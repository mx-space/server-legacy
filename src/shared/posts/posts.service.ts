import Category from '@libs/db/models/category.model'
import Post from '@libs/db/models/post.model'
import { Injectable } from '@nestjs/common'
import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from 'src/shared/base/base.service'

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
  ) {
    super(postModel)
  }

  async getCategoryBySlug(slug: string): Promise<DocumentType<Category>> {
    return await this.categoryModel.findOne({ slug })
  }

  async findPostById(id: string) {
    return await super.findById(id).populate('categoryId')
  }
}
