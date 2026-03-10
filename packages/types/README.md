# @rdx-lang/types

TypeScript type definitions for the [RDX](https://github.com/rdx-lang/rdx) AST. Mirrors the Rust `rdx-ast` crate exactly.

## Install

```sh
npm install @rdx-lang/types
```

## Usage

```ts
import type { RdxRoot, RdxNode, RdxComponentNode } from "@rdx-lang/types";

function findComponents(root: RdxRoot): RdxComponentNode[] {
  return root.children.filter(
    (n): n is RdxComponentNode => n.type === "component"
  );
}
```

## Types

- `RdxRoot` — Document root with frontmatter and children
- `RdxNode` — Union of all node types
- `RdxComponentNode` — `<Component>` with name, attributes, children
- `RdxAttributeNode` — Component attribute with name and typed value
- `RdxTextNode`, `RdxHeadingNode`, `RdxParagraphNode`, etc.
- `RdxSchema`, `RdxComponentSchema`, `RdxPropSchema` — Schema validation types
- `RdxDiagnostic` — Validation diagnostic
- `RdxTransform` — `(root: RdxRoot) => RdxRoot` function type
- `RdxPosition`, `RdxPoint` — Source location mapping

## License

MIT OR Apache-2.0
