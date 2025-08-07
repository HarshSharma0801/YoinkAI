import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({ onSubmit, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 justify-center p-4 border-t bg-white">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask me to write a scene, generate an image, or create a video..."
        disabled={disabled}
        className="flex-1 max-w-[800px]"
      />
      <Button type="submit" disabled={disabled || !prompt.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
