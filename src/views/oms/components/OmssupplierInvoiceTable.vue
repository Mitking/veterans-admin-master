<template>
  <div class="my-class">
    <el-form ref="Form" :model="form">
      <el-table
        :data="form.details"
        :style="{
          width: width_total(ArrFilter($attrs['form-data'],{addFatherProp: 'settle',tableHidden:undefined}),{op:(!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']),opWidth:100}),
          margin: '10px'
        }"
        border
        :summary-method="getSummaries"
        :show-summary="$attrs.summary"
      >
        <el-table-column v-if="!($attrs['operate-item'].prop==='detail')" :width="100" fixed>
          <template slot="header">
            <div class="table-header">操作</div>
          </template>
          <template slot-scope="{row,$index}">
            <div class="operator-father">
              <i style="color:#409EFF" class="el-icon-delete" @click="deleteItem(row,$index)" />
              <i style="color:#409EFF" class="el-icon-circle-plus-outline" @click="addItem(row,$index)" />
            </div>
          </template>
        </el-table-column>

        <el-table-column
          v-for="(item,index) in ArrFilter( $attrs['form-data'],propObj)"
          :key="index"
          :width="item.tableWidth || 180"
          :prop="item.prop"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
          </template>
          <template slot-scope="{row,$index}">

            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail'" style="display: flex;justify-content: center">
              {{ item.type==='PRICE' && fen2yuan(row[item.prop]).toString() || row[item.prop] || '-' }}
            </div>
            <el-form-item v-else :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30px'}">
              <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder" />
              <!--     弹出按列表 "       -->
              <el-input
                v-if="item.type==='selectFromPage'"
                :value="row[item.propFromPageName || item.prop]"
                :readonly="true"
                :placeholder="item.placeholder"
                @focus="opFunc(item,$index,row)"
              />
              <!-- 价格 -->
              <el-input
                v-if="item.type==='PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="comp_price_float(item,row,100)"
                :max-value="typeof item.maxValue==='function' && item.maxValue(row)"
                :readonly="item.readonly"
                :placeholder="item.placeholder || ''"
                @input="()=>{if(item.inputFunc){item.inputFunc(row)}row[item.prop]=yuan2fen(row[item.prop+'Show'])}"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>
              <!-- 价格计算 -->
              <el-input
                v-if="item.type==='PRICE_AUTOMATIC'"
                v-number-input.float="Object.assign({decimal:2,max:999999},item.float)"
                class="my-class-auto"
                :value="comp_price_auto(row,item)"
                :placeholder="item.placeholder || '系统计算'"
                :readonly="true"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>
              <template slot="error" slot-scope="{error}">
                <span style="position: absolute;right: .5rem;font-size:0.7rem;color:#ff0000;pointer-events:none">{{ error }}</span>
              </template>
            </el-form-item>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
// GetCardPageIndex
export default {
  name: 'OmsTable',
  data() {
    return {
      form: { details: [] },
      initFormDetailsItem: {},
      deleteDetails: [],
      summary: []
    }
  },
  computed: {
    width_total() { // 表格总宽度计算
      return function(arr, widthArg = null) { //
        return arr.map(item => ((widthArg && item[widthArg.widthProp]) ? item[widthArg.widthProp] : item.tableWidth) || 180)
          .reduce((curr, prev) => (curr + prev), 1 + (widthArg && widthArg.op ? widthArg.opWidth : 0)) + 'px'
      }
    },
    comp_price_auto() { // 自动计算价格
      return function(row, item) {
        const arg = item.arg.map(item => row[item])
        row[item.prop] = item.design(...arg)
        return this.fen2yuan(row[item.prop])
      }
    },
    comp_price_float() {
      return function(item, row, n) {
        return Object.assign(
          { decimal: Math.log10(n), max: 999999 },
          item.float,
          {
            max: (item.float
              ? ((typeof item.float.max === 'string') && row[item.float.max] / n ||
                (typeof item.float.max === 'number') && (item.float.max || 999999) ||
                (typeof item.float.max === 'function') && (item.float.max(row) || 999999))
              : 999999)
          })
      }
    },
    propObj() {
      if (this.$attrs['operate-item'].prop === 'detail') {
        return { addFatherProp: 'settle', 'detailShow': true, 'tableHidden': undefined }
      }
      return { addFatherProp: 'settle', 'editShow': true, 'tableHidden': undefined }
    },
    rules() {
      const temp_obj = { details: {}}
      this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'settle', 'editShow': true }).map(item => {
        if (item.rule) {
          this.$set(temp_obj.details, item.prop, item.rule)
        }
      })

      return temp_obj
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`oms结算单列表${n ? '打开' : '关闭'}`)
          this.init().then(() => {
            this.$nextTick(() => {
              if (this.$listeners.dataIsChange && this.$attrs['operate-item'].prop !== 'insert') {
                this.$listeners.dataIsChange(false)
              }
            })
          })
        } else { // 关闭时，重置表单
          if (this.$refs.Form) {
            this.$refs.Form.resetFields()
          }
        }
      },
      immediate: true
    },
    'form.details': { // 监听表格数据
      handler(n) {
        if (n) {
          // if (this.$listeners.tabDateChange) {
          //   this.$listeners.tabDateChange(n)
          // }
          if (this.$listeners.dataIsChange) {
            this.$listeners.dataIsChange(true)
          }
        }
      },
      deep: true,
      immediate: true
    },
    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        //
        if (n.length > 0) {
          let temp = []

          if (this.$attrs.select_window_name.split('_')[0] === 'form') {
            return
          }

          switch (this.$attrs.select_window_name) {
            case 'type_FinFranchiseeSettleIndex': // 结算单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    franchiseeSettlementNo: item.franchiseeSettleNo,
                    receivable: item.settleAmount, // 应收
                    received: item.received, // 已收
                    notPaid: item.notPaid // 未收
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_SupplierSettleIndex': // 供应商结算单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    settlementOrderNo: item.supplierSettlementNo,
                    payableAmount: item.settlementAmount || 0, // 应付款
                    paidAmount: item.paidAmount || 0, // 已付款
                    notPayAmount: item.notPaidAmount || 0, // 未付款
                    settlementAmount: item.notPaidAmount || 0
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
          }
          temp.map(item => {
            Object.keys(item).map(resItem => { // 去掉没用的字段
              if (!Object.keys(this.initFormDetailsItem).includes(resItem)) {
                delete item[resItem]
              }
            })
          })
          if (this.insertIndex !== null) {
            this.form.details.insert(this.insertIndex + 1, ...temp)
            this.form.details.splice(this.insertIndex, 1)
            // }
          } else { // 批量添加
            this.form.details.push(...temp)
          }
          this.$listeners.clearAddArr()
        }
      },
      immediate: true
    }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        this.deleteDetails = []
        this.$attrs['form-data'].map(item => {
          if (item.summary) {
            this.summary.push(item.prop)
          }
        })
        if (this.$attrs['operate-item'].prop === 'detail') { // 详情
          this.form.details = this.deepClone(this.$attrs.settle_details)
          return resolve(true)
        }
        const temp = {}
        this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'settle', 'editShow': true }).map(item => {
          if (item.summary) {
            this.summary.push(item.prop)
          }
          temp[item.prop] = item.defaultValue === undefined ? '' : item.defaultValue
          if (item.type === 'PRICE') {
            temp[item.prop + 'Show'] = ''
          }
        })
        this.initFormDetailsItem = this.deepClone(temp)

        if (['edit', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改
          if (this.$attrs['operate-item'].prop === 'insert') { // 创建
            this.form.details = [this.deepClone(this.initFormDetailsItem)]
          } else { // 修改
            const priceK = this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true, type: 'PRICE' }).map(itemK => itemK.prop)
            this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => { // 初始化数组对象数据为空
              temp[item.prop] = ''
            })
            this.form.details = this.$attrs.details.length > 0
              ? this.$attrs.details.map(itemD => {
                Object.keys(itemD).map(key => {
                  if (priceK.includes(key)) {
                    itemD[key + 'Show'] = this.fen2yuan(itemD[key])
                  }
                })

                return this.deepClone(Object.assign(temp, itemD))
              })
              : [this.deepClone(this.initFormDetailsItem)]
          }
        }
        resolve(true)
      })
    },
    getCheckedNodes(e, row) {

    },
    deleteItem(row, i) {
      if (row.id) {
        this.$listeners.deleteDetail(row).then(res => {
          if (res) {
            this.deleteDetails.push(row.id)
            if (this.form.details.length === 1) {
              console.log('剩一项了')
              this.$set(this.form.details, 0, this.deepClone(this.initFormDetailsItem))
            } else {
              this.form.details.splice(i, 1)
            }
          }
        })
      } else {
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          // const temp = this.deepClone(this.form)
          this.$set(this.form.details, 0, this.deepClone(this.initFormDetailsItem))
        } else {
          this.form.details.splice(i, 1)
        }
      }
    },
    opFunc(e, i = null, row = { id: null }) {
      const temp = {}
      if (e.formProData) { // 存在检索范围
        Object.keys(e.formProData).map(key => { // 检索字段keys
          temp[key] = e.formProData[key] === '' ? this.$attrs.invoice_form_data[key] : e.formProData[key]
        })
      }
      if (Object.values(temp).some(value => (value === '' || value === undefined))) { // 字段先头选择较验
        const nameList = {
          orgId: '组织',
          franchiseeId: '加盟商',
          settleOrgId: '加盟商',
          supplierId: '供应商',
          supplier: '供应商'
        }
        for (const key of Object.keys(temp)) {
          if (temp[key] === '' || temp[key] === undefined) {
            this.$message.error(`请先选择${nameList[key]}`)
            return
          }
        }
      }
      if (temp.settleOrgId !== undefined) { // 加盟商：组织
        temp.receiveOrgId = this.$attrs.form_data.settleOrgId
        temp.franchiseeOrgId = this.$attrs.form_data.settleOrgId
        delete temp.settleOrgId
      }

      if (temp.supplier !== undefined || temp.supplierId !== undefined) { // 供应商
        temp.supplierName = this.$attrs.form_data.supplier
        temp.supplier = this.$attrs.form_data.supplier
        temp.supplierId = this.$attrs.form_data.supplierId
        delete temp.supplier
      }
      if (temp.franchiseeId !== undefined) { // 结算单组织
        temp.settleOrgId = this.$attrs.form_data.franchiseeId
        delete temp.franchiseeId
      }

      this.insertIndex = i
      if (i !== null && e.prop) {
        this.window_add_select_value = this.form.details[i][e.prop] // 被点击的值
      } else {
        this.window_add_select_value = null
      }
      switch (e.click) {
        case 'addItems': // 打开选择列表
          console.log('formProData:', temp)
          this.$listeners.openSelectWindow({
            name: typeof e.windowName === 'string' ? e.windowName : e.windowName[row[e.typeName]],
            addedList: this.form.details,
            formProData: temp,
            curr: row }) // 固定选择范围
          break
      }
    },
    addItem(row, i) {
      this.form.details.splice((i + 1), 0, this.deepClone(this.initFormDetailsItem))
    },
    test() {
      // this.$refs.Form.resetField()
      this.$refs.Form.resetFields()
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value)) && this.summary.includes(column.property)) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
        } else {
          sums[index] = '-'
        }
      })
      return sums.map(item => this.fen2yuan(item))
    }
  }
}
</script>

<style scoped>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.table-header{
  display: flex;
  justify-content: center;
}
.footer-fa{
  display: flex;
  /*border: 1px solid blue;*/
  flex-direction: column;
  width: 85%;
}
.operator-father{
  display: flex;
  width:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}
.my-class >>> .el-form-item{
  margin-bottom:10px
}
.my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}
</style>
