import type { RdxRoot, RdxNode, RdxTransform } from "@rdx-lang/types";

// Re-export types
export type { RdxTransform } from "@rdx-lang/types";

// ------------------------------------------------------------
// Pipeline
// ------------------------------------------------------------

/**
 * A composable JS transform pipeline.
 *
 * ```ts
 * import { pipeline } from "@rdx-lang/core";
 * import { githubReferences } from "@rdx-lang/github";
 *
 * const transform = pipeline(
 *   githubReferences("rdx-lang/rdx"),
 *   addReadingTime,
 * );
 *
 * const result = transform(ast);
 * ```
 */
export function pipeline(...transforms: RdxTransform[]): RdxTransform {
  return (root: RdxRoot): RdxRoot => {
    let result = root;
    for (const t of transforms) {
      result = t(result);
    }
    return result;
  };
}

// ------------------------------------------------------------
// AST Walking
// ------------------------------------------------------------

/** Walk all nodes depth-first, calling `fn` on each. */
export function walk(
  nodes: RdxNode[],
  fn: (node: RdxNode, parent: RdxNode | null) => void,
  parent: RdxNode | null = null
): void {
  for (const node of nodes) {
    fn(node, parent);
    const children = getChildren(node);
    if (children) {
      walk(children, fn, node);
    }
  }
}

/** Walk all nodes and replace them. Return `null` to remove a node. */
export function walkMap(
  nodes: RdxNode[],
  fn: (node: RdxNode) => RdxNode | null
): RdxNode[] {
  const result: RdxNode[] = [];
  for (const node of nodes) {
    const mapped = fn(node);
    if (mapped === null) continue;
    const children = getChildren(mapped);
    if (children) {
      const newChildren = walkMap(children, fn);
      result.push(setChildren(mapped, newChildren));
    } else {
      result.push(mapped);
    }
  }
  return result;
}

// ------------------------------------------------------------
// Utilities
// ------------------------------------------------------------

/** Collect all plain text from a node tree. */
export function collectText(nodes: RdxNode[]): string {
  let out = "";
  walk(nodes, (node) => {
    if (node.type === "text") {
      out += node.value;
    }
  });
  return out;
}

/** Find all nodes matching a type. */
export function queryAll<T extends RdxNode>(
  nodes: RdxNode[],
  type: T["type"]
): T[] {
  const results: T[] = [];
  walk(nodes, (node) => {
    if (node.type === type) {
      results.push(node as T);
    }
  });
  return results;
}

/** Find the first node matching a type, or `undefined`. */
export function queryFirst<T extends RdxNode>(
  nodes: RdxNode[],
  type: T["type"]
): T | undefined {
  let found: T | undefined;
  walk(nodes, (node) => {
    if (!found && node.type === type) {
      found = node as T;
    }
  });
  return found;
}

// ------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------

function getChildren(node: RdxNode): RdxNode[] | null {
  if ("children" in node && Array.isArray(node.children)) {
    return node.children;
  }
  return null;
}

function setChildren(node: RdxNode, children: RdxNode[]): RdxNode {
  if ("children" in node) {
    return { ...node, children };
  }
  return node;
}
