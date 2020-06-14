import type { DocumentType } from '@typegoose/typegoose'
import * as fastJson from 'fast-json-stringify'
import { RedisService } from 'nestjs-redis'
import { RedisNames } from '../../libs/common/src/redis/redis.types'
import { WriteBaseModel } from '../../libs/db/src/models/base.model'
/*
 * @Author: Innei
 * @Date: 2020-06-03 12:14:54
 * @LastEditTime: 2020-06-14 11:04:40
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/utils/text-base.ts
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
  const ReadRedisStore = this.redis.getClient(RedisNames.Read)
  const ips = JSON.parse(
    (await ReadRedisStore.get(doc._id)) || '[]',
  ) as string[]

  if (ip && ((ips && ips.includes(ip)) || !ips.length)) {
    await doc.updateOne({ $inc: { 'count.read': 1 } })
    ips.push(ip)
    await ReadRedisStore.set(doc._id, JSON.stringify(ips))
  }
}

export async function updateLikeCount<
  T extends WriteBaseModel,
  U extends { redis: RedisService }
>(this: U, doc: DocumentType<T>, ip?: string) {
  const ReadRedisStore = this.redis.getClient(RedisNames.Like)
  const records = JSON.parse(
    (await ReadRedisStore.get(doc._id)) || '[]',
  ) as IpLikesMap[]

  if (
    ip &&
    ((records && records.some((r) => r.ip !== ip)) || !records.length)
  ) {
    await doc.updateOne({ $inc: { 'count.like': 1 } })
    records.push({ created: new Date().toISOString(), ip: ip })
    await ReadRedisStore.set(doc._id, stringify(records))
    return true
  }
  return false
}
