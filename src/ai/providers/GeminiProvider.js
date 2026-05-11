export class GeminiProvider {
  static async complete({ prompt }) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    console.log(data);

    return {
      role: "assistant",

      content:
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
    };
  }
}
