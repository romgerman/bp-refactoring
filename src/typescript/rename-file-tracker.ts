import * as fs from "fs/promises";

interface FileRenameChange {
  oldName: string;
  newName: string;
}

export class RenameFileTracker {
  changes: FileRenameChange[] = [];

  constructor() {}

  renameFile(oldName: string, newName: string): void {
    const change = this.changes.find((c) => c.oldName === oldName);

    if (change) {
      change.newName = newName;
    } else {
      this.changes.push({
        oldName,
        newName,
      });
    }
  }

  async applyChanges(): Promise<void> {
    for (const rename of this.changes) {
      await fs.rename(rename.oldName, rename.newName);
    }
  }
}
