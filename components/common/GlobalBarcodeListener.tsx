'use client';

import { useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';

export default function GlobalBarcodeListener() {
  const { itAssets, printers, employees, openQRModal } = useInventory();
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si l'utilisateur tape normalement dans un input de formulaire
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Si le délai entre deux frappes est supérieur à 100ms, ce n'est pas une douchette rapide
      if (diff > 100) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const scannedCode = bufferRef.current.trim().toUpperCase();
        bufferRef.current = '';

        if (scannedCode.length >= 3 && !isInput) {
          // 1. Chercher dans les 16 imprimantes HP
          const foundPrinter = printers.find(p => 
            (p.serialNumber && p.serialNumber.toUpperCase() === scannedCode) ||
            (p.assetTag && p.assetTag.toUpperCase() === scannedCode) ||
            p.id.toUpperCase() === scannedCode ||
            p.name.toUpperCase().includes(scannedCode) ||
            (p.ipAddress && p.ipAddress === scannedCode)
          );

          if (foundPrinter) {
            e.preventDefault();
            openQRModal({
              id: foundPrinter.id,
              assetTag: foundPrinter.serialNumber || foundPrinter.assetTag,
              name: `${foundPrinter.name} (${foundPrinter.model})`,
              category: 'it',
              location: foundPrinter.site || 'Delmas 52',
              company: foundPrinter.company || 'Lebrun S.A.',
              status: 'in_use' as any
            } as any);
            return;
          }

          // 2. Chercher dans les postes IT Dell
          const foundIT = itAssets.find((item: any) => 
            (item.serialNumber && item.serialNumber.toUpperCase() === scannedCode) ||
            (item.assetTag && item.assetTag.toUpperCase() === scannedCode) ||
            item.id.toUpperCase() === scannedCode ||
            item.name.toUpperCase().includes(scannedCode)
          );

          if (foundIT) {
            e.preventDefault();
            openQRModal(foundIT as any);
            return;
          }

          // 3. Chercher dans les collaborateurs et postes Dell
          const foundEmp = employees.find(emp => 
            (emp.employeeId && emp.employeeId.toUpperCase() === scannedCode) ||
            (emp.workstation?.pcSerial && emp.workstation.pcSerial.toUpperCase() === scannedCode) ||
            (emp.workstation?.pcName && emp.workstation.pcName.toUpperCase() === scannedCode)
          );

          if (foundEmp) {
            e.preventDefault();
            openQRModal({
              id: foundEmp.id,
              assetTag: foundEmp.workstation?.pcSerial || foundEmp.employeeId,
              name: `${foundEmp.fullName} (${foundEmp.workstation?.pcName || 'Poste Dell'})`,
              category: 'it',
              location: foundEmp.site || foundEmp.location || 'Delmas 52',
              company: foundEmp.company || 'Lebrun S.A.',
              status: 'in_use' as any
            } as any);
            return;
          }
        }
        return;
      }

      // N'accumuler que les caractères imprimables
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itAssets, printers, employees, openQRModal]);

  return null;
}
