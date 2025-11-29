import { useEffect, useState, useCallback } from 'react';
import { API_PREFIX, buildHeaders } from '../../api/httpClient.js';
import { fixHost } from '../utils/mediaUrl';

export interface SchoolConfig {
  id?: number;
  school_name: string;
  school_logo: string;
  business_hours?: string;
  email?: string;
  contact_phone1?: string;
  contact_phone2?: string;
  landing_image: string;
  landing_text: Record<string, string>;
  social_links?: Record<string, string>;
  rules?: Record<string, any>;
  available_categories?: string[];
  addresses?: any[];
}

const DEFAULT_CONFIG: SchoolConfig = {
  school_name: 'DriveAdmin',
  school_logo: '/assets/logo.png',
  landing_image: '/assets/landing.png',
  landing_text: {
    en: 'Learn to drive with confidence. Flexible schedules, professional instructors, modern vehicles.',
    ro: 'Învață să conduci cu încredere. Orar flexibil, instructori profesioniști, mașini moderne.',
    ru: 'Учитесь водить уверенно. Гибкий график, профессиональные инструкторы, современные авто.'
  },
  social_links: {},
  rules: {},
  available_categories: [],
  addresses: []
};

function mergeConfig(server: Partial<SchoolConfig> | null | undefined): SchoolConfig {
  if (!server) return { ...DEFAULT_CONFIG };
  return {
    ...DEFAULT_CONFIG,
    ...server,
    school_name: (server.school_name || '').trim() || DEFAULT_CONFIG.school_name,
    school_logo: fixHost(server.school_logo || DEFAULT_CONFIG.school_logo),
    landing_image: fixHost(server.landing_image || DEFAULT_CONFIG.landing_image),
    landing_text: { ...DEFAULT_CONFIG.landing_text, ...(server.landing_text || {}) }
  };
}

export function useSchoolConfig() {
  const [config, setConfig] = useState<SchoolConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_PREFIX}/school/config/`);
      const ok = res.ok ? res : await fetch(`${API_PREFIX}/school/config/`, { headers: buildHeaders() });
      if (!ok.ok) throw new Error('Failed fetching config');
      const data: any = await ok.json();
      setConfig(mergeConfig(data));
    } catch (e: any) {
      setError(e?.message || 'Failed loading school config');
      setConfig(mergeConfig(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { config, loading, error, refresh };
}

export { fixHost };