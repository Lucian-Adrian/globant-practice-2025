import { useEffect, useState } from 'react';
import { getAccessToken } from './authProvider';

function isTokenValid(token: string | null) {
  if (!token) return false;
  // If there's a student token stored, treat as not logged in for admin
  if (localStorage.getItem('student_access_token')) return false;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload?.student_id) return false;
  } catch (e) {
    return false;
  }
  return true;
}

export function useIsLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => isTokenValid(getAccessToken()));

  useEffect(() => {
    const check = () => setLoggedIn(isTokenValid(getAccessToken()));

    const onStorage = (e: StorageEvent) => {
      // Update when relevant keys change in other tabs/windows
      if (!e.key || e.key === 'ds_access_token' || e.key === 'ds_refresh_token' || e.key === 'student_access_token') {
        check();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);

    // Periodic check to catch same-window token changes where no events fire
    const interval = setInterval(check, 2000);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
      clearInterval(interval);
    };
  }, []);

  return loggedIn;
}
