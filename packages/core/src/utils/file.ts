import { promises as fs } from "fs";
import * as path from "path";

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

export function getFriendlyPath(from: string, to: string): string {
  // 1. Resolve to absolute paths to ensure we aren't comparing "empty" strings
  const absoluteFrom = path.resolve(from);
  const absoluteTo = path.resolve(to);

  const relative = path.relative(absoluteFrom, absoluteTo);

  // 2. Check if the path "escapes" the parent (starts with ..)
  // or if it's an entirely different root (isAbsolute)
  const isOutside = relative.startsWith("..") || path.isAbsolute(relative);

  // 3. If it's the same path, relative is '', so we use '.'
  if (relative === "") return ".";

  return isOutside ? absoluteTo : relative;
}

/**
 * Checks if a path is a child subdirectory of a parent path.
 *
 * @param childPath - Path to test
 * @param parentPath - Potential parent path
 * @returns `true` if childPath is a subdirectory of parentPath
 */
export function isChildPath(childPath: string, parentPath: string): boolean {
  // Special handling for root path - it's the parent of all non-root paths
  if (parentPath === ".") {
    return childPath !== ".";
  }

  // Check if child path starts with parent path followed by a path separator
  // This ensures 'core/api' is a child of 'core', but 'core2' is not
  return childPath.startsWith(parentPath + "/");
}
