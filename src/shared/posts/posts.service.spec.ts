/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-06-14 11:12:44
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/posts/posts.service.spec.ts
 * @Coding with Love
 */
import { Test, TestingModule } from '@nestjs/testing'
import { RedisModule, RedisService } from 'nestjs-redis'
import { RedisNames } from '../../../libs/common/src/redis/redis.types'
import { PostsService } from './posts.service'

describe('PostsService', () => {
  let service: PostsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, RedisService],
      imports: [RedisModule.register([{
        name: RedisNames.Like,
        keyPrefix: 'mx_like_',
      },
      ])]
    }).compile()

    service = module.get<PostsService>(PostsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
