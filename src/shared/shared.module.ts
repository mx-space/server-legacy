import { Module } from '@nestjs/common'
import { CommentsController } from 'src/shared/comments/comments.controller'
import { CommentsService } from 'src/shared/comments/comments.service'
import { PageController } from 'src/shared/page/page.controller'
import { PageService } from 'src/shared/page/page.service'
import { PostsController } from 'src/shared/posts/posts.controller'
import { PostsService } from 'src/shared/posts/posts.service'
import { AdminController } from './admin/admin.controller'
import { AdminService } from './admin/admin.service'
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
import { UploadsController } from './uploads/uploads.controller'
import { UploadsService } from './uploads/uploads.service'

@Module({
  providers: [
    AdminService,
    AggregateService,
    CategoriesService,
    CommentsService,
    MenuService,
    NotesService,
    PageService,
    PostsService,
    ProjectsService,
    SaysService,
    UploadsService,
  ],
  controllers: [
    AdminController,
    AggregateController,
    CategoriesController,
    CommentsController,
    MenuController,
    NotesController,
    PageController,
    PostsController,
    ProjectsController,
    SaysController,
    UploadsController,
  ],
  imports: [TestModule],
})
export class SharedModule {}
