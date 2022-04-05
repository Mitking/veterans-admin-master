const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/ecard/getEcardList',
    method: 'post',
    data
  })
}
// 充值
export function recharge(data = {}) {
  return request({
    url: module + '/ecard/recharge',
    method: 'post',
    data
  })
}
// 金额流水
export function getEcardLogList(data = {}) {
  return request({
    url: module + '/ecard/log/getEcardLogList',
    method: 'post',
    data
  })
}
// 积分流水
export function ecardPointLogList(data = {}) {
  return request({
    url: module + '/ecard/point/log/ecardPointLogList',
    method: 'post',
    data
  })
}
// 导入会员卡
export function importLemengCardInfo(data = {}) {
  return request({
    url: module + '/ecard/importLemengCardInfo',
    method: 'post',
    data
  })
}
