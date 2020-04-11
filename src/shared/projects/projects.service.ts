import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { Project } from '@libs/db/models/project.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { BaseService } from 'src/shared/base/base.service'

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectModel(Project)
    private readonly projectModel: ReturnModelType<typeof Project>,
  ) {
    super(projectModel)
  }
}
