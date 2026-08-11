import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FacilitatorService } from './facilitator.service';
import { CreateFacilitatorDto } from './dto/create-facilitator.dto';
import { UpdateFacilitatorDto } from './dto/update-facilitator.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('facilitators')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facilitators')
export class FacilitatorController {
  constructor(private readonly facilitatorService: FacilitatorService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  async create(@Body() createDto: CreateFacilitatorDto) {
    return await this.facilitatorService.create(createDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll() {
    return await this.facilitatorService.findAll();
  }

  @Get(':id')
  @Roles(Role.USER) // Any authenticated user can view a profile if needed, or restrict to ADMIN/MANAGER/FACILITATOR
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.facilitatorService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacilitatorDto
  ) {
    return await this.facilitatorService.update(id, updateDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string
  ) {
    return await this.facilitatorService.updateStatus(id, status);
  }

  @Patch(':id/availability')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  async updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body('availability') availability: any
  ) {
    return await this.facilitatorService.updateAvailability(id, availability);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.facilitatorService.delete(id);
  }

  // --- MOCK ENDPOINTS FOR PHASE 2 ---
  @Get(':id/classes')
  @Roles(Role.USER)
  async getClasses(@Param('id', ParseIntPipe) id: number) {
    return await this.facilitatorService.getClasses(id);
  }

  @Get(':id/students')
  @Roles(Role.USER)
  async getStudents(@Param('id', ParseIntPipe) id: number) {
    return await this.facilitatorService.getStudents(id);
  }

  @Get(':id/performance')
  @Roles(Role.ADMIN, Role.MANAGER, Role.FACILITATOR)
  async getPerformanceMetrics(@Param('id', ParseIntPipe) id: number) {
    return await this.facilitatorService.getPerformanceMetrics(id);
  }

  @Patch(':id/performance')
  @Roles(Role.ADMIN, Role.MANAGER)
  async updatePerformanceRating(
    @Param('id', ParseIntPipe) id: number,
    @Body('rating') rating: number
  ) {
    return await this.facilitatorService.updatePerformanceRating(id, rating);
  }

  @Get(':id/schedule')
  @Roles(Role.USER)
  async getSchedule(@Param('id', ParseIntPipe) id: number) {
    return await this.facilitatorService.getSchedule(id);
  }
}
