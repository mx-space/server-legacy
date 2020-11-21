import { patch } from './bootstrap'

patch(async ({ db }) => {
  await Promise.all(
    ['comments', 'links', 'says', 'projects', 'categories'].map(
      async (collection) => {
        return await db.collection(collection).updateMany(
          {},
          {
            $unset: {
              modified: '',
            },
          },
        )
      },
    ),
  )

  await db.collection('analyzes').updateMany(
    {},
    {
      $unset: {
        modified: '',
      },
      $rename: {
        created: 'timestamp',
      },
    },
  )
})
