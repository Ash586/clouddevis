'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMobileMenu } from '@/hooks/useMobileMenu';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isOpen: menuOpen, toggle: toggleMenu, close: closeMenu } = useMobileMenu();

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      {!isMobile && <AdminSidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={closeMenu} />
      )}
      {isMobile && (
        <div className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <AdminSidebar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onMenuToggle={toggleMenu} menuOpen={menuOpen} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
