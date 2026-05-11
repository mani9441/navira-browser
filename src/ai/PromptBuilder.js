export class PromptBuilder {
  static build({ context, message }) {
    return `
You are Navira AI.

You are integrated into an AI-native browser.

Current Active Tab:
${JSON.stringify(context.activeTab, null, 2)}

Open Tabs:
${JSON.stringify(context.openTabs, null, 2)}

Recent History:
${JSON.stringify(context.recentHistory, null, 2)}

User Request:
${message}

Respond helpfully.
`;
  }
}
