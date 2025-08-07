# 🚀 Yoink AI

**AI-Powered Script Writing and Content Creation Platform**

Yoink AI is a Full-Stack web application that combines the power of OpenAI's GPT-4 with advanced content generation capabilities. Create scripts, generate images, and produce videos through an intuitive chat-based interface.

## ✨ Features

- 🤖 **AI-Powered Chat Interface** - Conversation-driven content creation with OpenAI GPT-4
- 📝 **Script Writing** - Generate professional scripts with AI assistance
- 🎨 **Image Generation** - Create stunning visuals with DALL-E 3
- 🎬 **Video Generation** - Transform images into videos (placeholder mode)
- ☁️ **Cloud Storage** - Automatic asset management with Cloudinary
- 💾 **Data Persistence** - PostgreSQL database with full conversation history
- ⚡ **Real-time Updates** - WebSocket-powered live collaboration
- 📱 **Responsive Design** - Modern UI built with Next.js and Tailwind CSS

##  Video


https://github.com/user-attachments/assets/381a1fcd-29ed-467c-a411-ff687843efdd



## 🏗️ Architecture Overview

```mermaid
graph TD
    %% Frontend Layer
    A[Web UI] -->|renders| B[Editor Component]
    A -->|renders| C[Renderer Component]
    
    %% Communication Layer
    B -->|uses| D[WebSocket Client]
    A -->|uses| E[HTTP Client]
    
    %% Backend Gateway
    F[Server] -->|has| G[WebSocket Gateway]
    F -->|has| H[REST API]
    
    %% Service Layer
    G -->|communicates| I[AI Service]
    H -->|manages| J[User Service]
    H -->|manages| K[Project Service]
    
    %% External Connections
    I -->|requests| L[OpenAI API]
    K -->|uploads| M[Cloudinary API]
    
    %% Database Layer
    J -->|queries| N[(PostgreSQL)]
    K -->|queries| N
    
    %% Infrastructure
    F -->|runs in| O[Docker Container]
    N -->|hosted in| O
    
    %% Real-time Flow
    D -->|connects to| G
    E -->|requests to| H

```

## 📋 Technical Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Shadcn/ui patterns
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client

### Backend

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Validation**: class-validator
- **Architecture**: Modular design with dependency injection

### External Services

- **AI**: OpenAI API (GPT-4, DALL-E 3)
- **Storage**: Cloudinary
- **Infrastructure**: Docker

## 🔄 Application Flow

### 1. **User Interaction Flow**

```
User Input → Frontend → WebSocket → NestJS Gateway → OpenAI Service → AI Response → Real-time Updates
```

### 2. **Content Generation Flow**

```
Chat Message → AI Analysis → Function Calling → Tool Execution → Asset Creation → Database Storage → UI Update
```

### 3. **Data Flow**

```
Frontend (Axios) → NestJS Controllers → Services → Prisma → PostgreSQL
```

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+
- Docker
- OpenAI API Key
- Cloudinary Account

### 1. **Clone & Install**

```bash
git clone <repository-url>
cd YoinkAI

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### 2. **Environment Setup**

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/yoink_ai"
OPENAI_API_KEY="your_openai_api_key_here"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Server
PORT=3001
```

### 3. **Database Setup**

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run database migrations
cd server
npx prisma migrate dev
```

### 4. **Start Development Servers**

**Terminal 1 - Backend:**

```bash
cd server
npm run start:dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

### 5. **Access Application**

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🏛️ Backend Architecture (NestJS)

### **Module Structure**

```
src/
├── app.module.ts           # Root module - orchestrates all modules
├── main.ts                 # Application entry point
├── users/                  # User management module
│   ├── users.module.ts     # Module definition
│   ├── users.controller.ts # HTTP route handlers
│   ├── users.service.ts    # Business logic
│   └── dto/                # Data transfer objects
├── projects/               # Project management module
├── openai/                 # AI service integration
├── gateway/                # WebSocket real-time communication
├── cloudinary/             # Asset storage service
├── video/                  # Video generation (placeholder)
├── tools/                  # Utility services
└── prisma/                 # Database service
```

