/*
 * @Author: Innei
 * @Date: 2020-05-06 22:00:44
 * @LastEditTime: 2020-08-02 15:48:32
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/posts/posts.service.ts
 * @Coding with Love
 */

import Category from '@libs/db/models/category.model'
import Comment from '@libs/db/models/comment.model'
import Post from '@libs/db/models/post.model'
import {
  BadRequestException,
  HttpService,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import { DocumentType, Ref, ReturnModelType } from '@typegoose/typegoose'
import { merge } from 'lodash'
import { FilterQuery, MongooseUpdateQuery, QueryUpdateOptions } from 'mongoose'
import { RedisService } from 'nestjs-redis'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { WriteBaseService } from 'src/shared/base/base.service'
import { arrDifference } from 'src/utils'
import { updateLikeCount, updateReadCount } from '../../utils/text-base'
import { CategoriesService } from '../categories/categories.service'
@Injectable()
export class PostsService extends WriteBaseService<Post> {
  constructor(
    @InjectModel(Post) private readonly model: ReturnModelType<typeof Post>,

    private readonly categoryService: CategoriesService,
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
    private readonly http: HttpService,
    private readonly redis: RedisService,
  ) {
    super(model, http)
  }

  async createNew(projection: Partial<Post>) {
    const { categoryId } = projection
    const validCategory = await this.findCategoryById(
      (categoryId as any) as string,
    )
    if (!validCategory) {
      throw new UnprocessableEntityException('分类丢失了 ಠ_ಠ')
    }
    const newDocument = await super.createNew({
      // ...omit(projection, 'tags'),
      ...projection,
    })
    // if (projection.tags?.length) {
    //   newDocument.tags = []
    //   console.log(...projection.tags)

    //   newDocument.tags.push(...projection.tags)
    //   // newDocument.updateOne({
    //   //   $pullAll: {tags:},
    //   //   $push: { tags: { $each: projection.tags } },
    //   // } as MongooseUpdateQuery<Post>)

    //   await newDocument.save()
    // }
    // category
    validCategory.count += 1
    await validCategory.save()
    // tags
    if (projection.tags && projection.tags.length > 0) {
      try {
        for await (const tag of projection.tags) {
          await this.categoryService.updateTag({ name: tag, increase: 1 })
        }
      } catch {}
    }
    return newDocument
  }
  async getCategoryBySlug(slug: string): Promise<DocumentType<Category>> {
    return await this.categoryService.findOne({ slug })
  }

  async getCategoryById(id: string | Ref<Category, any>) {
    return await this.categoryService.findById(id)
  }

  async findPostById(id: string) {
    const doc = await super.findById(id).populate('category')
    if (!doc) {
      throw new CannotFindException()
    }
    return doc
  }

  async findCategoryById(id: string) {
    return await this.categoryService.findById(id)
  }

  async updateTags(increase: number, tags: string[]) {
    for await (const tag of tags) {
      await this.categoryService.updateTag({ increase, name: tag })
    }
  }
  async modifyTag(of: string | DocumentType<Post>, tags: string[] | null) {
    const document = typeof of === 'string' ? await this.model.findById(of) : of
    const isBeforeHasTags = document.tags && document.tags.length > 0
    const isNowHasTags = tags && tags.length > 0
    await (async () => {
      // 0. if now hasn't any tags, but before has

      if (!isNowHasTags && isBeforeHasTags) {
        await this.updateTags(-1, document.tags)
        return
      }

      // 1. if hasn't any tags before

      if (!document.tags || document.tags.length === 0) {
        await this.updateTags(1, tags)
        return
      }

      // 2. both has

      if (isBeforeHasTags && isNowHasTags) {
        // 3. difference
        const differenceArray = arrDifference(document.tags, tags)
        if (differenceArray.length) {
          for await (const differenceTag of differenceArray) {
            const isOld = document.tags.includes(differenceTag)
            await this.categoryService.updateTag({
              increase: isOld ? -1 : 1,
              name: differenceTag,
            })
          }

          return
        }
      }
    })()
    // finally update document
    await document.updateOne({
      $set: {
        tags,
      },
    } as MongooseUpdateQuery<Post>)
  }

  // @ts-ignore
  async update(
    condition: FilterQuery<Post>,
    projection: Partial<Post>,
    options?: QueryUpdateOptions,
  ) {
    const oldPost = await this.findPostById(condition._id)
    if (!oldPost) {
      throw new BadRequestException('文章丢失了 (　ﾟдﾟ)')
    }
    // update category information
    const { categoryId } = projection
    if (categoryId !== (oldPost.categoryId as any)) {
      const originCategory = await this.findCategoryById(
        (oldPost.categoryId as any) as string,
      )
      const newCategory = await this.findCategoryById(
        (categoryId as any) as string,
      )

      originCategory.count--
      await originCategory.save()

      if (!newCategory) {
        throw new BadRequestException('你还没有这个分类啦 (>﹏<)')
      }

      newCategory.count++
      await newCategory.save()
    }
    // tag
    await this.modifyTag(oldPost, projection.tags)
    return super.update(
      { _id: condition._id },
      projection,
      merge(
        {
          omitUndefined: true,
        },
        options || {},
      ),
    )
  }
  async deletePost(id: string) {
    const r = await this.model.findOneAndDelete({ _id: id })
    const categoryId = r.categoryId
    await this.categoryService.update(
      {
        _id: categoryId,
      },
      {
        $inc: {
          count: -1,
        },
      },
    )
    await this.commentModel.deleteMany({
      pid: id,
    })
    // update tag
    const tags = r.tags
    if (tags && tags.length > 0) {
      for await (const tag of tags) {
        await this.categoryService.updateTag({ name: tag, increase: -1 })
      }
    }
    return r
  }

  async updateReadCount(doc: DocumentType<Post>, ip?: string) {
    return await updateReadCount.call(this, doc, ip)
  }

  async updateLikeCount(id: string, ip: string) {
    const doc = await this.model.findById(id)
    if (!doc) {
      throw new CannotFindException()
    }
    return await updateLikeCount.call(this, doc, ip)
  }
}
