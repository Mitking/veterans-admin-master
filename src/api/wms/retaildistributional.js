const module = '/wms'
import request from '@/utils/request'

export function getPage(data = {}) {
  return request({
    url: module + '/retail/distributional/target/getAll',
    method: 'post',
    data
  })
}
export function updateOrSave(data = {}) {
  return request({
    url: module + '/retail/distributional/target/save',
    method: 'post',
    data
  })
}
