import type { DispositionNode } from "~/models/DispositionNodeModel";

/**
 * Determines the node type based on level and content
 * Used for consistent styling across disposition components
 */
export const getNodeStyle = (
  node: DispositionNode,
  level: number = 0
): string => {
  if (level === 0) {
    // Root level nodes - determine by name content
    const nodeName = node.name.toLowerCase();
    if (nodeName.includes("effective contact") && !nodeName.includes("no")) {
      return "effective";
    } else if (nodeName.includes("no effective")) {
      return "noEffective";
    } else if (nodeName.includes("no contact")) {
      return "noContact";
    }
  }
  return "default";
};

/**
 * Determines if a node is a leaf node (has no children)
 */
export const isLeafNode = (node: DispositionNode): boolean => {
  return !node.children || node.children.length === 0;
};

/**
 * Gets the appropriate CSS classes for a disposition node
 */
export const getDispositionNodeClasses = (
  node: DispositionNode,
  level: number = 0,
  baseClass: string,
  isSelected?: boolean,
  isClickable?: boolean
): string => {
  const nodeStyle = getNodeStyle(node, level);
  const hasChildren = !isLeafNode(node);

  let classes = baseClass;

  // Add node style class
  if (nodeStyle !== "default") {
    classes += ` ${baseClass.split(" ")[0]}${
      nodeStyle.charAt(0).toUpperCase() + nodeStyle.slice(1)
    }`;
  }

  // Add state classes
  if (isSelected) {
    classes += ` ${baseClass.split(" ")[0]}Selected`;
  }

  if (isClickable) {
    classes += ` ${baseClass.split(" ")[0]}Clickable`;
  }

  if (hasChildren) {
    classes += ` ${baseClass.split(" ")[0]}ParentNode`;
  } else {
    classes += ` ${baseClass.split(" ")[0]}LeafNode`;
  }

  return classes;
};
