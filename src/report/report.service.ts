import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getDashboardStats() {
    const totalStudentsResult = await this.entityManager.query(`SELECT COUNT(*) as count FROM student`);
    const totalClassesResult = await this.entityManager.query(`SELECT COUNT(*) as count FROM classes`);
    const totalFeesResult = await this.entityManager.query(`SELECT SUM(amount) as sum FROM fees WHERE status = 'PAID'`);

    return {
      totalStudents: parseInt(totalStudentsResult[0].count, 10),
      totalClasses: parseInt(totalClassesResult[0].count, 10),
      totalRevenue: totalFeesResult[0].sum ? parseFloat(totalFeesResult[0].sum) : 0,
    };
  }
}
