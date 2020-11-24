import { Project } from '@libs/db/models/project.model'
import { Injectable } from '@nestjs/common'
import { ReturnModelType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { BaseService } from 'apps/server/src/shared/base/base.service'

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectModel(Project)
    private readonly projectModel: ReturnModelType<typeof Project>,
  ) {
    super(projectModel)
  }
}
