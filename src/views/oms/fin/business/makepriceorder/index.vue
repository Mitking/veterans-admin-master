<template>
  <div>
    <keep-alive :max="2" exclude="OmsForm">
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
        :form-bottons="form_bottons"
        :add_arr="[]"
        :detail_table_buttons="[]"
        :edit-detail-some-disable="true"
        @deleteDetail="deleteDetail"
        @openModel="openModel"
        @formSave="formSave"
        @currentSelect="currentRow=$event"
        @review="review"
        @exportFn="exportFn"
      />
    </keep-alive>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { addOrSaveOrder, review, getDetails, printAutoPriceDetails } from '@/api/wms/purprice'
import OmsForm from '@/views/oms/components/OmsForm'
import Order from './makepriceorder'
import dayjs from 'dayjs'
export default {
  name: 'MakePriceIndex',
  components: { OmsForm, Order },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      form_bottons: [
        { title: '导出', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { }, detailShowArgs: { }, prop: 'export', click: this.exportFn, loading: false, icon: 'el-icon-download', type: 'primary', permission: ['oms:finAutoPriceDetails:print'] },
        { title: '审核', mix_comp_buttons_show: this.mix_comp_buttons_show, editShowArgs: { auditStatus: '1' }, detailShowArgs: { auditStatus: '1' }, prop: 'review', loading: false, icon: 'el-icon-s-check', type: 'primary', permission: ['oms:finAutoPrice:review'] }
      ],
      loading: false,
      currentComponent: 'Order',
      currentRow: { id: '' }, // 当前选择数据
      operateItem: { title: '', prop: '', icon: '' },
      table_data_arr: [ // 所有字段 show：在表格中显示，formShow：在详情中显示，defaultValue：默认值
        { title: '主键', prop: 'id', show: false, disabled: true, type: 'text', defaultValue: null, editShow: true, detailShow: false, addFatherProp: 'Req' },
        { title: '定价单号', prop: 'autoPriceNo', width: 240, show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '定价日期', prop: 'priceDate', width: 150, show: true, type: 'date', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '同步门店', prop: 'storeIds', width: 200, formItemWidth: '400', formItemPercent: '50%', show: true, type: 'storeIds', selectData: 'stores', editShow: true, detailShow: true, addFatherProp: 'Req',
          rule: [{ required: true, message: '门店不能为空', trigger: 'change' }] },
        { title: '审核状态', prop: 'auditStatus', width: 100, show: true, type: 'selectState', selectData: 'audit_status', editShow: true, defaultValue: '1', detailShow: true, addFatherProp: 'Req', readonly: true },
        { title: '平均加价率', prop: 'avgMakeupRate', width: 120, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '同步基础档案', prop: 'ifSyncProduct', width: 100, show: false, defaultValue: true, type: 'if_type', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '制单人', prop: 'creatorName', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '制单时间', prop: 'createTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核人', prop: 'reviewer', width: 150, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '审核时间', prop: 'reviewerTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '更新时间', prop: 'updateTime', width: 160, show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        // { title: '打印次数', prop: 'printCount', show: true, type: 'text', editShow: false, detailShow: true, addFatherProp: 'Req' },
        { title: '备注', prop: 'remark', show: false, type: 'remark', editShow: true, detailShow: false, addFatherProp: 'Req' },
        // // { title: '附加备注', prop: 'attachRemark', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },

        { title: '主键', prop: 'id', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', tableHidden: true },
        { title: '单据号', prop: 'autoPriceNo', show: false, type: 'text', editShow: false, detailShow: false, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品代码', prop: 'goodsCode', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '商品名称', prop: 'goodsName', show: false, tabWidth: 200, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '规格', prop: 'spec', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '上次成本', prop: 'lastCostAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '本次成本单价', prop: 'price', tableWidth: 140, show: false, type: 'COST_PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '收货数量', prop: 'receiveNum', show: false, type: 'weight_number', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '总金额', prop: 'totalAmount', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '上次会员价', prop: 'lastMemberPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '系统会员价', prop: 'sysMemberPrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '会员价', prop: 'memberPrice', show: false, type: 'PRICE', editShow: true, inputFunc: this.inputMemberPriceFunc, detailShow: true, addFatherProp: 'detailReqs', readonly: false,
          rule: [{ validator: this.mixin_check_amount, trigger: 'change' }] },
        { title: '实际加价率', prop: 'makeupRate', show: false, type: 'number', suffixType: 'text', suffix: '%', float: { max: 999.99, decimal: 2 }, inputFunc: this.inputMakeupRateFunc, editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false,
          rule: [{ max: 999.99, type: 'number', transform: (v) => Number(v), message: '不能大于999.99%', trigger: 'change' }] },
        { title: '系统加价率', prop: 'sysMakeupRate', show: false, type: 'percent', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '系统零售价', prop: 'sysSalePrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: true },
        { title: '零售价', prop: 'salePrice', show: false, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'detailReqs', readonly: false }

        // { title: '备注', prop: 'remark', show: false, type: 'text', editShow: true, detailShow: true, addFatherProp: 'detailReqs' }
      ],
      details: [] // 详细数据
    }
  },
  computed: {
    formShow() {
      console.log('formShow', this.currentComponent === 'OmsForm')
      return this.currentComponent === 'OmsForm'
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
      if (['detail', 'edit'].includes(operateItem.prop)) { // 详情，修改
        getDetails({ 'autoPriceNo': this.currentRow.autoPriceNo }).then(res => {
          if (res.code === 200) {
            this.details = res.data
            this.currentComponent = 'OmsForm'
            operateItem.loading = false
          } else {
            this.$message.error('获取失败')
            operateItem.loading = false
          }
        })
      }
    },
    exportFn(e, item = null, isSure = false) {
      if (!isSure) {
        this.$confirm(`确认导出文件吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.exportFn(e, item, true)
        }).catch(() => {
          item.loading = false
          this.$message.info('已取消操作')
        })
        return
      }
      if (item) {
        item.loading = true
      }
      printAutoPriceDetails({ 'autoPriceNo': e.autoPriceNo }).then(res => {
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['商品名称', '规格', '零售价', '会员价', '乐檬商品编码', '除2', '商品价格']
          const filterVal = ['goodsName', 'spec', 'salePrice', 'memberPrice', 'itemNum', 'divide2', 'ifProductPrice']
          const list = res.data
          const data = this.formatJson(filterVal, list)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '定价单号_' + e.autoPriceNo + dayjs().format('YYYYMMDD'),
            autoWidth: true,
            bookType: 'xlsx'
          })
        })
      }).finally(() => {
        if (item) {
          item.loading = false
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'weightType') {
          return this.MenuGetPropName('weight_type', v[j], { value: '', label: '' })
        } else if (['salePrice', 'memberPrice'].includes(j)) {
          return this.fen2yuan(v[j])
        } else {
          return v[j]
        }
      }))
    },
    inputMemberPriceFunc(row) { // 会员价变动
      row.makeupRate = this.DECIMAL.sub(row.memberPrice, row.price).div(row.price).mul('100').toNumber().toFixed(2)
    },
    inputMakeupRateFunc(row) { // 加价率变动
      // row.memberPrice = row.price * (Number(row.makeupRate) + 100) / 100
      row.memberPrice = this.DECIMAL.add(row.makeupRate || '0', '100').mul(row.price).mul('0.01').toNumber()
      row.memberPriceShow = this.fen2yuan(row.memberPrice)
    },
    formSave(arg, data = { Req: {}, detailReqs: [] }, deleteDetails) { // 提交回调处理
      switch (arg.opt || arg) {
        case 'detail': // 详情关闭
          if (arg.review) {
            this.review()
            return
          }
          this.loading = false // 表单按扭
          this.currentComponent = 'Order'
          break
        case 'insert': // 新增
          data.Req.id = null
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = null
              item.autoPriceNo = data.Req.autoPriceNo
            })
          }
          // data.details = data.detailReqs
          // delete data.detailReqs
          data = Object.assign(data, data.Req)
          delete data.Req
          data.deleteDetails = []

          if (arg.review) { // 新增并审核
            this.$confirm(`确认审核吗？`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              addOrSaveOrder(data).then(res => {
                if (res.code === 200) {
                  this.review(res.data.id, true)
                }
              }).catch(err => {
                this.loading = false
                throw err
              })
            }).catch(() => {
              this.$message.info('已取消审核')
              this.loading = false
            })
            return
          }
          addOrSaveOrder(data).then(res => {
            this.message(res)
          }).catch(err => {
            this.loading = false
            throw err
          })
          break
        case 'edit': // 修改
          if (data.detailReqs.length > 0) {
            data.detailReqs.map(item => {
              item.id = item.id === '' ? null : item.id
              item.autoPriceNo = data.Req.autoPriceNo
            })
          }
          // data.details = data.detailReqs
          // delete data.detailReqs
          data.autoPriceReq = data.Req
          data.storeIds = data.autoPriceReq.storeIds
          delete data.Req
          // delete data.detailReqs
          data.deleteDetails = deleteDetails

          addOrSaveOrder(data).then(res => {
            if (res.code === 200 && arg.review) {
              this.review()
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
    review(id, isSure = false) { // 审核
      if (!isSure) {
        this.$confirm(`确认审核吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.review(id, true)
        }).catch(() => {
          this.$message.info('已取消审核')
          if (this.operateItem.prop === 'insert') {
            this.currentComponent = 'Order'
            setTimeout(() => {
              this.$refs.Comp.search()
            }, 0)
          }
          this.loading = false
        })
        return
      }
      review({ 'ids': [id || this.currentRow.id], 'auditStatus': '3' }).then(res => {
        if (res.code === 200) {
          this.message(res)
        }
      }).catch(() => {
        if (this.operateItem.prop === 'insert') {
          this.currentComponent = 'Order'
          setTimeout(() => {
            this.$refs.Comp.search()
          }, 0)
        }
        this.loading = false
      })
    },
    deleteDetail(item) {
      return new Promise(resolve => {
        this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('autoPriceNo', this.table_data_arr)}「${item.autoPriceNo}」中的「${item.goodsName}」, 是否继续?`, '提示', {
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
