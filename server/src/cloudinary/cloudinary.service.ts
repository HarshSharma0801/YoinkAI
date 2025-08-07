import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImageFromUrl(
    imageUrl: string,
    filename?: string,
  ): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        upload_preset: 'Reservify',
        folder: 'Reservify',
        use_filename: true,
        overwrite: false,
        public_id: filename || undefined,
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  async uploadImageFromBuffer(
    buffer: Buffer,
    filename: string,
  ): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              upload_preset: 'Reservify',
              folder: 'Reservify',
              use_filename: true,
              overwrite: false,
              public_id: filename,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result?.secure_url || '');
              }
            },
          )
          .end(buffer);
      });
    } catch (error) {
      console.error('Error uploading buffer to Cloudinary:', error);
      throw new Error('Failed to upload image buffer to Cloudinary');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }
}
