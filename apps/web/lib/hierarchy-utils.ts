/**
 * Utility functions for working with hierarchical reference data
 */

export interface HierarchicalItem {
  id: string;
  name?: string;
  nameEn?: string;
  titleEn?: string;
  parent?: HierarchicalItem | null;
  parentRegion?: HierarchicalItem | null;
  parentTag?: HierarchicalItem | null;
  refIndustryCodes?: HierarchicalItem[];
  refRegions?: HierarchicalItem[];
  refTags?: HierarchicalItem[];
  children?: HierarchicalItem[];
  level?: number;
}

/**
 * Build a tree structure from flat hierarchical data
 * Works with industry codes, regions, or tags
 */
export function buildTree(items: HierarchicalItem[]): HierarchicalItem[] {
  const itemMap = new Map<string, HierarchicalItem>();
  const roots: HierarchicalItem[] = [];

  // First pass: create map and add children arrays
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build tree structure
  items.forEach(item => {
    const node = itemMap.get(item.id);
    if (!node) return;

    const parentId = 
      item.parent?.id || 
      item.parentRegion?.id || 
      item.parentTag?.id;

    if (parentId) {
      const parent = itemMap.get(parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // Parent not found in list, treat as root
        roots.push(node);
      }
    } else {
      // No parent, this is a root node
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Flatten a tree structure back to a list
 */
export function flattenTree(tree: HierarchicalItem[]): HierarchicalItem[] {
  const result: HierarchicalItem[] = [];
  
  function traverse(nodes: HierarchicalItem[], depth: number = 0) {
    nodes.forEach(node => {
      result.push({ ...node, level: depth });
      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    });
  }
  
  traverse(tree);
  return result;
}

/**
 * Get all ancestors of an item (parent, grandparent, etc.)
 */
export function getAncestors(
  item: HierarchicalItem,
  allItems: HierarchicalItem[]
): HierarchicalItem[] {
  const ancestors: HierarchicalItem[] = [];
  let current = item;
  
  while (current.parent || current.parentRegion || current.parentTag) {
    const parentId = 
      current.parent?.id || 
      current.parentRegion?.id || 
      current.parentTag?.id;
    
    if (!parentId) break;
    
    const parent = allItems.find(i => i.id === parentId);
    if (!parent) break;
    
    ancestors.unshift(parent);
    current = parent;
  }
  
  return ancestors;
}

/**
 * Get all descendants of an item (children, grandchildren, etc.)
 */
export function getDescendants(item: HierarchicalItem): HierarchicalItem[] {
  const descendants: HierarchicalItem[] = [];
  
  function traverse(node: HierarchicalItem) {
    const children = 
      node.children || 
      node.refIndustryCodes || 
      node.refRegions || 
      node.refTags || 
      [];
    
    children.forEach(child => {
      descendants.push(child);
      traverse(child);
    });
  }
  
  traverse(item);
  return descendants;
}

/**
 * Format item display name with hierarchy level indication
 */
export function formatHierarchicalName(
  item: HierarchicalItem,
  showLevel: boolean = true
): string {
  const name = item.name || item.nameEn || item.titleEn || 'Unnamed';
  const level = item.level || 0;
  
  if (!showLevel) return name;
  
  const indent = '  '.repeat(level);
  const prefix = level > 0 ? '└─ ' : '';
  
  return `${indent}${prefix}${name}`;
}

/**
 * Get breadcrumb path for an item
 */
export function getBreadcrumb(
  item: HierarchicalItem,
  allItems: HierarchicalItem[]
): string[] {
  const ancestors = getAncestors(item, allItems);
  const itemName = item.name || item.nameEn || item.titleEn || 'Unnamed';
  
  return [
    ...ancestors.map(a => a.name || a.nameEn || a.titleEn || 'Unnamed'),
    itemName
  ];
}

/**
 * Filter items by search term (searches through hierarchy)
 */
export function filterHierarchical(
  items: HierarchicalItem[],
  searchTerm: string
): HierarchicalItem[] {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  const matchingItems = new Set<string>();
  
  function checkMatch(item: HierarchicalItem): boolean {
    const name = (item.name || item.nameEn || item.titleEn || '').toLowerCase();
    if (name.includes(term)) {
      matchingItems.add(item.id);
      return true;
    }
    
    const children = 
      item.children || 
      item.refIndustryCodes || 
      item.refRegions || 
      item.refTags || 
      [];
    
    let hasMatchingChild = false;
    children.forEach(child => {
      if (checkMatch(child)) {
        matchingItems.add(item.id);
        hasMatchingChild = true;
      }
    });
    
    return hasMatchingChild;
  }
  
  items.forEach(checkMatch);
  
  return items.filter(item => matchingItems.has(item.id));
}
