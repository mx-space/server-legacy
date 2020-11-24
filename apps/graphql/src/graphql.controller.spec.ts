import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlController } from './graphql.controller';
import { GraphqlService } from './graphql.service';

describe('GraphqlController', () => {
  let graphqlController: GraphqlController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GraphqlController],
      providers: [GraphqlService],
    }).compile();

    graphqlController = app.get<GraphqlController>(GraphqlController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(graphqlController.getHello()).toBe('Hello World!');
    });
  });
});
