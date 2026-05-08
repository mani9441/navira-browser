import { StorageService } from "../services/StorageService";

export class PermissionManager {
  static async allow(
    domain,
    permission
  ) {
    await StorageService.savePermission({
      domain,
      permission,
      status: "allowed",
    });
  }

  static async deny(
    domain,
    permission
  ) {
    await StorageService.savePermission({
      domain,
      permission,
      status: "denied",
    });
  }

  static async getAll() {
    return await StorageService.getPermissions();
  }
}