export const getServiceName = (apiUrl) => {
  if (apiUrl.indexOf('/api/task') > -1) {
    return 'Task服务'
  } else if (apiUrl.indexOf('/api') > -1) {
    return 'UMS服务'
  } else if (apiUrl.indexOf('/api/wms') > -1) {
    return 'WMS服务'
  } else if (apiUrl.indexOf('/api/bms') > -1) {
    return 'BMS服务'
  } else if (apiUrl.indexOf('/api/core') > -1) {
    return 'Core服务'
  } else if (apiUrl.indexOf('/api/oms') > -1) {
    return 'OMS服务'
  } else if (apiUrl.indexOf('/api/lemeng') > -1) {
    return 'LeMeng服务'
  } else if (apiUrl.indexOf('/api/iot') > -1) {
    return 'IOT服务'
  }
  return '服务'
}
