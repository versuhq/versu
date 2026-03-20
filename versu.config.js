// Versu configuration in JavaScript format
module.exports = {
  plugins: ["@versu/plugin-gradle"],
  versionRules: {
    defaultBump: "patch",
    commitTypeBumps: {
      feat: "minor",
      fix: "patch",
      perf: "patch",
      refactor: "patch",
      docs: "ignore",
      test: "ignore",
      chore: "ignore",
      style: "ignore",
      ci: "ignore",
      build: "ignore",
    },
    dependencyBumps: {
      major: "major",
      minor: "minor",
      patch: "patch",
    },
  },
};
