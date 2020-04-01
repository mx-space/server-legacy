import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { RolesGuard } from 'src/auth/roles.guard'
import { Master } from 'src/core/decorators/guest.decorator'
import { CannotFindException } from 'src/core/exceptions/cant-find.exception'
import { IdDto } from 'src/shared/base/dto/id.dto'
import { CategoriesService } from 'src/shared/categories/categories.service'
import {
  CategoryDto,
  SlugOrIdDto,
} from 'src/shared/categories/dto/category.dto'

@Controller('categories')
@ApiTags('Category Routes')
@UseGuards(RolesGuard)
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  // TODO: Get `/` DELETE `/:id` <01-04-20 Innei> //
  @Get(':query')
  async getCategoryById(
    @Param() params: SlugOrIdDto,
    @Master() isMaster: boolean,
  ) {
    const { query } = params
    if (!query) {
      throw new BadRequestException()
    }

    const isId = Types.ObjectId.isValid(query)
    const res = isId
      ? await this.categoryService.findById(query).sort({ created: -1 })
      : await this.categoryService
          .findOne({ slug: query })
          .sort({ created: -1 })

    if (!res) {
      throw new CannotFindException()
    }
    // FIXME category count if empty will be [] not null
    // the expect is [] or null
    const children =
      (await this.categoryService.findCategoryPost(res._id, isMaster)) || []
    return { data: { ...res.toObject(), children } }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('bearer')
  async createCategory(@Body() body: CategoryDto) {
    const { type = 'Category', name } = body
    const { slug = name } = body
    try {
      const category = await this.categoryService.createNew({
        type,
        slug,
        name,
      })
      return category
    } catch {
      throw new UnprocessableEntityException('分类重复啦')
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiSecurity('bearer')
  async modifyCategory(@Param() params: IdDto, @Body() body: CategoryDto) {
    const { type, slug, name } = body
    const { id } = params
    const res = await this.categoryService.updateByIdAsync(id, {
      slug,
      type,
      name,
    })
    return res
  }
}
