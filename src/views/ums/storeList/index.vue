<template>
  <div>
    <keep-alive :max="2" exclude="CoreCompForm">
      <component
        :is="currentComponent"
        ref="Comp"
        :search_form_height.sync="searchFormHeight"
        :loading.sync="loading"
        :style="{margin:'0px'}"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :current-row="currentRow"
        :details="details"
        :show="formShow"
        :cascaderbycode="true"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e;}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addStore, getStoreList, updateStore } from '@/api/core/store'
import CoreCompForm from '@/views/core/components/CoreCompForm'
import Order from './store'
import store from '@/store'
export default {
  name: 'StoreIndex',
  components: { CoreCompForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false },
        { title: '所属账套', width: 300, prop: 'accountId', readonly: false, show: true, type: 'select', selectData: 'accounts', selectOption: { label: 'orgName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '账套名称必填', trigger: 'change' }] },
        { title: '所属组织', width: 300, prop: 'orgId', readonly: false, show: true, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, fatherProp: 'accountId', addFatherProp: 'Req',
          rule: [{ required: true, message: '组织名称必填', trigger: 'change' }] },
        { title: '门店名称', prop: 'name', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '门店名称必填', trigger: 'change' }] },
        { title: '门店类型', prop: 'typeId', show: true, width: 100, type: 'select', selectData: 'store_type', addFatherProp: 'Req', editShow: true, detailShow: true, formItemwidth: 160,
          rule: [{ required: true, message: '门店类型不能为空', trigger: 'change' }] },
        { title: '门店级别', prop: 'storeLevel', show: true, width: 100, type: 'select', unselect: ['1'], disabled: true, selectData: 'store_level', addFatherProp: 'Req', editShow: true, detailShow: true, formItemwidth: 160,
          rule: [{ required: true, message: '门店级别不能为空', trigger: 'change' }] },
        { title: '乐檬门店编码', prop: 'lemengStoreNo', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '乐檬仓库编号', prop: 'storehouseNum', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '启用禁用', prop: 'enable', show: true, width: 100, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true, detailShow: true }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'CoreCompForm')
      return this.currentComponent === 'CoreCompForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    message(res) {
      if (res.code === 200) {
        this.loading = false
        this.currentComponent = 'Order'
        this.$success('操作成功')
        //  更新枚举表
        getStoreList({}).then(res => { // 强制更新数据字典
          store.dispatch('enum/add_enum', { stores: res.data })
        })
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'accountId', 'readonly', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', operateItem.prop !== 'insert')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeLevel', 'disabled', this.currentRow.storeLevel === '1' && operateItem.prop !== 'insert')
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
        this.currentComponent = 'CoreCompForm'
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': case 'copy': // 新增,复制
          data.Req.id = null
          addStore(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改

          if (data.Req.openHoursStart && data.Req.openHoursStart.length === 5) {
            data.Req.openHoursStart = data.Req.openHoursStart + ':00'
          }
          if (data.Req.openHoursEnd && data.Req.openHoursEnd.length === 5) {
            data.Req.openHoursEnd = data.Req.openHoursEnd + ':00'
          }
          updateStore(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        default:
          console.log(arg, data)
      }
    },
    isNum(rule, value, callback) {
      const codeCheck = /^[0-9]*$/
      if (!codeCheck.test(value)) {
        callback(new Error('门店代码只能为数字'))
      } else {
        callback()
      }
    }
    // review() { // 审核
    //   review({ 'ids': [this.currentRow.id], 'auditStatus': '3' }).then(res => {
    //     if (res.code === 200) {
    //       this.message(res)
    //     }
    //   }).catch(err => {
    //     this.loading = false
    //     throw err
    //   })
    // },
    // deleteDetail(item) {
    //   return new Promise(resolve => {
    //     this.$confirm(`此操作将永久删除单号「${item.acceptNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning'
    //     }).then(() => {
    //       // this.operateItem.loading = true
    //       deleteDetails({ ids: [item.id] }).then(res => {
    //         if (res.code === 200) {
    //           this.$success('操作成功')
    //         } else {
    //           this.$error(res.data)
    //         }
    //         resolve(true)
    //       }).catch(err => {
    //         throw err
    //       })
    //     }).catch(() => {
    //       this.$message({
    //         type: 'info',
    //         message: '已取消删除'
    //       })
    //       resolve(false)
    //     })
    //   })
    // }
  }
}
</script>
<style scoped>
</style>
