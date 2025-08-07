import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ProjectsModule } from '../projects/projects.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { VideoModule } from '../video/video.module';

@Module({
  imports: [ProjectsModule, CloudinaryModule, VideoModule],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
