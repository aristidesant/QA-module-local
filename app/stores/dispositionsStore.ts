import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  DispositionCatalogModel,
  DispositionCategoryModel,
  DispositionTypeModel,
  DispositionStatusModel,
} from "~/models/DispositionCatalogModels";
import type { DispositionFlowModel } from "~/models/DispositionFlowModel";
import { sortDispositionCatalog } from "~/utils/dispositionSorting";

export interface DispositionBuilderState {
  // The working catalog that will be saved as flowJson
  workingCatalog: DispositionCatalogModel | null;

  // The source catalog for dragging items from
  sourceCatalog: DispositionCatalogModel | null;

  // Selected item for editing
  selectedItem: {
    type: "category" | "type" | "status";
    item:
      | DispositionCategoryModel
      | DispositionTypeModel
      | DispositionStatusModel;
    categoryId?: number;
    typeId?: number;
  } | null;

  // Actions
  setSourceCatalog: (catalog: DispositionCatalogModel | null) => void;
  setWorkingCatalog: (catalog: DispositionCatalogModel | null) => void;
  initializeWorkingCatalog: (sourceCatalog: DispositionCatalogModel) => void;

  // Item management
  addCategory: (category: DispositionCategoryModel) => void;
  addType: (type: DispositionTypeModel, categoryId: number) => void;
  addStatus: (
    status: DispositionStatusModel,
    categoryId: number,
    typeId: number
  ) => void;

  removeCategory: (categoryId: number) => void;
  removeType: (categoryId: number, typeId: number) => void;
  removeStatus: (categoryId: number, typeId: number, statusId: number) => void;

  updateCategory: (
    categoryId: number,
    updates: Partial<DispositionCategoryModel>
  ) => void;
  updateType: (
    categoryId: number,
    typeId: number,
    updates: Partial<DispositionTypeModel>
  ) => void;
  updateStatus: (
    categoryId: number,
    typeId: number,
    statusId: number,
    updates: Partial<DispositionStatusModel>
  ) => void;

  // Selection
  setSelectedCategory: (category: DispositionCategoryModel) => void;
  setSelectedType: (type: DispositionTypeModel, categoryId: number) => void;
  setSelectedStatus: (
    status: DispositionStatusModel,
    categoryId: number,
    typeId: number
  ) => void;
  clearSelection: () => void;

  // Utility
  clearWorkingCatalog: () => void;
  restoreFromDispositionFlow: (flow: DispositionFlowModel) => void;
  getDispositionFlowModel: () => DispositionFlowModel;
}

// Helper function to create an empty catalog structure
const createEmptyCatalog = (
  baseCatalog: DispositionCatalogModel
): DispositionCatalogModel => ({
  ...baseCatalog,
  categories: [],
});

