import { Module } from '@nestjs/common'
import { CommentsController } from 'src/shared/comments/comments.controller'
import { CommentsService } from 'src/shared/comments/comments.service'
import { PostsController } from 'src/shared/posts/posts.controller'
import { PostsService } from 'src/shared/posts/posts.service'
import { CategoriesController } from './categories/categories.controller'
import { CategoriesService } from './categories/categories.service'
import { MenuController } from './menu/menu.controller'
import { MenuService } from './menu/menu.service'
import { NotesController } from './notes/notes.controller'
import { NotesService } from './notes/notes.service'
import { TestModule } from './test/test.module'
import { PageController } from 'src/shared/page/page.controller'
import { PageService } from 'src/shared/page/page.service'
import { AdminController } from './admin/admin.controller'
import { AdminService } from './admin/admin.service'
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { UploadsController } from './uploads/uploads.controller';
import { UploadsService } from './uploads/uploads.service';
import { SaysController } from './says/says.controller';
import { SaysService } from './says/says.service';

@Module({
  providers: [
    CategoriesService,
    CommentsService,
    MenuService,
    NotesService,
    PageService,
    PostsService,
    AdminService,
    ProjectsService,
    UploadsService,
    SaysService,
  ],
  controllers: [
    CategoriesController,
    CommentsController,
    MenuController,
    NotesController,
    PageController,
    PostsController,
    AdminController,
    ProjectsController,
    UploadsController,
    SaysController,
  ],
  imports: [TestModule],
})
export class SharedModule {}
