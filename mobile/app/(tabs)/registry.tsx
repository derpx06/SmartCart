import { TabDemoScreen } from '@/components/screens/TabDemoScreen';
import { registryDemoContent } from '@/data/tabDemoContent';

export default function RegistryScreen() {
  return <TabDemoScreen {...registryDemoContent} />;
}
