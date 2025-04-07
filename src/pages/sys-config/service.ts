import { request } from '@umijs/max';

export async function saveSysConfig(params: any) {
  return request('/api/sys-config/save', {
    method: 'POST',
    data: params,
  });
}


export async function loadSysConfig() {
   return await request('/api/sys-config/', {
    method: 'GET',
  });
}