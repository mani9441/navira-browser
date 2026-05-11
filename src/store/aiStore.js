import { create } from "zustand";

export const useAIStore = create((set) => ({
  messages: [],

  streaming: false,

  currentResponse: "",

  context: null,

  tools: [],

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setStreaming: (value) =>
    set({
      streaming: value,
    }),

  setCurrentResponse: (value) =>
    set({
      currentResponse: value,
    }),

  setContext: (context) =>
    set({
      context,
    }),

  setTools: (tools) =>
    set({
      tools,
    }),
}));
