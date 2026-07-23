'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Receipt, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface FABProps {
  onNewDevis: () => void;
  onNewFacture: () => void;
  onDuplicate?: () => void;
  canDuplicate?: boolean;
}

export function FAB({ onNewDevis, onNewFacture, onDuplicate, canDuplicate = false }: FABProps) {
  const [open, setOpen] = useState(false);
  const { t } = useMobileI18n();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const handleDevis = useCallback(() => {
    setOpen(false);
    onNewDevis();
  }, [onNewDevis]);

  const handleFacture = useCallback(() => {
    setOpen(false);
    onNewFacture();
  }, [onNewFacture]);

  const handleDuplicate = useCallback(() => {
    setOpen(false);
    onDuplicate?.();
  }, [onDuplicate]);

  const actions = [
    {
      id: 'facture',
      label: t('fab.facture'),
      icon: Receipt,
      color: 'bg-blue-500',
      onPress: handleFacture,
      show: true,
    },
    {
      id: 'devis',
      label: t('fab.devis'),
      icon: FileText,
      color: 'bg-emerald-500',
      onPress: handleDevis,
      show: true,
    },
    {
      id: 'duplicate',
      label: t('fab.duplicate'),
      icon: Copy,
      color: 'bg-amber-500',
      onPress: handleDuplicate,
      show: canDuplicate && !!onDuplicate,
    },
  ];

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
          {open &&
            actions
              .filter((a) => a.show)
              .map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={action.onPress}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-full text-white shadow-lg active:scale-95',
                      action.color,
                    )}
                  >
                    <Icon size={17} />
                    <span className="text-sm font-bold">{action.label}</span>
                  </motion.button>
                );
              })}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={toggle}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cn(
            'w-14 h-14 rounded-full shadow-xl flex items-center justify-center',
            'active:scale-90 transition-colors',
          )}
          style={{ background: open ? 'var(--sand-muted)' : 'var(--green-2)' }}
          aria-label={open ? t('fab.close') : t('fab.open')}
          aria-expanded={open}
        >
          <Plus size={26} className="text-white" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
}
