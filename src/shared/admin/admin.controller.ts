import { Controller } from '@nestjs/common'
import { AdminService } from 'src/shared/admin/admin.service'
import { PostsService } from 'src/shared/posts/posts.service'
import { NotesService } from 'src/shared/notes/notes.service'
import { CommentsService } from 'src/shared/comments/comments.service'

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly postService: PostsService,
    private readonly noteService: NotesService,
    private readonly commentService: CommentsService,
  ) {}
}
