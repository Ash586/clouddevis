'use client';

import { usePathname } from 'next/navigation';
import { useState, useLayoutEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { useIsMobile } from '@/hooks/useIsMobile';

const ADMIN_STYLES = `
#admin-layout,.admin-content{font-family:'Sora',system-ui,sans-serif}
#admin-layout .rounded-2xl{border-radius:10px!important}
#admin-layout .rounded-xl{border-radius:6px!important}
#admin-layout .font-mono{font-family:'IBM Plex Mono',monospace!important}
@keyframes spin{to{transform:rotate(360deg)}}
`;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const id = 'admin-injected-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = ADMIN_STYLES;
    document.head.appendChild(style);
  }, []);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div id="admin-layout" style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      {!isMobile && <AdminSidebar />}

      {isMobile && menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          onClick={closeMenu}
        />
      )}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100%',
            zIndex: 50,
            transition: 'transform 0.3s ease',
            transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <AdminSidebar />
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminNavbar onMenuToggle={toggleMenu} menuOpen={menuOpen} />
        <div className="admin-content" style={{ padding: '24px 28px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
