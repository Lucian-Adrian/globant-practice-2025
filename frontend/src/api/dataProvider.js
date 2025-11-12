// Extracted dataProvider from App.jsx (working logic only)
import { httpJson, rawFetch, API_PREFIX } from './httpClient';
import { HttpError } from 'react-admin';
import { raI18nProvider } from '../i18n/index.js';

const baseApi = API_PREFIX; // consistent single source

const mapResource = (resource) => {
  const mapping = { classes: 'courses', scheduledclasses: 'scheduled-classes', };
  const name = mapping[resource] || resource;
  return `${name}/`;
};

// httpJson adds auth header automatically; rawFetch for manual handling

const buildQuery = (params) => {
  const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
  const query = new URLSearchParams();

  query.set('page', String(page));
  query.set('page_size', String(perPage));

  if (params.filter) {
    Object.entries(params.filter).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      const m = k.match(/^(.*)_(gte|lte|gt|lt)$/);
      const key = m ? `${m[1]}__${m[2]}` : k;
      query.set(key, String(v));
    });
  }

  if (params.sort && params.sort.field) {
    const { field, order } = params.sort;
    const ordering = order === 'DESC' ? `-${field}` : field;
    query.set('ordering', ordering);
  }

  return query.toString();
};

const translateIfValidationKey = (msg) => {
  if (typeof msg === 'string' && msg.startsWith('validation.')) {
    try { return raI18nProvider.translate(msg); } catch (_) { return msg; }
  }
  return msg;
};

const extractFieldErrors = (body) => {
  if (!body || typeof body !== 'object') return {};
  const source = body.errors && typeof body.errors === 'object' ? body.errors : body;
  const map = {};
  for (const [field, messages] of Object.entries(source)) {
    if (messages == null) continue;
    if (Array.isArray(messages) && messages.length) map[field] = String(translateIfValidationKey(messages[0]));
    else if (typeof messages === 'string') map[field] = translateIfValidationKey(messages);
    else if (typeof messages === 'object' && messages.message) map[field] = String(translateIfValidationKey(messages.message));
  }
  return map;
};

const dataProvider = {
  getList: async (resource, params) => {
    const resName = mapResource(resource);
    const qs = buildQuery(params);
    const url = `${baseApi}/${resName}?${qs}`;
  const { json } = await httpJson(url);
    const data = Array.isArray(json) ? json : json.results || [];
    const total = Array.isArray(json) ? json.length : json.count ?? data.length;
    return { data, total };
  },
  getOne: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}${params.id}/`;
  const { json } = await httpJson(url);
    return { data: json };
  },
  getMany: async (resource, params) => {
    const items = await Promise.all(
      params.ids.map((id) => dataProvider.getOne(resource, { id }).then((r) => r.data))
    );
    return { data: items };
  },
  getManyReference: async (resource, params) => {
    const filter = { ...(params.filter || {}), [params.target]: params.id };
    return dataProvider.getList(resource, { ...params, filter });
  },
  update: async (resource, params) => {
    if (resource === 'lessons' || resource === 'scheduled-classes') {
      // Debug: inspect outgoing payload to verify scheduled_time contains chosen time
      // Remove after verifying
      try { console.debug('[DP:update] lessons payload', params.data); } catch (_) {}
      // Ensure UTC ISO for scheduled_time
      if (params.data && params.data.scheduled_time) {
        params.data = { ...params.data, scheduled_time: new Date(params.data.scheduled_time).toISOString() };
      }
    }
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}${params.id}/`;
    const resp = await rawFetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params.data) });
    let body = {};
    try { body = await resp.json(); } catch (_) {}
    if (!resp.ok) {
      const fieldErrors = extractFieldErrors(body);
      // Ensure inline field errors in RA by using HttpError(message, status, { errors })
      const baseMessage = resp.status === 400 ? 'validation' : (body.message || body.detail || body.error || 'Server error');
      throw new HttpError(baseMessage, resp.status, { errors: fieldErrors });
    }
    return { data: body };
  },
  updateMany: async (resource, params) => {
    const results = [];
    for (const id of params.ids) {
      const r = await dataProvider.update(resource, { id, data: params.data });
      results.push(r.data.id);
    }
    return { data: results };
  },
  create: async (resource, params) => {
    if (resource === 'lessons' || resource === 'scheduled-classes') {
      // Debug: inspect outgoing payload to verify scheduled_time contains chosen time
      // Remove after verifying
      try { console.debug('[DP:create] lessons payload', params.data); } catch (_) {}
      // Ensure UTC ISO for scheduled_time
      if (params.data && params.data.scheduled_time) {
        params.data = { ...params.data, scheduled_time: new Date(params.data.scheduled_time).toISOString() };
      }
    }
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}`;
  const resp = await rawFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params.data) });
    let body = {};
    try { body = await resp.json(); } catch (_) {}
    if (!resp.ok) {
      const fieldErrors = extractFieldErrors(body);
      // Ensure inline field errors in RA by using HttpError(message, status, { errors })
      const baseMessage = resp.status === 400 ? 'validation' : (body.message || body.detail || body.error || 'Server error');
      throw new HttpError(baseMessage, resp.status, { errors: fieldErrors });
    }
    return { data: body };
  },
  delete: async (resource, params) => {
    const resName = mapResource(resource);
    const url = `${baseApi}/${resName}${params.id}/`;
  await httpJson(url, { method: 'DELETE' });
    return { data: { id: params.id } };
  },
  deleteMany: async (resource, params) => {
    const results = await Promise.all(
      params.ids.map((id) => dataProvider.delete(resource, { id }).then((r) => r.data.id))
    );
    return { data: results };
  },
};

export default dataProvider;
