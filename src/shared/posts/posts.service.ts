import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import Post from '@libs/db/models/post.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { BaseService } from 'src/shared/base/base.service'

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
  ) {
    super(postModel)
  }

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
