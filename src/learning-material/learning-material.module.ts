import { Module } from '@nestjs/common';
import { LearningMaterialController } from './learning-material.controller';
import { LearningMaterialService } from './learning-material.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningMaterial } from './entity/learning-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningMaterial])],
  controllers: [LearningMaterialController],
  providers: [LearningMaterialService]
})
export class LearningMaterialModule {}
