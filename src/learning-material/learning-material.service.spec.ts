import { Test, TestingModule } from '@nestjs/testing';
import { LearningMaterialService } from './learning-material.service';

describe('LearningMaterialService', () => {
  let service: LearningMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LearningMaterialService],
    }).compile();

    service = module.get<LearningMaterialService>(LearningMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
