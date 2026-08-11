import { Test, TestingModule } from '@nestjs/testing';
import { FacilitatorService } from './facilitator.service';

describe('FacilitatorService', () => {
  let service: FacilitatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacilitatorService],
    }).compile();

    service = module.get<FacilitatorService>(FacilitatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
