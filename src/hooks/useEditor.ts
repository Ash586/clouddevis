'use client';
import { useEditorState } from './useEditorState';
import { useEditorActions } from './useEditorActions';
import type { UserMode, DocumentType } from '@/types';

export function useEditor(initialMode?: UserMode, initialDocId?: string, initialType?: DocumentType) {
  const state = useEditorState(initialMode, initialDocId, initialType);
  const actions = useEditorActions({
    doc: state.doc,
    setDoc: state.setDoc,
    docId: state.docId,
    setDocId: state.setDocId,
    mode: state.mode,
    newItem: state.newItem,
    setNewItem: state.setNewItem,
    setAddingItem: state.setAddingItem,
    setSaving: state.setSaving,
  });

  return { ...state, ...actions };
}
