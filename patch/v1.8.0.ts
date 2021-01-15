import { patch } from './bootstrap'

/*
 * @Author: Innei
 * @Date: 2021-01-15 14:18:33
 * @LastEditTime: 2021-01-15 14:21:26
 * @LastEditors: Innei
 * @FilePath: /server/patch/v1.8.0.ts
 * @Mark: Coding with Love
 */
patch(async ({ db }) => {
  await db.collection('options').updateOne(
    { name: 'commentOptions' },
    {
      $unset: { 'value.akismetApiKey': 1 },
    },
  )
})
