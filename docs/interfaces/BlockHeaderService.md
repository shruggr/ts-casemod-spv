[**spv-store v0.0.1**](../README.md) • **Docs**

***

[spv-store v0.0.1](../globals.md) / BlockHeaderService

# Interface: BlockHeaderService

## Methods

### getBlocks()

> **getBlocks**(`lastHeight`, `limit`): `Promise`\<[`BlockHeader`](BlockHeader.md)[]\>

#### Parameters

• **lastHeight**: `number`

• **limit**: `number`

#### Returns

`Promise`\<[`BlockHeader`](BlockHeader.md)[]\>

#### Defined in

[services/block-service.ts:4](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/services/block-service.ts#L4)

***

### getChaintip()

> **getChaintip**(): `Promise`\<[`BlockHeader`](BlockHeader.md)\>

#### Returns

`Promise`\<[`BlockHeader`](BlockHeader.md)\>

#### Defined in

[services/block-service.ts:5](https://github.com/shruggr/ts-casemod-spv/blob/e58946f83152e9deb265157899c0af08eff6c009/src/services/block-service.ts#L5)
