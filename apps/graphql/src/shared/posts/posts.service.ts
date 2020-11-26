/*
 * @Author: Innei
 * @Date: 2020-10-01 15:10:04
 * @LastEditTime: 2020-10-01 15:17:02
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/posts/posts.service.ts
 * @Mark: Coding with Love
 */
import Category from '@libs/db/models/category.model'
import { Injectable } from '@nestjs/common'
import { Ref, ReturnModelType } from '@typegoose/typegoose'
import { CategoriesService } from '../categories/categories.service'
import { DocumentType } from '@typegoose/typegoose'
import { BaseService } from '../base/base.service'
import Post from '@libs/db/models/post.model'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'shared/core/exceptions/cant-find.exception'

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    private readonly categoryService: CategoriesService,
    @InjectModel(Post) postModel: ReturnModelType<typeof Post>,
  ) {
    super(postModel)
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
}
