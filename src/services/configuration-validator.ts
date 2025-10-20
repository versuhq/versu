import { Config } from "../config/index.js";
import { BumpType } from "../semver/index.js";

const validBumpTypes: (BumpType | 'ignore')[] = ['major', 'minor', 'patch', 'none', 'ignore'];
const validDepBumpTypes: BumpType[] = ['major', 'minor', 'patch', 'none'];

export class ConfigurationValidator {

    validate(config: Config): void {
      if (!validBumpTypes.includes(config.defaultBump)) {
        throw new Error(`Invalid defaultBump: ${config.defaultBump}`);
      }
      
      for (const [commitType, bumpType] of Object.entries(config.commitTypes)) {
        if (!validBumpTypes.includes(bumpType)) {
          throw new Error(`Invalid bump type for commit type '${commitType}': ${bumpType}`);
        }
      }
      
      const depRules = config.dependencyRules;
      
      if (!validDepBumpTypes.includes(depRules.onMajorOfDependency)) {
        throw new Error(`Invalid onMajorOfDependency: ${depRules.onMajorOfDependency}`);
      }
      
      if (!validDepBumpTypes.includes(depRules.onMinorOfDependency)) {
        throw new Error(`Invalid onMinorOfDependency: ${depRules.onMinorOfDependency}`);
      }
      
      if (!validDepBumpTypes.includes(depRules.onPatchOfDependency)) {
        throw new Error(`Invalid onPatchOfDependency: ${depRules.onPatchOfDependency}`);
      }
    }
}