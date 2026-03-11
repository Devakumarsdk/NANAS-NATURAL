import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Ticket, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../context/store';

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/categories', icon: Tag, label: 'Categories' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
];

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 992 : false);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 992 : true);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobileSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f5f7', fontFamily: 'Sora, sans-serif', position: 'relative' }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000 }}
        />
      )}

      <aside
        style={{
          width: sidebarOpen ? 240 : 64,
          flexShrink: 0,
          background: '#0f1a0f',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.25s ease',
          overflow: 'hidden',
          zIndex: 1001,
          ...(isMobile
            ? {
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                width: 240,
              }
            : { position: 'relative' }),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {sidebarOpen ? (
            <img src="/nanas-natural-logo-light.svg" alt="NANA'S NATURAL" style={{ height: 30, width: 'auto', maxWidth: '100%' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a5c3a', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>
              NN
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(({ path, icon: Icon, label, exact }) => {
            const isExactActive = location.pathname === '/admin' && path === '/admin';
            const isActive = isExactActive || (!exact && location.pathname.startsWith(path) && path !== '/admin');
            return (
              <Link
                key={path}
                to={path}
                onClick={closeMobileSidebar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  background: isActive ? 'rgba(26,92,58,0.4)' : 'transparent',
                  borderLeft: isActive ? '3px solid #4ade80' : '3px solid transparent',
                  color: isActive ? '#4ade80' : '#aaa',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {sidebarOpen && label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a5c3a', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: '#888' }}>Administrator</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 500 }}
          >
            <LogOut size={16} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '0 16px', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen((prev) => !prev)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4 }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
              {NAV_ITEMS.find((n) => location.pathname === n.path || (location.pathname.startsWith(n.path) && n.path !== '/admin'))?.label || 'Dashboard'}
            </h2>
          </div>
          <Link to="/" style={{ fontSize: 13, color: '#1a5c3a', fontWeight: 500 }}>
            View Store
          </Link>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 12 : 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
