import React from 'react';

import { ProductCarousel } from '@/components/luxury/ProductCarousel';
import type { ProductItem } from '@/data/luxuryHomeData';
import type { HomeRow } from '@/store/home-store';

type HomeRowRailProps = {
  row: HomeRow;
  loading?: boolean;
  onPressProduct?: (product: ProductItem) => void;
};

export function HomeRowRail({ row, loading, onPressProduct }: HomeRowRailProps) {
  return (
    <ProductCarousel
      title={row.title}
      caption={row.subtitle}
      products={row.items}
      loading={Boolean(loading)}
      onPressProduct={onPressProduct}
    />
  );
}

