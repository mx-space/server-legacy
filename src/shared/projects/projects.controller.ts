import { Controller, Get, Body, Post, UseGuards } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { ProjectDto } from 'src/shared/projects/dto/project.dto'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

@Controller('projects')
@ApiTags('Project Routes')
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  @Get()
  async getProjects() {
    return this.projectService.findWithPaginator()
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async createProject(@Body() body: ProjectDto) {
    return this.projectService.createNew(body)
  }
}
