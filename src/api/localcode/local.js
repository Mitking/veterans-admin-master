import request from '@/utils/request'
/**
 * 查询所有省
 * @returns
 */
export const getAllProvince = (data = {}) => {
  return request.post('/sysProvince/getListSysProvince', data)
}
/**
 * 查询所有市
 * @returns
 */
export const getCityByPcode = (data = {}) => {
  return request.post('/sysCity/getListSysCityByPcode', data)
}
/**
 * 查询所有县区
 * @returns
 */
export const getCountyByPcode = (data = {}) => {
  return request.post('/sysCounty/getListSysCountyByPcode', data)
}
/**
 * 查询所有镇
 * @returns
 */
export const getTownByPcode = (data = {}) => {
  return request.post('/sysTown/getListSysTownByPcode', data)
}
/**
 * 查询所有村
 * @returns
 */
export const getVillageByPcode = (data = {}) => {
  return request.post('/sysVillage/getListSysVillageByPcode', data)
}
/**
 * 添加村
 * @returns
 */
export const addVillage = (data = {}) => {
  return request.post('/sysVillage/addSysVillage', data)
}
