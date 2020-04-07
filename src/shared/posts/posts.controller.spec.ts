import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import { PostsService } from 'src/shared/posts/posts.service'
import { PostsController } from './posts.controller'

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

  // describe('it should be pass', async () => {})
})
