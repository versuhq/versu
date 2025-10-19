import { ModuleDetector } from "../module-detector.js";
import { ModuleRegistry } from '../module-registry.js';
export declare class GradleModuleDetector implements ModuleDetector {
    readonly repoRoot: string;
    constructor(repoRoot: string);
    detect(): Promise<ModuleRegistry>;
}
//# sourceMappingURL=gradle-module-detector.d.ts.map