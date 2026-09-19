'use client';

import React, { useEffect } from 'react';
import { useReliefStore } from '@/lib/store';

export default function ApiSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchLiveData = useReliefStore((state) => state.fetchLiveData);

  useEffect(() => {
    // Fetch live data from deployed Render API on initial mount
    fetchLiveData();
  }, [fetchLiveData]);

  return <>{children}</>;
}
