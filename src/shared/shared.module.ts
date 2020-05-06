import { Module } from '@nestjs/common'
import { CommentsController } from 'src/shared/comments/comments.controller'
import { CommentsService } from 'src/shared/comments/comments.service'
import { PageController } from 'src/shared/page/page.controller'
import { PageService } from 'src/shared/page/page.service'
import { PostsController } from 'src/shared/posts/posts.controller'
import { PostsService } from 'src/shared/posts/posts.service'
import { OptionsController } from './options/admin.controller'
import { OptionsService } from './options/admin.service'
import { AggregateController } from './aggregate/aggregate.controller'
import { AggregateService } from './aggregate/aggregate.service'
import { CategoriesController } from './categories/categories.controller'
import { CategoriesService } from './categories/categories.service'
import { MenuController } from './menu/menu.controller'
import { MenuService } from './menu/menu.service'
import { NotesController } from './notes/notes.controller'
import { NotesService } from './notes/notes.service'
import { ProjectsController } from './projects/projects.controller'
import { ProjectsService } from './projects/projects.service'
import { SaysController } from './says/says.controller'
import { SaysService } from './says/says.service'
import { TestModule } from './test/test.module'
import { UploadsModule } from './uploads/uploads.module'
import { LinksController } from './links/links.controller'
import { LinksService } from './links/links.service'

@Module({
  providers: [
    OptionsService,
    AggregateService,
    CategoriesService,
    CommentsService,
    MenuService,
    NotesService,
    PageService,
    PostsService,
    ProjectsService,
    SaysService,
    LinksService,
  ],
  controllers: [
    OptionsController,
    AggregateController,
    CategoriesController,
    CommentsController,
    MenuController,
    NotesController,
    PageController,
    PostsController,
    ProjectsController,
    SaysController,
    LinksController,
  ],
  imports: [TestModule, UploadsModule],
})
export class SharedModule {}
