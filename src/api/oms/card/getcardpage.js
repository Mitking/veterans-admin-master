const module = '/oms'
import request from '@/utils/request'
// 获取
export function getPage(data = {}) {
  return request({
    url: module + '/card/getCardPage',
    method: 'post',
    data
  })
}
export function editOrder(data = {}) {
  return request({
    url: module + '/card/updateCards',
    method: 'post',
    data
  })
}
export function cardClear(data = {}) {
  return request({
    url: module + '/card/cardClear',
    method: 'post',
    data
  })
}
export function getCardList(data = {}) {
  return request({
    url: module + '/card/getCardList',
    method: 'post',
    data
  })
}
// 获取卡流水
export function getCardExpensesLog(data = {}) {
  return request({
    url: module + '/card/expenses/record/getCardExpensesLog',
    method: 'post',
    data
  })
}
// 导入乐檬卡
export function importLemengCardData(data = {}) {
  return request({
    url: module + '/card/importLemengCardData',
    method: 'post',
    data
  })
}
