import { patch } from './bootstrap'

patch(async ({ models: { analyze } }) => {
  await analyze.updateMany({}, { $unset: { modified: '' } }).exec()
})
