import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: createProjectDto,
      include: {
        user: true,
        elements: true,
        conversationTurns: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        elements: {
          orderBy: { order: 'asc' },
        },
        conversationTurns: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        user: true,
        elements: {
          orderBy: { order: 'asc' },
          take: 3, 
        },
        conversationTurns: {
          orderBy: { createdAt: 'desc' },
          take: 3, 
        },
        _count: {
          select: {
            elements: true,
            conversationTurns: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async addElement(projectId: string, elementData: any) {
    const lastElement = await this.prisma.element.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });

    const order = lastElement ? lastElement.order + 1 : 0;

    return this.prisma.element.create({
      data: {
        ...elementData,
        projectId,
        order,
      },
    });
  }

  async updateElement(elementId: string, data: any) {
    return this.prisma.element.update({
      where: { id: elementId },
      data,
    });
  }

  async addConversationTurn(
    projectId: string,
    role: string,
    content: string,
    toolCalls?: any,
  ) {
    return this.prisma.conversationTurn.create({
      data: {
        projectId,
        role,
        content,
        toolCalls,
      },
    });
  }
}
