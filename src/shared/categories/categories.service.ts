import Category from '@libs/db/models/category.model'
import Post from '@libs/db/models/post.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { addCondition } from 'src/shared/utils'
import { BaseService } from '../base/base.service'

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Post)
    private readonly postModel: ReturnModelType<typeof Post>,
  ) {
    super(categoryModel)
  }

  async findCategoryPost(categoryId: string, isMaster = false) {
    const condition = addCondition(isMaster)
    // FIXME 2020-04-01 it will be show hide post if guest access this api
    return await this.postModel
      .find({
        categoryId,
        ...condition,
      })
      .select('title created slug')
      .sort({ created: -1 })
  }

  async findPostsInCategory(id: string) {
    return await this.postModel.find({
      categoryId: id,
    })
  }
}
