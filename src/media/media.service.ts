import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entity/media.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
  ) {}

  async createMediaRecord(file: Express.Multer.File): Promise<Media> {
    const media = this.mediaRepository.create({
      filename: file.filename,
      path: `/media/${file.filename}`, // URL path for ServeStaticModule
      mimetype: file.mimetype,
      size: file.size,
    });
    return await this.mediaRepository.save(media);
  }

  async findAll(): Promise<Media[]> {
    return await this.mediaRepository.find();
  }

  async remove(id: number): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Delete the file from the OS file system
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      media.filename,
    );
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(
        `File ${filePath} could not be deleted from the file system. It may have already been removed.`,
      );
    }

    // Delete the record from the database
    await this.mediaRepository.remove(media);
  }
}
