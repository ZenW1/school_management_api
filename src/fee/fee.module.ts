import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';
import { Fee } from './entity/fee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fee])],
  controllers: [FeeController],
  providers: [FeeService],
  exports: [FeeService],
})
export class FeeModule {}
