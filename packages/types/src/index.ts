// ============================================================
// RDX AST TypeScript Definitions
// Mirrors the Rust `rdx-ast` crate exactly.
// ============================================================

/** Source position mapping back to the `.rdx` file. */
export interface RdxPosition {
  start: RdxPoint;
  end: RdxPoint;
}

/** A single point in the source document. */
export interface RdxPoint {
  /** 1-indexed line number. */
  line: number;
  /** 1-indexed column number. */
  column: number;
  /** 0-indexed byte offset from the start of the document. */
  offset: number;
}

// ------------------------------------------------------------
// Root
// ------------------------------------------------------------

/** The root of an RDX document. */
export interface RdxRoot {
  type: "root";
  frontmatter: Record<string, unknown> | null;
  children: RdxNode[];
  position: RdxPosition;
}

// ------------------------------------------------------------
// Node union
// ------------------------------------------------------------

export type RdxNode =
  | RdxTextNode
  | RdxCodeInlineNode
  | RdxCodeBlockNode
  | RdxMathInlineNode
  | RdxMathDisplayNode
  | RdxParagraphNode
  | RdxHeadingNode
  | RdxListNode
  | RdxListItemNode
  | RdxBlockquoteNode
  | RdxThematicBreakNode
  | RdxHtmlNode
  | RdxTableNode
  | RdxTableRowNode
  | RdxTableCellNode
  | RdxLinkNode
  | RdxImageNode
  | RdxEmphasisNode
  | RdxStrongNode
  | RdxStrikethroughNode
  | RdxFootnoteDefinitionNode
  | RdxFootnoteReferenceNode
  | RdxComponentNode
  | RdxVariableNode
  | RdxErrorNode;

// ------------------------------------------------------------
// Text nodes
// ------------------------------------------------------------

export interface RdxTextNode {
  type: "text";
  value: string;
  position: RdxPosition;
}

export interface RdxCodeInlineNode {
  type: "code_inline";
  value: string;
  position: RdxPosition;
}

export interface RdxMathInlineNode {
  type: "math_inline";
  value: string;
  position: RdxPosition;
}

export interface RdxMathDisplayNode {
  type: "math_display";
  value: string;
  position: RdxPosition;
}

// ------------------------------------------------------------
// Code block
// ------------------------------------------------------------

export interface RdxCodeBlockNode {
  type: "code_block";
  value: string;
  lang?: string;
  meta?: string;
  position: RdxPosition;
}

// ------------------------------------------------------------
// Standard block nodes
// ------------------------------------------------------------

interface RdxStandardBlockBase {
  children: RdxNode[];
  position: RdxPosition;
}

export interface RdxParagraphNode extends RdxStandardBlockBase {
  type: "paragraph";
}

export interface RdxHeadingNode extends RdxStandardBlockBase {
  type: "heading";
  depth?: number;
  id?: string;
}

export interface RdxListNode extends RdxStandardBlockBase {
  type: "list";
  ordered?: boolean;
}

export interface RdxListItemNode extends RdxStandardBlockBase {
  type: "list_item";
  checked?: boolean;
}

export interface RdxBlockquoteNode extends RdxStandardBlockBase {
  type: "blockquote";
}

export interface RdxThematicBreakNode extends RdxStandardBlockBase {
  type: "thematic_break";
}

export interface RdxHtmlNode extends RdxStandardBlockBase {
  type: "html";
}

export interface RdxTableNode extends RdxStandardBlockBase {
  type: "table";
}

export interface RdxTableRowNode extends RdxStandardBlockBase {
  type: "table_row";
}

export interface RdxTableCellNode extends RdxStandardBlockBase {
  type: "table_cell";
}

export interface RdxEmphasisNode extends RdxStandardBlockBase {
  type: "emphasis";
}

export interface RdxStrongNode extends RdxStandardBlockBase {
  type: "strong";
}

export interface RdxStrikethroughNode extends RdxStandardBlockBase {
  type: "strikethrough";
}

// ------------------------------------------------------------
// Link & Image
// ------------------------------------------------------------

export interface RdxLinkNode {
  type: "link";
  url: string;
  title?: string;
  children: RdxNode[];
  position: RdxPosition;
}

export interface RdxImageNode {
  type: "image";
  url: string;
  title?: string;
  alt?: string;
  children: RdxNode[];
  position: RdxPosition;
}

// ------------------------------------------------------------
// Footnotes
// ------------------------------------------------------------

export interface RdxFootnoteDefinitionNode {
  type: "footnote_definition";
  label: string;
  children: RdxNode[];
  position: RdxPosition;
}

export interface RdxFootnoteReferenceNode {
  type: "footnote_reference";
  label: string;
  children: RdxNode[];
  position: RdxPosition;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export interface RdxComponentNode {
  type: "component";
  name: string;
  isInline: boolean;
  attributes: RdxAttributeNode[];
  children: RdxNode[];
  position: RdxPosition;
}

export interface RdxAttributeNode {
  name: string;
  value: RdxAttributeValue;
  position: RdxPosition;
}

export type RdxAttributeValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | unknown[]
  | RdxVariableRef;

/** A variable reference as an attribute value. */
export interface RdxVariableRef {
  type: "variable";
  path: string;
  position: RdxPosition;
}

// ------------------------------------------------------------
// Variable interpolation
// ------------------------------------------------------------

export interface RdxVariableNode {
  type: "variable";
  path: string;
  position: RdxPosition;
}

// ------------------------------------------------------------
// Error
// ------------------------------------------------------------

export interface RdxErrorNode {
  type: "error";
  message: string;
  rawContent: string;
  position: RdxPosition;
}

// ------------------------------------------------------------
// Transform type (the standard for JS extensions)
// ------------------------------------------------------------

/** A transform is a function that takes an AST and returns a modified AST. */
export type RdxTransform = (root: RdxRoot) => RdxRoot;

// ------------------------------------------------------------
// Schema types (mirrors rdx-schema)
// ------------------------------------------------------------

export interface RdxSchema {
  strict?: boolean;
  components: Record<string, RdxComponentSchema>;
}

export interface RdxComponentSchema {
  props?: Record<string, RdxPropSchema>;
  self_closing?: boolean;
  allowed_children?: string[];
  description?: string;
}

export interface RdxPropSchema {
  type: RdxPropType;
  required?: boolean;
  default?: unknown;
  values?: string[];
  description?: string;
}

export type RdxPropType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "object"
  | "array"
  | "variable"
  | "any";

export interface RdxDiagnostic {
  severity: "error" | "warning";
  message: string;
  component: string;
  line: number;
  column: number;
}
