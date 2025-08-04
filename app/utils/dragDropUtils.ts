/**
 * Returns a tree containing only the direct hierarchy chain for a given node ID (no siblings).
 * Example: If you pass the ID of a deep child, you get the root, only the direct parent(s), and the target node.
 */
/**
 * Returns a single DispositionNode representing the direct hierarchy chain for a given node ID (no siblings).
 * Traverses up to the root (node with no parentId).
 */
export function getDirectHierarchyTree(
  nodes: DispositionNode[],
  targetNodeId: number
): DispositionNode | null {
  // Helper to find node and its parent chain
  function findChain(
    currentNodes: DispositionNode[],
    chain: DispositionNode[] = []
  ): DispositionNode[] | null {
    for (const node of currentNodes) {
      const newChain = [...chain, node];
      if (node.id === targetNodeId) {
        return newChain;
      }
      if (node.children && node.children.length > 0) {
        const childChain = findChain(node.children, newChain);
        if (childChain) return childChain;
      }
    }
    return null;
  }

  const chain = findChain(nodes);
  if (!chain) return null;

  // Build the hierarchy from the chain (root to target)
  let current: DispositionNode | null = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    const node = chain[i];
    const nodeClone: DispositionNode = {
      ...node,
      children: current ? [current] : [],
    };
    current = nodeClone;
    // Stop if node has no parentId (root)
    if (!node.parentId) break;
  }
  return current;
}
import type { DispositionNode } from "~/models/DispositionNodeModel";

/**
 * Utility functions for handling complex drag and drop operations
 * with parent-child relationships in disposition nodes
 */

/**
 * Recursively collects all node IDs including children
 */
export function collectAllNodeIds(node: DispositionNode): number[] {
  const ids = [node.id];
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      ids.push(...collectAllNodeIds(child));
    });
  }
  return ids;
}

/**
 * Finds a node by ID in a nested structure
 */
export function findNodeById(
  nodes: DispositionNode[],
  nodeId: number
): DispositionNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the parent node of a given child node ID
 */
