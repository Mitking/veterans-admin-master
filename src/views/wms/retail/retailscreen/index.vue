<template>
  <div>
    <keep-alive :max="2" :exclude="['AddScreenPage','Preview']">
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
        :imgs="imgList"
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
// import { addOrSaveOrder } from '@/api/wms/retailscreen'
import Form from './addScreenPage'
import Preview from './Preview' // 预览
import Order from './retailscreen'
export default {
  name: 'RetailScreenIndex',
  components: { Form, Order, Preview },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      loading: false,
      imgList: [],
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '设置组织', width: 200, prop: 'setOrgId', show: false, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, defaultValue: '', editShow: true, detailShow: false, addFatherProp: 'Req', readonly: false },
        { title: '设置门店', width: 200, prop: 'setStoreId', show: true, type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, fatherPropName: 'orgId', fatherProp: 'setOrgId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '标题', prop: 'title', width: 200, placeholder: '系统生成', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '状态', prop: 'state', width: 100, show: true, type: 'tag_click', selectData: 'if_enable', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '图片', prop: 'img', width: 80, show: true, type: 'img', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '展示开始时间', prop: 'showStartTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '展示结束时间', prop: 'showEndTime', width: 160, show: true, type: 'text', editShow: true, detailShow: false, addFatherProp: 'Req', readonly: true },
        { title: '创建时间', prop: 'createTime', width: 160, show: true, type: 'date', editShow: false, detailShow: true, addFatherProp: 'Req' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
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
      if (['detail'].includes(operateItem.prop)) { // 预览，修改
        // getScreenImgs({ screenSetid: this.currentRow.id }).then(res => {

        // }).finally(() => {
        //   operateItem.loading = false
        // })
        this.imgList = [{ imgPath: this.currentRow.img }]
        this.currentComponent = 'Preview'
        operateItem.loading = false
      } else if (operateItem.prop === 'insert') { // 新增
        this.details = []
        // orderNo({ type: 'CGHY' }).then(res => {
        //   if (res.code === 200) {
        //     this.table_data_arr[1].defaultValue = res.data
        this.currentComponent = 'Form'
        operateItem.loading = false
        //   }
        // })
      }
    },
    formSave(arg, data) { // 提交回调处理
      
      switch (arg.opt || arg) {
        case 'close': // 详情关闭
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'sub': // 提交
          this.message(data)
          // addOrSaveOrder(data).then(res => {
          //   if (res.code === 200 && arg.review) {
          //     this.review()
          //     return
          //   }
          //   this.message(res)
          // }).catch(err => {
          //   this.loading = false
          //   throw err
          // })
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
        this.$confirm(`此操作将永久删除所有选择项目，是否继续？`, '提示', {
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
