import * as dayjs from 'dayjs'

export const getTodayEarly = (today: Date) =>
  dayjs(today).set('hour', 0).set('minute', 0).set('millisecond', 0).toDate()

export const getWeekStart = (today: Date) =>
  dayjs(today)
    .set('day', 0)
    .set('hour', 0)
    .set('millisecond', 0)
    .set('minute', 0)
    .toDate()

export const getMonthStart = (today: Date) =>
  dayjs(today)
    .set('date', 0)
    .set('hour', 0)
    .set('minute', 0)
    .set('millisecond', 0)
    .toDate()

export function getMonthLength(date: Date) {
  const d = new Date(date)

  d.setMonth(d.getMonth() + 1)
  d.setDate(1)

  d.setDate(d.getDate() - 1)
  return d.getDate()
}
