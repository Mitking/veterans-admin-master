<template>
  <div>
    <keep-alive :max="2" exclude="WmsForm">
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
        :add_arr="[]"
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { updateOrder, addOrder } from '@/api/wms/posordertip'
import WmsForm from '@/views/wms/components/WmsForm'
import Order from './order'
export default {
  name: 'PosOrderTipIndex',
  components: { WmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '组织', width: 200, readonly: [1, 2].includes(this.$store.getters.accountType), prop: 'orgId', show: true, type: 'select', defaultValue: this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, tableHidden: [0, 3, 2].includes(this.$store.getters.accountType) ? undefined : true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '组织不能为空', trigger: 'change' }] },
        { title: '门店', width: 200, readonly: this.$store.getters.accountType === 1, prop: 'storeId', defaultValue: this.$store.getters.storeId, show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherProp: 'orgId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '提示内容', width: 400, prop: 'tip', show: true, type: 'remark', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'WmsForm')
      return this.currentComponent === 'WmsForm'
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
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'readonly', [1, 2].includes(this.$store.getters.accountType) || operateItem.prop === 'edit')
      this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'readonly', this.$store.getters.accountType === 1 || operateItem.prop === 'edit')
      if (['detail', 'edit', 'insert'].includes(operateItem.prop)) { // 详情，修改
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'orgId', 'defaultValue', this.$refs.Comp.searchForm.orgId)
        this.mixin_arr_edit_by_prop(this.table_data_arr, 'storeId', 'defaultValue', this.$refs.Comp.searchForm.storeId)
        this.details = null
        this.currentComponent = 'WmsForm'
        operateItem.loading = false
      }
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'review': // 审核
          this.review()
          break
        case 'insert': // 新增
          data.Req.id = null
          addOrder(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).finally(() => {
            this.loading = false
          })
          break
        case 'edit': // 修改
          updateOrder(data.Req).then(res => {
            if (res.code === 200 && arg.review) {
              this.review(res.data.id)
              return
            }
            this.message(res)
          }).finally(() => {
            this.loading = false
          })
          break
        default:
          console.log(arg, data)
      }
    },
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
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('code', this.table_data_arr)}「${item.code}」中的「${item.goodsName}」, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          resolve(true)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
          resolve(false)
        })
      })
    }
  }
}
</script>
<style scoped>
</style>
