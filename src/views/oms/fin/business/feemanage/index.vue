<template>
  <div>
    <keep-alive :max="2" exclude="CoreForm">
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
        @formChange="form=$event"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrder, updateOrder } from '@/api/oms/fin/feemanage'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './feemanage'
import { getFeeSelectList } from '@/api/oms/fin/feemanage'
export default {
  name: 'FeeManageIndex',
  components: { CoreForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form: {},
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false },
        // { title: '组织', prop: 'orgId', show: true, addFatherProp: 'Req', type: 'select', editShow: [0, 3].includes(this.$store.getters.accountType), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' },
        // rule: [{ required: true, message: '组织必填', trigger: 'change' }] },
        { title: '上级编码', prop: 'parentCode', width: 200, show: false, defaultValue: '', checkStrictly: true, placeholder: '默认值：无', addFatherProp: 'Req', type: 'FeeList', editShow: true, selectData: 'feeSelectList', selectOption: { label: 'showName', value: 'id' }},
        { title: '科目编码', prop: 'sujectCode', show: true, type: 'numberPoint', addFatherProp: 'Req', editShow: true,
          rule: [{ validator: this.sujectCodeCheck, trigger: 'change' }] },
        { title: '费用名称', prop: 'feeName', show: true, type: 'text', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '费用名称必填', trigger: 'change' }] },
        { title: '是否末级', prop: 'ifLast', width: 150, show: true, type: 'if_type', addFatherProp: 'Req', editShow: true, defaultValue: true },
        { title: '状态', prop: 'feeState', width: 150, show: true, type: 'select', selectData: 'eff_state', defaultValue: '1', addFatherProp: 'Req', editShow: true }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'CoreForm')
      return this.currentComponent === 'CoreForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    sujectCodeCheck(rule, value, callback) {
      if (value === '') {
        callback(new Error('编码不能为空'))
      } else if (this.form.parentCode && this.form.parentCode !== '0') {
        const valNum = value.match(/[0-9]*/g)
        const code = this.form.parentCode
        if (code.match(/[0-9]*/g).every((item, index) => item === valNum[index])) {
          if (code === value) {
            return callback(new Error('编码不能等于父级!'))
          }
          callback()
        } else {
          callback(new Error('编码开头不等同父级!'))
        }
      } else {
        callback()
      }
    },
    message(res) {
      if (res.code === 200) {
        this.loading = false
        this.currentComponent = 'Order'
        getFeeSelectList({ ifLastQuery: false }).then(res => { // 字典表强制更新
          if (res.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'feeSelectList': res.data })
          }
        })
        getFeeSelectList({ ifLastQuery: true }).then(res => { // 字典表强制更新
          if (res.code === 200) {
            this.$store.dispatch('enum/add_enum', { 'feeSelectListLast': res.data })
          }
        })
        this.$success('操作成功')
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
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
        this.currentRow.parentCode = this.currentRow.parentCode || ''
        this.currentComponent = 'CoreForm'
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
          data.Req.parentCode = data.Req.parentCode || 0
          data.Req.ifLast = data.Req.parentCode === 0 ? false : data.Req.ifLast
          addOrder(data.Req).then(res => {
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
          data.Req.parentCode = data.Req.parentCode || 0
          data.Req.ifLast = data.Req.parentCode === 0 ? false : data.Req.ifLast
          updateOrder(data.Req).then(res => {
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
    }
  }
}
</script>
<style scoped>
</style>
