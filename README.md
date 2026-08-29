# @timestables-ninja/core

Framework-free game logic and i18n shared by every **Times Tables Ninja**
client. No React, DOM, or React Native dependencies live here, so it runs
anywhere a JS engine does (browser, Node, React Native/Hermes).

This package was extracted from
[`timestables-ninja`](https://github.com/maurodoglio/timestables-ninja) so
the web app and the iOS app (`timestables-ninja-ios`) share one
implementation of belts, question selection, scoring, and translations
instead of drifting apart.

## What's here

- `src/game` — belts ladder, fact/question generation, weighted practice
  selection, scoring and grading rules, and the avatar catalog
  (`AVATARS`, `getAvatar`, `isAvatarId`).
- `src/i18n` — English and Italian catalogues, language detection,
  `{placeholder}` interpolation, locale formatters (numbers, dates, lists).
- `src/state` — pure profile mutations: folding a finished session into a
  profile (`recordSession`), renaming a profile (`renameProfile`), and
  achievement rules. Deliberately excludes any
  persistence (`localStorage`, `AsyncStorage`, Firestore, ...); each client
  owns its own storage layer.

Nothing here touches storage, React, or the DOM — that's intentionally left
to each consuming app.

## Using this package

There is no npm publish yet. Consuming projects add it as a plain git
dependency and import straight from TypeScript source (both Vite/esbuild and
Metro/Expo transpile `.ts` from `node_modules` without a separate build
step):

```jsonc
// package.json
"dependencies": {
  "@timestables-ninja/core": "git+https://github.com/maurodoglio/timestables-ninja-core.git"
}
```

```ts
import { BELTS, nextBelt, selectQuestions, translate } from '@timestables-ninja/core'
```

To pick up changes, bump the dependency (`npm install <git-url>` again, or
pin a commit SHA in the URL for reproducible installs).

## Development

```bash
npm install
npm test         # vitest
npm run typecheck
```

## Versioning note

No `dist/` build and no semver publishing yet — this is intentionally the
simplest thing that works for two internal consumers. If this package grows
external consumers, add a build step (`tsc` to `dist/`) and publish to npm
under the `@timestables-ninja` scope.
