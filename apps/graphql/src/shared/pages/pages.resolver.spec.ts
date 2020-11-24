import { Test, TestingModule } from '@nestjs/testing';
import { PagesResolver } from './pages.resolver';

describe('PagesResolver', () => {
  let resolver: PagesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PagesResolver],
    }).compile();

    resolver = module.get<PagesResolver>(PagesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
