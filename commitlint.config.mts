import type { UserConfig } from "@commitlint/types";

export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat",
				"fix",
				"docs",
				"style",
				"refactor",
				"perf",
				"test",
				"build",
				"ci",
				"chore",
				"revert",
			],
		],
		"scope-enum": [2, "always", ["config", "deps", "ci", "release"]],
		"scope-empty": [1, "never"],
		"subject-case": [2, "never", ["upper-case", "pascal-case"]],
	},
} satisfies UserConfig;
