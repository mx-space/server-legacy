import Note from '../libs/db/src/models/note.model'
import Post from '../libs/db/src/models/post.model'
import { getModelForClass } from '@typegoose/typegoose'
import { config } from 'dotenv'
import { connect, disconnect } from 'mongoose'
const env = config().parsed

async function main() {
  connect((env.DB_URL || 'mongodb://localhost') + '/mx-space', {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })

  {
    const post = getModelForClass(Post)
    const note = getModelForClass(Note)
    const allPosts = await post.find()
    const allNotes = await note.find()

    for await (const post of [...allPosts, ...allNotes]) {
      const text = post.text

      post.text = text
        .replace(
          'https://raw.githubusercontent.com/Innei/img-bed/master',
          'https://cdn.jsdelivr.net/gh/innei/img-bed@master',
        )
        .replace(/.*?.sinaimg.cn/, 'tva2.sinaimg.cn')
      //@ts-ignore
      await post.save()
    }
  }

  disconnect()
}

main()
