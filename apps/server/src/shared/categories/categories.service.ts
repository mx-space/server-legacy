import Category, { CategoryType } from '@libs/db/models/category.model'
import Post from '@libs/db/models/post.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import type { ReturnModelType } from '@typegoose/typegoose'
import { omit } from 'lodash'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'libs/core/exceptions/cant-find.exception'
import { addConditionToSeeHideContent } from 'libs/utils'
import { BaseService } from '../base/base.service'

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectModel(Category)
    private readonly model: ReturnModelType<typeof Category>,
    @InjectModel(Post)
    private readonly postModel: ReturnModelType<typeof Post>,
  ) {
    super(model)
    // if there hasn't category
    this.createDefaultCategory()
  }

  async createDefaultCategory() {
    if ((await this.model.countDocuments()) === 0) {
      return await this.createNew({
        name: '默认分类',
        slug: 'default',
      })
    }
  }
  async findCategoryPost(
    categoryId: string,
    shouldShowHide = false,
    condition: any = {},
  ) {
    const extraCondition = addConditionToSeeHideContent(shouldShowHide)

    return await this.postModel
      .find({
        categoryId,
        ...extraCondition,
        ...condition,
      })
      .select('title created slug _id')
      .sort({ created: -1 })
  }

  async findPostsInCategory(id: string) {
    return await this.postModel.find({
      categoryId: id,
    })
  }

  async findArticleWithTag(
    tag: string,
    shouldShowHide = false,
  ): Promise<null | any[]> {
    const extraCondition = addConditionToSeeHideContent(shouldShowHide)
    const posts = await this.postModel
      .find(
        {
          tags: tag,
          ...extraCondition,
        },
        undefined,
        { lean: true },
      )
      .populate('category')
    if (!posts.length) {
      throw new CannotFindException()
    }
    return posts.map(({ _id, title, slug, category, created }) => ({
      _id,
      title,
      slug,
      category: omit(category, ['count', '__v', 'created', 'modified']),
      created,
    }))
  }

  async createNew({ name, slug }: { name: string; slug: string }) {
    try {
      const category = await super.createNew({
        type: CategoryType.Category,
        slug,
        name,
      })
      return category
    } catch {
      throw new UnprocessableEntityException('分类或者标签重复了')
    }
  }

  async getPostTagsSum() {
    const data = await this.postModel.aggregate([
      { $project: { tags: 1 } },
      {
        $unwind: '$tags',
      },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ])
    return data
  }
}
