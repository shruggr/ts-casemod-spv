[**spv-store v0.0.1**](../README.md) • **Docs**

***

[spv-store v0.0.1](../globals.md) / InscriptionIndexer

# Class: InscriptionIndexer

Abstract class representing an Indexer.

## Extends

- [`Indexer`](Indexer.md)

## Constructors

### new InscriptionIndexer()

> **new InscriptionIndexer**(`owners`, `indexMode`, `network`?): [`InscriptionIndexer`](InscriptionIndexer.md)

Creates an instance of the Indexer.

#### Parameters

• **owners**: `Set`\<`string`\> = `...`

A set of owners that this indexer is interested in. 
                An owner can be an address or any other data the indexer 
                wants to use to identify which transactions to include in the index.

• **indexMode**: [`IndexMode`](../enumerations/IndexMode.md)

The mode of the indexer.

• **network?**: [`Network`](../type-aliases/Network.md) = `"mainnet"`

The network the indexer is operating on. Defaults to "mainnet".

#### Returns

[`InscriptionIndexer`](InscriptionIndexer.md)

#### Inherited from

[`Indexer`](Indexer.md).[`constructor`](Indexer.md#constructors)

#### Defined in

[models/indexer.ts:54](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/models/indexer.ts#L54)

## Properties

### indexMode

> **indexMode**: [`IndexMode`](../enumerations/IndexMode.md)

The mode of the indexer.

#### Inherited from

[`Indexer`](Indexer.md).[`indexMode`](Indexer.md#indexmode)

#### Defined in

[models/indexer.ts:56](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/models/indexer.ts#L56)

***

### name

> **name**: `string` = `"Inscriptions"`

Human readable name for this indexer.

#### Overrides

[`Indexer`](Indexer.md).[`name`](Indexer.md#name)

#### Defined in

[indexers/insc.ts:27](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/indexers/insc.ts#L27)

***

### network

> **network**: [`Network`](../type-aliases/Network.md) = `"mainnet"`

The network the indexer is operating on. Defaults to "mainnet".

#### Inherited from

[`Indexer`](Indexer.md).[`network`](Indexer.md#network)

#### Defined in

[models/indexer.ts:57](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/models/indexer.ts#L57)

***

### owners

> **owners**: `Set`\<`string`\>

A set of owners that this indexer is interested in. 
                An owner can be an address or any other data the indexer 
                wants to use to identify which transactions to include in the index.

#### Inherited from

[`Indexer`](Indexer.md).[`owners`](Indexer.md#owners)

#### Defined in

[models/indexer.ts:55](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/models/indexer.ts#L55)

***

### tag

> **tag**: `string` = `"insc"`

Unique identifier for this indexer.

#### Overrides

[`Indexer`](Indexer.md).[`tag`](Indexer.md#tag)

#### Defined in

[indexers/insc.ts:26](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/indexers/insc.ts#L26)

## Methods

### parse()

> **parse**(`ctx`, `vout`): `Promise`\<`undefined` \| [`IndexData`](IndexData.md)\>

Parses an output and returns the index data if it is relevant to this indexer.
If the output is not relevant, it returns undefined.

#### Parameters

• **ctx**: [`IndexContext`](../interfaces/IndexContext.md)

The context for the index operation.

• **vout**: `number`

The output number to be parsed.

#### Returns

`Promise`\<`undefined` \| [`IndexData`](IndexData.md)\>

A promise that resolves to the index data if relevant, or undefined if not.

#### Overrides

[`Indexer`](Indexer.md).[`parse`](Indexer.md#parse)

#### Defined in

[indexers/insc.ts:29](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/indexers/insc.ts#L29)

***

### preSave()

> **preSave**(`ctx`): `Promise`\<`void`\>

Pre-save hook that evaluates the index data for the entire transaction before it is persisted.

#### Parameters

• **ctx**: [`IndexContext`](../interfaces/IndexContext.md)

The context of the index operation.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the pre-save evaluation is complete.

#### Inherited from

[`Indexer`](Indexer.md).[`preSave`](Indexer.md#presave)

#### Defined in

[models/indexer.ts:79](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/models/indexer.ts#L79)

***

### sync()

> **sync**(`txoStore`, `ingestQueue`): `Promise`\<`void`\>

Synchronize txo data for indexer from a remote source.

#### Parameters

• **txoStore**: [`TxoStore`](TxoStore.md)

The store containing transaction outputs.

• **ingestQueue**

A queue of transactions to be ingested, keyed by transaction ID.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the synchronization is complete.

#### Inherited from

[`Indexer`](Indexer.md).[`sync`](Indexer.md#sync)

#### Defined in

[models/indexer.ts:90](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/models/indexer.ts#L90)
