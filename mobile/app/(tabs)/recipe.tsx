import { TabDemoScreen } from '@/components/screens/TabDemoScreen';
import { recipeDemoContent } from '@/data/tabDemoContent';

export default function RecipeScreen() {
  return <TabDemoScreen {...recipeDemoContent} />;
}
