"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { Project } from "@/types";
import axios from "axios";

async function fetchProject(id: string): Promise<Project | null> {
  try {
    const response = await axios.get(
      `${
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001"
      }/projects/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
        .then((data) => {
          if (data) {
            setProject(data);
          } else {
            setError("Project not found");
          }
        })
        .catch((err) => {
          setError("Failed to load project");
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Project Not Found
          </h1>
          <p className="text-gray-600">
            The requested project could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Editor
      projectId={project.id}
      initialElements={project.elements}
      initialConversationTurns={project.conversationTurns}
    />
  );
}
