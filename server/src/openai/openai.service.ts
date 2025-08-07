import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ProjectsService } from '../projects/projects.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { VideoService } from '../video/video.service';
import { ElementType } from '@prisma/client';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private projectsService: ProjectsService,
    private cloudinaryService: CloudinaryService,
    private videoService: VideoService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateFallbackResponse(prompt: string): string {
    const fallbackResponses = [
      `I understand you want me to help with: "${prompt}". 

Here's a sample script structure you can use as a starting point:

**FADE IN:**

**EXT. LOCATION - TIME OF DAY**

*[Scene description and action]*

**CHARACTER NAME**
Dialogue goes here.

**[Additional action or camera direction]**

**FADE OUT.**

I'm currently experiencing high demand and rate limits. Please try again in a few moments for a more detailed, personalized response.`,

      `Thank you for your request about: "${prompt}".

Due to current API limitations, here's a general framework you can adapt:

**SCENE STRUCTURE:**
- **Setup:** Establish the setting and characters
- **Conflict:** Introduce the main challenge or goal  
- **Resolution:** Show how the situation develops

**VISUAL ELEMENTS:**
- Consider lighting (golden hour, dramatic shadows, etc.)
- Camera angles (wide shots for establishing, close-ups for emotion)
- Color palette to match the mood

Please try your request again in a moment for a more customized response.`,

      `I see you're working on: "${prompt}".

Here's a quick creative starting point:

**STORY BEATS:**
1. **Opening Image** - Set the tone and world
2. **Inciting Incident** - What kicks off the action?
3. **Midpoint** - Major turning point or revelation
4. **Climax** - The main confrontation or peak moment
5. **Resolution** - How things settle

**PRODUCTION NOTES:**
- Focus on strong visual storytelling
- Keep dialogue concise and purposeful
- Consider practical locations and budget

The system is currently at capacity. Please retry shortly for a full, detailed response tailored to your specific needs.`,
    ];

    return fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];
  }

  private getTools() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'generate_image',
          description:
            'Generate an image based on a detailed description for scene visualization',
          parameters: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description:
                  'Detailed description of the image to generate, including visual elements, lighting, mood, and style',
              },
              scene_context: {
                type: 'string',
                description:
                  'Context about what scene or part of the script this image represents',
              },
            },
            required: ['description'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'add_script_element',
          description: 'Add a formatted script element to the project',
          parameters: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description:
                  'The formatted script content (scene heading, action, dialogue, etc.)',
              },
              element_type: {
                type: 'string',
                enum: [
                  'SCENE_HEADING',
                  'ACTION',
                  'CHARACTER',
                  'DIALOGUE',
                  'PARENTHETICAL',
                  'TRANSITION',
                ],
                description: 'The type of script element',
              },
            },
            required: ['content', 'element_type'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'generate_video',
          description:
            'Generate a video from an image with motion and animation',
          parameters: {
            type: 'object',
            properties: {
              image_url: {
                type: 'string',
                description: 'URL of the image to animate into a video',
              },
              description: {
                type: 'string',
                description:
                  'Description of the motion and animation to apply to the image',
              },
              duration: {
                type: 'number',
                enum: [5, 10],
                description: 'Duration of the video in seconds (5 or 10)',
              },
            },
            required: ['image_url', 'description'],
          },
        },
      },
    ];
  }

  private async handleFunctionCall(
    projectId: string,
    functionCall: any,
    gateway: any,
  ): Promise<string> {
    const { name, arguments: args } = functionCall;
    const parsedArgs = JSON.parse(args);

    switch (name) {
      case 'generate_image':
        try {
          gateway.emitInfo(projectId, 'Generating image...');

          const imageUrl = await this.generateImage(parsedArgs.description);

          const cloudinaryUrl = await this.cloudinaryService.uploadImageFromUrl(
            imageUrl,
            `image-${Date.now()}`,
          );

          await this.projectsService.addElement(projectId, {
            type: ElementType.IMAGE,
            content: parsedArgs.scene_context || parsedArgs.description,
            assetUrl: cloudinaryUrl,
            isGenerating: false,
            order: 0,
          });

          gateway.emitElementAdded(projectId, {
            id: `image-${Date.now()}`,
            projectId,
            type: ElementType.IMAGE,
            content: parsedArgs.scene_context || parsedArgs.description,
            assetUrl: cloudinaryUrl,
            isGenerating: false,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          return `Image generated and saved successfully. The image shows: ${parsedArgs.description}`;
        } catch (error) {
          console.error('Error generating image:', error);
          return `Failed to generate image: ${error.message}`;
        }

      case 'add_script_element':
        try {
          await this.projectsService.addElement(projectId, {
            type: parsedArgs.element_type,
            content: parsedArgs.content,
            isGenerating: false,
            order: 0,
          });

          gateway.emitElementAdded(projectId, {
            id: `script-${Date.now()}`,
            projectId,
            type: parsedArgs.element_type,
            content: parsedArgs.content,
            isGenerating: false,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          return `Script element added successfully: ${parsedArgs.element_type}`;
        } catch (error) {
          console.error('Error adding script element:', error);
          return `Failed to add script element: ${error.message}`;
        }

      case 'generate_video':
        try {
          gateway.emitInfo(projectId, 'Generating video...');

          const budgetStatus = this.videoService.getBudgetStatus();
          const duration = parsedArgs.duration || 5;
          const estimatedCost = 0.0;

          if (budgetStatus.daily.remaining < estimatedCost) {
            return `Cannot generate video: Daily budget limit reached. Remaining: $${budgetStatus.daily.remaining.toFixed(2)}, Need: $${estimatedCost.toFixed(2)}`;
          }

          const videoResult = await this.videoService.generateVideoFromImage(
            parsedArgs.image_url,
            parsedArgs.description,
            { duration: duration },
          );

          if (!videoResult.success) {
            return `Failed to generate video: ${videoResult.error}`;
          }

          let finalVideoUrl = videoResult.videoUrl;
          if (
            videoResult.videoUrl &&
            videoResult.videoUrl !== parsedArgs.image_url
          ) {
            try {
              finalVideoUrl = await this.cloudinaryService.uploadImageFromUrl(
                videoResult.videoUrl,
                `video-${Date.now()}`,
              );
            } catch (uploadError) {
              console.warn(
                'Failed to upload video to Cloudinary, using original URL',
              );
              finalVideoUrl = videoResult.videoUrl;
            }
          }

          await this.projectsService.addElement(projectId, {
            type: ElementType.VIDEO,
            content: parsedArgs.description,
            assetUrl: finalVideoUrl,
            isGenerating: false,
            order: 0,
          });

          gateway.emitElementAdded(projectId, {
            id: `video-${Date.now()}`,
            projectId,
            type: ElementType.VIDEO,
            content: parsedArgs.description,
            assetUrl: finalVideoUrl,
            isGenerating: false,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          const cost = videoResult.cost || 0;
          const statusMessage = `Video generated (placeholder mode). Original image returned. Daily budget unchanged: $${budgetStatus.daily.remaining.toFixed(2)}`;

          return statusMessage;
        } catch (error) {
          console.error('Error generating video:', error);
          return `Failed to generate video: ${error.message}`;
        }

      default:
        return `Unknown function: ${name}`;
    }
  }

  async generateResponse(projectId: string, prompt: string, gateway: any) {
    try {
      await this.projectsService.addConversationTurn(projectId, 'user', prompt);

      const project = await this.projectsService.findOne(projectId);
      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      const messages = [
        {
          role: 'system' as const,
          content: `You are an AI assistant helping to create video scripts and visual content. You can:
1. Write screenplay-formatted scripts with proper scene headings, action lines, character names, and dialogue
2. Generate images for scene visualization using the generate_image function
3. Add formatted script elements using the add_script_element function

When users ask for images or visual content, use the generate_image function with detailed, cinematic descriptions.
When writing scripts, use the add_script_element function to properly format and structure the content.
Always be creative and detailed in your descriptions and script writing.`,
        },
        ...project.conversationTurns.map((turn) => ({
          role:
            turn.role === 'assistant'
              ? ('assistant' as const)
              : ('user' as const),
          content: turn.content,
        })),
      ];

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7,
            tools: this.getTools(),
            tool_choice: 'auto',
            stream: false,
          });

          const response = completion.choices[0]?.message;

          Logger.log('OpenAI response:', response);

          if (!response) {
            throw new Error('No response from OpenAI');
          }

          if (response.tool_calls && response.tool_calls.length > 0) {
            let functionResults = [];

            for (const toolCall of response.tool_calls) {
              if (toolCall.type === 'function') {
                const result = await this.handleFunctionCall(
                  projectId,
                  toolCall.function,
                  gateway,
                );
                functionResults.push(result);
              }
            }

            const followUpMessages = [
              ...messages,
              {
                role: 'assistant' as const,
                content: response.content || '',
                tool_calls: response.tool_calls,
              },
              ...response.tool_calls.map((toolCall, index) => ({
                role: 'tool' as const,
                content: functionResults[index],
                tool_call_id: toolCall.id,
              })),
            ];

            const followUpCompletion =
              await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: followUpMessages,
                max_tokens: 1000,
                temperature: 0.7,
                stream: false,
              });

            const finalResponse =
              followUpCompletion.choices[0]?.message?.content ||
              'Action completed successfully.';

            await this.projectsService.addConversationTurn(
              projectId,
              'assistant',
              finalResponse,
            );

            gateway.emitTextChunk(projectId, finalResponse);
          } else {
            const responseText = response.content || 'No response generated.';

            await this.projectsService.addConversationTurn(
              projectId,
              'assistant',
              responseText,
            );

            gateway.emitTextChunk(projectId, responseText);
          }

          return;
        } catch (apiError: any) {
          retryCount++;

          if (
            apiError.status === 429 ||
            apiError.code === 'rate_limit_exceeded'
          ) {
            console.log(`Rate limit hit. Attempt ${retryCount}/${maxRetries}`);

            if (retryCount < maxRetries) {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.log(`Waiting ${delayMs / 1000} seconds before retry...`);
              await this.delay(delayMs);
            } else {
              throw apiError;
            }
          } else {
            throw apiError;
          }
        }
      }
    } catch (error: any) {
      console.error('Error in generateResponse:', error);

      if (error.status === 429 || error.code === 'rate_limit_exceeded') {
        console.log('Using fallback response due to rate limits');

        const fallbackText = this.generateFallbackResponse(prompt);
        await this.projectsService.addConversationTurn(
          projectId,
          'assistant',
          fallbackText,
        );

        gateway.emitTextChunk(projectId, fallbackText);
        gateway.emitInfo(
          projectId,
          'Response generated using fallback due to API rate limits. Please try again in a few minutes for full AI responses.',
        );
      } else {
        gateway.emitError(
          projectId,
          'Failed to generate response. Please try again.',
        );
      }
    }
  }

  async generateImage(description: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: description,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });

      return response.data?.[0]?.url || '';
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }

  async generateVideo(imageUrl: string): Promise<string> {
    console.log('Video generation requested for image:', imageUrl);

    return imageUrl;
  }
}
