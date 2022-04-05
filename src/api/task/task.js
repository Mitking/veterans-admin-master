const module = '/task'
import request from '@/utils/request'

/**
 * 分页查询定时任务
 * @returns
 */
export const getJobPage = (data = {}) => {
  return request.post(module + '/job/getJobPage', data)
}

/**
 * 启用禁用定时任务
 * @returns
 */
export const validJob = (data = {}) => {
  return request.post(module + '/job/validJob', data)
}

/**
 * 添加定时任务
 * @returns
 */
export const addJob = (data = {}) => {
  return request.post(module + '/job/addJob', data)
}

/**
 * 修改定时任务
 * @returns
 */
export const updateJob = (data = {}) => {
  return request.post(module + '/job/updateJob', data)
}

/**
 * 分页获取调度日志
 * @returns
 */
export const getJobRecordPage = (data = {}) => {
  return request.post(module + '/job/record/getJobRecordPage', data)
}
