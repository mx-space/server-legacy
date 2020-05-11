import { Test, TestingModule } from '@nestjs/testing';
import { AnalyzeService } from './analyze.service';

describe('AnalyzeService', () => {
  let service: AnalyzeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyzeService],
    }).compile();

    service = module.get<AnalyzeService>(AnalyzeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
