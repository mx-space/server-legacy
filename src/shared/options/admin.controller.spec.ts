import { Test, TestingModule } from '@nestjs/testing'
import { OptionsController } from './admin.controller'

describe('Admin Controller', () => {
  let controller: OptionsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OptionsController],
    }).compile()

    controller = module.get<OptionsController>(OptionsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
