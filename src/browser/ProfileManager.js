import { SessionManager } from "./SessionManager";

import { StorageService } from "../services/StorageService";

export class ProfileManager {
  static async create(name) {
    const profile =
      SessionManager.createProfile(
        name
      );

    await StorageService.saveProfile(
      profile
    );

    return profile;
  }

  static async getAll() {
    return await StorageService.getProfiles();
  }
}