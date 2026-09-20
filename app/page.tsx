'use client';

import React from 'react';
import { InventoryProvider, useInventory } from '@/context/InventoryContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OverviewView from '@/components/dashboard/OverviewView';
import ITEquipmentView from '@/components/inventory/ITEquipmentView';
import PrintersView from '@/components/printers/PrintersView';
import PersonnelView from '@/components/personnel/PersonnelView';
import NetworkView from '@/components/network/NetworkView';
import UPSView from '@/components/ups/UPSView';
import PhonesView from '@/components/phones/PhonesView';
import ApplicationsView from '@/components/applications/ApplicationsView';
import AccountsView from '@/components/accounts/AccountsView';
import DocumentsView from '@/components/documents/DocumentsView';
import SettingsView from '@/components/settings/SettingsView';
import BarcodeModal from '@/components/common/BarcodeModal';
import BarcodeScannerModal from '@/components/common/BarcodeScannerModal';
import GlobalBarcodeListener from '@/components/common/GlobalBarcodeListener';
import AssetModal from '@/components/common/AssetModal';
import EmployeeModal from '@/components/personnel/EmployeeModal';
import PrinterModal from '@/components/printers/PrinterModal';
import NetworkModal from '@/components/network/NetworkModal';
import UPSModal from '@/components/ups/UPSModal';
import PhoneModal from '@/components/phones/PhoneModal';
import ApplicationModal from '@/components/applications/ApplicationModal';
import AccountModal from '@/components/accounts/AccountModal';
import DocumentModal from '@/components/documents/DocumentModal';
import QuickSearchModal from '@/components/common/QuickSearchModal';
import ToastNotification from '@/components/common/ToastNotification';
import SuccessAnimation from '@/components/common/SuccessAnimation';
import LoginPage from '@/components/auth/LoginPage';

function MainContent() {
  const { 
    activeTab, 
    isAuthenticated, 
    isBarcodeScannerOpen, 
    closeBarcodeScanner 
  } = useInventory();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen w-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'printers':
        return <PrintersView />;
      case 'it':
        return <ITEquipmentView />;
      case 'network':
        return <NetworkView />;
      case 'ups':
        return <UPSView />;
      case 'applications':
        return <ApplicationsView />;
      case 'personnel':
        return <PersonnelView />;
      case 'accounts':
        return <AccountsView />;
      case 'documents':
        return <DocumentsView />;
      case 'phones':
        return <PhonesView />;
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

        <main className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 scroll-smooth bg-[#f8fafc]">
          <div className="w-full max-w-7xl 2xl:max-w-[1540px] mx-auto space-y-6">
            {renderActiveTab()}
          </div>
        </main>
      </div>

      {/* Global Modals & Listeners */}
      <BarcodeModal />
      <BarcodeScannerModal 
        isOpen={isBarcodeScannerOpen} 
        onClose={closeBarcodeScanner} 
      />
      <GlobalBarcodeListener />
      <AssetModal />
      <EmployeeModal />
      <PrinterModal />
      <NetworkModal />
      <UPSModal />
      <PhoneModal />
      <ApplicationModal />
      <AccountModal />
      <DocumentModal />
      <QuickSearchModal />
      <SuccessAnimation />
      <ToastNotification />
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
