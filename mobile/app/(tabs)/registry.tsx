import { useEffect } from 'react';

import { TabDemoScreen } from '@/components/screens/TabDemoScreen';
import { useTabContentStore } from '@/store/tab-content-store';

export default function RegistryScreen() {
  const content = useTabContentStore((state) => state.registryContent);
  const loadRegistryContent = useTabContentStore((state) => state.loadRegistryContent);

  useEffect(() => {
    void loadRegistryContent();
  }, [loadRegistryContent]);

  return <TabDemoScreen {...content} />;
}
