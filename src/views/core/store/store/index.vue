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
        { title: 'ID', prop: 'id', width: 70, show: true, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false },
        // { title: '门店代码', prop: 'code', show: true, width: 100, type: 'Number', addFatherProp: 'Req', editShow: true, detailShow: true, formItemwidth: 160,
        // rule: [{ required: true, message: '门店代码必填', trigger: 'change' }, { max: 4, message: '门店代码不能超过4位', trigger: 'change' }, { validator: this.isNum, trigger: 'blur' }] },
        { title: '门店名称', prop: 'name', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '门店名称必填', trigger: 'change' }] },
        { title: '门店分组', prop: 'storeGroupId', width: 150, tipMsgPath: '/core/store/group', permission: 'core:storeGroup:getList', formItemwidth: 160, show: true, type: 'select', selectData: 'store_group', selectOption: { label: 'groupName', value: 'id' }, addFatherProp: 'Req', editShow: true, detailShow: true }, // selectOption:下拉框参数
        { title: '门店类型', prop: 'typeId', show: true, width: 100, type: 'select', selectData: 'store_type', addFatherProp: 'Req', editShow: false, detailShow: true, formItemwidth: 160,
          rule: [{ required: true, message: '门店类型不能为空', trigger: 'change' }] },
        { title: '门店级别', prop: 'storeLevel', show: true, width: 100, type: 'select', unselect: ['1'], disabled: true, selectData: 'store_level', addFatherProp: 'Req', editShow: false, detailShow: true, formItemwidth: 160,
          rule: [{ required: true, message: '门店级别不能为空', trigger: 'change' }] },
        { title: '乐檬门店编码', prop: 'lemengStoreNo', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '乐檬仓库编号', prop: 'storehouseNum', show: true, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '启用禁用', prop: 'enable', show: true, width: 100, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '营业开始时间', prop: 'openHoursStart', width: 120, defaultValue: '00:00', show: false, type: 'timeSf', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 150,
          rule: [{ required: true, message: '开始时间不能为空', trigger: 'change' }] },
        { title: '营业结束时间', prop: 'openHoursEnd', width: 120, defaultValue: '23:30', show: false, type: 'timeSf', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 150,
          rule: [{ required: true, message: '结束时间不能为空', trigger: 'change' }] },
        { title: '收银机数量', prop: 'cashierCount', show: false, width: 100, type: 'Number', float: { max: 30 }, suffixType: 'text', suffix: '台', addFatherProp: 'Req', editShow: false, detailShow: true, formItemWidth: 100 },
        { title: '联系人', prop: 'contactPerson', width: 150, formItemwidth: 160, show: true, click: 'addItems', type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        // { title: '联系人', prop: 'contactPersonName', width: 150, formItemwidth: 160, show: true, type: 'text', click: 'addItems', addFatherProp: 'Req', editShow: false, detailShow: false },
        { title: '联系电话', prop: 'contactPhone', width: 120, show: true, type: 'Number', float: { max: 99999999999 }, addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 150 },
        { title: '省/市/区', prop: 'area', show: false, type: 'area', addFatherProp: 'Req', editShow: true, detailShow: false },
        { title: '所在省', prop: 'province', formItemWidth: 300, width: 120, show: false, type: 'text', addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '所在城市', prop: 'city', show: false, type: 'text', width: 120, addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '所在区', prop: 'district', show: false, type: 'text', width: 120, addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '详细地址', prop: 'address', formItemWidth: 200, show: false, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '详细地址必填', trigger: 'change' }] },
        { title: '可配送范围', prop: 'deliveryRange', show: false, type: 'Number', width: 100, float: { max: 100000 }, suffixType: 'text', suffix: 'M', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 100 },
        { title: '配送费', prop: 'deliveryFee', show: false, type: 'PRICE', width: 100, addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 100 },
        { title: '免配送费金额', prop: 'dismissDeliveryFee', show: false, width: 120, type: 'PRICE', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 100 },
        // { title: '分组名称', prop: 'groupName', show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '在售商品数', prop: 'storeProductCount', width: 120, show: true, type: 'Number', addFatherProp: 'Req', editShow: false, detailShow: true, formItemWidth: 100 },
        { title: '建筑面积', prop: 'floorArea', show: false, type: 'Number', width: 120, float: { max: 99999999 }, suffixType: 'text', suffix: '㎡', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 120 },
        { title: '实际面积', prop: 'actualArea', show: false, type: 'Number', width: 120, float: { max: 99999999 }, suffixType: 'text', suffix: '㎡', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 120 },
        { title: '经营面积', prop: 'businessArea', show: true, type: 'Number', width: 120, float: { max: 99999999 }, suffixType: 'text', suffix: '㎡', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 120 },
        { title: '仓库数', prop: 'stockNum', show: true, type: 'Number', readonly: true, width: 100, float: { max: 100 }, addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 100 },
        { title: '楼层', prop: 'storey', show: false, type: 'Number', width: 100, float: { max: 10 }, suffixType: 'text', suffix: '层', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 100 },
        // { title: '所属账套编号', prop: 'groupId', show: true, type: 'text',addFatherProp: 'Req', editShow: true, detailShow: true },
        // { title: '所属企业编号', prop: 'companyId', show: true, type: 'text',addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '跨组织调拨', prop: 'allocationLimited', show: true, width: 120, type: 'if_type', selectData: 'limited', addFatherProp: 'Req', editShow: true, detailShow: true, defaultValue: '0', formItemWidth: 150 },
        // { title: '上级调拨审核', prop: 'whetherVerify', show: false, type: 'if_type', width: 120, defaultValue: true, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '经度', prop: 'latitude', tipMsg: '地图选点保留6位小数', show: false, type: 'number', width: 120, float: { max: 1000, decimal: 6 }, suffixType: 'icon', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 150 },
        { title: '纬度', prop: 'longitude', tipMsg: '地图选点保留6位小数', show: false, type: 'number', width: 120, float: { max: 1000, decimal: 6 }, suffixType: 'icon', addFatherProp: 'Req', editShow: true, detailShow: true, formItemWidth: 150 },
        { title: '备注', prop: 'remark', show: false, type: 'remark', addFatherProp: 'Req', editShow: true, detailShow: false }
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
          this.$refs.Comp.search()
        })
        // setTimeout(() => {
        //   this.$refs.Comp.search()
        // }, 0)
      } else {
        this.$error(res.data)
      }
    },
    openModel(operateItem = {}) { // 添加、修改、详情
      this.operateItem = operateItem
      operateItem.loading = true
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
          if (data.Req.openHoursStart.length <= 5) {
            data.Req.openHoursStart = data.Req.openHoursStart + ':00'
          }
          if (data.Req.openHoursEnd.length <= 5) {
            data.Req.openHoursEnd = data.Req.openHoursEnd + ':00'
          }
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
