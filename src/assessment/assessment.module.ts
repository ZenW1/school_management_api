import { Module } from '@nestjs/common';
import { AssignmentsController } from './controllers/assignments.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { GradesController } from './controllers/grades.controller';
import { AssignmentsService } from './services/assignments.service';
import { SubmissionsService } from './services/submissions.service';
import { GradesService } from './services/grades.service';

@Module({
  controllers: [AssignmentsController, SubmissionsController, GradesController],
  providers: [AssignmentsService, SubmissionsService, GradesService]
})
export class AssessmentModule { }
