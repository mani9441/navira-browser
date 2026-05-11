export class LLMRouter {
  static async complete(prompt) {
    console.log("PROMPT:", prompt);

    return {
      role: "assistant",

      content: "Navira AI runtime connected successfully.",
    };
  }
}
