"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, MessageCircle, Clock, ArrowRight } from "lucide-react";
import axios from "axios";

interface CreateProjectData {
  title: string;
  description?: string;
  userId: string;
}

interface CreateUserData {
  email: string;
  name?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  elements: Array<{
    id: string;
    type: string;
    content: string;
    assetUrl?: string;
  }>;
  conversationTurns: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  _count: {
    elements: number;
    conversationTurns: number;
  };
}

const DEMO_USER_EMAIL = "demo@aethereditor.com";
const DEMO_USER_NAME = "Demo User";

async function createOrFindUser(data: CreateUserData) {
  const response = await axios.post(
    `${
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
    }/users/find-or-create`,
    data
  );
  return response.data;
}

async function createProject(data: CreateProjectData) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"}/projects`,
    data
  );
  return response.data;
}

async function fetchProjectsForUser(userId: string): Promise<Project[]> {
  const response = await axios.get(
    `${
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
    }/projects/user/${userId}`
  );
  return response.data;
}

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeUserAndProjects = async () => {
      try {
        const user = await createOrFindUser({
          email: DEMO_USER_EMAIL,
          name: DEMO_USER_NAME,
        });
        setUserId(user.id);

        const fetchedProjects = await fetchProjectsForUser(user.id);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error initializing user or fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    initializeUserAndProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !userId) return;

    setIsCreating(true);
    try {
      const project = await createProject({
        title: title.trim(),
        description: description.trim() || undefined,
        userId: userId,
      });
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderProjectCard = (project: Project) => {
    const lastConversationTurn = project.conversationTurns?.[0];
    const lastMessageContent = lastConversationTurn
      ? `${
          lastConversationTurn.role === "user" ? "User" : "AI"
        }: ${lastConversationTurn.content.substring(0, 100)}${
          lastConversationTurn.content.length > 100 ? "..." : ""
        }`
      : "No conversation yet.";

    return (
      <div
        key={project.id}
        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
        )}
        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            <span>{project._count?.conversationTurns || 0} messages</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{project._count?.elements || 0} elements</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Updated: {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-700 border-t pt-3 mt-3">
          <p className="font-medium">Last message:</p>
          <p className="text-gray-600 italic">{lastMessageContent}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Yoink AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered script writing and content creation
          </p>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Script Writing</p>
            </div>
            <div className="text-center">
              <Plus className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Image Generation</p>
            </div>
            <div className="text-center">
              <ArrowRight className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Video Creation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Title
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title..."
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (Optional)
                </label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project..."
                />
              </div>
              <Button
                type="submit"
                disabled={isCreating || !title.trim()}
                className="w-full"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Projects
            </h2>
            {loadingProjects ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No projects yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map(renderProjectCard)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Create Project</h4>
              <p className="text-gray-600">
                Start a new project with a title and description
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Chat with AI</h4>
              <p className="text-gray-600">
                Describe what you want to create and let AI help you
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Generate Content</h4>
              <p className="text-gray-600">
                Create scripts, images, and videos with AI assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
