// 数据字典
import { enumList } from '@/api/core/enum.js'
import { getToken } from '@/utils/auth' // get token from cookie
const state = { // 字段库
  enumList: {
    alg_team: [],
    CustomerType: [],
    FlavorList: [],
    feeSelectList: [],
    feeSelectInitList: [],
    feeSelectListLast: [],
    diff_reason: [],
    adjust_reason: [],
    accounts: [],
    store_group: [],
    stock_group: [],
    stockId: [],
    stores: [],
    supplier_group: [],
    pos_status: [],
    categoryList: [],
    audit_status: [],
    organizes: [],
    brandList: [],
    algList: [],
    FeeList: [], // 费用列表
    // personList: [], // 人员列表
    personListCG: [], // 采购员列表
    personListSH: [], // 仓储收货员列表
    personListCCRK: [], // 仓储入库人（临时用仓储部长）
    personListSJ: [], // 司机（临时用仓储部长）
    FinTaxRateList: [], // 税率
    IF_NUM: [
      { name: '否', value: 0 },
      { name: '是', value: 1 }
    ],
    module_arr: [
      { name: '档案', value: 1 }, { name: '采购', value: 2 }, { name: '物流', value: 3 }, { name: '仓储', value: 4 }, { name: '门店', value: 5 },
      { name: '财务', value: 6 }, { name: '收银', value: 7 }, { name: '零售', value: 8 }, { name: '卡中心', value: 9 }, { name: '报表', value: 10 },
      { name: '系统', value: 11 }, { name: 'POS', value: 12 }, { name: 'ToB', value: 13 }
    ],
    // CG 采购管理| CC 仓库管理 | LS 连锁管理 | QT 其它
    mobile_module: [
      { name: '采购管理', value: 'CG' },
      { name: '仓库管理', value: 'CC' },
      { name: '连锁管理', value: 'LS' },
      { name: '物流管理', value: 'WL' },
      { name: '档案管理', value: 'DA' },
      { name: '配送管理', value: 'PS' },
      { name: '收银管理', value: 'SY' },
      { name: '零售管理', value: 'LS' },
      { name: '礼品卡管理', value: 'LPK' },
      { name: '活动', value: 'HD' },
      { name: '其它', value: 'QT' }
    ],
    module_type: [
      { name: '目录', value: 'D' }, { name: '菜单', value: 'M' }, { name: '按钮', value: 'B' }
    ],
    sys_log_action: [
      { name: '未知', value: 'UNKNOWN' },
      { name: '删除', value: 'DELETE' },
      { name: '查询', value: 'SELECT' },
      { name: '更新', value: 'UPDATE' },
      { name: '导出', value: 'EXPORT' },
      { name: '打印', value: 'PRINT' },
      { name: '审核', value: 'REVIEW' },
      { name: '新增', value: 'INSERT' },
      { name: '登录', value: 'LOFIN' }
    ],
    sys_log_device: [
      { name: '电脑端', value: 'WEB' },
      { name: '移动安卓端', value: 'ANDROID' },
      { name: '移动苹果端', value: 'IOS' }
    ]
  }
}
const mutations = { // 方法
  SET_ENUM_LIST: (state, list) => {
    const temp = {}
    list.forEach(item => {
      temp[item.type] = item.dataList
    })
    state.enumList = Object.assign(state.enumList, temp)
  },
  ADD_ENUM_LIST: (state, obj) => {
    state.enumList = Object.assign(state.enumList, obj)
  },
  ADD_LIST_ITEM: (state, { name, obj }) => {
    console.log(name)
    console.log(obj)
    state.enumList[name].push(obj)
  }
}
const actions = { // 外部调用
  get_enum({ commit }) {
    enumList().then(res => {
      commit('SET_ENUM_LIST', res.data)
    })
  },
  add_enum({ commit }, data) {
    commit('ADD_ENUM_LIST', data)
    return Promise.resolve(true)
  },
  add_enum_sync({ commit }, data) {
    commit('ADD_ENUM_LIST', data)
  }
}
if (getToken()) { // 刷新从新获取枚举表
  enumList().then(res => {
    if (res.code === 200) {
      mutations.SET_ENUM_LIST(state, res.data)
    } else {
      return false
    }
  })
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
