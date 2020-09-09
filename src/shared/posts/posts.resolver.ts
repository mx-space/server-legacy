import { Args, Query, Resolver } from '@nestjs/graphql'
import { PostPaginationArgs } from './dto'
import { PostItemModel } from './posts.model'
import { PostsService } from './posts.service'

@Resolver(() => PostItemModel)
export class PostsResolver {
  constructor(private readonly service: PostsService) {}

  @Query(() => PostItemModel)
  public async post(@Args('id') id: string) {
    console.log(id)

    return await this.service.findAll()
  }

  @Query(() => [PostItemModel])
  public async posts(@Args() recipesArgs: PostPaginationArgs) {
    console.log(recipesArgs)

    return await this.service.findAll()
  }
}
