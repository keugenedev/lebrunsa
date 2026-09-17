'use client';

import React from 'react';
import LoginPage from '@/components/auth/LoginPage';
import { InventoryProvider } from '@/context/InventoryContext';

export default function LoginRoute() {
  return (
    <InventoryProvider>
      <LoginPage isStandalonePage />
    </InventoryProvider>
  );
}
