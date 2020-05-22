import { Test, TestingModule } from '@nestjs/testing'
import { SaysService } from './says.service'

describe('SaysService', () => {
  let service: SaysService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaysService],
    }).compile()

    service = module.get<SaysService>(SaysService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
