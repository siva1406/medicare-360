import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext(null);

export function HashRouter({ children }) {
  const getPath = () => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  };

  const [currentPath, setCurrentPath] = useState(getPath);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(getPath());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) {
      window.location.hash = '/';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to) => {
    window.location.hash = to.startsWith('/') ? to : `/${to}`;
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useNavigate must be used within HashRouter');
  return ctx.navigate;
}

export function useLocation() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useLocation must be used within HashRouter');
  return { pathname: ctx.currentPath };
}

export function Link({ to, children, className = '', onClick, ...props }) {
  const { navigate } = useContext(RouterContext) || {};

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && navigate) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={`#${to.startsWith('/') ? to : `/${to}`}`} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

export function Routes({ children }) {
  const { currentPath } = useContext(RouterContext);

  let matchChild = null;
  const baseCurrentPath = (currentPath || '/').split('?')[0];

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && !matchChild) {
      const { path } = child.props;
      if (path === '*' || path === baseCurrentPath || (path !== '/' && baseCurrentPath === path)) {
        matchChild = child;
      }
    }
  });

  return matchChild;
}

export function Route({ element }) {
  return element;
}
