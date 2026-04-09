import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { ProductDetailScreen } from '@/components/product/ProductDetailScreen';
import { defaultProductDetail, productDetailsBySlug } from '@/data/product/productDetails';

export default function ProductDetailRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const resolvedSlug = Array.isArray(slug) ? slug[0] : slug;
  const product = (resolvedSlug && productDetailsBySlug[resolvedSlug]) || defaultProductDetail;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProductDetailScreen product={product} />
    </>
  );
}
