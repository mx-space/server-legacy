// TODO 限制密码访问
export function addCondition(isMaster: boolean) {
  return isMaster
    ? {
        $or: [{ hide: false }, { hide: true }],
      }
    : { $or: [{ hide: false }] }
}

export const Range = (min: number, max: number): number[] => {
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
