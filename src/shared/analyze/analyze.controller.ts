import { Controller, Delete, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import * as dayjs from 'dayjs'
import { RedisService } from 'nestjs-redis'
import { RedisNames } from '../../../libs/common/src/redis/redis.types'
import { Auth } from '../../core/decorators/auth.decorator'
import { getMonthLength, getTodayEarly, getWeekStart } from '../../utils/time'
import { PagerDto } from '../base/dto/pager.dto'
import { AnalyzeDto } from './analyze.dto'
import { AnalyzeService } from './analyze.service'
@Controller('analyze')
@ApiTags('Analyze Routes')
@Auth()
export class AnalyzeController {
  constructor(
    private readonly service: AnalyzeService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getAnalyze(@Query() query: AnalyzeDto & Partial<PagerDto>) {
    const { from, to = new Date(), page = 1, size = 50 } = query

    const data = await this.service.getRangeAnalyzeData(from, to, {
      limit: ~~size,
      skip: (~~page - 1) * ~~size,
    })
    const total = await this.service.getCallTime()
    const redis = this.redisService.getClient(RedisNames.Access)
    const fromRedisIps = await redis.get('ips')
    const ips = fromRedisIps ? JSON.parse(fromRedisIps) : []
    return {
      ...data,
      total,
      today_ips: ips,
    }
  }

  @Get('today')
  async getAnalyzeToday(@Query() query: Partial<PagerDto>) {
    const { page = 1, size = 50 } = query
    const today = new Date()
    const todayEarly = getTodayEarly(today)
    return await this.service.getRangeAnalyzeData(todayEarly, today, {
      limit: ~~size,
      skip: (~~page - 1) * ~~size,
    })
  }

  @Get('week')
  async getAnalyzeWeek(@Query() query: Partial<PagerDto>) {
    const { page = 1, size = 50 } = query
    const today = new Date()
    const weekStart = getWeekStart(today)
    return await this.service.getRangeAnalyzeData(weekStart, today, {
      limit: ~~size,
      skip: (~~page - 1) * ~~size,
    })
  }

  @Get('fragment')
  async getFragment() {
    const now = new Date()

    // today fragment
    const nowHour = now.getHours()
    const todayHours = await Promise.all(
      Array(24)
        .fill(undefined)
        .map(async (v, i) => {
          const from = dayjs(now)
            .set('hour', i)
            .set('minute', 0)
            .set('second', 0)
          const to = from.add(1, 'hour')
          const { ip, pv } = await this.service.getRangeAnalyzeIpAndPvCount(
            from.toDate(),
            to.toDate(),
          )

          return [
            {
              hour: i === nowHour ? '现在' : i + '时',
              key: 'ip',
              value: ip,
            },
            {
              hour: i === nowHour ? '现在' : i + '时',
              key: 'pv',
              value: pv,
            },
          ]
        }),
    )

    // week fragment

    const getWeekLabel = (index: number) =>
      ['日', '一', '二', '三', '四', '五', '六'][index]
    const todayDay = now.getDay()
    const weeks = await Promise.all(
      Array(7)
        .fill(undefined)
        .map(async (v, i) => {
          const from = dayjs(now)
            .set('day', i)
            .set('hour', 0)
            .set('minute', 0)
            .set('second', 0)
          const to = from.add(1, 'day')
          const { ip, pv } = await this.service.getRangeAnalyzeIpAndPvCount(
            from.toDate(),
            to.toDate(),
          )
          const day = i === todayDay ? '今天' : '周' + getWeekLabel(i)
          return [
            {
              day,
              key: 'ip',
              value: ip,
            },
            {
              day,
              key: 'pv',
              value: pv,
            },
          ]
        }),
    )

    // month fragment
    const month = now.getMonth() + 1
    const monthEveryDays = await Promise.all(
      Array(getMonthLength(month, now.getFullYear()))
        .fill(undefined)
        .map(async (v, i) => {
          const from = dayjs(now)
            .set('hour', 0)
            .set('date', i + 1)
            .set('minute', 0)
            .set('second', 0)
          const to = from.add(1, 'day')
          const { ip, pv } = await this.service.getRangeAnalyzeIpAndPvCount(
            from.toDate(),
            to.toDate(),
          )
          const date = `${month}-${i + 1}`
          return [
            { date, key: 'ip', value: ip },
            { date, key: 'pv', value: pv },
          ]
        }),
    )

    return {
      today: todayHours.flat(1),
      weeks: weeks.flat(1),
      months: monthEveryDays.flat(1),
    }
  }

  @Get('like')
  async getTodayLikedArticle() {
    const client = this.redisService.getClient(RedisNames.Like)
    const keys = await client.keys('*mx_like*')
    return await Promise.all(
      keys.map(async (key) => {
        const id = key.split('_').pop()
        const json = await client.get(id)
        return {
          [id]: (JSON.parse(json) as {
            ip: string
            created: string
          }[]).sort(
            (a, b) =>
              new Date(a.created).getTime() - new Date(b.created).getTime(),
          ),
        }
      }),
    )
  }

  @Delete()
  async clearAnalyze(@Query() query: AnalyzeDto) {
    const { from = new Date('2020-01-01'), to = new Date() } = query
    await this.service.cleanAnalyzeRange({ from, to })
    return 'OK'
  }
}
