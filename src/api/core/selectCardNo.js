const module = '/core'
import request from '@/utils/request'
// 礼品卡
export function selectCardNo(data = {}) {
  return request({
    url: module + '/card/selectCardNo',
    method: 'post',
    data
  })
}
