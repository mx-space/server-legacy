/*
 * @Author: Innei
 * @Date: 2020-05-08 17:02:08
 * @LastEditTime: 2020-08-24 22:20:24
 * @LastEditors: Innei
 * @FilePath: /mx-server/libs/common/src/tasks/tasks.module.ts
 * @Coding with Love
 */
import { HttpModule, Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TasksService } from './tasks.service'

@Module({
  imports: [ScheduleModule.forRoot(), HttpModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
