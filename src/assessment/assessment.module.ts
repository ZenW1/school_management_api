import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsController } from './controllers/assignments.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { GradesController } from './controllers/grades.controller';
import { AssignmentsService } from './services/assignments.service';
import { SubmissionsService } from './services/submissions.service';
import { GradesService } from './services/grades.service';
import { Assignment } from './entities/assignment.entity';
import { Submission } from './entities/submission.entity';
import { Grade } from './entities/grade.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment, Submission, Grade])],
  controllers: [AssignmentsController, SubmissionsController, GradesController],
  providers: [AssignmentsService, SubmissionsService, GradesService]
})
export class AssessmentModule { }
