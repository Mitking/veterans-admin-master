const module = '/oms'
import request from '@/utils/request'
export function getActivNumber(data = {}) {
  return request({
    url: module + '/activ/serial/number/getActivSerialNumber',
    method: 'post',
    data
  })
}
