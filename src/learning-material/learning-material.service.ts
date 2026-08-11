import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningMaterial } from './entity/learning-material.entity';
import { UploadMaterialDto } from './dto/upload-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { FileType } from './enum/file-type.enum';

@Injectable()
export class LearningMaterialService {
  constructor(
    @InjectRepository(LearningMaterial)
    private readonly materialRepository: Repository<LearningMaterial>,
  ) { }

  // Mocked file upload since S3 isn't set up yet
  async uploadMaterial(dto: UploadMaterialDto, file: Express.Multer.File, user: any): Promise<LearningMaterial> {
    const fileSizeBytes = file.size;
    const fileName = file.originalname;
    // Basic type mapping for mock
    let fileType = FileType.OTHER;
    if (file.mimetype.includes('pdf')) fileType = FileType.PDF;
    else if (file.mimetype.includes('video')) fileType = FileType.VIDEO;
    else if (file.mimetype.includes('image')) fileType = FileType.IMAGE;

    // Mock S3 URL
    const fileUrl = `https://mock-s3-bucket.s3.amazonaws.com/materials/${Date.now()}-${fileName}`;

    const material = this.materialRepository.create({
      ...dto,
      course: { id: dto.courseId } as any,
      class: dto.classId ? { id: dto.classId } as any : null,
      uploadedBy: { id: user.id } as any,
      fileName,
      fileSizeBytes,
      fileType,
      fileUrl,
    });

    return await this.materialRepository.save(material);
  }

  async findAll(): Promise<LearningMaterial[]> {
    return await this.materialRepository.find({ relations: { course: true, class: true, uploadedBy: true } });
  }

  async findById(id: number): Promise<LearningMaterial> {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: { course: true, class: true, uploadedBy: true }
    });
    if (!material) throw new NotFoundException(`Material ${id} not found`);
    return material;
  }

  async updateMaterial(id: number, dto: UpdateMaterialDto): Promise<LearningMaterial> {
    const material = await this.findById(id);
    this.materialRepository.merge(material, dto);
    return await this.materialRepository.save(material);
  }

  async deleteMaterial(id: number): Promise<void> {
    const material = await this.findById(id);
    // Real implementation would also delete from S3 here
    await this.materialRepository.remove(material);
  }

  async downloadMaterial(id: number): Promise<{ url: string }> {
    const material = await this.findById(id);
    material.downloadCount += 1;
    await this.materialRepository.save(material);

    // In reality, this might generate a signed S3 URL
    return { url: material.fileUrl };
  }
}
