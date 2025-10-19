import { ModuleDetector } from "../module-detector.js";
import { ModuleRegistry } from '../module-registry.js';
import { 
  getRawProjectInformation,
  parseHierarchyStructure 
} from './hierarchy-dependencies.js';

export class GradleModuleDetector implements ModuleDetector {
  constructor(readonly repoRoot: string) {}

  async detect(): Promise<ModuleRegistry> {
    const rawProjectInformation = await getRawProjectInformation(this.repoRoot);
    const hierarchy = parseHierarchyStructure(rawProjectInformation);
    return new ModuleRegistry(hierarchy);
  }
}
