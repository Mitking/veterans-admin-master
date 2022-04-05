<template>
  <div>
    <keep-alive :max="2" :exclude="['WmsForm']">
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
import { save } from '@/api/wms/retailposregister'
import Form from '@/views/wms/components/WmsForm'
import Order from './retailposregister'
export default {
  name: 'RetailPosRegisterIndex',
  components: { Form, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: null }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: 'POS机名称', width: 200, prop: 'deviceName', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false,
          rule: [{ required: true, message: 'POS机名称不能为空', trigger: 'change' }] },
        { title: '设备识别码', width: 260, prop: 'deviceCode', type: 'text', show: true, editShow: true, detailShow: true, addFatherProp: 'Req', readonly: false,
          rule: [{ required: true, message: '设备识别码不能为空', trigger: 'change' }] },
        { title: '启用状态', width: 150, prop: 'enableFlag', show: true, type: 'tag_click', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '设备状态', width: 150, prop: 'state', show: true, type: 'select', selectData: 'pos_state', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '设备组织', width: 200, prop: 'deviceOrgId', show: true, type: 'select', defaultValue: 0, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '组织不能为空', trigger: 'change' }] },
        { title: '设备门店', width: 200, prop: 'deviceStoreId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherPropName: 'orgId', fatherProp: 'deviceOrgId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        // { title: '设备所在门店名', prop: 'storeName', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '扣减仓库名', prop: 'stockName', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '扣减仓库', width: 200, prop: 'deductionStockId', show: true, type: 'select', selectData: 'stockId', selectOption: { label: 'stockName', value: 'id' }, fatherProp: 'deviceStoreId', fatherPropName: 'storeId', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '扣减仓库不能为空', trigger: 'change' }] },
        { title: '创建时间', width: 160, prop: 'createTime', show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: true, type: 'remark', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'Form')
      return this.currentComponent === 'Form'
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
      if (['edit'].includes(operateItem.prop)) { // 修改
        this.details = null
        this.currentComponent = 'Form'
        operateItem.loading = false
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = null
        this.currentComponent = 'Form'
        operateItem.loading = false
      }
    },
    formSave(arg, data) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'close':case 'detail': // 详情关闭
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert':case 'edit': // 修改，新增
          data.postRegisterList = [data.Req]
          delete data.Req
          data.deleteIds = []
          save(data).then(res => {
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
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('adjustmentOrderNo', this.table_data_arr)}「${item.adjustmentOrderNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
