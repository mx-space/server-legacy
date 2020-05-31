/*
 * @Author: Innei
 * @Date: 2020-05-06 22:00:44
 * @LastEditTime: 2020-05-31 18:13:48
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/posts/posts.service.ts
 * @Coding with Love
 */

import Category from '@libs/db/models/category.model'
import Comment from '@libs/db/models/comment.model'
import Post from '@libs/db/models/post.model'
import { HttpService, Injectable } from '@nestjs/common'
import { DocumentType, Ref, ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { WriteBaseService } from 'src/shared/base/base.service'
@Injectable()
export class PostsService extends WriteBaseService<Post> {
  constructor(
    @InjectModel(Post) private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Comment)
    private readonly commentModel: ReturnModelType<typeof Comment>,
    private readonly http: HttpService,
  ) {
    super(postModel, http)
  }

  async getCategoryBySlug(slug: string): Promise<DocumentType<Category>> {
    return await this.categoryModel.findOne({ slug })
  }

  async getCategoryById(id: string | Ref<Category, any>) {
    return await this.categoryModel.findById(id)
  }

  async findPostById(id: string) {
    const doc = await super.findById(id).populate('category')
    if (!doc) {
      throw new CannotFindException()
    }
    return doc
  }

  async findCategoryById(id: string) {
    return await this.categoryModel.findById(id)
  }

  async deletePost(id: string) {
    const r = await this.postModel.findOneAndDelete({ _id: id })
    const categoryId = r.categoryId
    await this.categoryModel.updateOne(
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
    return r
  }

  async updateReadCount(doc: DocumentType<Post>) {
    await doc.updateOne({ $inc: { 'count.read': 1 } })
  }
}
