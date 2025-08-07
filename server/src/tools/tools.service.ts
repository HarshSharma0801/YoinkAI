import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ToolsService {
  constructor(private configService: ConfigService) {}

  async generateImage(description: string): Promise<string> {
    try {
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: description,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }

  async generateVideo(imageUrl: string): Promise<string> {
    console.log('Generating video from image:', imageUrl);

    return 'https://placeholder-video-url.com/video.mp4';
  }

  async generateScript(prompt: string): Promise<string> {
    return prompt;
  }
}
