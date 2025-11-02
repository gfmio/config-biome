import type { UserConfig } from '@commitlint/types';

export default {
  extends: [
    '@commitlint/config-conventional',
  ],
  rules: {
    'scope-empty': [
      1,
      'never',
    ],
    'scope-enum': [
      2,
      'always',
      [
        'config',
        'deps',
        'ci',
        'release',
      ],
    ],
    'subject-case': [
      2,
      'never',
      [
        'upper-case',
        'pascal-case',
      ],
    ],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
} satisfies UserConfig;
