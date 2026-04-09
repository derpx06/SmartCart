import { create } from 'zustand';

import {
  recipeDemoContent,
  registryDemoContent,
  type TabDemoContent,
} from '@/data/tabDemoContent';
import { api } from '@/lib/api';

type TabContentStore = {
  recipeContent: TabDemoContent;
  registryContent: TabDemoContent;
  loadRecipeContent: () => Promise<void>;
  loadRegistryContent: () => Promise<void>;
};

export const useTabContentStore = create<TabContentStore>((set) => ({
  recipeContent: recipeDemoContent,
  registryContent: registryDemoContent,
  loadRecipeContent: async () => {
    try {
      const data = await api.getRecipes();
      set({ recipeContent: data });
    } catch {
      set({ recipeContent: recipeDemoContent });
    }
  },
  loadRegistryContent: async () => {
    try {
      const data = await api.getRegistries();
      set({ registryContent: data });
    } catch {
      set({ registryContent: registryDemoContent });
    }
  },
}));
