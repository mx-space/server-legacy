import { Test, TestingModule } from '@nestjs/testing'
import { AnalyzeController } from './analyze.controller'

describe('Analyze Controller', () => {
  let controller: AnalyzeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyzeController],
    }).compile()

    controller = module.get<AnalyzeController>(AnalyzeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
