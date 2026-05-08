import { StorageService } from "../services/StorageService";

export class HistoryManager {
  static async add(
    url,
    title
  ) {
    await StorageService.saveHistory({
      url,
      title,
    });
  }

  static async getAll() {
    return await StorageService.getHistory();
  }
}