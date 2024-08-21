/* eslint-disable no-case-declarations */
import type { IndexContext } from "../models/index-context";
import { IndexData } from "../models/index-data";
import { Indexer } from "../models/indexer";
import { Txo, TxoStatus } from "../models/txo";
import { Ord } from "./ord";
import { Utils } from "@bsv/sdk";
import { TxoStore } from "../stores/txo-store";
import { Outpoint, type Ingest } from "../models";
import type { RemoteBsv20 } from "./remote-types";

export enum Bsv21Status {
  Invalid = -1,
  Pending = 0,
  Valid = 1,
}

export class Bsv21 {
  status = Bsv21Status.Pending;
  public id: Outpoint;
  public op = "";
  public amt = 0n;
  public dec = 0;
  public sym?: string;
  public icon?: string;
  public supply?: bigint;
  public contract?: string;
  public reason?: string;

  constructor(props: Bsv21) {
    this.id = props.id || "";
    Object.assign(this, props);
  }

  static fromJSON(obj: any): Bsv21 {
    // if (typeof obj.id != "string" && !Array.isArray(obj.id)) return;
    const bsv21 = new Bsv21({
      id: new Outpoint(obj.id as string),
      ...obj,
      amt: BigInt(obj.amt),
    });
    return bsv21;
  }
}

export class Bsv21Indexer extends Indexer {
  tag = "bsv21";

  parse(ctx: IndexContext, vout: number): IndexData | undefined {
    const txo = ctx.txos[vout];
    const ordIdxData = txo.data.ord as IndexData | undefined;
    if (!ordIdxData) return;
    const ord = ordIdxData.data as Ord;
    if (!ord || ord.insc?.file.type !== "application/bsv-20") return;
    let bsv21: Bsv21;
    try {
      bsv21 = Bsv21.fromJSON(JSON.parse(ord.insc!.file.text!));
    } catch (e) {
      return;
    }
    const data = new IndexData(bsv21);
    if (bsv21.amt <= 0n || bsv21.amt > 2 ** 64 - 1) return;
    switch (bsv21.op) {
      case "deploy+mint":
        if (bsv21.dec > 18) return;
        bsv21.id = txo.outpoint;
        bsv21.supply = bsv21.amt;
        bsv21.status = Bsv21Status.Valid;
        break;
      case "transfer":
      case "burn":
        break;
      default:
        return;
    }
    if (!bsv21.id) {
      return;
    }
    if (txo.owner && this.owners.has(txo.owner)) {
      data.events.push({ id: "address", value: txo.owner });
      data.events.push({ id: "id", value: bsv21.id.toString() });
      if (bsv21.contract) {
        data.events.push({ id: "contract", value: bsv21.contract });
      }
    }

    return data;
  }

  preSave(ctx: IndexContext) {
    const balance: { [id: string]: bigint } = {};
    const tokensIn: { [id: string]: Txo[] } = {};
    for (const spend of ctx.spends) {
      const bsv21 = spend.data.bsv21;
      if (!bsv21) continue;
      if (bsv21.data.status == Bsv21Status.Valid) {
        if (!tokensIn[bsv21.data.id]) {
          tokensIn[bsv21.data.id] = [];
        }
        tokensIn[bsv21.data.id].push(spend);
        balance[bsv21.data!.id] =
          (balance[bsv21.data!.id] || 0n) + bsv21.data.amt;
      }
    }
    const tokensOut: { [id: string]: Txo[] } = {};
    const reasons: { [id: string]: string } = {};
    for (const txo of ctx.txos) {
      const bsv21 = txo.data?.bsv21;
      if (!bsv21 || !["transfer", "burn"].includes(bsv21.data.op)) continue;
      let token: Bsv21 | undefined;
      for (const spend of tokensIn[bsv21.data.id] || []) {
        token = spend.data.bsv21.data;
        bsv21.deps.push(spend.outpoint.toString());
      }
      if ((balance[bsv21.data.id] || 0n) < bsv21.data.amt) {
        reasons[bsv21.data.id] = "Insufficient inputs";
      }

      if (token) {
        bsv21.data.sym = token.sym;
        bsv21.data.icon = token.icon;
        bsv21.data.contract = token.contract;
        bsv21.data.supply = token.supply;
      }

      if (!tokensOut[bsv21.data.id]) {
        tokensOut[bsv21.data.id] = [];
      }
      tokensOut[bsv21.data.id].push(txo);
      balance[bsv21.data.id] =
        (balance[bsv21.data.id] || 0n) - BigInt(bsv21.data.amt);
    }

    for (const [id, txos] of Object.entries(tokensOut)) {
      const reason = reasons[id];
      for (const txo of txos) {
        txo.data.bsv21.data.status = reason
          ? Bsv21Status.Invalid
          : Bsv21Status.Valid;
        txo.data.bsv21.data.reason = reason;
      }
    }
  }

