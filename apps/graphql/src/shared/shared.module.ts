/*
 * @Author: Innei
 * @Date: 2020-10-01 13:48:50
 * @LastEditTime: 2020-10-01 15:23:19
 * @LastEditors: Innei
 * @FilePath: /mx-server-next/src/shared/shared.module.ts
 * @Mark: Coding with Love
 */
import { Module } from '@nestjs/common'
import { CategoriesService } from './categories/categories.service'
import { PostsResolver } from './posts/posts.resolver'
import { PostsService } from './posts/posts.service'
import { CategoriesResolver } from './categories/categories.resolver'
import { NotesResolver } from './notes/notes.resolver'
import { NotesService } from './notes/notes.service'
import { AggregateResolver } from './aggregate/aggregate.resolver'
import { AggregateService } from './aggregate/aggregate.service'
import { PagesResolver } from './pages/pages.resolver'
import { PagesService } from './pages/pages.service'

@Module({
  providers: [
    PostsService,
    CategoriesService,
    PostsResolver,
    CategoriesResolver,
    NotesResolver,
    NotesService,
    AggregateResolver,
    AggregateService,
    PagesResolver,
    PagesService,
  ],
})
export class SharedModule {}
