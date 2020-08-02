/*
 * @Author: Innei
 * @Date: 2020-04-30 12:21:51
 * @LastEditTime: 2020-06-07 14:26:28
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/utils/index.ts
 * @Coding with Love
 */

export function addConditionToSeeHideContent(isMaster: boolean) {
  return isMaster
    ? {
        $or: [{ hide: false }, { hide: true }],
      }
    : { hide: false, password: undefined }
}

export const range = (min: number, max: number): number[] => {
  const arr = []
  for (let index = min; index <= max; index++) {
    arr.push(index)
  }
  return arr
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //不含最大值，含最小值
}
export function PickOne<T>(arr: Array<T>): T {
  const length = arr.length
  const random = getRandomInt(0, length)
  return arr[random]
}

const md5 = (text: string) =>
  require('crypto').createHash('md5').update(text).digest('hex')
export function getAvatar(mail: string) {
  return `https://www.gravatar.com/avatar/${md5(mail)}`
}

export const yearCondition = (year?: number) => {
  if (!year) {
    return {}
  }
  return {
    created: {
      $gte: new Date(year, 1, 1),
      $lte: new Date(year + 1, 1, 1),
    },
  }
}

export function hasChinese(str: string) {
  return escape(str).indexOf('%u') < 0 ? false : true
}

export const isDev = process.env.NODE_ENV === 'development'

export const escapeShell = function (cmd: string) {
  return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"'
}

export function arrDifference(a1: string[], a2: string[]) {
  const a = [],
    diff = []

  for (let i = 0; i < a1.length; i++) {
    a[a1[i]] = true
  }

  for (let i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]]
    } else {
      a[a2[i]] = true
    }
  }

  for (const k in a) {
    diff.push(k)
  }

  return diff
}
