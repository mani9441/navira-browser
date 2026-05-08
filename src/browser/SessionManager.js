export class SessionManager {
  static createPartition(profileName) {
    return `persist:${profileName.toLowerCase()}`;
  }

  static createProfile(name) {
    return {
      id: Date.now(),
      name,
      partition: this.createPartition(name),
      createdAt: Date.now(),
    };
  }
}