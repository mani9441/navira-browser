import { ContextEngine } from "./ContextEngine";

import { PromptBuilder } from "./PromptBuilder";

import { LLMRouter } from "./LLMRouter";

import { useAIStore } from "../store/aiStore";

import { AIEventTypes } from "./AIEvents";

import { eventBus } from "../browser/BrowserEvents";

export class AIChatManager {
  static async send(message) {
    const aiStore = useAIStore.getState();

    aiStore.addMessage({
      role: "user",
      content: message,
    });

    eventBus.emit(AIEventTypes.AI_MESSAGE_SENT, { message });

    aiStore.setStreaming(true);

    const context = await ContextEngine.build();

    eventBus.emit(AIEventTypes.AI_CONTEXT_UPDATED, context);

    const prompt = PromptBuilder.build({
      context,
      message,
    });

    const response = await LLMRouter.complete(prompt);

    aiStore.addMessage(response);

    aiStore.setStreaming(false);

    eventBus.emit(AIEventTypes.AI_RESPONSE_RECEIVED, response);

    return response;
  }
}
