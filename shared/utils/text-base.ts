import type { DocumentType } from '@typegoose/typegoose'
import * as fastJson from 'fast-json-stringify'
import { RedisService } from 'nestjs-redis'
import { RedisNames } from '@libs/common/redis/redis.types'
import { WriteBaseModel } from '@libs/db/models/base.model'
import { Cache } from 'cache-manager'
import { CACHE_KEY_PREFIX, CacheKeys } from 'shared/constants'
/*
 * @Author: Innei
 * @Date: 2020-06-03 12:14:54
 * @LastEditTime: 2021-03-21 20:46:09
 * @LastEditors: Innei
 * @FilePath: /server/shared/utils/text-base.ts
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

export async function refreshKeyedCache(cacheManager: Cache) {
  const namedKeyPrefix = CACHE_KEY_PREFIX + 'name:'
  cacheManager.del(namedKeyPrefix + CacheKeys.RSS)
  cacheManager.del(namedKeyPrefix + CacheKeys.SiteMapCatch)
  cacheManager.del(namedKeyPrefix + CacheKeys.AggregateCatch)
}
