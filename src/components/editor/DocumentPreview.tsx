'use client';
import React from 'react';
import type { DocumentState, CalculationResult, CustomSectionDef, BlockId } from '@/types';
import { PreviewClassique } from './preview/PreviewClassique';

export type PreviewFocus = 'header' | 'client' | 'items' | 'totals' | 'payment' | null;

interface Props {
  doc: DocumentState;
  results: CalculationResult;
  customSections?: CustomSectionDef[];
  hiddenFields?: Set<string>;
  previewFocus?: PreviewFocus;
  brandWatermark?: boolean;
  onZoneClick?: (focus: NonNullable<PreviewFocus>) => void;
}

export function DocumentPreview({ doc, results, hiddenFields, previewFocus = null, brandWatermark = false, onZoneClick }: Props) {
  const hf = new Set(hiddenFields ?? []);
  const sf = (fieldId: string) => !hf.has(fieldId);
  const bv = (...fieldIds: string[]) => fieldIds.some(f => sf(f));
  const vb = (block: string) => !doc.hiddenBlocks.includes(block as BlockId);

  return (
    <PreviewClassique
      doc={doc}
      results={results}
      sf={sf}
      bv={bv}
      vb={vb}
      highlight={previewFocus}
      brandWatermark={brandWatermark}
      onZoneClick={onZoneClick}
    />
  );
}
