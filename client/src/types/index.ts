export enum ElementType {
  SCENE_HEADING = "SCENE_HEADING",
  ACTION = "ACTION",
  CHARACTER = "CHARACTER",
  DIALOGUE = "DIALOGUE",
  PARENTHETICAL = "PARENTHETICAL",
  TRANSITION = "TRANSITION",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  TEXT = "TEXT",
}

export interface Element {
  id: string;
  projectId: string;
  type: ElementType;
  content: string;
  assetUrl?: string;
  isGenerating: boolean;
  order: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationTurn {
  id: string;
  projectId: string;
  role: string;
  content: string;
  toolCalls?: Record<string, unknown>;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  elements: Element[];
  conversationTurns: ConversationTurn[];
}

export interface SocketEvents {
  textChunk: { content: string };
  generationStarted: { elementId: string; type: string };
  generationCompleted: { elementId: string; assetUrl: string };
  elementAdded: { element: Element };
  error: { message: string };
  info: { message: string };
}
