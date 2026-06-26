'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type React from 'react';
import type { DocumentState } from '@/types';

const UNDO_LIMIT = 50;

interface UseEditorUndoReturn {
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

export function useEditorUndo(
  doc: DocumentState,
  setDoc: React.Dispatch<React.SetStateAction<DocumentState>>,
): UseEditorUndoReturn {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const undoStack = useRef<DocumentState[]>([]);
  const redoStack = useRef<DocumentState[]>([]);
  const lastDocRef = useRef<DocumentState | null>(null);
  const docRef = useRef(doc);
  docRef.current = doc;
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track doc changes with debounce, push snapshots onto undo stack
  useEffect(() => {
    if (lastDocRef.current === null || lastDocRef.current === doc) return;
    const prevDoc = lastDocRef.current;
    lastDocRef.current = doc;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      undoStack.current.push(prevDoc);
      if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
      redoStack.current = [];
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(false);
    }, 400);
  }, [doc]);

  const handleUndo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(docRef.current);
    setDoc(prev);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }, [setDoc]);

  const handleRedo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(docRef.current);
    setDoc(next);
    setCanRedo(redoStack.current.length > 0);
    setCanUndo(true);
  }, [setDoc]);

  return { canUndo, canRedo, handleUndo, handleRedo };
}
