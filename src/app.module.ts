import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { ApiKeyMiddleware } from './middleware/api-key/api-key.middleware';
import { User } from './user/entity/user.entity';
import { MediaModule } from './media/media.module';
import { Media } from './media/entity/media.entity';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Student } from './student/entity/student.entity';
import { DocumentUpload } from './student/entity/document-upload.entity';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { ClassModule } from './class/class.module';
import { Course } from './course/entity/course.entity';
import { Class } from './class/entity/class.entity';
import { FacilitatorModule } from './facilitator/facilitator.module';
import { Facilitator } from './facilitator/entity/facilitator.entity';
import { LearningMaterialModule } from './learning-material/learning-material.module';
import { LearningMaterial } from './learning-material/entity/learning-material.entity';
import { AssessmentModule } from './assessment/assessment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/media',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'myuser'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'mypassword'),
        database: configService.get<string>('POSTGRES_DB', 'mydb'),
        entities: [User, Media, Student, DocumentUpload, Course, Class, Facilitator, LearningMaterial],
        synchronize: true, // Use only in dev. In prod, use migrations.
      }),
      inject: [ConfigService],
    }),
    UserModule,
    MediaModule,
    AuthModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    StudentModule,
    CourseModule,
    ClassModule,
    FacilitatorModule,
    LearningMaterialModule,
    AssessmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})

export class AppModule { }
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(ApiKeyMiddleware).forRoutes(UserController);
//   }
// }
