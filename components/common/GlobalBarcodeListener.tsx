'use client';

import { useEffect, useRef } from 'react';
import { useInventory } from '@/context/InventoryContext';

export default function GlobalBarcodeListener() {
  const { itAssets = [], printers = [], employees = [], openQRModal, openBarcodeScanner } = useInventory();
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Sécurité : ignorer si l'événement ou e.key est indéfini
      if (!e || typeof e.key !== 'string') return;

      // Ignorer si l'utilisateur tape normalement dans un input de formulaire
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      const now = Date.now();
      const diff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Si le délai entre deux frappes est supérieur à 300ms, réinitialiser le tampon
      // (300ms garantit que les douchettes USB/Bluetooth avec délai inter-caractères ne sont pas tronquées)
      if (diff > 300) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        let scannedCode = (bufferRef.current || '').trim().toUpperCase();
        bufferRef.current = '';

        // Supprimer les identifiants AIM éventuels transmis par certains scanners (ex: ]C1, ]Q1, ]e0)
        if (/^\][A-Z0-9]{2}/i.test(scannedCode)) {
          scannedCode = scannedCode.substring(3);
        }

        if (scannedCode && scannedCode.length >= 3 && !isInput) {
          // 1. Chercher dans les imprimantes HP
          const foundPrinter = (printers || []).find(p => 
            p && (
              (p.serialNumber && p.serialNumber.toUpperCase() === scannedCode) ||
              (p.assetTag && p.assetTag.toUpperCase() === scannedCode) ||
              (p.id && p.id.toUpperCase() === scannedCode) ||
              (p.name && p.name.toUpperCase().includes(scannedCode)) ||
              (p.ipAddress && p.ipAddress === scannedCode)
            )
          );

          if (foundPrinter) {
            e.preventDefault();
            if (openBarcodeScanner) {
              openBarcodeScanner(foundPrinter.assetTag || foundPrinter.serialNumber || scannedCode);
            }
            return;
          }

          // 2. Chercher dans les postes IT Dell / HP
          const foundIT = (itAssets || []).find((item: any) => 
            item && (
              (item.serialNumber && item.serialNumber.toUpperCase() === scannedCode) ||
              (item.assetTag && item.assetTag.toUpperCase() === scannedCode) ||
              (item.id && item.id.toUpperCase() === scannedCode) ||
              (item.name && item.name.toUpperCase().includes(scannedCode))
            )
          );

          if (foundIT) {
            e.preventDefault();
            if (openBarcodeScanner) {
              openBarcodeScanner(foundIT.assetTag || foundIT.serialNumber || scannedCode);
            }
            return;
          }

          // 3. Chercher dans les collaborateurs et postes Dell
          const foundEmp = (employees || []).find(emp => 
            emp && (
              (emp.employeeId && emp.employeeId.toUpperCase() === scannedCode) ||
              (emp.id && emp.id.toUpperCase() === scannedCode) ||
              (emp.workstation?.pcSerial && emp.workstation.pcSerial.toUpperCase() === scannedCode) ||
              (emp.workstation?.pcName && emp.workstation.pcName.toUpperCase() === scannedCode)
            )
          );

          if (foundEmp) {
            e.preventDefault();
            if (openBarcodeScanner) {
              openBarcodeScanner(foundEmp.employeeId || scannedCode);
            }
            return;
          }

          // 4. Si le code commence par les préfixes d'inventaire AST-, PRN- ou EMP-
          if (scannedCode.startsWith('AST-') || scannedCode.startsWith('PRN-') || scannedCode.startsWith('EMP-')) {
            e.preventDefault();
            if (openBarcodeScanner) {
              openBarcodeScanner(scannedCode);
            }
            return;
          }
        }
        return;
      }

      // N'accumuler que les caractères imprimables (1 seul caractère)
      if (typeof e.key === 'string' && e.key.length === 1) {
        bufferRef.current = (bufferRef.current || '') + e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itAssets, printers, employees, openQRModal, openBarcodeScanner]);

  return null;
}
