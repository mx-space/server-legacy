import { Module, Global } from '@nestjs/common'
import { DbService } from './db.service'
import { TypegooseModule } from 'nestjs-typegoose'
import { User } from './models/user.model'
import Note from './models/note.model'
import Comment from './models/comment.model'
import Post from './models/post.model'
import Option from './models/option.model'
import Category from './models/category.model'
import Menu from '@libs/db/models/menu.model'
import Page from './models/page.model'

const models = TypegooseModule.forFeature([
  Category,
  Comment,
  Menu,
  Note,
  Option,
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
