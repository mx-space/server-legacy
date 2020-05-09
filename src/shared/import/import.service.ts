import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import Category from '../../../libs/db/src/models/category.model'
import Note from '../../../libs/db/src/models/note.model'
import Post from '../../../libs/db/src/models/post.model'
import { DatatypeDto } from './dto/datatype.dto'

@Injectable()
export class ImportService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Post)
    private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note)
    private readonly noteModel: ReturnModelType<typeof Note>,
  ) {}
  private readonly genDate = (item: DatatypeDto) => {
    const { meta } = item
    if (!meta) {
      return {
        created: new Date(),
        modified: new Date(),
      }
    }
    const { date, updated } = meta
    return {
      created: new Date(date) || new Date(),
      modified: new Date(updated) || new Date(date) || new Date(),
    }
  }

  async insertPostsToDb(data: DatatypeDto[]) {
    let count = 1
    const categoryNameAndId = (await this.categoryModel.find().lean()).map(
      (c) => {
        return { name: c.name, _id: c._id }
      },
    )

    const insertOrCreateCategory = async (name: string) => {
      if (!name) {
        return
      }
      const hasCategory = categoryNameAndId.find((c) => name === c.name)
      // console.log(hasCategory)
      if (!hasCategory) {
        const newCategoryDoc = await this.categoryModel.create({
          name,
          slug: name,
          type: 0,
        })
        categoryNameAndId.push({
          name: newCategoryDoc.name,
          _id: newCategoryDoc._id,
        })
        newCategoryDoc.count++
        await newCategoryDoc.save()
        return newCategoryDoc
      } else {
        await this.categoryModel.updateOne(
          {
            _id: hasCategory._id,
          },
          {
            $inc: {
              count: 1,
            },
          },
        )
        return hasCategory
      }
    }
    const genDate = this.genDate
    const models = [] as Post[]
    const _defaultCategory = await this.categoryModel.findOne()
    const defaultCategory = new Proxy(_defaultCategory, {
      get(target) {
        target.updateOne({
          $inc: {
            count: 1,
          },
        })

        return target
      },
    })
    for await (const item of data) {
      if (!item.meta) {
        models.push(({
          title: '未命名-' + count++,
          slug: new Date().getTime(),
          text: item.text,
          ...genDate(item),
          categoryId: Types.ObjectId(defaultCategory._id),
        } as any) as Post)
      } else {
        const category = await insertOrCreateCategory(
          item.meta.categories?.shift(),
        )
        models.push({
          title: item.meta.title,
          slug: item.meta.slug || item.meta.title,
          text: item.text,
          ...genDate(item),
          categoryId: category?._id || defaultCategory._id,
        } as Post)
      }
    }
    return await this.postModel.insertMany(models)
  }
  async insertNotesToDb(data: DatatypeDto[]) {
    const models = [] as Note[]
    for await (const item of data) {
      if (!item.meta) {
        models.push({
          title: '未命名随记',
          text: item.text,
          ...this.genDate(item),
        } as Note)
      } else {
        models.push({
          title: item.meta.title,
          text: item.text,
          ...this.genDate(item),
        } as Note)
      }
    }

    return await this.noteModel.create(models)
  }
}
