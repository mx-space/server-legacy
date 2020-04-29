import Category from './models/category.model'
import Comment from './models/comment.model'
import Menu from '@libs/db/models/menu.model'
import Note from './models/note.model'
import Page from './models/page.model'
import Post from './models/post.model'
import { DbService } from './db.service'
import { File } from './models/file.model'
import { Global, Module } from '@nestjs/common'
import { Option } from './models/option.model'
import { Project } from './models/project.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { User } from './models/user.model'
import { Say } from './models/say.model'
import { Link } from './models/link.model'

const models = TypegooseModule.forFeature([
  Category,
  Comment,
  File,
  Link,
  Menu,
  Note,
  Option,
  Page,
  Post,
  Project,
  Say,
  User,
])

@Global()
@Module({
  imports: [
    TypegooseModule.forRootAsync({
      useFactory: () => ({
        uri: (process.env.DB_URL || 'mongodb://localhost') + '/nest-test',
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
      }),
    }),
    models,
  ],
  providers: [DbService],
  exports: [DbService, models],
})
export class DbModule {}
