import { TabDemoScreen } from '@/components/screens/TabDemoScreen';
import { ordersDemoContent } from '@/data/tabDemoContent';

export default function OrdersScreen() {
  return <TabDemoScreen {...ordersDemoContent} />;
}
