import { Test, TestingModule } from '@nestjs/testing'
import { PostsController } from './posts.controller'
import { PostsService } from 'src/shared/posts/posts.service'
import Post from '@libs/db/models/post.model'
import Category from '@libs/db/models/category.model'
import { AppModule } from 'src/app.module'

describe('Posts Controller', () => {
  let controller: PostsController
  let service: PostsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PostsService],
      controllers: [PostsController],
    }).compile()
    service = module.get<PostsService>(PostsService)

    controller = module.get<PostsController>(PostsController)
  })

  describe('it should be pass', async () => {})
})
