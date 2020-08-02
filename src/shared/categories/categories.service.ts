import Category, { CategoryType } from '@libs/db/models/category.model'
import Post from '@libs/db/models/post.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import type { ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { addConditionToSeeHideContent } from 'src/utils'
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
  ): Promise<null | DocumentType<Post>[]> {
    const extraCondition = addConditionToSeeHideContent(shouldShowHide)
    const posts = await this.postModel
      .find({
        tags: tag,
        ...extraCondition,
      })
      .select('title created slug _id')
    if (!posts.length) {
      throw new CannotFindException()
    }
    return posts
  }
  async updateTag({ name, increase }: { name: string; increase: number }) {
    // NOTE: - tag name can't same as category name
    // category name or slug and tag name or slug all unique

    try {
      await this.model.updateOne(
        {
          type: CategoryType.Tag,
          name,
          slug: name,
        },
        {
          $inc: {
            count: increase,
          },
        },
        { upsert: true },
      )
      const newDocument = await this.model.findOne({
        type: CategoryType.Tag,
        name,
      })
      if (newDocument.count <= 0) {
        await newDocument.remove()
        return null
      }
      return newDocument
    } catch {
      throw new UnprocessableEntityException('分类或者标签重复了')
    }
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
}
