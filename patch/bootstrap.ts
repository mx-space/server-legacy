import Category from '../libs/db/src/models/category.model'
import Note from '../libs/db/src/models/note.model'
import Post from '../libs/db/src/models/post.model'
import { getModelForClass, mongoose } from '@typegoose/typegoose'
import { config } from 'dotenv'
import { Analyze } from '../libs/db/src/models/analyze.model'
import { ConnectionBase } from 'mongoose'

const env = config().parsed || {}
const url =
  (process.env.DB_URL || env.DB_URL || 'mongodb://localhost') + '/mx-space'
const opt = {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
}
mongoose.connect(url, opt)
const post = getModelForClass(Post)
const note = getModelForClass(Note)
const category = getModelForClass(Category)
const analyze = getModelForClass(Analyze)
const Config = {
  env,
  db: (mongoose.connection as any).client.db('mx-space') as ConnectionBase,
  models: {
    post,
    note,
    category,
    analyze,
  },
}
export async function bootstrap(cb: (config: typeof Config) => any) {
  await cb.call(this, Config)

  mongoose.disconnect()
  process.exit()
}
