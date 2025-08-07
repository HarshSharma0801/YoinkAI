"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Element, ElementType, ConversationTurn } from "@/types";
import { ElementRenderer } from "./element-renderer";
import { PromptInput } from "./prompt-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { socketClient } from "@/lib/socket";

interface EditorProps {
  projectId: string;
  initialElements?: Element[];
  initialConversationTurns?: ConversationTurn[];
}

export function Editor({
  projectId,
  initialElements = [],
  initialConversationTurns = [],
}: EditorProps) {

  const conversationElements = initialConversationTurns.map((turn, index) => ({
    id: `conversation-${turn.id}`,
    projectId,
    type: ElementType.TEXT,
    content:
      turn.role === "user"
        ? `**User:** ${turn.content}`
        : `**Assistant:** ${turn.content}`,
    isGenerating: false,
    order: index,
    createdAt: turn.createdAt,
    updatedAt: turn.createdAt,
    metadata: {
      conversationRole: turn.role,
      isConversationTurn: true,
    },
  }));

  const allInitialElements = [...conversationElements, ...initialElements].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const [elements, setElements] = useState<Element[]>(allInitialElements);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleTextChunk = useCallback((data: { content: string }) => {
    setStreamingText((prev) => prev + data.content);
  }, []);

  const handleGenerationStarted = useCallback(
    (data: { elementId: string; type: string }) => {

      console.log("Generation started:", data);
    },
    []
  );

  const handleGenerationCompleted = useCallback(
    (data: { elementId: string; assetUrl: string }) => {
      setElements((prev) =>
        prev.map((el) =>
          el.id === data.elementId
            ? { ...el, assetUrl: data.assetUrl, isGenerating: false }
            : el
        )
      );
    },
    []
  );

  const handleElementAdded = useCallback((data: { element: Element }) => {
    setElements((prev) => [...prev, data.element]);
  }, []);

  const handleError = useCallback((data: { message: string }) => {
    console.error("Socket error:", data.message);
    setIsProcessing(false);
  }, []);

  const handleInfo = useCallback((data: { message: string }) => {
    setInfoMessage(data.message);

    setTimeout(() => setInfoMessage(null), 10000);
  }, []);

  useEffect(() => {
    socketClient.connect();

    socketClient.joinProject(projectId);

    socketClient.on("textChunk", handleTextChunk);
    socketClient.on("generationStarted", handleGenerationStarted);
    socketClient.on("generationCompleted", handleGenerationCompleted);
    socketClient.on("elementAdded", handleElementAdded);
    socketClient.on("error", handleError);
    socketClient.on("info", handleInfo);

    return () => {

      socketClient.off("textChunk", handleTextChunk);
      socketClient.off("generationStarted", handleGenerationStarted);
      socketClient.off("generationCompleted", handleGenerationCompleted);
      socketClient.off("elementAdded", handleElementAdded);
      socketClient.off("error", handleError);
      socketClient.off("info", handleInfo);
    };
  }, [
    projectId,
    handleTextChunk,
    handleGenerationStarted,
    handleGenerationCompleted,
    handleElementAdded,
    handleError,
    handleInfo,
  ]);

  useEffect(() => {

    if (streamingText && !isProcessing) {
      const textElement: Element = {
        id: `text-${Date.now()}`,
        projectId,
        type: ElementType.TEXT,
        content: streamingText,
        isGenerating: false,
        order: elements.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setElements((prev) => [...prev, textElement]);
      setStreamingText("");
    }
  }, [isProcessing, streamingText, projectId, elements.length]);

  const handlePromptSubmit = (prompt: string) => {
    setIsProcessing(true);
    setStreamingText("");

    const userElement: Element = {
      id: `user-${Date.now()}`,
      projectId,
      type: ElementType.TEXT,
      content: `User: ${prompt}`,
      isGenerating: false,
      order: elements.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setElements((prev) => [...prev, userElement]);

    socketClient.sendPrompt(projectId, prompt);

    setTimeout(() => setIsProcessing(false), 30000);
  };

  const displayElements = [...elements];
  if (streamingText && isProcessing) {
    displayElements.push({
      id: `streaming-${Date.now()}`,
      projectId,
      type: ElementType.TEXT,
      content: streamingText,
      isGenerating: false,
      order: elements.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Aether Editor</h1>
        <p className="text-sm text-gray-600">
          AI-powered script and scene creation
        </p>
        {infoMessage && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{infoMessage}</p>
          </div>
        )}
      </div>

      {}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8 bg-white min-h-full">
          {displayElements.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">Welcome to Aether Editor</p>
              <p>
                Start by asking me to write a scene, generate an image, or
                create a video.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayElements.map((element) => (
                <ElementRenderer key={element.id} element={element} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {}
      <PromptInput onSubmit={handlePromptSubmit} disabled={isProcessing} />
    </div>
  );
}
