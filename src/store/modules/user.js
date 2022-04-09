// modules/user
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
// import { queryOrgByAccountId } from '@/api/org'
// import { mutations as enumMutations } from './enum'
// import Layout from '@/layout'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  routes: [],
  type: '',
  modules: [],
  accountId: '',
  orgId: 0,
  storeId: 0,
  accountType: '',
  operatorId: 0
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ACCOUNT: (state, token) => {
    state.accountId = token
  },
  SET_OPERATOR_ID: (state, id) => {
    state.operatorId = id
  },

  SET_ORGID: (state, data) => {
    state.orgId = data
  },
  SET_STOREID: (state, token) => {
    state.storeId = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_TYPE: (state, type) => {
    state.type = type
  },
  SET_ACCOUNT_TYPE: (state, accountType) => {
    state.accountType = accountType
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ROUTES: (state, routes) => {
    state.routes = routes
  },
  SET_MODULES: (state, modules) => {
    state.modules = modules
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }
        data.roles = data.permsList
        delete data.permsList
        const { roles, operator, introduction, type, accountType, accountId, orgId, storeId, operatorId } = data
        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
        //   const roles = [1, 2, 3, 4, 5, 6, 7, 8, 9]
          reject('getInfo: roles must be a non-null array!')
        }
        /* console.log(roles)*/
        /* console.log(routes)*/
        commit('SET_ROLES', roles)
        commit('SET_ROUTES', data.routes)
        commit('SET_MODULES', data.modules)
        commit('SET_NAME', operator)
        // commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        commit('SET_TYPE', type)
        commit('SET_ACCOUNT_TYPE', accountType)
        commit('SET_ACCOUNT', accountId)
        commit('SET_OPERATOR_ID', operatorId)
        commit('SET_ORGID', orgId)
        commit('SET_STOREID', storeId)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        window.location.reload() // 重置vuex
        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
