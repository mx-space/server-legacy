/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-06-10 18:59:13
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/shared/shared.module.ts
 * @Coding with Love
 */

import { TasksModule } from '@libs/common/tasks/tasks.module'
import { Module } from '@nestjs/common'
import { CommentsController } from 'apps/server/src/shared/comments/comments.controller'
import { CommentsService } from 'apps/server/src/shared/comments/comments.service'
import { PageController } from 'apps/server/src/shared/page/page.controller'
import { PageService } from 'apps/server/src/shared/page/page.service'
import { PostsController } from 'apps/server/src/shared/posts/posts.controller'
import { PostsService } from 'apps/server/src/shared/posts/posts.service'

import { GatewayModule } from '../gateway/gateway.module'
import { AggregateController } from './aggregate/aggregate.controller'
import { AggregateService } from './aggregate/aggregate.service'
import { AnalyzeController } from './analyze/analyze.controller'
import { AnalyzeService } from './analyze/analyze.service'
import { BackupsController } from './backups/backups.controller'
import { BackupsService } from './backups/backups.service'
import { CategoriesController } from './categories/categories.controller'
import { CategoriesService } from './categories/categories.service'
import { HelperController } from './helper/helper.controller'
import { HelperService } from './helper/helper.service'
import { LinksController } from './links/links.controller'
import { LinksService } from './links/links.service'
import { NotesController } from './notes/notes.controller'
import { NotesService } from './notes/notes.service'
import { OptionsController } from './options/options.controller'
import { OptionsService } from './options/options.service'
import { ProjectsController } from './projects/projects.controller'
import { ProjectsService } from './projects/projects.service'
import { SaysController } from './says/says.controller'
import { SaysService } from './says/says.service'
import { UploadsModule } from './uploads/uploads.module'

@Module({
  imports: [UploadsModule, TasksModule, GatewayModule],
  providers: [
    OptionsService,
    AggregateService,
    CategoriesService,
    CommentsService,
    NotesService,
    PageService,
    PostsService,
    ProjectsService,
    SaysService,
    LinksService,
    HelperService,
    AnalyzeService,
    BackupsService,
  ],
  controllers: [
    OptionsController,
    AggregateController,
    CategoriesController,
    CommentsController,
    NotesController,
    PageController,
    PostsController,
    ProjectsController,
    SaysController,
    LinksController,
    HelperController,
    AnalyzeController,
    BackupsController,
  ],
})
export class SharedModule {}
