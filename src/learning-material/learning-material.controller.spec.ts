import { Test, TestingModule } from '@nestjs/testing';
import { LearningMaterialController } from './learning-material.controller';

describe('LearningMaterialController', () => {
  let controller: LearningMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningMaterialController],
    }).compile();

    controller = module.get<LearningMaterialController>(LearningMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
