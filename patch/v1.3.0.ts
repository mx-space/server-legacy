// patch for version lower than v1.3.0

import { CategoryType } from '../libs/db/src/models/category.model'
import { bootstrap } from './bootstrap'

bootstrap(async ({ models: { category } }) => {
  await category.deleteMany({
    type: CategoryType.Tag,
  })
})
