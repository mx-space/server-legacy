import Page from '@libs/db/models/page.model'
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { safeDump } from 'js-yaml'
import { omit } from 'lodash'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { join } from 'path'
import { TEMP_DIR } from 'src/constants'
import { isDev } from 'src/utils'
import Category from '../../../libs/db/src/models/category.model'
import Note from '../../../libs/db/src/models/note.model'
import Post from '../../../libs/db/src/models/post.model'
import { DatatypeDto } from './dto/datatype.dto'
import mkdirp = require('mkdirp')

@Injectable()
export class HelperService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: ReturnModelType<typeof Category>,
    @InjectModel(Post)
    private readonly postModel: ReturnModelType<typeof Post>,
    @InjectModel(Note)
    private readonly noteModel: ReturnModelType<typeof Note>,
    @InjectModel(Page)
    private readonly pageModel: ReturnModelType<typeof Page>,
  ) {}

  logger = new Logger(HelperService.name)
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
        // @ts-ignore
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

  async extractAllArticle() {
    return {
      posts: await this.postModel.find().populate('category'),
      notes: await this.noteModel.find().lean(),
      pages: await this.pageModel.find().lean(),
    }
  }

  static ExportTempDir = join(TEMP_DIR, 'export')
  async generateTempArchive({
    documents,
    archiveName,
    tempDir,
    options = {},
  }: {
    documents: { meta: MetaType; text: string }[]
    archiveName: string
    tempDir: string
    options: { slug?: boolean }
  }) {
    const tempRootDir = join(HelperService.ExportTempDir, tempDir)
    mkdirp.sync(tempRootDir)
    for (const document of documents) {
      writeFileSync(
        join(
          tempRootDir,
          (options.slug ? document.meta.slug : document.meta.title)
            .concat('.md')
            .replace(/\//g, '-'),
        ),
        document.text,
        { encoding: 'utf-8' },
      )
    }

    // then to zip

    try {
      const cmd = `zip -r ${archiveName}.zip *.md;rm *.md`

      execSync(cmd, {
        cwd: tempRootDir,
        encoding: 'utf-8',
      })
    } catch (e) {
      if (isDev) {
        console.log(e)
      }
      throw new UnprocessableEntityException('压缩过程中出现未知错误')
    }
  }

  markdownBuilder(property: MarkdownYAMLProperty) {
    const {
      meta: { created, modified, title },
      text,
    } = property
    const header = {
      date: created,
      updated: modified,
      title,
      ...omit(property.meta, ['created', 'modified', 'title']),
    }
    const toYaml = safeDump(header, { skipInvalid: true })
    const res = `
---
${toYaml.trim()}

---

${text}
`.trim()

    return res
  }
}

type MetaType = {
  created: Date
  modified: Date
  title: string
  slug: string
} & Record<string, any>

export interface MarkdownYAMLProperty {
  meta: MetaType
  text: string
}