export const useDispositionsStore = create<DispositionBuilderState>()(
  devtools(
    (set, get) => ({
      // State
      workingCatalog: null,
      sourceCatalog: null,
      selectedItem: null,

      // Actions
      setSourceCatalog: (catalog) => {
        set({ sourceCatalog: catalog });
      },

      setWorkingCatalog: (catalog) => {
        set({ workingCatalog: catalog });
      },

      initializeWorkingCatalog: (sourceCatalog) => {
        const emptyCatalog = createEmptyCatalog(sourceCatalog);
        set({ workingCatalog: emptyCatalog });
      },

      // Add operations
      addCategory: (category) => {
        const state = get();
        if (!state.workingCatalog) return;

        const newCategory: DispositionCategoryModel = {
          ...category,
          types: [],
        };

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: [...(state.workingCatalog.categories || []), newCategory],
        };

        // Sort the catalog after adding
        const sortedCatalog = sortDispositionCatalog(updatedCatalog);
        set({ workingCatalog: sortedCatalog });
      },

      addType: (type, categoryId) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const newType: DispositionTypeModel = {
          ...type,
          statuses: [],
        };

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, types: [...(cat.types || []), newType] }
            : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        // Sort the catalog after adding
        const sortedCatalog = sortDispositionCatalog(updatedCatalog);
        set({ workingCatalog: sortedCatalog });
      },

      addStatus: (status, categoryId, typeId) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                types:
                  cat.types?.map((type) =>
                    type.id === typeId
                      ? {
                          ...type,
                          statuses: [...(type.statuses || []), status],
                        }
                      : type
                  ) || [],
              }
            : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        // Sort the catalog after adding
        const sortedCatalog = sortDispositionCatalog(updatedCatalog);
        set({ workingCatalog: sortedCatalog });
      },

      // Remove operations
      removeCategory: (categoryId) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.filter(
          (cat) => cat.id !== categoryId
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        // Sort the catalog after removing
        const sortedCatalog = sortDispositionCatalog(updatedCatalog);
        set({ workingCatalog: sortedCatalog });

        // Clear selection if the removed category was selected
        if (
          state.selectedItem?.type === "category" &&
          state.selectedItem.item.id === categoryId
        ) {
          set({ selectedItem: null });
        }
      },

      removeType: (categoryId, typeId) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                types: cat.types?.filter((type) => type.id !== typeId) || [],
              }
            : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        // Sort the catalog after removing
        const sortedCatalog = sortDispositionCatalog(updatedCatalog);
        set({ workingCatalog: sortedCatalog });

        // Clear selection if the removed type was selected
        if (
          state.selectedItem?.type === "type" &&
          state.selectedItem.item.id === typeId
        ) {
          set({ selectedItem: null });
        }
      },

      removeStatus: (categoryId, typeId, statusId) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                types:
                  cat.types?.map((type) =>
                    type.id === typeId
                      ? {
                          ...type,
                          statuses:
                            type.statuses?.filter(
                              (status) => status.id !== statusId
                            ) || [],
                        }
                      : type
                  ) || [],
              }
            : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        // Sort the catalog after removing
        const sortedCatalog = sortDispositionCatalog(updatedCatalog);
        set({ workingCatalog: sortedCatalog });

        // Clear selection if the removed status was selected
        if (
          state.selectedItem?.type === "status" &&
          state.selectedItem.item.id === statusId
        ) {
          set({ selectedItem: null });
        }
      },

      // Update operations
      updateCategory: (categoryId, updates) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        set({ workingCatalog: updatedCatalog });

        // Update selection if the updated category is selected
        if (
          state.selectedItem?.type === "category" &&
          state.selectedItem.item.id === categoryId
        ) {
          const updatedCategory = updatedCategories.find(
            (cat) => cat.id === categoryId
          );
          if (updatedCategory) {
            set({
              selectedItem: {
                type: "category",
                item: updatedCategory,
              },
            });
          }
        }
      },

      updateType: (categoryId, typeId, updates) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                types:
                  cat.types?.map((type) =>
                    type.id === typeId ? { ...type, ...updates } : type
                  ) || [],
              }
            : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        set({ workingCatalog: updatedCatalog });

        // Update selection if the updated type is selected
        if (
          state.selectedItem?.type === "type" &&
          state.selectedItem.item.id === typeId
        ) {
          const updatedCategory = updatedCategories.find(
            (cat) => cat.id === categoryId
          );
          const updatedType = updatedCategory?.types?.find(
            (type) => type.id === typeId
          );
          if (updatedType) {
            set({
              selectedItem: {
                type: "type",
                item: updatedType,
                categoryId,
              },
            });
          }
        }
      },

      updateStatus: (categoryId, typeId, statusId, updates) => {
        const state = get();
        if (!state.workingCatalog?.categories) return;

        const updatedCategories = state.workingCatalog.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                types:
                  cat.types?.map((type) =>
                    type.id === typeId
                      ? {
                          ...type,
                          statuses:
                            type.statuses?.map((status) =>
                              status.id === statusId
                                ? { ...status, ...updates }
                                : status
                            ) || [],
                        }
                      : type
                  ) || [],
              }
            : cat
        );

        const updatedCatalog: DispositionCatalogModel = {
          ...state.workingCatalog,
          categories: updatedCategories,
        };

        set({ workingCatalog: updatedCatalog });

        // Update selection if the updated status is selected
        if (
          state.selectedItem?.type === "status" &&
          state.selectedItem.item.id === statusId
        ) {
          const updatedCategory = updatedCategories.find(
            (cat) => cat.id === categoryId
          );
          const updatedType = updatedCategory?.types?.find(
            (type) => type.id === typeId
          );
          const updatedStatus = updatedType?.statuses?.find(
            (status) => status.id === statusId
          );
          if (updatedStatus) {
            set({
              selectedItem: {
                type: "status",
                item: updatedStatus,
                categoryId,
                typeId,
              },
            });
          }
        }
      },

      // Selection operations
      setSelectedCategory: (category) => {
        set({ selectedItem: { type: "category", item: category } });
      },

      setSelectedType: (type, categoryId) => {
        set({ selectedItem: { type: "type", item: type, categoryId } });
      },

      setSelectedStatus: (status, categoryId, typeId) => {
        set({
          selectedItem: { type: "status", item: status, categoryId, typeId },
        });
      },

      clearSelection: () => {
        set({ selectedItem: null });
      },

      // Utility operations
      clearWorkingCatalog: () => {
        set({ workingCatalog: null, selectedItem: null });
      },

      restoreFromDispositionFlow: (flow) => {
        if (!flow.flowJson) {
          throw new Error("No flowJson found in DispositionFlowModel");
        }

        // Sort the catalog when restoring
        const sortedCatalog = sortDispositionCatalog(flow.flowJson);

        set({
          workingCatalog: sortedCatalog,
          selectedItem: null,
        });
      },

      getDispositionFlowModel: (): DispositionFlowModel => {
        const state = get();

        if (!state.workingCatalog) {
          throw new Error(
            "No working catalog available to create disposition flow"
          );
        }

        return {
          id: 0, // This will be set by the backend for new flows
          clientId: state.workingCatalog.clientId,
          userId: 0, // This should be set by the calling component
          campaignId: state.workingCatalog.campaignId || 0,
          flowJson: state.workingCatalog,
        };
      },
    }),
    {
      name: "dispositions-store-v2",
    }
  )
);

// Export types for convenience
export type {
  DispositionCatalogModel,
  DispositionCategoryModel,
  DispositionTypeModel,
  DispositionStatusModel,
} from "~/models/DispositionCatalogModels";
export type { DispositionFlowModel } from "~/models/DispositionFlowModel";
