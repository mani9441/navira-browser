import { browser } from "../browser/BrowserAPI";

export class ToolRegistry {
  static tools = {
    openTab: {
      description: "Open new browser tab",

      execute: async ({ url }) => {
        return await browser.tabs.create(url);
      },
    },

    closeTab: {
      description: "Close browser tab",

      execute: async ({ id }) => {
        return await browser.tabs.close(id);
      },
    },

    navigate: {
      description: "Navigate active tab",

      execute: async ({ id, url }) => {
        return await browser.page.navigate(id, url);
      },
    },

    getTabs: {
      description: "Get all open tabs",

      execute: async () => {
        return browser.state.getTabs();
      },
    },

    getActiveTab: {
      description: "Get active tab",

      execute: async () => {
        return browser.state.getActiveTab();
      },
    },
  };

  static getTool(name) {
    return this.tools[name];
  }

  static getAll() {
    return this.tools;
  }

  static async execute(name, payload) {
    const tool = this.tools[name];

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return await tool.execute(payload);
  }
}