  async sync(txoStore: TxoStore): Promise<number> {
    const limit = 100;
    let lastHeight = 0;
    for await (const owner of this.owners) {
      let resp = await fetch(
        `https://ordinals.gorillapool.io/api/bsv20/${owner}/balance`,
      );
      const balance = (await resp.json()) as RemoteBsv20[];
      for await (const token of balance) {
        if (!token.id) continue;
        console.log("importing", token.id);
        // try {
        let offset = 0;
        let utxos: RemoteBsv20[] = [];
        do {
          resp = await fetch(
            `https://ordinals.gorillapool.io/api/bsv20/${owner}/id/${token.id}?limit=${limit}&offset=${offset}&includePending=true`,
          );
          utxos = ((await resp.json()) as RemoteBsv20[]) || [];
          const txos: Txo[] = [];
          for (const u of utxos) {
            const txo = new Txo(
              new Outpoint(u.txid, u.vout),
              1n,
              Utils.toArray(u.script, "base64"),
              TxoStatus.TRUSTED,
            );
            if (u.height) {
              txo.block = { height: u.height, idx: BigInt(u.idx || 0) };
            }
            txo.data.bsv21 = new IndexData(
              Bsv21.fromJSON({
                id: token.id,
                amt: u.amt,
                dec: token.dec,
                sym: token.sym,
                op: u.op!,
                status: u.status,
                icon: token.icon,
              }),
              undefined, //deps[u.txid] || [],
              [
                { id: "address", value: owner },
                { id: "id", value: token.id!.toString() },
              ],
            );
            if (u.listing && u.payout && u.price) {
              txo.data.list = new IndexData(
                {
                  payout: Utils.toArray(u.payout, "base64"),
                  price: BigInt(u.price),
                },
                undefined,
                [
                  {
                    id: "price",
                    value: BigInt(u.price).toString(16).padStart(16, "0"),
                  },
                ],
              );
            }
            lastHeight = Math.max(lastHeight, u.height || 0);
            txos.push(txo);
          }
          await txoStore.storage.putMany(txos);
          await txoStore.queue(
            txos.map(
              (t) =>
                ({
                  txid: t.outpoint.txid,
                  height: t.block.height,
                  idx: Number(t.block.idx),
                  checkSpends: true,
                  downloadOnly: this.syncMode === TxoStatus.TRUSTED,
                }) as Ingest,
            ),
          );
          offset += limit;
          // if (this.syncMode !== TxoStatus.TRUSTED) {
          //   resp = await fetch(
          //     `https://ordinals.gorillapool.io/api/bsv20/${owner}/id/${token.id}/ancestors`,
          //   );
          //   const txids = (await resp.json()) as { [score: string]: string };
          //   await txoStore.queue(
          //     Object.entries(txids).map(([score, txid]) => {
          //       const [height, idx] = score.split(".");
          //       return {
          //         txid,
          //         height: Number(height || Date.now()),
          //         idx: Number(idx || 0),
          //         isDepOnly: true
          //       } as Ingest
          //     })
          //   );
          // }
        } while (utxos.length == limit);
      }
    }
    return lastHeight;
  }
}
