import Menu from '@libs/db/models/menu.model'
import { Global, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { DbService } from './db.service'
import Category from './models/category.model'
import Comment from './models/comment.model'
import Note from './models/note.model'
import { Option } from './models/option.model'
import Page from './models/page.model'
import Post from './models/post.model'
import { User } from './models/user.model'

const models = TypegooseModule.forFeature([
  Category,
  Comment,
  Menu,
  Note,
  Option,
  Page,
  Post,
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
