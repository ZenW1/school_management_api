import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto } from '../dto/create-assignment.dto';
import { UpdateAssignmentDto } from '../dto/update-assignment.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../user/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  create(@Body() createAssignmentDto: CreateAssignmentDto, @Req() req: any) {
    return this.assignmentsService.create(createAssignmentDto, req.user);
  }

  @Get()
  @Roles(Role.USER)
  findAll(@Query('classId') classId?: string) {
    return this.assignmentsService.findAll(classId ? +classId : undefined);
  }

  @Get(':id')
  @Roles(Role.USER)
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findById(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  update(@Param('id') id: string, @Body() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentsService.update(+id, updateAssignmentDto);
  }

  @Patch(':id/publish')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  publish(@Param('id') id: string) {
    return this.assignmentsService.publish(+id);
  }

  @Patch(':id/close')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  close(@Param('id') id: string) {
    return this.assignmentsService.close(+id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(+id);
  }
}
