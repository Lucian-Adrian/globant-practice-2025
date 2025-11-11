import * as React from 'react';

const LS_KEY = 'admin.aside.collapsed';

const AsidePanelContext = React.createContext({
  collapsed: false,
  toggle: () => {},
  setCollapsed: (_v) => {},
});

export function AsidePanelProvider({ children }) {
  const [collapsed, setCollapsed] = React.useState(false);

  // Load from localStorage only on client
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw === '1' || raw === 'true') setCollapsed(true);
    } catch (_) {}
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try { window.localStorage.setItem(LS_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ collapsed, toggle, setCollapsed }), [collapsed, toggle]);
  return <AsidePanelContext.Provider value={value}>{children}</AsidePanelContext.Provider>;
}

export function useAsidePanel() {
  return React.useContext(AsidePanelContext);
}

export default AsidePanelContext;
