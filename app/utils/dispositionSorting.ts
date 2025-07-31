import type {
  DispositionCatalogModel,
  DispositionCategoryModel,
  DispositionTypeModel,
  DispositionStatusModel,
} from "~/models/DispositionCatalogModels";

/**
 * Sorts items by their order property in ascending order
 */
const sortByOrder = <T extends { order?: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    return orderA - orderB;
  });
};

/**
 * Recursively sorts a disposition catalog by order at all levels:
 * - Categories are sorted by order
 * - Types within each category are sorted by order
 * - Statuses within each type are sorted by order
 */
export const sortDispositionCatalog = (
  catalog: DispositionCatalogModel
): DispositionCatalogModel => {
  if (!catalog.categories?.length) {
    return catalog;
  }

  const sortedCategories: DispositionCategoryModel[] = catalog.categories.map(
    (category) => {
      const sortedTypes: DispositionTypeModel[] =
        category.types?.map((type) => {
          const sortedStatuses: DispositionStatusModel[] = sortByOrder(
            type.statuses || []
          );

          return {
            ...type,
            statuses: sortedStatuses,
          };
        }) || [];

      return {
        ...category,
        types: sortByOrder(sortedTypes),
      };
    }
  );

  return {
    ...catalog,
    categories: sortByOrder(sortedCategories),
  };
};

/**
 * Assigns sequential order values to items that don't have an order
 * This ensures consistent ordering when items are added without explicit order
 */
export const normalizeOrder = <T extends { order?: number }>(
  items: T[]
): T[] => {
  return items.map((item, index) => ({
    ...item,
    order: item.order ?? index + 1,
  }));
};
