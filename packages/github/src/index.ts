import type {
  RdxRoot,
  RdxNode,
  RdxTransform,
  RdxTextNode,
  RdxLinkNode,
  RdxPosition,
} from "@rdx-lang/types";
import { walk } from "@rdx-lang/core";

export interface GithubOptions {
  /** GitHub repository in `owner/repo` format. */
  repo: string;
  /** Base URL for links. Defaults to `https://github.com`. */
  baseUrl?: string;
}

// Patterns
const ISSUE_RE = /(?<=^|[^a-zA-Z0-9])#(\d+)/g;
const USER_RE = /(?<=^|\s)@([a-zA-Z0-9_-]+)/g;
const COMMIT_RE = /(?<=^|[^a-zA-Z0-9])([0-9a-f]{7,40})(?=[^a-zA-Z0-9]|$)/g;

/**
 * Creates a transform that converts GitHub references to links.
 *
 * ```ts
 * import { githubReferences } from "@rdx-lang/github";
 * import { pipeline } from "@rdx-lang/core";
 *
 * const transform = pipeline(
 *   githubReferences({ repo: "rdx-lang/rdx" }),
 * );
 * ```
 */
export function githubReferences(options: GithubOptions): RdxTransform {
  const base = (options.baseUrl ?? "https://github.com").replace(/\/$/, "");
  const repoUrl = `${base}/${options.repo}`;

  return (root: RdxRoot): RdxRoot => {
    const newChildren = processNodes(root.children, repoUrl, base);
    return { ...root, children: newChildren };
  };
}

function processNodes(
  nodes: RdxNode[],
  repoUrl: string,
  baseUrl: string
): RdxNode[] {
  const result: RdxNode[] = [];

  for (const node of nodes) {
    // Skip inside links and images
    if (node.type === "link" || node.type === "image") {
      result.push(node);
      continue;
    }

    if (node.type === "text") {
      result.push(...expandTextNode(node, repoUrl, baseUrl));
      continue;
    }

    // Recurse into children
    if ("children" in node && Array.isArray(node.children)) {
      const newChildren = processNodes(node.children, repoUrl, baseUrl);
      result.push({ ...node, children: newChildren } as RdxNode);
    } else {
      result.push(node);
    }
  }

  return result;
}

interface Match {
  index: number;
  length: number;
  node: RdxLinkNode;
}

function expandTextNode(
  node: RdxTextNode,
  repoUrl: string,
  baseUrl: string
): RdxNode[] {
  const text = node.value;
  const matches: Match[] = [];

  // Issues: #123
  for (const m of text.matchAll(ISSUE_RE)) {
    const idx = m.index! + m[0].length - m[1].length - 1; // position of #
    const len = m[1].length + 1;
    matches.push({
      index: idx,
      length: len,
      node: makeLink(
        `#${m[1]}`,
        `${repoUrl}/issues/${m[1]}`,
        subPosition(node.position, idx, idx + len)
      ),
    });
  }

  // Users: @username
  for (const m of text.matchAll(USER_RE)) {
    const idx = m.index! + m[0].length - m[1].length - 1;
    const len = m[1].length + 1;
    matches.push({
      index: idx,
      length: len,
      node: makeLink(
        `@${m[1]}`,
        `${baseUrl}/${m[1]}`,
        subPosition(node.position, idx, idx + len)
      ),
    });
  }

  // Commits: abc1234f (must contain at least one letter)
  for (const m of text.matchAll(COMMIT_RE)) {
    if (!/[a-f]/i.test(m[1])) continue;
    const idx = m.index!;
    const len = m[1].length;
    matches.push({
      index: idx,
      length: len,
      node: makeLink(
        m[1].slice(0, 7),
        `${repoUrl}/commit/${m[1]}`,
        subPosition(node.position, idx, idx + len)
      ),
    });
  }

  if (matches.length === 0) return [node];

  // Sort by position and build result
  matches.sort((a, b) => a.index - b.index);
  const result: RdxNode[] = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.index < cursor) continue; // skip overlapping match
    if (match.index > cursor) {
      result.push(
        makeText(
          text.slice(cursor, match.index),
          subPosition(node.position, cursor, match.index)
        )
      );
    }
    result.push(match.node);
    cursor = match.index + match.length;
  }

  if (cursor < text.length) {
    result.push(
      makeText(
        text.slice(cursor),
        subPosition(node.position, cursor, text.length)
      )
    );
  }

  return result;
}

/**
 * Derive a sub-position within a text node by slicing at character offsets.
 * Since we only have byte offsets and line/column from the parent, we approximate
 * by advancing offset/column by the character index (valid for ASCII content,
 * which GitHub refs always are).
 */
function subPosition(
  base: RdxPosition,
  charStart: number,
  charEnd: number
): RdxPosition {
  return {
    start: {
      line: base.start.line,
      column: base.start.column + charStart,
      offset: base.start.offset + charStart,
    },
    end: {
      line: base.start.line,
      column: base.start.column + charEnd,
      offset: base.start.offset + charEnd,
    },
  };
}

function makeLink(
  text: string,
  url: string,
  position: RdxPosition
): RdxLinkNode {
  return {
    type: "link",
    url,
    children: [{ type: "text", value: text, position }],
    position,
  };
}

function makeText(value: string, position: RdxPosition): RdxTextNode {
  return { type: "text", value, position };
}
