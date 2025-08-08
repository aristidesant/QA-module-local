import type { DispositionNode } from "~/models/DispositionNodeModel";

/**
 * Sorts disposition nodes by their order property in ascending order
 */
export const sortDispositionNodes = (
  nodes: DispositionNode[]
): DispositionNode[] => {
  return [...nodes]
    .sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    })
    .map((node) => ({
      ...node,
      children: node.children ? sortDispositionNodes(node.children) : undefined,
    }));
};

/**
 * Recursively sorts a disposition node tree by order at all levels
 * Returns a new array of sorted nodes
 */
export const sortDispositionTree = (
  nodes: DispositionNode[]
): DispositionNode[] => {
  return sortDispositionNodes(nodes);
};

/**
 * Assigns sequential order values to disposition nodes that don't have an order
 * Recursively normalizes order for all children
 */
export const normalizeDispositionNodeOrder = (
  nodes: DispositionNode[]
): DispositionNode[] => {
  return nodes.map((node, index) => ({
    ...node,
    order: node.order ?? index + 1,
    children: node.children
      ? normalizeDispositionNodeOrder(node.children)
      : undefined,
  }));
};
