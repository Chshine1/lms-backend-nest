import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileContract } from '@app/contracts/file/entities/file.contract';
import { CreateFileDto } from '@app/contracts/file/dto/create-file.dto';
import { SignedUrlResult } from '@app/contracts/file/dto/signed-url.result';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createFile(
    @Body() dto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileContract> {
    return this.fileService.createFile(dto, file);
  }

  @Get(':id')
  getFile(@Param('id') id: string): Promise<FileContract> {
    return this.fileService.getFile(Number(id));
  }

  @Delete(':id')
  deleteFile(
    @Param('id') id: string,
    @Body('userId') userId: number,
  ): Promise<void> {
    return this.fileService.deleteFile(Number(id), userId);
  }

  @Get(':id/signed-url')
  getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<SignedUrlResult> {
    return this.fileService.generateSignedUrl(
      Number(id),
      expiresIn ? Number(expiresIn) : undefined,
    );
  }
}
