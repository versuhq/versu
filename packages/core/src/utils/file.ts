import { promises as fs } from "fs";

/**
 * Checks whether a file or directory exists at the specified path.
 * @param path - Absolute or relative path to check
 * @returns True if the path exists and is accessible, false otherwise
 */
export async function exists(path: string): Promise<boolean> {
  try {
    // Attempt to access the path
    // If access succeeds, the path exists and is accessible
    await fs.access(path);
    return true;
  } catch {
    // If access fails (any error), consider path as non-existent
    // This includes ENOENT (doesn't exist) and EACCES (no permission)
    return false;
  }
}
