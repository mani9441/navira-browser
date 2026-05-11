import { GeminiProvider } from "./providers/GeminiProvider";

export class LLMRouter {
  static async complete({
    provider = "gemini",

    prompt,

    onToken,
  }) {
    switch (provider) {
      case "gemini":
        return await GeminiProvider.complete({
          prompt,
          onToken,
        });

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
