import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import Post from '@libs/db/models/post.model'
import { ReturnModelType } from '@typegoose/typegoose'

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
  ) {}

  async getByCateAndSlug({
    showHide = false,
    slug,
  }: {
    showHide?: boolean
    slug: string
  }) {
    return await this.postModel
      .findOne({
        slug,
        ...(showHide ? {} : { hide: false }),
      })
      .populate('categoryId')
  }
}
