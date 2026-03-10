# @rdx-lang/core

Core utilities for working with [RDX](https://github.com/rdx-lang/rdx) ASTs in JavaScript/TypeScript — composable transform pipeline, tree walking, and query helpers.

## Install

```sh
npm install @rdx-lang/core
```

## Usage

### Transform pipeline

```ts
import { pipeline } from "@rdx-lang/core";
import { githubReferences } from "@rdx-lang/github";

const transform = pipeline(
  githubReferences({ repo: "rdx-lang/rdx" }),
  addReadingTime,
);

const result = transform(ast);
```

### Walking and querying

```ts
import { walk, queryAll, queryFirst, collectText } from "@rdx-lang/core";

// Find all headings
const headings = queryAll(ast.children, "heading");

// Extract plain text for search indexing
const text = collectText(ast.children);

// Custom walk
walk(ast.children, (node, parent) => {
  if (node.type === "component") {
    console.log(node.name);
  }
});
```

### `walkMap` — transform nodes

```ts
import { walkMap } from "@rdx-lang/core";

// Remove all images
const filtered = walkMap(ast.children, (node) =>
  node.type === "image" ? null : node
);
```

## API

- `pipeline(...transforms)` — Compose transforms left-to-right
- `walk(nodes, fn)` — Depth-first traversal
- `walkMap(nodes, fn)` — Map/filter nodes (return `null` to remove)
- `collectText(nodes)` — Extract all plain text
- `queryAll(nodes, type)` — Find all nodes of a type
- `queryFirst(nodes, type)` — Find first node of a type

## License

MIT OR Apache-2.0
