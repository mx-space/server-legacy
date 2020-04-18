import { Test, TestingModule } from '@nestjs/testing';
import { AggregateController } from './aggregate.controller';

describe('Aggregate Controller', () => {
  let controller: AggregateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AggregateController],
    }).compile();

    controller = module.get<AggregateController>(AggregateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
