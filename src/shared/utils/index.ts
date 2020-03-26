export function addCondition(isMaster: boolean) {
  return isMaster
    ? {
        $or: [{ hide: false }, { hide: true }],
      }
    : { $or: [{ hide: false }] }
}
