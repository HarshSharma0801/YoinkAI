import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface VideoGenerationOptions {
  prompt?: string;
  imageUrl?: string;
  duration?: 5 | 10;
  ratio?: '16:9' | '9:16' | '4:3' | '3:4' | '1:1' | '21:9';
  watermark?: boolean;
}

interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  cost?: number;
  error?: string;
  taskId?: string;
}

@Injectable()
export class VideoService {
  private readonly MAX_DAILY_COST = 5.0;
  private readonly MAX_MONTHLY_COST = 50.0;
  private dailyUsage = 0;
  private monthlyUsage = 0;
  private lastResetDate = new Date().toDateString();

  constructor(private configService: ConfigService) {}

  private resetDailyUsageIfNeeded() {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailyUsage = 0;
      this.lastResetDate = today;
    }
  }

  private calculateCost(duration: number): number {
    return 0.0;
  }

  private canAffordGeneration(duration: number): {
    canAfford: boolean;
    reason?: string;
  } {
    this.resetDailyUsageIfNeeded();

    const cost = this.calculateCost(duration);

    if (this.dailyUsage + cost > this.MAX_DAILY_COST) {
      return {
        canAfford: false,
        reason: `Daily budget limit reached ($${this.MAX_DAILY_COST}). Used: $${this.dailyUsage.toFixed(2)}`,
      };
    }

    if (this.monthlyUsage + cost > this.MAX_MONTHLY_COST) {
      return {
        canAfford: false,
        reason: `Monthly budget limit reached ($${this.MAX_MONTHLY_COST}). Used: $${this.monthlyUsage.toFixed(2)}`,
      };
    }

    return { canAfford: true };
  }

  private recordUsage(cost: number) {
    this.dailyUsage += cost;
    this.monthlyUsage += cost;
    console.log(
      `Video generation cost: $${cost.toFixed(2)}. Daily: $${this.dailyUsage.toFixed(2)}, Monthly: $${this.monthlyUsage.toFixed(2)}`,
    );
  }

  async generateVideoFromImage(
    imageUrl: string,
    prompt: string,
    options: VideoGenerationOptions = {},
  ): Promise<VideoGenerationResult> {
    const duration = options.duration || 5;

    const affordabilityCheck = this.canAffordGeneration(duration);
    if (!affordabilityCheck.canAfford) {
      return {
        success: false,
        error: affordabilityCheck.reason,
        cost: 0,
      };
    }

    console.log('🎬 Video Generation Request (Placeholder Mode):');
    console.log(`  - Image URL: ${imageUrl}`);
    console.log(`  - Prompt: ${prompt}`);
    console.log(`  - Duration: ${duration} seconds`);
    console.log(`  - Aspect Ratio: ${options.ratio || '16:9'}`);
    console.log('  - Status: Simulating video generation...');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('✅ Video Generation Complete (Placeholder)');

    return {
      success: true,
      videoUrl: imageUrl,
      cost: 0,
      taskId: `placeholder-${Date.now()}`,
      error:
        'Placeholder mode: Video generation simulated. Original image returned.',
    };
  }

  async generateVideoFromText(
    prompt: string,
    options: VideoGenerationOptions = {},
  ): Promise<VideoGenerationResult> {
    const duration = options.duration || 5;

    const affordabilityCheck = this.canAffordGeneration(duration);
    if (!affordabilityCheck.canAfford) {
      return {
        success: false,
        error: affordabilityCheck.reason,
        cost: 0,
      };
    }

    console.log('🎬 Text-to-Video Generation Request (Placeholder Mode):');
    console.log(`  - Prompt: ${prompt}`);
    console.log(`  - Duration: ${duration} seconds`);
    console.log(`  - Aspect Ratio: ${options.ratio || '16:9'}`);
    console.log('  - Status: Simulating text-to-video generation...');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('✅ Text-to-Video Generation Complete (Placeholder)');

    return {
      success: true,
      videoUrl:
        'https://via.placeholder.com/640x360/000000/FFFFFF?text=Video+Placeholder',
      cost: 0,
      taskId: `text-placeholder-${Date.now()}`,
      error: 'Placeholder mode: Text-to-video generation simulated.',
    };
  }

  getBudgetStatus() {
    this.resetDailyUsageIfNeeded();

    return {
      daily: {
        used: this.dailyUsage,
        limit: this.MAX_DAILY_COST,
        remaining: this.MAX_DAILY_COST - this.dailyUsage,
        percentage: (this.dailyUsage / this.MAX_DAILY_COST) * 100,
      },
      monthly: {
        used: this.monthlyUsage,
        limit: this.MAX_MONTHLY_COST,
        remaining: this.MAX_MONTHLY_COST - this.monthlyUsage,
        percentage: (this.monthlyUsage / this.MAX_MONTHLY_COST) * 100,
      },
    };
  }

  resetMonthlyUsage() {
    this.monthlyUsage = 0;
    console.log('Monthly video generation budget reset');
  }
}
