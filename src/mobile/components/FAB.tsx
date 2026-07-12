'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Receipt, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onNewDevis: () => void;
  onNewFacture: () => void;
}

export function FAB({ onNewDevis, onNewFacture }: FABProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const handleDevis = useCallback(() => {
    setOpen(false);
    onNewDevis();
  }, [onNewDevis]);

  const handleFacture = useCallback(() => {
    setOpen(false);
    onNewFacture();
  }, [onNewFacture]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-black/30"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Speed-dial container */}
      <div
        className="fixed z-[46] flex flex-col items-end gap-3"
        style={{
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: '20px',
        }}
      >
        {/* Mini buttons */}
        <AnimatePresence>
          {open && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.05 }}
                onClick={handleFacture}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500 text-white shadow-lg active:scale-95"
              >
                <Receipt size={18} />
                <span className="text-sm font-bold">Facture</span>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0 }}
                onClick={handleDevis}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 text-white shadow-lg active:scale-95"
              >
                <FileText size={18} />
                <span className="text-sm font-bold">Devis</span>
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={toggle}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'w-14 h-14 rounded-full shadow-xl flex items-center justify-center',
            'active:scale-90 transition-colors',
            open ? 'bg-[var(--sand-muted)]' : 'bg-[var(--green-2)]',
          )}
        >
          {open ? (
            <X size={24} className="text-white" />
          ) : (
            <Plus size={26} className="text-white" strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </>
  );
}
