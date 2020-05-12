import { Controller, Get, Query, Delete } from '@nestjs/common'
import { AnalyzeService } from './analyze.service'
import { ApiTags } from '@nestjs/swagger'
import { AnalyzeDto } from './analyze.dto'
import { DocumentType } from '@typegoose/typegoose'
import { RedisService } from 'nestjs-redis'
import { PagerDto } from '../base/dto/pager.dto'
import { getTodayEarly, getWeekStart, getMonthStart } from '../utils/time'
import { Analyze } from '../../../libs/db/src/models/analyze.model'
import { Auth } from '../../core/decorators/auth.decorator'
import * as dayjs from 'dayjs'
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
    const redis = this.redisService.getClient('access')
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
    const todayData: Pick<
      DocumentType<Analyze>,
      '_id' | 'ip' | 'ua' | 'created' | 'typegooseName'
    >[] = (await this.service.getRangeAnalyzeData(getTodayEarly(now), now, {
      withPaginator: false,
    })) as any
    // today fragment
    const todayHours = {} as {
      [key: number]: number
    }

    todayData.forEach((d) => {
      const time = new Date(d.created)
      const hour = time.getHours()
      todayHours[hour] = -~todayHours[hour]
    })
    // week fragment
    const weekData: Pick<
      DocumentType<Analyze>,
      '_id' | 'ip' | 'ua' | 'created' | 'typegooseName'
    >[] = (await this.service.getRangeAnalyzeData(getWeekStart(now), now, {
      withPaginator: false,
    })) as any

    const weeks = {} as { [key: number]: number }
    weekData.forEach((i) => {
      const time = new Date(i.created)
      const gap = dayjs(now).diff(dayjs(time), 'day')
      weeks[gap] = -~weeks[gap]
    })

    // month fragment
    const monthEveryDays = {} as { [key: number]: number }
    const thisMonthData: Pick<
      DocumentType<Analyze>,
      '_id' | 'ip' | 'ua' | 'created' | 'typegooseName'
    >[] = (await this.service.getRangeAnalyzeData(getMonthStart(now), now, {
      withPaginator: false,
    })) as any

    thisMonthData.forEach((i) => {
      const time = new Date(i.created)
      const day = time.getDate()
      monthEveryDays[day] = -~monthEveryDays[day]
    })

    return {
      today: todayHours,
      weeks,
      months: monthEveryDays,
    }
  }

  @Delete()
  async clearAnalyze() {
    await this.service.clearAnalyzeRange()
    return 'OK'
  }
}
