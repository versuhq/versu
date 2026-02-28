import { z } from "zod";

const commitNoteSchema = z.object({
  title: z.string(),
  text: z.string(),
});

const commitReferenceSchema = z.object({
  raw: z.string(),
  action: z.string().nullable(),
  owner: z.string().nullable(),
  repository: z.string().nullable(),
  issue: z.string(),
  prefix: z.string(),
});

const commitBaseSchema = z.object({
  merge: z.string().nullable(),
  revert: z.record(z.string(), z.string().nullable()).nullable(),
  header: z.string().nullable(),
  body: z.string().nullable(),
  footer: z.string().nullable(),
  notes: z.array(commitNoteSchema),
  mentions: z.array(z.string()),
  references: z.array(commitReferenceSchema),

  type: z.string().nullable().optional(),
  version: z.string().nullable().optional(),
  hash: z.string().nullable().optional(),
  committerDate: z.string().nullable().optional(),
});

const commitSchema = z.intersection(
  commitBaseSchema,
  z.record(z.string(), z.string().nullable()),
);

const commitGroupSchema = z.object({
  title: z.string(),
  commits: z.array(commitSchema),
});

const noteGroupSchema = z.object({
  title: z.string(),
  notes: z.array(commitNoteSchema),
});

const contextSchema = z.object({
  prependPlaceholder: z.string(),
  version: z.string().optional(),
  isPatch: z.boolean().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  linkReferences: z.boolean().optional(),
  commit: z.string().optional(),
  issue: z.string().optional(),
  repository: z.string().optional(),
  host: z.string().optional(),
  owner: z.string().optional(),
  repoUrl: z.string().optional(),
  commitGroups: z.array(commitGroupSchema).optional(),
  noteGroups: z.array(noteGroupSchema).optional(),
  linkCompare: z.boolean().optional(),
});

const optionsSchema = z.object({
  groupBy: z.string().optional(), // not accurate
  commitsSort: z.any().optional(),
  commitGroupsSort: z.any().optional(),
  notesSort: z.any().optional(),
  noteGroupsSort: z.any().optional(),
  ignoreReverted: z.boolean().optional(),
  reverse: z.boolean().optional(),
  doFlush: z.boolean().optional(),
  transform: z
    .function({ input: [z.any(), z.any(), z.any()], output: z.any() })
    .optional(),
  generateOn: z
    .union([
      z.function({
        input: [z.any(), z.any(), z.any(), z.any()],
        output: z.boolean(),
      }),
      z.string(),
    ])
    .nullable()
    .optional(),
  finalizeContext: z
    .function({
      input: [z.any(), z.any(), z.any(), z.any(), z.any()],
      output: z.any(),
    })
    .optional(),
  debug: z.function({ input: [z.string()], output: z.void() }).optional(),
  formatDate: z
    .function({ input: [z.union([z.string(), z.date()])], output: z.string() })
    .optional(),
  skip: z.function({ input: [z.any()], output: z.boolean() }).optional(),
  mainTemplate: z.string().optional(),
  headerPartial: z.string().optional(),
  commitPartial: z.string().optional(),
  footerPartial: z.string().optional(),
  partials: z.record(z.string(), z.string().nullable()).optional(),
});

/**
 * Zod schema for Changelog configuration.
 * Validates the structure of changelog options and context.
 */
export const changelogSchema = z.object({
  context: contextSchema.optional(),
  options: optionsSchema.optional(),
});

const stableCommitSchema = z.enum(["patch", "minor", "major"]);

const prereleaseCommitSchema = z.enum([
  "prerelease",
  "prepatch",
  "preminor",
  "premajor",
]);

export const commitTypeConfigSchema = z.object({
  stable: z.union([stableCommitSchema, z.literal("none")]),
  prerelease: z.union([prereleaseCommitSchema, z.literal("none")]),
});

/**
 * Zod schema for the main Config object.
 * This schema is used by ConfigurationValidator to ensure type-safe
 * configuration with detailed error messages for invalid configurations.
 */
export const configSchema = z.object({
  plugins: z.array(z.string()).optional().default([]),
  versioning: z
    .object({
      unknownCommitType: commitTypeConfigSchema.optional(),
      breakingChange: commitTypeConfigSchema.optional(),
      commitTypes: z.record(z.string(), commitTypeConfigSchema).optional(),
      cascadeRules: z
        .object({
          stable: z
            .record(
              stableCommitSchema,
              z.union([stableCommitSchema, z.literal("none")]),
            )
            .optional(),
          prerelease: z
            .record(
              prereleaseCommitSchema,
              z.union([prereleaseCommitSchema, z.literal("none")]),
            )
            .optional(),
        })
        .optional(),
    })
    .optional(),
  changelog: z
    .object({
      root: changelogSchema.optional(),
      module: changelogSchema.optional(),
    })
    .optional(),
});

export const configSchemaWithDefaults = z.object({
  plugins: z.array(z.string()),
  versioning: z.object({
    unknownCommitType: commitTypeConfigSchema,
    breakingChange: commitTypeConfigSchema,
    commitTypes: z.record(z.string(), commitTypeConfigSchema),
    cascadeRules: z.object({
      stable: z.record(
        stableCommitSchema,
        z.union([stableCommitSchema, z.literal("none")]),
      ),
      prerelease: z.record(
        prereleaseCommitSchema,
        z.union([prereleaseCommitSchema, z.literal("none")]),
      ),
    }),
  }),
  changelog: z
    .object({
      root: changelogSchema.optional(),
      module: changelogSchema.optional(),
    })
    .optional(),
});
