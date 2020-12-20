import { TasksService } from '@libs/common/tasks/tasks.service'
import Category from '@libs/db/models/category.model'
/*
 * @Author: Innei
 * @Date: 2020-05-06 22:14:51
 * @LastEditTime: 2020-08-24 22:27:29
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/helper/helper.controller.ts
 * @Coding with Love
 */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger'
import { execSync } from 'child_process'
import { FastifyReply } from 'fastify'
import { readFileSync } from 'fs'
import { Readable } from 'stream'
import { join } from 'path'
import { Auth } from 'shared/core/decorators/auth.decorator'
import { ArticleType, DataListDto } from './dto/datatype.dto'
import { HelperService, MarkdownYAMLProperty } from './helper.service'

@Controller('helper')
@ApiTags('Helper Routes')
@Auth()
export class HelperController {
  constructor(
    private readonly service: HelperService,
    private readonly task: TasksService,
  ) {}

  @Post('markdown/import')
  @ApiProperty({ description: '导入 Markdown with YAML 数据' })
  async importArticle(@Body() body: DataListDto) {
    const type = body.type

    switch (type) {
      case ArticleType.Post: {
        return await this.service.insertPostsToDb(body.data)
      }
      case ArticleType.Note: {
        return await this.service.insertNotesToDb(body.data)
      }
    }
  }

  @Get('markdown/export')
  @ApiProperty({ description: '导出 Markdown with YAML 数据' })
  @ApiQuery({
    description: '导出的 md 文件名是否为 slug',
    name: 'slug',
    required: false,
    enum: ['0', '1'],
  })
  async exportArticleToMarkdown(
    @Res() reply: FastifyReply,
    @Query('slug') slug: string,
  ) {
    const allArticles = await this.service.extractAllArticle()
    const { notes, pages, posts } = allArticles

    const convertor = <
      T extends {
        text: string
        created?: Date
        modified: Date
        title: string
        slug?: string
      }
    >(
      item: T,
      extraMetaData: Record<string, any> = {},
    ): MarkdownYAMLProperty => {
      const meta = {
        created: item.created,
        modified: item.modified,
        title: item.title,
        slug: item.slug || item.title,
        ...extraMetaData,
      }
      return {
        meta,
        text: this.service.markdownBuilder({ meta, text: item.text }),
      }
    }
    // posts
    const convertPost = posts.map((post) =>
      convertor(post, {
        categories: (post.category as Category).name,
        type: 'Post',
        permalink: 'posts/' + post.slug,
      }),
    )
    const convertNote = notes.map((note) =>
      convertor(note, {
        mood: note.mood,
        weather: note.weather,
        id: note.nid,
        permalink: 'notes/' + note.nid,
        type: 'Note',
      }),
    )
    const convertPage = pages.map((page) =>
      convertor(page, {
        subtitle: page.subtitle,
        type: 'Page',
        permalink: page.slug,
      }),
    )

    // zip
    const map = {
      posts: convertPost,
      pages: convertPage,
      notes: convertNote,
    }
    const timestamp = new Date().getTime().toString()
    await Promise.all(
      Object.entries(map).map(([key, arr]) => {
        this.service.generateTempArchive({
          documents: arr,
          archiveName: key,
          tempDir: timestamp,
          options: {
            slug: !!parseInt(slug),
          },
        })
      }),
    )
    const workdir = join(HelperService.ExportTempDir, timestamp)

    // will generate `notes.zip` `pages.zip` `posts.zip`
    // package again
    try {
      execSync('zip markdown.zip notes.zip pages.zip posts.zip', {
        cwd: workdir,
      })
    } catch {
      throw new UnprocessableEntityException('导出失败')
    }

    const stream = new Readable()
    const archive = readFileSync(join(workdir, 'markdown.zip'))
    stream.push(archive)
    stream.push(null)

    reply
      .header(
        'Content-Disposition',
        `attachment; filename="markdown-${new Date().toISOString()}.zip"`,
      )
      .type('application/zip')
      .send(stream)
  }

  @Get('baidu')
  async pushToBaiduNow() {
    return await this.task.pushToBaiduSearch()
  }
}
