import { Test, TestingModule } from '@nestjs/testing'
import { BackupsController } from './backups.controller'

describe('Backups Controller', () => {
  let controller: BackupsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackupsController],
    }).compile()

    controller = module.get<BackupsController>(BackupsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
