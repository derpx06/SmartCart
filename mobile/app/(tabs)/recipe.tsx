import { useEffect } from 'react';

import { TabDemoScreen } from '@/components/screens/TabDemoScreen';
import { useTabContentStore } from '@/store/tab-content-store';

export default function RecipeScreen() {
  const content = useTabContentStore((state) => state.recipeContent);
  const loadRecipeContent = useTabContentStore((state) => state.loadRecipeContent);

  useEffect(() => {
    void loadRecipeContent();
  }, [loadRecipeContent]);

  return <TabDemoScreen {...content} />;
}
