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
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addAssociateOrder, updateAssociateOrder } from '@/api/oms/fin/feemanage'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './feeassociate'
export default {
  name: 'FeeAssociateIndex',
  components: { CoreForm, Order },
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
        { title: '关联项目', prop: 'assoProject', show: true, type: 'select', selectData: 'project', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '关联项目不能为空', trigger: 'change' }] },
        { title: '科目编码', prop: 'sujectCode', width: 200, show: true, type: 'text', addFatherProp: 'Req', editShow: false },
        { title: '费用名称', prop: 'feeId', show: false, type: 'FeeListId', checkStrictly: false, selectData: 'feeSelectListLast', addFatherProp: 'Req', editShow: true,
          rule: [{ required: true, message: '费用名称必填', trigger: 'change' }] },
        { title: '费用名称', prop: 'feeName', show: true, type: 'text', addFatherProp: 'Req', editShow: false },
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
    message(res) {
      if (res.code === 200) {
        this.currentComponent = 'Order'
        this.$success('操作成功')
        setTimeout(() => {
          this.$refs.Comp.search()
        }, 0)
      } else {
        this.$error(res.data)
      }
      this.loading = false
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
      if (['detail', 'edit', 'insert', 'copy'].includes(operateItem.prop)) { // 详情，修改,复制
        this.details = null
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
          addAssociateOrder(data.Req).then(res => {
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
          updateAssociateOrder(data.Req).then(res => {
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
