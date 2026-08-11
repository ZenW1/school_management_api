import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitatorService } from './facilitator.service';
import { FacilitatorController } from './facilitator.controller';
import { Facilitator } from './entity/facilitator.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Facilitator]),
    UserModule,
  ],
  providers: [FacilitatorService],
  controllers: [FacilitatorController]
})
export class FacilitatorModule {}
