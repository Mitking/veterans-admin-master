const module = '/bms'
import request from '@/utils/request'
// 首页环比
export function getChainData(data = {}) {
  return request({
    url: module + '/report/getChainDataOfAdmin',
    method: 'post',
    data
  })
}
// 首页环比头部6卡片数据
export function manageAnalysisConfig(data = {}) {
  return request({
    url: module + '/manage/analysis/config/manageAnalysisConfig',
    method: 'post',
    data
  })
}
// 图表数据
export function getManageDataGroup(data = {}) {
  return request({
    url: module + '/report/getManageDataGroup',
    method: 'post',
    data
  })
}

// 待办事项查询
export function getUnReviewInfo(data = {}) {
  return request({
    url: module + '/unreview/show/getUnReviewInfo',
    method: 'post',
    data
  })
}
// 待办事项设置
export function unreviewConfig(data = {}) {
  return request({
    url: module + '/unreview/show/unreviewConfig',
    method: 'post',
    data
  })
}

// 商品分析Top10
export function getProductAnalysisRes(data = {}) {
  return request({
    url: module + '/report/getProductAnalysisRes',
    method: 'post',
    data
  })
}
// 常用业务查询
export function getDailyBusinessGroup(data = {}) {
  return request({
    url: module + '/daily/business/getDailyBusinessGroup',
    method: 'post',
    data
  })
}
// 常用业务查询
export function unreviewConfigForAdminister(data = {}) {
  return request({
    url: module + '/unreview/show/unreviewConfigForAdminister',
    method: 'post',
    data
  })
}

// 常用业务设置
export function saveOrUpdateDailyBusiness(data = {}) {
  return request({
    url: module + '/daily/business/saveOrUpdateDailyBusiness',
    method: 'post',
    data
  })
}
