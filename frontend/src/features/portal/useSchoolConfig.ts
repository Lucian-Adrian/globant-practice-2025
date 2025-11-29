import { useState, useEffect } from 'react';
import { API_PREFIX } from '../../api/httpClient';

export interface SchoolConfig {
  school_name: string;
  school_logo: string | null;
  business_hours: string;
  email: string;
  contact_phone1: string;
  contact_phone2: string | null;
  landing_image: string | null;
  landing_text: Record<string, string>;
  social_links: Record<string, string>;
  available_categories: string[];
}

// Default fallbacks when API fails or images not set
const DEFAULTS: SchoolConfig = {
  school_name: 'DriveAdmin',
  school_logo: '/assets/logo.png',
  business_hours: 'Mon-Fri: 9AM-6PM',
  email: 'contact@school.com',
  contact_phone1: '+373 69 155 877',
  contact_phone2: null,
  landing_image: '/assets/landing.png',
  landing_text: {},
  social_links: {},
  available_categories: ['B'],
};

let cachedConfig: SchoolConfig | null = null;
let fetchPromise: Promise<SchoolConfig> | null = null;

async function fetchSchoolConfig(): Promise<SchoolConfig> {
  if (cachedConfig) return cachedConfig;
  
  if (fetchPromise) return fetchPromise;
  
  fetchPromise = (async () => {
    try {
      const resp = await fetch(`${API_PREFIX}/school/config/`);
      if (!resp.ok) throw new Error('Failed to fetch config');
      const data = await resp.json();
      
      // Merge with defaults for any missing values
      cachedConfig = {
        ...DEFAULTS,
        ...data,
        // Use defaults for images if not set in API
        school_logo: data.school_logo || DEFAULTS.school_logo,
        landing_image: data.landing_image || DEFAULTS.landing_image,
      };
      return cachedConfig;
    } catch (err) {
      console.warn('Failed to fetch school config, using defaults:', err);
      cachedConfig = DEFAULTS;
      return cachedConfig;
    }
  })();
  
  return fetchPromise;
}

/**
 * Hook to fetch and cache school configuration.
 * Falls back to static assets if API fails or images not configured.
 */
export function useSchoolConfig() {
  const [config, setConfig] = useState<SchoolConfig>(cachedConfig || DEFAULTS);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    let mounted = true;
    
    fetchSchoolConfig().then((cfg) => {
      if (mounted) {
        setConfig(cfg);
        setLoading(false);
      }
    });
    
    return () => { mounted = false; };
  }, []);

  return { config, loading };
}

export default useSchoolConfig;
