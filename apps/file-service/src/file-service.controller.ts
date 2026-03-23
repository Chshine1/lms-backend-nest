import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { FileService } from './file-service.service';
import { CreateFileDto, FileFilterDto } from './dto/file.dto';

@Controller('files')
export class FileServiceController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  createFile(@Body() dto: CreateFileDto) {
    return this.fileService.createFile(dto);
  }

  @Get(':id')
  getFile(@Param('id') id: string) {
    return this.fileService.getFile(Number(id));
  }

  @Get()
  listFiles(@Query() query: FileFilterDto) {
    return this.fileService.listFiles(query);
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string, @Body('userId') userId: number) {
    return this.fileService.deleteFile(Number(id), userId);
  }

  @Get(':id/signed-url')
  getSignedUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    return this.fileService.generateSignedUrl(
      Number(id),
      expiresIn ? Number(expiresIn) : undefined,
    );
  }

  @Get(':id/ref')
  getStorageRef(@Param('id') id: string) {
    return this.fileService.getStorageRef(Number(id));
  }
}
