import { TabDemoScreen } from '@/components/screens/TabDemoScreen';
import { cartDemoContent } from '@/data/tabDemoContent';

export default function CartScreen() {
  return <TabDemoScreen {...cartDemoContent} />;
}
