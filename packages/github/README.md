# @rdx-lang/github

[RDX](https://github.com/rdx-lang/rdx) transform that converts GitHub references in text to clickable links — `#123` to issue links, `@user` to profile links, and commit SHAs to commit links.

## Install

```sh
npm install @rdx-lang/github
```

## Usage

```ts
import { githubReferences } from "@rdx-lang/github";
import { pipeline } from "@rdx-lang/core";

const transform = pipeline(
  githubReferences({ repo: "rdx-lang/rdx" }),
);

const result = transform(ast);
```

Input text like `Fixed #42 by @alice in abc1234f` becomes links:
- `#42` → `https://github.com/rdx-lang/rdx/issues/42`
- `@alice` → `https://github.com/alice`
- `abc1234f` → `https://github.com/rdx-lang/rdx/commit/abc1234f`

## Options

```ts
githubReferences({
  repo: "owner/repo",        // Required: GitHub repo
  baseUrl: "https://github.com", // Optional: defaults to github.com
});
```

## License

MIT OR Apache-2.0
