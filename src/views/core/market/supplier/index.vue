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
        v-bind="$attrs"
        v-on="$listeners"
        @formChange="formChange"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="(e)=>{currentRow=e}"
      />
    </keep-alive>
    <!-- 详情弹窗 -->
    <el-dialog
      class="my-class"
      title="单据详情"
      :visible.sync="detailFormShow"
      :modal-append-to-body="false"
      fullscreen
      :modal="false"
    >
      <component
        :is="'CoreForm'"
        :show="detailFormShow?'CoreForm':''"
        :current-row="currentRow"
        :form-data="table_data_arr"
        :operate-item="operateItem"
        :details="details"
        :is_child="$attrs.is_child"
        :add_arr="[]"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailFormShow = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addSupplier, updateSupplier } from '@/api/core/supplier'
import CoreForm from '@/views/core/components/CoreForm'
import Order from './supplier'
import pinyin from 'chinese-to-pinyin'
export default {
  name: 'SupplierIndex',
  components: { CoreForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const checkCycle = function(rule, value, callback) {
      if (!value || value[0] === '0') {
        callback(new Error('不能为空或0'))
      } else {
        callback()
      }
    }
    return {
      detailFormShow: false,
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, addFatherProp: 'Req', editShow: false, detailShow: false },
        { title: '供应商名称', prop: 'name', width: 300, show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '供应商名称必填', trigger: 'change' }] },
        // { title: '供应商代码', prop: 'supplierCode', width: 100, show: true, type: 'text', addFatherProp: 'Req', editShow: false, detailShow: true,
        //   rule: [{ required: true, message: '供应商代码必填', trigger: 'change' }] },
        { title: '速记码', prop: 'supplierShortCode', width: 150, show: false, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '所属市场', prop: 'supplierGroupId', width: 200, tipMsgPath: '/core/market/group', permission: 'core:supplierGroup:getList', show: true, type: 'select', selectData: 'supplier_group', selectOption: { label: 'groupName', value: 'id' }, addFatherProp: 'Req', editShow: true, detailShow: true,
          rule: [{ required: true, message: '所属市场不能为空', trigger: 'change' }] },
        { title: '是否启用', prop: 'enable', show: true, width: 100, type: 'if_enable', defaultValue: true, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '省/市/区', prop: 'area', show: false, type: 'area', addFatherProp: 'Req', editShow: true, detailShow: false },
        { title: '省', prop: 'province', show: false, type: 'text', width: 100, addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '市', prop: 'city', show: false, type: 'text', width: 100, addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '区', prop: 'district', show: false, type: 'text', width: 100, addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '详细地址', prop: 'address', show: true, type: 'text', width: 400, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '经营方式', prop: 'businessMode', show: true, type: 'select', width: 100, selectData: 'business_mode', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '供应商级别', prop: 'level', show: true, type: 'select', width: 150, selectData: 'supplier_level', addFatherProp: 'Req', editShow: true, formItemwidth: 160, detailShow: true },
        { title: '供应商属性', prop: 'attribute', show: true, type: 'select', width: 150, selectData: 'supplier_attr', addFatherProp: 'Req', editShow: true, formItemwidth: 160, detailShow: true },
        { title: '供应商类型', prop: 'typeId', show: true, type: 'select', width: 150, selectData: 'supplier_type', addFatherProp: 'Req', editShow: true, formItemwidth: 160, detailShow: true },
        // { title: '所属市场', prop: 'market', show: true, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '经度', prop: 'latitude', tipMsg: '地图选点保留6位小数', show: false, type: 'number', width: 100, float: { max: 1000, decimal: 6 }, suffixType: 'icon', addFatherProp: 'Req', formItemwidth: 160, editShow: true, detailShow: true },
        { title: '纬度', prop: 'longitude', tipMsg: '地图选点保留6位小数', show: false, type: 'number', width: 100, float: { max: 1000, decimal: 6 }, suffixType: 'icon', addFatherProp: 'Req', formItemwidth: 160, editShow: true, detailShow: true },
        { title: '供应商品质', prop: 'quality', show: true, type: 'text', placeholder: '优良低劣等', width: 120, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '市场内位置', prop: 'marketPosition', show: true, width: 150, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '银行名称', prop: 'bankName', show: true, width: 400, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '银行账号', prop: 'bankNo', show: false, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '开户银行', prop: 'openBank', show: false, width: 200, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '税号', prop: 'taxNo', show: false, type: 'text', width: 200, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '可用额度', prop: 'availableQuota', show: true, type: 'PRICE', suffix: 'el-icon-warning-outline', tipMsg: '可用额度=信用额度+预付款-未结算总额', width: 150, addFatherProp: 'Req', editShow: false, detailShow: true },
        { title: '信用额度', prop: 'creditQuota', show: true, type: 'PRICE', width: 150, addFatherProp: 'Req', editShow: true, detailShow: true },
        { title: '结算方式', prop: 'settlementMode', show: true, width: 100, type: 'select', selectData: 'settle_mode', addFatherProp: 'Req', editShow: true, detailShow: true, formItemwidth: 160,
          rule: [{ required: true, message: '结算方式不能为空', trigger: 'change' }] },
        { title: '账期类型', prop: 'settlementType', show: false, width: 100, type: 'select', selectData: 'settle_type', defaultValue: '', addFatherProp: 'Req', editShow: true, detailShow: true, fa_show: { settlementMode: '2' }, formItemwidth: 160,
          rule: [{ required: true, message: '账期类型不能为空', trigger: 'change' }] },
        { title: '结账周期', prop: 'settlementCycle', show: false, width: 100, type: 'Number', addFatherProp: 'Req', defaultValue: '', editShow: true, detailShow: true, fa_show: { settlementType: '1', settlementMode: '2' }, formItemwidth: 160,
          rule: [{ validator: checkCycle, trigger: 'change' }] }, // fa_show:父级联动字段
        { title: '结算日', prop: 'settlementDay', show: false, width: 100, type: 'text', addFatherProp: 'Req', editShow: true, detailShow: true, formItemwidth: 160, fa_show: { settlementType: '2', settlementMode: '2' },
          rule: [{ validator: checkCycle, trigger: 'change' }] },
        { title: '周期单位', prop: 'cycleUnit', show: false, width: 100, type: 'select', selectData: 'unit_time', defaultValue: '', addFatherProp: 'Req', editShow: true, detailShow: true, fa_show: { settlementMode: '2' }, formItemWidth: 100,
          rule: [{ required: true, message: '周期单位不能为空', trigger: 'change' }] },
        { title: '备注', prop: 'remark', show: false, type: 'remark', addFatherProp: 'Req', editShow: true, detailShow: false }
      ],
      details: [], // 详细数据
      TEMP_NAME: '' // 供应商名缓存
    }
  },
  computed: {
    formShow() {
      return this.currentComponent === 'CoreForm'
    }
  },
  watch: {},
  created() {},
  methods: {
    formChange(form) {
      if (form !== false) {
        this.table_data_arr.map(item => {
          if (item.fa_show) {
            this.$set(item, 'editShow', Object.keys(item.fa_show).every(itemz => form[itemz] === item.fa_show[itemz]))
          }
        })
        const P = pinyin(form.name, { firstCharacter: true, heteronym: false, removeTone: true, removeSpace: true, keepRest: true }).toLocaleUpperCase()
        if (this.operateItem.prop === 'insert' &&
        form.name &&
      this.TEMP_NAME !== this.$json_copy(form.name) // 函数控制单个字段监听！！
        ) {
          form.supplierShortCode = P
        }
        if (this.operateItem.prop === 'insert' &&
        !form.name &&
        this.TEMP_NAME !== this.$json_copy(form.name) // 函数控制单个字段监听！！
        ) {
          form.supplierShortCode = ''
        }
        this.TEMP_NAME = this.$json_copy(form.name)
      }
    },
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
        if (this.$attrs.is_child) { // 选单时弹窗展示详情
          this.detailFormShow = true
        } else {
          this.currentComponent = 'CoreForm'
        }
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
          data.Req.settlementDay = data.Req.settlementType === '1' ? '0' : data.Req.settlementDay
          data.Req.settlementCycle = data.Req.settlementType === '2' ? '0' : data.Req.settlementCycle
          addSupplier(data.Req).then(res => {
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

          data.Req.settlementDay = data.Req.settlementType === '1' ? '0' : data.Req.settlementDay
          data.Req.settlementCycle = data.Req.settlementType === '2' ? '0' : data.Req.settlementCycle
          updateSupplier(data.Req).then(res => {
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
