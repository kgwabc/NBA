import { EventEmitter } from "events";
import type { ChatMessage } from "@/lib/db";

declare global {
  // eslint-disable-next-line no-var
  var __chatEmitter: EventEmitter | undefined;
}

const CHAT_EVENT = "message";

export type ChatEvent =
  | { type: "message"; message: ChatMessage }
  | { type: "delete"; id: number }
  | { type: "clear" };

function createEmitter() {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  return emitter;
}

const emitter = global.__chatEmitter ?? (global.__chatEmitter = createEmitter());

export function publish(event: ChatEvent) {
  emitter.emit(CHAT_EVENT, event);
}

export function subscribe(listener: (event: ChatEvent) => void) {
  emitter.on(CHAT_EVENT, listener);
  return () => emitter.off(CHAT_EVENT, listener);
}
