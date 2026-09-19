'use client';

import React from 'react';

/**
 * ApiSyncProvider is a lightweight wrapper.
 * Global blanket fetching has been removed so each individual page
 * fetches only its own required endpoints.
 */
export default function ApiSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
