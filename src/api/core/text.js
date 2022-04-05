const module = '/core'
import request from '@/utils/request'
// 关于
export function getText(data = {}) {
  return request({
    // url: module + '/about/getText',
    url: module + '/about/getAll',
    method: 'post',
    data
  })
}
export function addText(data = {}) {
  return request({
    url: module + '/about/addText',
    method: 'post',
    data
  })
}
export function updateText(data = {}) {
  return request({
    url: module + '/about/updateText',
    method: 'post',
    data
  })
}
