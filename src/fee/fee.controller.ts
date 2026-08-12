import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeeService } from './fee.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../user/enums/role.enum';

@ApiTags('Fees')
@Controller('fee')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create fee record' })
  create(@Body() createFeeDto: CreateFeeDto) {
    return this.feeService.create(createFeeDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all fee records' })
  findAll() {
    return this.feeService.findAll();
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get fees by student ID' })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.feeService.findByStudent(studentId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get a fee record' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.feeService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a fee record' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feeService.update(id, updateFeeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a fee record' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.feeService.remove(id);
  }
}
