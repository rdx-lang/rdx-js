# rdx-js

JavaScript/TypeScript packages for [RDX (Reactive Document eXpressions)](https://github.com/rdx-lang/rdx).

## Packages

| Package | Description |
|---|---|
| [`@rdx-lang/types`](packages/types/) | TypeScript type definitions for the RDX AST |
| [`@rdx-lang/wasm`](packages/wasm/) | WASM-compiled parser, validator, and transforms |
| [`@rdx-lang/core`](packages/core/) | JS transform pipeline, AST walking, and utilities |
| [`@rdx-lang/github`](packages/github/) | Transform: convert GitHub references to links |

## Architecture

```
.rdx file
   │
   ▼
@rdx-lang/wasm (Rust→WASM parser)
   │
   ▼
RdxRoot (typed JSON AST)
   │
   ▼
@rdx-lang/core pipeline
   │  ├─ @rdx-lang/github
   │  ├─ your-custom-transform
   │  └─ ...
   ▼
Modified AST → renderer
```

The WASM parser does the heavy lifting. Transforms are plain JS functions that operate on the typed AST — no Rust or WASM needed to write extensions.

## Writing a transform

A transform is just a function:

```ts
import type { RdxTransform } from "@rdx-lang/types";

export function addReadingTime(): RdxTransform {
  return (root) => {
    const text = collectText(root.children);
    const minutes = Math.ceil(text.split(/\s+/).length / 200);
    return {
      ...root,
      frontmatter: { ...root.frontmatter, readingTime: minutes },
    };
  };
}
```

Compose transforms with `pipeline`:

```ts
import { pipeline } from "@rdx-lang/core";
import { githubReferences } from "@rdx-lang/github";

const transform = pipeline(
  githubReferences({ repo: "rdx-lang/rdx" }),
  addReadingTime(),
);

const result = transform(ast);
```

## Development

```sh
bun install
bun run build
```

Requires [Bun](https://bun.sh) 1.2+.

## License

Licensed under either of [Apache License, Version 2.0](../rdx/LICENSE-APACHE) or [MIT License](../rdx/LICENSE-MIT) at your option.
