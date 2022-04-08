const module = ''
import request from '@/utils/request'
// 初始化enum
export function enumList(data = {}) {
  return request({
    url: module + '/basic/enum/initEnum',
    method: 'post',
    data
  })
}
export function getEnumPage(data = {}) {
  return request({
    url: module + '/basic/enum/getEnumPage',
    method: 'post',
    data
  })
}
export function getEnum(data = {}) {
  return request({
    url: module + '/basic/enum/getEnum',
    method: 'post',
    data
  })
}
export function deleteEnum(data = {}) {
  return request({
    url: module + '/basic/enum/deleteEnum',
    method: 'post',
    data
  })
}
export function insertEnum(data = {}) {
  return request({
    url: module + '/basic/enum/insertEnum',
    method: 'post',
    data
  })
}
export function updateEnum(data = {}) {
  return request({
    url: module + '/basic/enum/updateEnum',
    method: 'post',
    data
  })
}
