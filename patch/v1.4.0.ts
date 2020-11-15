import { bootstrap } from './bootstrap'

bootstrap(async ({ models: { analyze } }) => {
  await analyze.updateMany({}, { $unset: { modified: '' } }).exec()
})
