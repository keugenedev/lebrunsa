'use client';

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
  background?: string;
  lineColor?: string;
}

const barcodeCache = new Map<string, string>();

export default React.memo(function Barcode({
  value,
  width = 1.6,
  height = 48,
  displayValue = true,
  fontSize = 12,
  className = '',
  background = '#ffffff',
  lineColor = '#0f172a'
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cacheKey = `${value}_${width}_${height}_${displayValue}_${fontSize}_${background}_${lineColor}`;

  useEffect(() => {
    if (!svgRef.current || !value) return;

    if (barcodeCache.has(cacheKey)) {
      svgRef.current.innerHTML = barcodeCache.get(cacheKey)!;
      return;
    }

    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width,
        height,
        displayValue,
        font: 'monospace',
        fontSize,
        textMargin: 4,
        textAlign: 'center',
        textPosition: 'bottom',
        background,
        lineColor,
        margin: 6,
        valid: () => true
      });
      if (svgRef.current.innerHTML) {
        barcodeCache.set(cacheKey, svgRef.current.innerHTML);
      }
    } catch (err) {
      console.error('Erreur de génération Code 128:', err);
    }
  }, [value, width, height, displayValue, fontSize, background, lineColor, cacheKey]);

  if (!value) return null;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto" />
    </div>
  );
});
