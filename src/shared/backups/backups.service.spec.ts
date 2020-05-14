import { Test, TestingModule } from '@nestjs/testing';
import { BackupsService } from './backups.service';

describe('BackupsService', () => {
  let service: BackupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackupsService],
    }).compile();

    service = module.get<BackupsService>(BackupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
