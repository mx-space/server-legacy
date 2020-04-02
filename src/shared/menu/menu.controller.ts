import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller('menu')
@ApiTags('Menu Routes')
export class MenuController {}
