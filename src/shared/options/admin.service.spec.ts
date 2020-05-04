import { Test, TestingModule } from '@nestjs/testing'
import { OptionsService } from './admin.service'

describe('AdminService', () => {
  let service: OptionsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OptionsService],
    }).compile()

    service = module.get<OptionsService>(OptionsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
