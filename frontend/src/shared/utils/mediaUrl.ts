// Shared media URL utilities and constants

export const PUBLIC_BACKEND_BASE = (import.meta as any)?.env?.VITE_BACKEND_PUBLIC_BASE || 'http://localhost:8000';

export function fixHost(u: string): string {
  if (!u) return '';
  let out = u.trim();
  if (out.startsWith('blob:')) return out;
  out = out
    .replace('http://backend:8000', PUBLIC_BACKEND_BASE)
    .replace('https://backend:8000', PUBLIC_BACKEND_BASE)
    .replace('http://0.0.0.0:8000', PUBLIC_BACKEND_BASE)
    .replace('https://0.0.0.0:8000', PUBLIC_BACKEND_BASE)
    .replace('http://localhost:8000', PUBLIC_BACKEND_BASE)
    .replace('https://localhost:8000', PUBLIC_BACKEND_BASE);
  if (out.startsWith('/media/')) out = `${PUBLIC_BACKEND_BASE}${out}`;
  return out;
}

// ImageInput helpers to DRY format/parse behavior
export function formatImageValue(val: any): Array<{ src: string; rawFile?: File }> {
  if (!val) return [];
  if (typeof val === 'string') return val ? [{ src: val }] : [];
  if (typeof val === 'object' && !Array.isArray(val)) {
    const src = (val as any).src || (val as any).url || (val as any).path || '';
    return src ? [{ src }] : [];
  }
  if (Array.isArray(val)) return val;
  return [];
}

export function parseImageValue(val: any): Array<{ src: string; rawFile?: File }> {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item: any) => {
      if (item instanceof File) {
        return { src: URL.createObjectURL(item), rawFile: item };
      }
      if (typeof item === 'object') {
        const src = item.src || item.url || item.path || '';
        return src ? { src, ...(item.rawFile ? { rawFile: item.rawFile } : {}) } : {} as any;
      }
      if (typeof item === 'string') {
        return item ? { src: item } : {} as any;
      }
      return {} as any;
    }).filter((obj: any) => !!obj.src);
  }
  if (val instanceof File) {
    return [{ src: URL.createObjectURL(val), rawFile: val }];
  }
  if (typeof val === 'object' && (val.src || val.url || val.path)) {
    const src = val.src || val.url || val.path;
    return src ? [{ src, ...(val.rawFile ? { rawFile: val.rawFile } : {}) }] : [];
  }
  if (typeof val === 'string') return val ? [{ src: val }] : [];
  return [];
}
