import type { DocumentType } from '@typegoose/typegoose'
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

export async function updateReadCount<
  T extends WriteBaseModel,
  U extends { redis: RedisService }
>(this: U, doc: DocumentType<T>, ip?: string) {
  const redis = this.redis.getClient(RedisNames.Read)

  const isReadBefore = await redis.sismember(doc._id, ip)
  if (isReadBefore) {
    return
  }
  await redis.sadd(doc._id, ip)
  await doc.updateOne({ $inc: { 'count.read': 1 } })
}

/**
 * 之前 like 过的话 return true, 反之 false
 * @param this
 * @param doc
 * @param ip
 * @returns
 */
export async function updateLikeCount<
  T extends WriteBaseModel,
  U extends { redis: RedisService }
>(this: U, doc: DocumentType<T>, ip?: string) {
  const redis = this.redis.getClient(RedisNames.Like)

  const isLikedBefore = await redis.sismember(doc._id, ip)
  if (isLikedBefore) {
    return true
  }
  await redis.sadd(doc._id, ip)
  await doc.updateOne({ $inc: { 'count.like': 1 } })
  return false
}

export async function refreshKeyedCache(cacheManager: Cache) {
  const namedKeyPrefix = CACHE_KEY_PREFIX + 'name:'
  cacheManager.del(namedKeyPrefix + CacheKeys.RSS)
  cacheManager.del(namedKeyPrefix + CacheKeys.SiteMapCatch)
  cacheManager.del(namedKeyPrefix + CacheKeys.AggregateCatch)
}
