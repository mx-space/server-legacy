import { Test, TestingModule } from '@nestjs/testing';
import { AggregateResolver } from './aggregate.resolver';

describe('AggregateResolver', () => {
  let resolver: AggregateResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AggregateResolver],
    }).compile();

    resolver = module.get<AggregateResolver>(AggregateResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
