import React from "react";
import { Element, ElementType } from "@/types";
import { Loader2 } from "lucide-react";

interface ElementRendererProps {
  element: Element;
}

export function ElementRenderer({ element }: ElementRendererProps) {
  const { type, content, assetUrl, isGenerating, metadata } = element;

  if (isGenerating) {
    return (
      <div className="flex items-center gap-2 py-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Generating {type.toLowerCase()}...</span>
      </div>
    );
  }

  switch (type) {
    case ElementType.SCENE_HEADING:
      return (
        <h2 className="text-lg font-bold uppercase tracking-wide py-2 border-b border-gray-200">
          {content}
        </h2>
      );

    case ElementType.ACTION:
      return (
        <p className="py-1 text-gray-800 leading-relaxed max-w-none">
          {content}
        </p>
      );

    case ElementType.CHARACTER:
      return (
        <div className="pt-4 pb-1">
          <h3 className="font-semibold uppercase tracking-wider text-center">
            {content}
          </h3>
        </div>
      );

    case ElementType.DIALOGUE:
      return (
        <p className="pb-2 text-gray-800 leading-relaxed max-w-md mx-auto text-center">
          {content}
        </p>
      );

    case ElementType.PARENTHETICAL:
      return (
        <p className="pb-1 text-gray-600 italic text-center max-w-sm mx-auto">
          ({content})
        </p>
      );

    case ElementType.TRANSITION:
      return (
        <p className="py-2 font-semibold uppercase tracking-wide text-right">
          {content}
        </p>
      );

    case ElementType.IMAGE:
      return (
        <div className="py-4">
          {assetUrl ? (
            <div className="space-y-2">
              {}
              <img
                src={assetUrl}
                alt={content}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-600 text-center italic">
                {content}
              </p>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              Image: {content}
            </div>
          )}
        </div>
      );

    case ElementType.VIDEO:
      return (
        <div className="py-4">
          {assetUrl ? (
            <div className="space-y-2">
              <video
                src={assetUrl}
                controls
                className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-sm text-gray-600 text-center italic">
                {content}
              </p>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              Video: {content}
            </div>
          )}
        </div>
      );

    case ElementType.TEXT:
    default:

      if (metadata?.isConversationTurn) {
        const isUser = metadata.conversationRole === "user";
        return (
          <div
            className={`py-2 px-4 my-2 rounded-lg ${
              isUser
                ? "bg-blue-50 border-l-4 border-blue-500 ml-8"
                : "bg-gray-50 border-l-4 border-gray-500 mr-8"
            }`}
          >
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>
        );
      }

      return (
        <div className="py-1 text-gray-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      );
  }
}
