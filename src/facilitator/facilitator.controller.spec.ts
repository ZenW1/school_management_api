import { Test, TestingModule } from '@nestjs/testing';
import { FacilitatorController } from './facilitator.controller';

describe('FacilitatorController', () => {
  let controller: FacilitatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitatorController],
    }).compile();

    controller = module.get<FacilitatorController>(FacilitatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
