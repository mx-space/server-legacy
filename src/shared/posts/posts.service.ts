import Category from '@libs/db/models/category.model'
import Post from '@libs/db/models/post.model'
import { Injectable } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from 'src/shared/base/base.service'
import Comment from '@libs/db/models/comment.model'

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
  ) {
    super(postModel)
  }

  async getCategoryBySlug(slug: string): Promise<DocumentType<Category>> {
    return await this.categoryModel.findOne({ slug })
  }

  async findPostById(id: string) {
    return await super.findById(id).populate('categoryId')
  }

  async findCategoryById(id: string) {
    return await this.categoryModel.findById(id)
  }

  async deletePost(id: string) {
    const r = await this.postModel.deleteOne({ _id: id })
    await this.commentModel.deleteMany({
      pid: id,
    })
    return r
  }
}
