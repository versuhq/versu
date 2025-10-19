import { ModuleRegistry } from "./module-registry";
export interface ModuleDetector {
    readonly repoRoot: string;
    /**
     * Detect all modules in the repository and return a module manager
     */
    detect(): Promise<ModuleRegistry>;
}
//# sourceMappingURL=module-detector.d.ts.map