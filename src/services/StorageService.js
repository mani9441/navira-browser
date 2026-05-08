export class StorageService {
  // ------------------------
  // TABS
  // ------------------------

  static async loadTabs() {
    return await window.electronAPI.loadTabs();
  }

  static async saveTabs(
    tabs,
    activeTabId
  ) {
    return await window.electronAPI.saveTabs(
      tabs,
      activeTabId
    );
  }

  // ------------------------
  // PROFILES
  // ------------------------

  static async saveProfile(
    profile
  ) {
    return await window.electronAPI.saveProfile(
      profile
    );
  }

  static async getProfiles() {
    return await window.electronAPI.getProfiles();
  }

  // ------------------------
  // HISTORY
  // ------------------------

  static async saveHistory(
    entry
  ) {
    return await window.electronAPI.saveHistory(
      entry
    );
  }

  static async getHistory() {
    return await window.electronAPI.getHistory();
  }

  // ------------------------
  // PERMISSIONS
  // ------------------------

  static async savePermission(
    permission
  ) {
    return await window.electronAPI.savePermission(
      permission
    );
  }

  static async getPermissions() {
    return await window.electronAPI.getPermissions();
  }
}