import { io, Socket } from "socket.io-client";
import { SocketEvents } from "@/types";

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;

  private constructor() {}

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  connect(
    serverUrl: string = process.env.NEXT_PUBLIC_SERVER_URL ||
      "http://localhost:3001"
  ) {
    if (!this.socket) {
      this.socket = io(serverUrl, {
        withCredentials: true,
        autoConnect: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinProject(projectId: string) {
    this.socket?.emit("joinProject", { projectId });
  }

  sendPrompt(projectId: string, prompt: string) {
    this.socket?.emit("prompt", { projectId, prompt });
  }

  on<T extends keyof SocketEvents>(
    event: T,
    callback: (data: SocketEvents[T]) => void
  ) {
    this.socket?.on(event as string, callback as (...args: unknown[]) => void);
  }

  off<T extends keyof SocketEvents>(
    event: T,
    callback?: (data: SocketEvents[T]) => void
  ) {
    this.socket?.off(event as string, callback as (...args: unknown[]) => void);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketClient = SocketClient.getInstance();
