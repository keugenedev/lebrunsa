'use client';

import React from 'react';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OverviewView from '@/components/dashboard/OverviewView';
import ITEquipmentView from '@/components/inventory/ITEquipmentView';
import StarlinkView from '@/components/starlink/StarlinkView';
import TelecomPlansView from '@/components/plans/TelecomPlansView';
import ElectronicsView from '@/components/electronics/ElectronicsView';
import PersonnelView from '@/components/personnel/PersonnelView';
import MovementsView from '@/components/operations/MovementsView';
import AlertsView from '@/components/operations/AlertsView';
import SettingsView from '@/components/settings/SettingsView';
import QRCodeModal from '@/components/common/QRCodeModal';
import AssetModal from '@/components/common/AssetModal';
import EmployeeModal from '@/components/personnel/EmployeeModal';
import QuickSearchModal from '@/components/common/QuickSearchModal';

function MainContent() {
  const { activeTab } = useInventory();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'it':
        return <ITEquipmentView />;
      case 'starlink':
        return <StarlinkView />;
      case 'plans':
        return <TelecomPlansView />;
      case 'electronics':
        return <ElectronicsView />;
      case 'personnel':
        return <PersonnelView />;
      case 'movements':
        return <MovementsView />;
      case 'alerts':
        return <AlertsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {renderActiveTab()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <QRCodeModal />
      <AssetModal />
      <EmployeeModal />
      <QuickSearchModal />
    </div>
  );
}

export default function Page() {
  return (
    <InventoryProvider>
      <MainContent />
    </InventoryProvider>
  );
}
