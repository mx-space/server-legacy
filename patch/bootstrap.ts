import Category from '../libs/db/src/models/category.model'
import Note from '../libs/db/src/models/note.model'
import Post from '../libs/db/src/models/post.model'
import { getModelForClass, mongoose } from '@typegoose/typegoose'
import { config } from 'dotenv'
import { Analyze } from '../libs/db/src/models/analyze.model'

const env = config().parsed || {}

mongoose.connect(
  (process.env.DB_URL || env.DB_URL || 'mongodb://localhost') + '/mx-space',
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  },
)

const post = getModelForClass(Post)
const note = getModelForClass(Note)
const category = getModelForClass(Category)
const analyze = getModelForClass(Analyze)
const Config = {
  env,
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
