/*
 * @Author: Innei
 * @Date: 2021-03-11 22:14:27
 * @LastEditTime: 2021-03-12 10:12:13
 * @LastEditors: Innei
 * @FilePath: /server/shared/core/interceptors/secret.interceptors.ts
 * Mark: Coding with Love
 */
import Note from '@libs/db/models/note.model'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import * as locale from 'dayjs/locale/zh'
import * as relativeTime from 'dayjs/plugin/relativeTime'
import { IncomingMessage } from 'http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import dayjs = require('dayjs')
import { GqlExecutionContext } from '@nestjs/graphql'
import { AnyType } from 'apps/graphql/src/shared/base/interfaces'
dayjs.extend(relativeTime)
dayjs.locale(locale)
export interface Response<T> {
  data: T
}

@Injectable()
export class NoteSecretInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const http = context.switchToHttp()
    const req = http.getRequest() as IncomingMessage
    // @ts-ignore
    const isMaster = req.isMaster
    if (isMaster) {
      return next.handle()
    }

    return next.handle().pipe(map(handle()))
  }
}

function filterSecretNote(note: Note, now: Date) {
  const data = note
  const secret = data.secret
  if (secret && new Date(secret).getTime() - now.getTime() > 0) {
    data.text = '这篇文章需要在 ' + dayjs(secret).fromNow() + '才能查看哦'
    data.mood = undefined
    data.weather = undefined
    delete data.mood
    delete data.weather
  }
}

@Injectable()
export class NoteSecretGQLInterceptor<T>
  implements NestInterceptor<T, AnyType> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<AnyType> {
    // const http = context.switchToHttp()
    const req = GqlExecutionContext.create(context).getContext()
      .req as IncomingMessage
    // @ts-ignore
    const isMaster = req.isMaster
    if (isMaster) {
      return next.handle()
    }

    return next.handle().pipe(map(handle()))
  }
}
function handle(): (value: any, index: number) => any {
  const now = new Date()
  return (data) => {
    if (!data) return data
    // console.log(data)
    const dataField = data.data as Note[] | Note
    if (!dataField) {
      filterSecretNote(data, now)
    } else {
      if (Array.isArray(dataField)) {
        dataField.forEach((data) => filterSecretNote(data, now))
      } else filterSecretNote(dataField, now)
    }

    return data
  }
}
