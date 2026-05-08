export class DownloadManager {
  static downloads = [];

  static add(download) {
    this.downloads.push(download);
  }

  static getAll() {
    return this.downloads;
  }
}