import type { DocumentType } from '@typegoose/typegoose'
import * as fastJson from 'fast-json-stringify'
import { RedisService } from 'nestjs-redis'
import { RedisNames } from '../../../libs/common/src/redis/redis.types'
import { WriteBaseModel } from '../../../libs/db/src/models/base.model'
/*
 * @Author: Innei
 * @Date: 2020-06-03 12:14:54
 * @LastEditTime: 2020-06-03 13:00:56
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/utils/text-base.ts
 * @Coding with Love
 */

export type IpLikesMap = {
  ip: string

  created: string
}
const stringify = fastJson({
  title: 'ip-id schema',
  type: 'array',
  items: {
    type: 'object',
    properties: {
      ip: { type: 'string' },
      created: { type: 'string' },
    },
  },
})
export async function updateReadCount<
  T extends WriteBaseModel,
  U extends { redis: RedisService }
>(this: U, doc: DocumentType<T>, ip?: string) {
  const likeRedisStore = this.redis.getClient(RedisNames.Like)
  const ips = JSON.parse(
    (await likeRedisStore.get(doc._id)) || '[]',
  ) as IpLikesMap[]

  if (ip && ((ips && ips.some((r) => r.ip !== ip)) || !ips.length)) {
    await doc.updateOne({ $inc: { 'count.read': 1 } })
    ips.push({ created: new Date().toISOString(), ip: ip })
    await likeRedisStore.set(doc._id, stringify(ips))
  }
}
