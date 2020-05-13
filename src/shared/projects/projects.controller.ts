import { Project } from '@libs/db/models/project.model'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BaseCrud } from '../base/base.controller'
import { ProjectsService } from './projects.service'

@Controller('projects')
@ApiTags('Project Routes')
export class ProjectsController extends BaseCrud<Project, Project> {
  constructor(private readonly projectService: ProjectsService) {
    super(projectService)
  }
}
