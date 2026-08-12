/**
 * Database Seeder
 *
 * Seeds all features with realistic data:
 *  Users → Students → Facilitators → Courses → Classes →
 *  LearningMaterials → Assignments → Submissions → Grades →
 *  Attendance → Fees
 *
 * Run: npx ts-node -r tsconfig-paths/register src/database/seed.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// --- Entities ---
import { User } from '../user/entity/user.entity';
import { Student } from '../student/entity/student.entity';
import { DocumentUpload } from '../student/entity/document-upload.entity';
import { Facilitator } from '../facilitator/entity/facilitator.entity';
import { Course } from '../course/entity/course.entity';
import { Class } from '../class/entity/class.entity';
import { LearningMaterial } from '../learning-material/entity/learning-material.entity';
import { Assignment } from '../assessment/entities/assignment.entity';
import { Submission } from '../assessment/entities/submission.entity';
import { Grade } from '../assessment/entities/grade.entity';
import { Attendance } from '../attendance/entity/attendance.entity';
import { Fee } from '../fee/entity/fee.entity';
import { Media } from '../media/entity/media.entity';

// --- Enums ---
import { Role } from '../user/enums/role.enum';
import { StudentStatus } from '../student/enum/student.status.enum';
import { DocumentType } from '../student/enum/document-type.enum';
import { VerificationStatus } from '../student/enum/verification-status.enum';
import { FacilitatorStatus } from '../facilitator/enum/facilitator.status.enum';
import { CourseStatus } from '../course/enum/course-status.enum';
import { ClassStatus } from '../class/enum/class-status.enum';
import { FileType } from '../learning-material/enum/file-type.enum';
import { Visibility } from '../learning-material/enum/visibility.enum';
import { AssignmentStatus } from '../assessment/enums/assignment-status.enum';
import { SubmissionStatus } from '../assessment/enums/submission-status.enum';
import { AttendanceStatus } from '../attendance/enum/attendance-status.enum';
import { FeeStatus } from '../fee/enum/fee-status.enum';

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Data Source
// ─────────────────────────────────────────────────────────────────────────────
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
  username: process.env.POSTGRES_USER ?? 'myuser',
  password: process.env.POSTGRES_PASSWORD ?? 'mypassword',
  database: process.env.POSTGRES_DB ?? 'mydb',
  entities: [
    User,
    Media,
    Student,
    DocumentUpload,
    Facilitator,
    Course,
    Class,
    LearningMaterial,
    Assignment,
    Submission,
    Grade,
    Attendance,
    Fee,
  ],
  synchronize: true,
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  return daysFromNow(-days);
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────────────────────
async function seed(): Promise<void> {
  await AppDataSource.initialize();
  console.log('✅ Database connected');
  
  // Drop and recreate schema to make seeding idempotent
  await AppDataSource.synchronize(true);
  console.log('✅ Schema dropped and recreated');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  console.log('🌱 Seeding users…');
  const userRepo = AppDataSource.getRepository(User);

  const [admin, manager, facUser1, facUser2, stuUser1, stuUser2, stuUser3] =
    await userRepo.save([
      userRepo.create({
        name: 'Admin User',
        email: 'admin@school.dev',
        password: hashedPassword,
        role: Role.ADMIN,
        dob: new Date('1985-03-15'),
      }),
      userRepo.create({
        name: 'Manager User',
        email: 'manager@school.dev',
        password: hashedPassword,
        role: Role.MANAGER,
        dob: new Date('1988-07-22'),
      }),
      userRepo.create({
        name: 'Dr. Alice Johnson',
        email: 'alice.johnson@school.dev',
        password: hashedPassword,
        role: Role.FACILITATOR,
        dob: new Date('1980-11-10'),
      }),
      userRepo.create({
        name: 'Prof. Bob Smith',
        email: 'bob.smith@school.dev',
        password: hashedPassword,
        role: Role.FACILITATOR,
        dob: new Date('1975-05-30'),
      }),
      userRepo.create({
        name: 'Charlie Brown',
        email: 'charlie.brown@school.dev',
        password: hashedPassword,
        role: Role.STUDENT,
        dob: new Date('2002-01-14'),
      }),
      userRepo.create({
        name: 'Diana Prince',
        email: 'diana.prince@school.dev',
        password: hashedPassword,
        role: Role.STUDENT,
        dob: new Date('2001-09-25'),
      }),
      userRepo.create({
        name: 'Evan Rogers',
        email: 'evan.rogers@school.dev',
        password: hashedPassword,
        role: Role.STUDENT,
        dob: new Date('2003-04-08'),
      }),
    ]);
  console.log('   ✔ 7 users created');

  // ── 2. STUDENTS ───────────────────────────────────────────────────────────
  console.log('🌱 Seeding students…');
  const studentRepo = AppDataSource.getRepository(Student);
  const [student1, student2, student3] = await studentRepo.save([
    studentRepo.create({
      userId: stuUser1.id,
      name: stuUser1.name,
      enrollmentDate: daysAgo(365),
      parentName: 'George Brown',
      parentPhone: '+1-555-0101',
      address: '123 Maple Street, Springfield',
      dateOfBirth: stuUser1.dob,
      gpa: 3.75,
      status: StudentStatus.ACTIVE,
    }),
    studentRepo.create({
      userId: stuUser2.id,
      name: stuUser2.name,
      enrollmentDate: daysAgo(300),
      parentName: 'Hippolyta Queen',
      parentPhone: '+1-555-0202',
      address: '456 Oak Avenue, Metropolis',
      dateOfBirth: stuUser2.dob,
      gpa: 3.90,
      status: StudentStatus.ACTIVE,
    }),
    studentRepo.create({
      userId: stuUser3.id,
      name: stuUser3.name,
      enrollmentDate: daysAgo(180),
      parentName: 'Steve Rogers',
      parentPhone: '+1-555-0303',
      address: '789 Pine Road, Gotham',
      dateOfBirth: stuUser3.dob,
      gpa: 3.20,
      status: StudentStatus.ACTIVE,
    }),
  ]);
  console.log('   ✔ 3 students created');

  // ── 3. DOCUMENT UPLOADS ───────────────────────────────────────────────────
  console.log('🌱 Seeding student documents…');
  const docRepo = AppDataSource.getRepository(DocumentUpload);
  await docRepo.save([
    docRepo.create({
      userId: stuUser1.id,
      documentType: DocumentType.ID,
      fileUrl: '/uploads/docs/charlie_id.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
    }),
    docRepo.create({
      userId: stuUser2.id,
      documentType: DocumentType.CERTIFICATE,
      fileUrl: '/uploads/docs/diana_cert.pdf',
      verificationStatus: VerificationStatus.VERIFIED,
    }),
    docRepo.create({
      userId: stuUser3.id,
      documentType: DocumentType.QUALIFICATION,
      fileUrl: '/uploads/docs/evan_qual.pdf',
      verificationStatus: VerificationStatus.PENDING,
    }),
  ]);
  console.log('   ✔ 3 documents created');

  // ── 4. FACILITATORS ───────────────────────────────────────────────────────
  console.log('🌱 Seeding facilitators…');
  const facilitatorRepo = AppDataSource.getRepository(Facilitator);
  const [fac1, fac2] = await facilitatorRepo.save([
    facilitatorRepo.create({
      user: facUser1,
      specialization: 'Web Development & Cloud Computing',
      qualification: 'PhD Computer Science, MIT',
      hireDate: daysAgo(730),
      department: 'Engineering',
      status: FacilitatorStatus.ACTIVE,
      performanceRating: 4.85,
      totalClassesAssigned: 8,
      totalStudentsTaught: 120,
      availability: {
        monday: ['09:00-12:00', '14:00-17:00'],
        wednesday: ['09:00-12:00', '14:00-17:00'],
        friday: ['09:00-12:00'],
      },
    }),
    facilitatorRepo.create({
      user: facUser2,
      specialization: 'Database Systems & Data Engineering',
      qualification: 'MSc Information Systems, Stanford',
      hireDate: daysAgo(1095),
      department: 'Data Science',
      status: FacilitatorStatus.ACTIVE,
      performanceRating: 4.60,
      totalClassesAssigned: 12,
      totalStudentsTaught: 200,
      availability: {
        tuesday: ['10:00-13:00', '15:00-18:00'],
        thursday: ['10:00-13:00', '15:00-18:00'],
      },
    }),
  ]);
  console.log('   ✔ 2 facilitators created');

  // ── 5. COURSES ────────────────────────────────────────────────────────────
  console.log('🌱 Seeding courses…');
  const courseRepo = AppDataSource.getRepository(Course);
  const [course1, course2, course3] = await courseRepo.save([
    courseRepo.create({
      code: 'CS101',
      name: 'Introduction to Web Development',
      description: 'Fundamentals of HTML, CSS, JavaScript and modern web frameworks.',
      credits: 3,
      syllabusUrl: '/uploads/syllabus/cs101.pdf',
      status: CourseStatus.ACTIVE,
      createdBy: admin,
    }),
    courseRepo.create({
      code: 'CS201',
      name: 'Database Systems',
      description: 'Relational databases, SQL, NoSQL, indexing and query optimization.',
      credits: 4,
      prerequisites: 'CS101',
      syllabusUrl: '/uploads/syllabus/cs201.pdf',
      status: CourseStatus.ACTIVE,
      createdBy: admin,
    }),
    courseRepo.create({
      code: 'CS301',
      name: 'Cloud Computing & DevOps',
      description: 'AWS/GCP fundamentals, Docker, Kubernetes, and CI/CD pipelines.',
      credits: 3,
      prerequisites: 'CS101,CS201',
      syllabusUrl: '/uploads/syllabus/cs301.pdf',
      status: CourseStatus.ACTIVE,
      createdBy: admin,
    }),
  ]);
  console.log('   ✔ 3 courses created');

  // ── 6. CLASSES ────────────────────────────────────────────────────────────
  console.log('🌱 Seeding classes…');
  const classRepo = AppDataSource.getRepository(Class);
  const [class1, class2] = await classRepo.save([
    classRepo.create({
      courseId: course1.id,
      facilitatorId: fac1.id,
      className: 'CS101-A Morning Batch',
      capacity: 30,
      schedule: {
        monday: '09:00-11:00',
        wednesday: '09:00-11:00',
        friday: '09:00-10:00',
      },
      semester: 'Fall 2025',
      startDate: daysAgo(60),
      endDate: daysFromNow(60),
      enrolledCount: 3,
      status: ClassStatus.ACTIVE,
    }),
    classRepo.create({
      courseId: course2.id,
      facilitatorId: fac2.id,
      className: 'CS201-B Evening Batch',
      capacity: 25,
      schedule: {
        tuesday: '15:00-17:00',
        thursday: '15:00-17:00',
      },
      semester: 'Fall 2025',
      startDate: daysAgo(45),
      endDate: daysFromNow(75),
      enrolledCount: 2,
      status: ClassStatus.ACTIVE,
    }),
    classRepo.create({
      courseId: course3.id,
      facilitatorId: fac1.id,
      className: 'CS301-A Afternoon Batch',
      capacity: 20,
      schedule: {
        wednesday: '14:00-17:00',
        friday: '14:00-16:00',
      },
      semester: 'Spring 2026',
      startDate: daysFromNow(30),
      endDate: daysFromNow(150),
      enrolledCount: 0,
      status: ClassStatus.UPCOMING,
    }),
  ]);
  console.log('   ✔ 3 classes created');

  // ── 7. LEARNING MATERIALS ─────────────────────────────────────────────────
  console.log('🌱 Seeding learning materials…');
  const materialRepo = AppDataSource.getRepository(LearningMaterial);
  await materialRepo.save([
    materialRepo.create({
      courseId: course1.id,
      classId: class1.id,
      title: 'HTML5 & CSS3 Fundamentals',
      description: 'Complete guide to modern HTML5 semantic elements and CSS3 styling.',
      fileUrl: '/uploads/materials/html_css_fundamentals.pdf',
      fileName: 'html_css_fundamentals.pdf',
      fileSizeBytes: 2_048_000,
      fileType: FileType.PDF,
      week: 1,
      topic: 'HTML & CSS',
      uploadedBy: facUser1,
      visibility: Visibility.PUBLIC,
      downloadCount: 45,
      tags: 'html,css,fundamentals,week1',
      isFeatured: true,
    }),
    materialRepo.create({
      courseId: course1.id,
      classId: class1.id,
      title: 'JavaScript ES6+ Deep Dive',
      description: 'Arrow functions, destructuring, async/await, and modern JS patterns.',
      fileUrl: '/uploads/materials/js_es6_deep_dive.pdf',
      fileName: 'js_es6_deep_dive.pdf',
      fileSizeBytes: 3_145_728,
      fileType: FileType.PDF,
      week: 3,
      topic: 'JavaScript',
      uploadedBy: facUser1,
      visibility: Visibility.PUBLIC,
      downloadCount: 38,
      tags: 'javascript,es6,async,week3',
      isFeatured: true,
    }),
    materialRepo.create({
      courseId: course2.id,
      classId: class2.id,
      title: 'Introduction to SQL',
      description: 'SELECT, JOIN, GROUP BY, indexes, and query optimization techniques.',
      fileUrl: '/uploads/materials/intro_to_sql.pdf',
      fileName: 'intro_to_sql.pdf',
      fileSizeBytes: 1_572_864,
      fileType: FileType.PDF,
      week: 1,
      topic: 'SQL Basics',
      uploadedBy: facUser2,
      visibility: Visibility.PUBLIC,
      downloadCount: 52,
      tags: 'sql,database,week1',
      isFeatured: false,
    }),
    materialRepo.create({
      courseId: course2.id,
      classId: class2.id,
      title: 'Database Design Lecture Recording',
      description: 'Full lecture on ER diagrams, normalization (1NF-3NF), and schema design.',
      fileUrl: '/uploads/materials/db_design_lecture.mp4',
      fileName: 'db_design_lecture.mp4',
      fileSizeBytes: 524_288_000,
      fileType: FileType.VIDEO,
      week: 2,
      topic: 'Database Design',
      uploadedBy: facUser2,
      visibility: Visibility.RESTRICTED,
      downloadCount: 20,
      tags: 'er-diagram,normalization,week2',
      isFeatured: false,
    }),
  ]);
  console.log('   ✔ 4 learning materials created');

  // ── 8. ASSIGNMENTS ────────────────────────────────────────────────────────
  console.log('🌱 Seeding assignments…');
  const assignmentRepo = AppDataSource.getRepository(Assignment);
  const [assignment1, assignment2, assignment3] = await assignmentRepo.save([
    assignmentRepo.create({
      classId: class1.id,
      title: 'Build a Personal Portfolio Website',
      description: 'Create a fully responsive portfolio using HTML5, CSS3, and vanilla JS.',
      maxScore: 100,
      weight: 0.25,
      dueDate: daysFromNow(14),
      status: AssignmentStatus.PUBLISHED,
      instructions: [
        'Requirements:',
        '1. Minimum 4 pages: Home, About, Projects, Contact',
        '2. Mobile responsive (works on 320px to 1920px)',
        '3. At least one CSS animation or transition',
        '4. Form validation using JavaScript',
        '5. Submit GitHub repo URL and live demo link',
      ].join('\n'),
      createdBy: facUser1,
    }),
    assignmentRepo.create({
      classId: class1.id,
      title: 'JavaScript Quiz App',
      description: 'Build an interactive quiz application with a timer and score tracking.',
      maxScore: 80,
      weight: 0.20,
      dueDate: daysFromNow(28),
      status: AssignmentStatus.PUBLISHED,
      instructions: [
        'Requirements:',
        '1. Minimum 10 questions with 4 options each',
        '2. 30-second countdown timer per question',
        '3. Score calculation and display at the end',
        '4. LocalStorage to save high scores',
        '5. Clean, commented code',
      ].join('\n'),
      createdBy: facUser1,
    }),
    assignmentRepo.create({
      classId: class2.id,
      title: 'Database Design — E-Commerce Schema',
      description: 'Design a normalized relational database schema for an e-commerce platform.',
      maxScore: 100,
      weight: 0.30,
      dueDate: daysFromNow(21),
      status: AssignmentStatus.PUBLISHED,
      instructions: [
        'Requirements:',
        '1. Complete ER diagram with all relationships',
        '2. Minimum 8 tables, fully normalized to 3NF',
        '3. SQL DDL scripts to create all tables',
        '4. 10 sample SQL queries demonstrating JOINs, aggregations',
        '5. Index strategy document',
      ].join('\n'),
      createdBy: facUser2,
    }),
  ]);
  console.log('   ✔ 3 assignments created');

  // ── 9. SUBMISSIONS ────────────────────────────────────────────────────────
  console.log('🌱 Seeding submissions…');
  const submissionRepo = AppDataSource.getRepository(Submission);
  await submissionRepo.save([
    submissionRepo.create({
      assignmentId: assignment1.id,
      studentId: student1.id,
      submissionUrl: 'https://github.com/charlie/portfolio',
      submittedContent: 'Submitted portfolio site with all 4 pages and animations.',
      status: SubmissionStatus.SUBMITTED,
      isLate: false,
    }),
    submissionRepo.create({
      assignmentId: assignment1.id,
      studentId: student2.id,
      submissionUrl: 'https://github.com/diana/portfolio',
      submittedContent: 'Responsive portfolio with contact form validation.',
      status: SubmissionStatus.SUBMITTED,
      isLate: false,
    }),
    submissionRepo.create({
      assignmentId: assignment2.id,
      studentId: student1.id,
      submissionUrl: 'https://github.com/charlie/quiz-app',
      submittedContent: 'Quiz app with timer and localStorage high scores.',
      status: SubmissionStatus.SUBMITTED,
      isLate: false,
    }),
    submissionRepo.create({
      assignmentId: assignment3.id,
      studentId: student2.id,
      submittedContent: 'E-Commerce DB schema with 10 tables and full ER diagram.',
      fileName: 'ecommerce_schema.zip',
      fileSizeBytes: 245_760,
      status: SubmissionStatus.SUBMITTED,
      isLate: false,
    }),
  ]);
  console.log('   ✔ 4 submissions created');

  // ── 10. GRADES ────────────────────────────────────────────────────────────
  console.log('🌱 Seeding grades…');
  const gradeRepo = AppDataSource.getRepository(Grade);
  await gradeRepo.save([
    gradeRepo.create({
      studentId: student1.id,
      classId: class1.id,
      assignmentId: assignment1.id,
      score: 88,
      maxScore: 100,
      weight: 0.25,
      weightedScore: 22,
      feedback: 'Excellent responsive design. Contact form works well. Minor CSS issues on mobile.',
      gradedBy: facUser1,
      rubricScores: { design: 90, functionality: 85, code_quality: 89 },
    }),
    gradeRepo.create({
      studentId: student2.id,
      classId: class1.id,
      assignmentId: assignment1.id,
      score: 95,
      maxScore: 100,
      weight: 0.25,
      weightedScore: 23.75,
      feedback: 'Outstanding work! Perfect responsiveness across all screen sizes.',
      gradedBy: facUser1,
      rubricScores: { design: 96, functionality: 95, code_quality: 94 },
    }),
    gradeRepo.create({
      studentId: student1.id,
      classId: class1.id,
      assignmentId: assignment2.id,
      score: 72,
      maxScore: 80,
      weight: 0.20,
      weightedScore: 18,
      feedback: 'Timer implementation is solid. High scores saving works. Needs better UI.',
      gradedBy: facUser1,
      rubricScores: { functionality: 75, ui: 68, code_quality: 73 },
    }),
    gradeRepo.create({
      studentId: student2.id,
      classId: class2.id,
      assignmentId: assignment3.id,
      score: 92,
      maxScore: 100,
      weight: 0.30,
      weightedScore: 27.6,
      feedback: 'Excellent schema design. All relationships correctly normalized.',
      gradedBy: facUser2,
      rubricScores: { er_diagram: 95, normalization: 90, sql_scripts: 91, queries: 92 },
    }),
  ]);
  console.log('   ✔ 4 grades created');

  // ── 11. ATTENDANCE ────────────────────────────────────────────────────────
  console.log('🌱 Seeding attendance…');
  const attendanceRepo = AppDataSource.getRepository(Attendance);
  const attendanceRecords: Attendance[] = [];

  // class1 sessions
  for (const d of [14, 12, 10, 7, 5, 3]) {
    attendanceRecords.push(
      attendanceRepo.create({
        studentId: student1.id, classId: class1.id, date: daysAgo(d) as any,
        status: AttendanceStatus.PRESENT,
      }),
      attendanceRepo.create({
        studentId: student2.id, classId: class1.id, date: daysAgo(d) as any,
        status: d === 7 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
        remarks: d === 7 ? 'Arrived 15 minutes late' : undefined,
      }),
      attendanceRepo.create({
        studentId: student3.id, classId: class1.id, date: daysAgo(d) as any,
        status: d === 12 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT,
        remarks: d === 12 ? 'Medical appointment' : undefined,
      }),
    );
  }

  // class2 sessions
  for (const d of [13, 11, 8, 6, 4]) {
    attendanceRecords.push(
      attendanceRepo.create({
        studentId: student1.id, classId: class2.id, date: daysAgo(d) as any,
        status: AttendanceStatus.PRESENT,
      }),
      attendanceRepo.create({
        studentId: student2.id, classId: class2.id, date: daysAgo(d) as any,
        status: d === 11 ? AttendanceStatus.EXCUSED : AttendanceStatus.PRESENT,
        remarks: d === 11 ? 'Family emergency — excused by admin' : undefined,
      }),
    );
  }

  await attendanceRepo.save(attendanceRecords);
  console.log(`   ✔ ${attendanceRecords.length} attendance records created`);

  // ── 12. FEES ──────────────────────────────────────────────────────────────
  console.log('🌱 Seeding fees…');
  const feeRepo = AppDataSource.getRepository(Fee);
  await feeRepo.save([
    feeRepo.create({
      studentId: student1.id, amount: 1500.00,
      dueDate: daysAgo(30) as any, paymentDate: daysAgo(35) as any,
      status: FeeStatus.PAID, remarks: 'Fall 2025 tuition fee — paid in full',
    }),
    feeRepo.create({
      studentId: student1.id, amount: 250.00,
      dueDate: daysFromNow(15) as any,
      status: FeeStatus.PENDING, remarks: 'Lab materials fee for CS101',
    }),
    feeRepo.create({
      studentId: student2.id, amount: 1500.00,
      dueDate: daysAgo(30) as any, paymentDate: daysAgo(28) as any,
      status: FeeStatus.PAID, remarks: 'Fall 2025 tuition fee — paid in full',
    }),
    feeRepo.create({
      studentId: student2.id, amount: 100.00,
      dueDate: daysAgo(10) as any,
      status: FeeStatus.OVERDUE, remarks: 'Mid-term examination fee — OVERDUE',
    }),
    feeRepo.create({
      studentId: student3.id, amount: 1500.00,
      dueDate: daysFromNow(5) as any,
      status: FeeStatus.PENDING, remarks: 'Fall 2025 tuition fee — due soon',
    }),
    feeRepo.create({
      studentId: student3.id, amount: 75.00,
      dueDate: daysAgo(20) as any,
      status: FeeStatus.OVERDUE, remarks: 'Registration fee — OVERDUE',
    }),
  ]);
  console.log('   ✔ 6 fee records created');

  // ─────────────────────────────────────────────────────────────────────────
  await AppDataSource.destroy();

  console.log('\n🎉 Seeding complete! Summary:');
  console.log('   Users          : 7  (1 Admin, 1 Manager, 2 Facilitators, 3 Students)');
  console.log('   Students       : 3');
  console.log('   Documents      : 3');
  console.log('   Facilitators   : 2');
  console.log('   Courses        : 3  (CS101, CS201, CS301)');
  console.log('   Classes        : 3  (2 active, 1 upcoming)');
  console.log('   Materials      : 4');
  console.log('   Assignments    : 3');
  console.log('   Submissions    : 4');
  console.log('   Grades         : 4');
  console.log(`   Attendance     : ${attendanceRecords.length}`);
  console.log('   Fees           : 6  (2 paid, 2 pending, 2 overdue)');
  console.log('\n📧 Login credentials (all passwords: Password123!):');
  console.log('   admin@school.dev         → Admin');
  console.log('   manager@school.dev       → Manager');
  console.log('   alice.johnson@school.dev → Facilitator');
  console.log('   bob.smith@school.dev     → Facilitator');
  console.log('   charlie.brown@school.dev → Student');
  console.log('   diana.prince@school.dev  → Student');
  console.log('   evan.rogers@school.dev   → Student');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
