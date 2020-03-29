// TODO 限制密码访问
export function addCondition(isMaster: boolean) {
  return isMaster
    ? {
        $or: [{ hide: false }, { hide: true }],
      }
    : { $or: [{ hide: false }] }
}