export function findParentNode(
  nodes: DispositionNode[],
  childId: number
): DispositionNode | null {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      if (node.children.some((child) => child.id === childId)) {
        return node;
      }
      const found = findParentNode(node.children, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds the parent node tree of a given node
 */
export function findParentNodeTree(
  nodes: DispositionNode[],
  childId: number
): DispositionNode | null {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      if (node.children.some((child) => child.id === childId)) {
        return node;
      }
      const found = findParentNode(node.children, childId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Creates a deep copy of a node with all its children
 */
export function cloneNodeWithChildren(node: DispositionNode): DispositionNode {
  return {
    ...node,
    children: node.children
      ? node.children.map((child) => cloneNodeWithChildren(child))
      : [],
  };
}

/**
 * Gets all nodes that should be moved when dragging a node
 * This includes the node itself with all its children preserved in hierarchy
 */
export function getNodesForDrag(node: DispositionNode): DispositionNode[] {
  // Just return the node with all its children - no need to flatten
  return [cloneNodeWithChildren(node)];
}

/**
 * Gets all parent nodes in the hierarchy chain for a given node
 */
export function getParentChain(
  allCatalogNodes: DispositionNode[],
  targetNodeId: number
): DispositionNode[] {
  const chain: DispositionNode[] = [];

  function findInChain(
    nodes: DispositionNode[],
    parentChain: DispositionNode[] = []
  ): boolean {
    for (const node of nodes) {
      const currentChain = [...parentChain, node];

      if (node.id === targetNodeId) {
        // Found the target, return the chain excluding the target itself
        chain.push(...parentChain);
        return true;
      }

      if (node.children && node.children.length > 0) {
        if (findInChain(node.children, currentChain)) {
          return true;
        }
      }
    }
    return false;
  }

  findInChain(allCatalogNodes);
  return chain;
}

/**
 * Creates a hierarchical structure with only the necessary parent chain
 */
export function createHierarchicalNodes(
  draggedNode: DispositionNode,
  parentChain: DispositionNode[]
): DispositionNode[] {
  if (parentChain.length === 0) {
    // No parents needed, just return the dragged node
    return [cloneNodeWithChildren(draggedNode)];
  }

  // Build the hierarchy from the bottom up
  let currentNode = cloneNodeWithChildren(draggedNode);

  // Work backwards through the parent chain
  for (let i = parentChain.length - 1; i >= 0; i--) {
    const parent = parentChain[i];
    const parentClone: DispositionNode = {
      ...parent,
      children: [currentNode], // Only include the child we're interested in
    };
    currentNode = parentClone;
  }

  return [currentNode];
}

/**
 * Gets all nodes that should be included when adding a child node
 * This includes the child node and its parent chain if not already present
 */
export function getNodesForChildAddition(
  draggedNode: DispositionNode,
  allCatalogNodes: DispositionNode[],
  existingBuilderNodes: DispositionNode[]
): DispositionNode[] {
  const existingIds = new Set(existingBuilderNodes.map((n) => n.id));

  // If the dragged node is already in builder, don't add anything
  if (existingIds.has(draggedNode.id)) {
    console.log("Node already exists in builder");
    return [];
  }

  // Get the parent chain for this node
  const parentChain = getParentChain(allCatalogNodes, draggedNode.id);
  console.log(
    "Parent chain for node",
    draggedNode.name,
    ":",
    parentChain.map((p) => p.name)
  );

  // Filter out parents that are already in the builder
  const missingParents = parentChain.filter(
    (parent) => !existingIds.has(parent.id)
  );
  console.log(
    "Missing parents:",
    missingParents.map((p) => p.name)
  );

  // Build the result array
  const result: DispositionNode[] = [];

  // Add missing parents first (in order from root to immediate parent)
  missingParents.forEach((parent) => {
    // Create parent with empty children - we'll add the full structure separately
    result.push({
      ...parent,
      children: [], // We'll handle children separately
    });
  });

  // Add the dragged node with all its children
  result.push(cloneNodeWithChildren(draggedNode));

  console.log(
    "Nodes to add:",
    result.map((n) => ({
      id: n.id,
      name: n.name,
      childrenCount: n.children?.length || 0,
    }))
  );
  return result;
}

/**
 * Checks if a node can be dropped in a specific location
 */
export function canDropNode(
  draggedNodeId: number,
  targetDroppableId: string,
  sourceDroppableId: string
): boolean {
  // Allow dropping from catalog to builder
  if (
    sourceDroppableId.startsWith("catalog") &&
    targetDroppableId === "builder-drop"
  ) {
    return true;
  }

  // Allow dropping from catalog to nested catalog areas for reordering
  if (
    sourceDroppableId.startsWith("catalog") &&
    targetDroppableId.startsWith("catalog")
  ) {
    return true;
  }

  // Prevent other types of drops for now
  return false;
}

/**
 * Generates a unique droppable ID for nested catalog items
 */
export function generateDroppableId(nodeId: number, path: string): string {
  return `catalog-${nodeId}-${path}`;
}

/**
 * Parses a droppable ID to extract node information
 */
/**
 * Checks if a child node should be merged into a parent node
 */
export function shouldMergeAsChild(
  parentNode: DispositionNode,
  childNode: DispositionNode
): boolean {
  return hasNodeInChildren(parentNode, childNode.id);
}

/**
 * Checks if a node exists anywhere in the children hierarchy
 */
export function hasNodeInChildren(
  parentNode: DispositionNode,
  childId: number
): boolean {
  if (!parentNode.children || parentNode.children.length === 0) {
    return false;
  }

  for (const child of parentNode.children) {
    if (child.id === childId) {
      return true;
    }
    if (hasNodeInChildren(child, childId)) {
      return true;
    }
  }

  return false;
}

/**
 * Merges a child node into a parent node's hierarchy
 */
export function mergeChildIntoParent(
  parentNode: DispositionNode,
  childNode: DispositionNode
): DispositionNode {
  const mergedParent = cloneNodeWithChildren(parentNode);

  // Find where to insert the child and merge it
  function insertChild(node: DispositionNode): DispositionNode {
    if (!node.children) {
      node.children = [];
    }

    // Check if any direct children should contain this child
    for (let i = 0; i < node.children.length; i++) {
      if (hasNodeInChildren(node.children[i], childNode.id)) {
        node.children[i] = insertChild(node.children[i]);
        return node;
      }
    }

    // Check if this child should be added directly to this node
    const shouldAddHere = node.children.some(
      (child) => child.id === childNode.id
    );
    if (shouldAddHere) {
      // Replace the existing placeholder with the full child
      node.children = node.children.map((child) =>
        child.id === childNode.id ? cloneNodeWithChildren(childNode) : child
      );
    }

    return node;
  }

  return insertChild(mergedParent);
}

export function parseDroppableId(droppableId: string): {
  type: string;
  nodeId?: number;
  path?: string;
} {
  if (droppableId === "builder-drop") {
    return { type: "builder" };
  }

  if (droppableId === "catalog-menu") {
    return { type: "catalog-root" };
  }

  if (droppableId.startsWith("catalog-")) {
    const parts = droppableId.split("-");
    if (parts.length >= 3) {
      return {
        type: "catalog-nested",
        nodeId: parseInt(parts[1], 10),
        path: parts.slice(2).join("-"),
      };
    }
  }

  return { type: "unknown" };
}
