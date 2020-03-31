import { Module } from '@nestjs/common'
import { CommentsController } from 'src/shared/comments/comments.controller'
import { CommentsService } from 'src/shared/comments/comments.service'
import { PostsController } from 'src/shared/posts/posts.controller'
import { NotesController } from './notes/notes.controller'
import { NotesService } from './notes/notes.service'
import { PostsService } from 'src/shared/posts/posts.service'
import { TestModule } from './test/test.module';

@Module({
  providers: [PostsService, NotesService, CommentsService],
  controllers: [NotesController, CommentsController, PostsController],
  imports: [TestModule],
})
export class SharedModule {}