### **Key Services**

#### **OpenAI Service**

- **Purpose**: Core AI functionality
- **Features**:
  - Chat completions with GPT-4
  - Function calling for tool execution
  - Image generation with DALL-E 3
  - Retry logic for rate limiting
- **Dependencies**: ProjectsService, CloudinaryService, VideoService

#### **Projects Service**

- **Purpose**: Project and conversation management
- **Features**:
  - CRUD operations for projects
  - Conversation history management
  - Element (content) storage
- **Dependencies**: PrismaService

#### **WebSocket Gateway**

- **Purpose**: Real-time communication
- **Features**:
  - Live chat updates
  - Generation status notifications
  - Room-based project isolation
- **Dependencies**: OpenAIService

## 🎨 Frontend Architecture (Next.js)

### **Component Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page - project listing
│   └── projects/[id]/     # Dynamic project pages
├── components/
│   ├── editor/            # Main editor components
│   │   ├── editor.tsx     # Chat interface
│   │   └── element-renderer.tsx # Content display
│   └── ui/                # Reusable UI components
├── lib/
│   └── socket.ts          # WebSocket client singleton
└── types/
    └── index.ts           # TypeScript interfaces
```

### **Key Features**

#### **Editor Component**

- Real-time chat interface
- Dynamic content rendering
- WebSocket event handling
- State management for conversations

#### **Element Renderer**

- Displays different content types (text, images, videos)
- Handles loading states
- Responsive design

## 🗄️ Database Schema

### **Core Tables**

- **Users**: User authentication and profiles
- **Projects**: Individual user projects
- **ConversationTurns**: Chat history with role-based messages
- **Elements**: Generated content (scripts, images, videos)

### **Relationships**

```
User → Projects (1:N)
Project → ConversationTurns (1:N)
Project → Elements (1:N)
```

## 🔧 API Endpoints

### **REST API**

```
GET    /projects/:id              # Get project details
POST   /projects                  # Create new project
GET    /projects/user/:userId     # Get user's projects
POST   /users/find-or-create      # User management
```

### **WebSocket Events**

```
prompt           # Send chat message
textChunk        # Receive AI response
elementAdded     # New content generated
info            # Status updates
```

## 🤖 AI Function Calling

Yoink AI uses OpenAI's function calling to enable the AI to execute specific tools:

### **Available Functions**

1. **generate_image**: Creates images using DALL-E 3
2. **generate_video**: Placeholder video generation
3. **add_script_element**: Adds formatted script content

### **Function Call Flow**

```
User Request → AI Analysis → Function Selection → Tool Execution → Result Integration → Response
```

## 🎯 Key Features Explained

### **Real-time Collaboration**

- WebSocket-based live updates
- Instant message delivery
- Generation status notifications
- Room-based project isolation

### **Content Generation**

- **Scripts**: AI-powered screenplay writing
- **Images**: DALL-E 3 integration with Cloudinary storage
- **Videos**: Placeholder system (cost-controlled)

### **Data Persistence**

- Complete conversation history
- Generated asset storage
- Project organization
- User session management

## 🔒 Security & Best Practices

- **Environment Variables**: Secure API key management
- **Validation**: DTO-based request validation
- **Error Handling**: Comprehensive error logging
- **Rate Limiting**: Built-in retry mechanisms
- **CORS**: Properly configured cross-origin requests

## 🧪 Development

### **Testing**

```bash
# Backend tests
cd server && npm run test

# Frontend tests
cd client && npm run test
```

### **Building**

```bash
# Backend build
cd server && npm run build

# Frontend build
cd client && npm run build
```

## 🚀 Deployment

### **Environment Variables for Production**

- Set `NODE_ENV=production`
- Configure proper database URL
- Set client URL for CORS
- Add production API keys

### **Docker Production**

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Considerations

- **Database**: Indexed queries for conversation history
- **Assets**: CDN delivery via Cloudinary
- **Caching**: Client-side caching for static content
- **Optimization**: Code splitting and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using NestJS, Next.js, and OpenAI**
