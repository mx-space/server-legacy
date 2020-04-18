import { Test, TestingModule } from '@nestjs/testing';
import { AggregateService } from './aggregate.service';

describe('AggregateService', () => {
  let service: AggregateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AggregateService],
    }).compile();

    service = module.get<AggregateService>(AggregateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
