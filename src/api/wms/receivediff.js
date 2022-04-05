const module = '/wms'
import request from '@/utils/request'

export function getList(data = {}) {
  return request({
    url: module + '/sto/receive/diff/getList',
    method: 'post',
    data
  })
}
export function getListByRecordId(data = {}) {
  return request({
    url: module + '/sto/receive/diff/detail/getListByRecordId',
    method: 'post',
    data
  })
}
