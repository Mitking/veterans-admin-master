<template>
  <div class="my-class">
    <div v-if="!($attrs['operate-item'].prop==='detail') && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']" style="margin: 10px 15px 15px 10px">
      <el-button
        v-for="(item,index) in $attrs.detail_table_buttons"
        :key="index"
        size="small"
        type="primary"
        plain
        @click="opFunc(item)"
      >
        {{ item.title }}
      </el-button>
    </div>
    <div v-if="$attrs['operate-item'].prop==='detail' && $attrs.detail_table_detail_buttons" style="margin: 10px 15px 15px 10px">
      <el-button
        v-for="(item,index) in $attrs.detail_table_detail_buttons"
        :key="index"
        size="small"
        type="primary"
        plain
        @click="opFunc(item)"
      >
        {{ item.title }}
      </el-button>
    </div>
    <el-form ref="Form" :model="form">
      <el-table
        highlight-current-row
        :data="form.details"
        :style="{
          width: width_total(ArrFilter($attrs['form-data'],{addFatherProp: 'detailReqs',tableHidden:undefined}),{op:(!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']),opWidth:100}),
          margin: '10px'
        }"
        border
        :summary-method="getSummaries"
        :show-summary="$attrs.summary"
      >
        <el-table-column v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable'] && !$attrs['edit-detail-some-disable']" :width="100" fixed>
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
          :width="50"
          label="序号"
          type="index"
          align="center"
        />
        <el-table-column
          v-for="(item,index) in ArrFilter( $attrs['form-data'],propObj)"
          :key="index"
          :width="item.tableWidth || ''"
          :prop="item.prop"
        >
          <template slot="header">
            <div class="table-header">{{ item.title }}</div>
            <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="bottom" effect="light">
              <i class="el-icon-warning-outline" />
            </el-tooltip>
          </template>
          <template slot-scope="{row,$index}">
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail' || $attrs['edit-detail-disable']" style="line-height:1rem;display: flex;justify-content: center">
              <!-- 业务费用选项 -->
              <el-cascader
                v-if="item.type==='FeeList'"
                :value="Number(row[item.lastValue])"
                :disabled="true"
                :props="{
                  value:'id',
                  label:'showName',
                  leaf:'ifLast'
                }"
                :style="{'width':'100%'}"
                :options="$store.state.enum.enumList.feeSelectListLast"
              />
              <span v-else>
                {{ item.type==='select' && MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') ||
                  item.type==='PRICE' && (fen2yuan(row[item.prop]) || '0') ||
                  item.type==='PRICE_AUTOMATIC' && comp_price_auto(row,item) ||
                  item.type==='COST_PRICE' && (fen2yuan6cover(row[item.prop])) ||
                  item.type==='percent' && row[item.prop]+'%' ||
                  item.type==='number' && row[item.prop]+(item.suffix?item.suffix:'') ||
                  item.type==='weight_number' && g2kg(row[item.prop]) ||
                  item.type==='WEIGHT_AUTOMATIC' && g2kg(row[item.prop]) ||
                  item.type==='costFees' && costFeesDeal(row,item) ||
                  row[item.prop] || '-' }}</span>
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item v-else :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30px'}">
              <el-input v-if="item.type==='text'" v-model="row[item.prop]" :placeholder="item.placeholder" />
              <!--  有制约的条 -->
              <el-input
                v-if="item.type==='select' && (item.disabledBindValue?(row[item.disabledBindValue]):false)"
                :value="MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' })"
                :placeholder="item.placeholder"
                :readonly="true"
              />
              <el-select
                v-if="item.type==='select' && (item.disabledBindValue?(!row[item.disabledBindValue]):true)"
                v-model="row[item.prop]"
                class="item-select-fa"
                placeholder="请选择"
                :style="{'width':'100%'}"
                @change="()=>{if(item.selectChangeFunc)item.selectChangeFunc(row)}"
              >
                <el-option
                  v-for="itemSon in selectComputed(item,row)"
                  :key="itemSon.value"
                  :label="itemSon[item.selectOption?item.selectOption.label:'name']"
                  :value="itemSon[item.selectOption?item.selectOption.value:'value']"
                />
              </el-select>

              <el-date-picker
                v-if="item.type==='date'"
                v-model="row[item.prop]"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                class="my-class-date"
              />
              <el-date-picker
                v-if="item.type==='time'"
                v-model="row[item.prop]"
                type="datetime"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />

              <!--     弹出按列表  :value="MenuGetPropName(item.selectData,row[item.realProp],item.selectOption?item.selectOption:{ value: '', label: '' })"       -->
              <el-input
                v-if="item.type==='selectFromPage'"
                :value="item.selectData?MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }):row[item.propFromPageName || item.prop]"
                :readonly="true"
                :placeholder="item.placeholder"
                @focus="opFunc(item,$index,row)"
              />
              <div v-if="item.type==='if_type'" class="table-header">
                <span style="margin:0 3px">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>
                <el-switch
                  v-model="row[item.prop]"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <!-- 价格 -->
              <el-input
                v-if="item.type==='PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="comp_price_float(item,row,100)"
                class="my-class-price"
                :max-value="typeof item.maxValue==='function' && item.maxValue(row) || 999999999"
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
                v-number-input.float="Object.assign({decimal:2,max:999999999},item.float)"
                class="my-class-auto"
                :value="comp_price_auto(row,item)"
                :placeholder="item.placeholder || '系统计算'"
                :readonly="true"
              >
                <div slot="prefix">
                  <span>￥</span>
                </div>
              </el-input>
              <!-- 业务费用选项 -->
              <el-cascader
                v-if="item.type==='FeeList'"
                :value="[Number(item.firstValue?row[item.firstValue] : row.feeType),Number(item.lastValue?row[item.lastValue] : row.businessType)]"
                clearable
                :props="{
                  value:'id',
                  label:'showName',
                  leaf:'ifLast'
                }"
                :style="{'width':'100%'}"
                :options="$store.state.enum.enumList.feeSelectListLast"
                @change="row.businessType=$event[1];row.feeType=$event[0];row.feeName=$event[0];if(item.firstValue)row[item.firstValue]=$event[0];if(item.lastValue)row[item.lastValue]=$event[1]"
              />
              <!-- 数字（小数） -->
              <el-input
                v-if="item.type==='number'"
                v-model="row[item.prop]"
                v-number-input.float="comp_price_float(item,row,1)"
                :placeholder="item.placeholder"
                @input="()=>{if(item.inputFunc)item.inputFunc(row)}"
              >
                <div v-if="item.suffixType" slot="suffix" style="padding-right: 5px">
                  <span v-if="item.suffixType==='text'">{{ item.suffix }}</span>
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
// GetCardPageIndex settlementAmount received
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
          { decimal: Math.log10(n), max: 999999999 },
          item.float,
          {
            max: (item.float
              ? ((typeof item.float.max === 'string') && row[item.float.max] / n ||
                (typeof item.float.max === 'number') && (item.float.max || 999999999) ||
                (typeof item.float.max === 'function') && (item.float.max(row) || 999999999))
              : 999999999)
          })
      }
    },
    propObj() {
      if (this.$attrs['operate-item'].prop === 'detail') {
        return { addFatherProp: 'detailReqs', 'detailShow': true, 'tableHidden': undefined }
      }
      return { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined }
    },
    selectComputed() { // select选项集
      return function(propitem, row) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          const temp = this.enumGetproplist(propitem).filter(item => row[propitem.fatherProp] === 0 ? true : item[propitem.fatherPropName].indexOf(row[propitem.fatherProp]) !== -1)
          if (!temp.map(item => item[propitem.selectOption.value || 'value']).includes(row[propitem.prop])) {
            row[propitem.prop] = ''
          }
          return temp
        }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem, propitem.selectDataFilter) : []
      }
    },
    rules() {
      const temp_obj = { details: {}}
      this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
        if (item.rule) {
          this.$set(temp_obj.details, item.prop, item.rule)
          // temp_obj.details[item.prop] = item.rule
        }
        // Object.assign temp_obj
      })

      return temp_obj
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`oms列表${n ? '打开' : '关闭'}`)
          this.init().then(() => {
            this.$nextTick(() => {
              if (this.$listeners.dataIsChange && this.$attrs['operate-item'].prop !== 'insert') {
                this.$listeners.dataIsChange(false)
              }
            })
          })
        } else {
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
          if (this.$listeners.tabDateChange) {
            this.$listeners.tabDateChange(n)
            if (this.$listeners.dataIsChange) {
              this.$listeners.dataIsChange(true)
            }
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
            case 'type_SupplierIndex': // 供应商选择

              this.form.details[this.insertIndex].supplierId = n[0].id
              this.form.details[this.insertIndex].supplierName = n[0].name
              this.form.details[this.insertIndex].supplier = n[0].name
              return
            case 'type_User': // 人员选择

              this.form.details[this.insertIndex].participantId = n[0].id
              this.form.details[this.insertIndex].participant = n[0].surname
              return
            case 'type_StoreProductIndex': // 门店商品选择
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    goodsCode: item.goodsCode,
                    goodsName: item.goodsName,
                    price: item.price,
                    priceShow: this.fen2yuan(item.price),
                    // stockNum: (item.stockNumber || 0) + this.MenuGetPropName('weight_type', item.unitConversionRateRes.stockWeightType), 再议
                    stockNum: (item.stockNumber || 0),
                    stockNumber: (item.stockNumber || 0),
                    purUnit: item.unitConversionRateRes.purWeightType,
                    weightType: item.unitConversionRateRes.stockWeightType,
                    goodsCategoryId: item.goodsCategoryId,
                    productId: item.goodsArchiveId,
                    spec: item.spec || '',
                    totalStockNum: item.totalStockNum || '',
                    totalStockNumWeightShow: item.totalStockNum ? this.g2kg(item.totalStockNum) : '',
                    totalStockCount: item.totalStockCount || ''
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_ProductIndex': // 商品选择
              temp = n.map(item => Object.assign(
                this.deepClone(this.initFormDetailsItem),
                {
                  goodsCode: item.goodsCode,
                  goodsName: item.goodsName,
                  productId: item.id,
                  purUnit: item.unitConversionRateRes.purWeightType,
                  weightType: item.unitConversionRateRes.stockWeightType,
                  spec: item.spec,
                  price: item.price,
                  priceShow: this.fen2yuan(item.price),
                  lastPurPrice: item.lastPurPrice || ''
                }))
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_FinFranchiseeSettleIndex': // 加盟商结算单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    franchiseeSettlementNo: item.franchiseeSettleNo,
                    receivable: item.settleAmount, // 应收
                    receivedTemp: item.received || 0, // 已收款(缓存)
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
                    paidAmountTemp: item.paidAmount || 0, // 已付款(缓存)
                    paidAmount: item.paidAmount || 0, // 已付款
                    notPayAmount: item.notPaidAmount || 0, // 未付款
                    settlementAmount: 0 // 本次付款金额
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_StockReceiveIndex': // 收货单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    orderType: '3',
                    orderNo: item.receiveOrderNo,
                    amountPayable: item.supplierOrderAmount, // 汇总金额===应付金额
                    amountPayableShow: this.fen2yuan(item.supplierOrderAmount), // 汇总金额===应付金额
                    amountPaid: item.settledAmount || 0, // 已付金额
                    amountPaidShow: this.fen2yuan(item.settledAmount || 0), // 已付金额
                    notPayAmount: item.unSettledAmount || 0, // 未付金额
                    notPayAmountShow: this.fen2yuan(item.unSettledAmount || 0), // 未付金额
                    settlementAmount: item.unSettledAmount, // 本次结算金额，默认给未结金额
                    settlementAmountShow: this.fen2yuan(item.unSettledAmount), // 本次结算金额，默认给汇总金额
                    receiveDate: item.receiveDate // 日期
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_SendDeliveryIndex': // 配送单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    orderType: '2',
                    orderNo: item.deliveryNo,
                    receivable: this.DECIMAL.add((item.amount || '0'), (item.feeAmount || '0')).toNumber() || 0, // 单据金额===应收金额
                    receivableShow: this.fen2yuan(this.DECIMAL.add((item.amount || '0'), (item.feeAmount || '0')).toNumber() || 0), // 单据金额===应收金额
                    received: item.settledAmount || 0, // 已收金额
                    receivedShow: this.fen2yuan(item.settledAmount || 0), // 已收金额（元）

                    notPaid: item.unSettledAmount || 0, // 未收金额
                    notPaidShow: this.fen2yuan(item.unSettledAmount || 0), // 未收金额（元）

                    settleAmount: item.unSettledAmount || 0, // 本次结算金额，默认给单据金额
                    settleAmountShow: this.fen2yuan(item.unSettledAmount || 0), // 本次结算金额，默认给单据金额
                    deliveryDate: item.deliveryDate // 日期
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_FinFranchiseeFeeIndex': // 加盟商费用单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    orderType: '1',
                    orderNo: item.franchiseeFeeNo,
                    receivable: item.sumFeeAmount || 0, // 单据金额
                    receivableShow: this.fen2yuan(item.sumFeeAmount || 0), // 单据金额（元）
                    received: item.settledAmount || 0, // 已收金额
                    receivedShow: this.fen2yuan(item.settledAmount || 0), // 已收金额（元）
                    notPaid: item.unSettledAmount || 0, // 未收金额
                    notPaidShow: this.fen2yuan(item.unSettledAmount || 0), // 未收金额（元）
                    settleAmount: item.unSettledAmount || 0, // 本次结算金额，默认给未收金额
                    settleAmountShow: this.fen2yuan(item.unSettledAmount || 0), // 本次结算金额，默认给未收金额
                    deliveryDate: item.busDate // 日期
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_SupplierFeeIndex': // 供应商费用单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    orderType: '1',
                    orderNo: item.supplierFeeNo,
                    amountPayable: this.DECIMAL.sub('0', item.totalFee || '0').toNumber(), // 单据金额
                    amountPayableShow: this.fen2yuan(this.DECIMAL.sub('0', item.totalFee || '0').toNumber()), // 单据金额（元）
                    amountPaid: this.DECIMAL.sub('0', (item.settledAmount || '0')).toNumber(), // 已付金额
                    amountPaidShow: this.fen2yuan(this.DECIMAL.sub('0', (item.settledAmount || '0')).toNumber()), // 已付金额
                    notPayAmount: this.DECIMAL.sub('0', (item.unSettledAmount || 0)).toNumber(), // 未付金额
                    notPayAmountShow: this.fen2yuan(this.DECIMAL.sub('0', (item.unSettledAmount || 0)).toNumber()), // 未付金额
                    settlementAmount: this.DECIMAL.sub('0', (item.unSettledAmount || '0')).toNumber(), // 本次结算金额，默认给未付金额
                    settlementAmountShow: this.fen2yuan(this.DECIMAL.sub('0', (item.unSettledAmount || '0')).toNumber()), // 本次结算金额，默认给未付金额（yuan）
                    receiveDate: item.busDate // 日期
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_StockRefundIndex': // 供应商退货单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    orderType: '4',
                    orderNo: item.storageRefundNo,
                    amountPayable: this.DECIMAL.sub('0', item.orderAmount || '0').toNumber(), // 单据金额
                    amountPayableShow: this.fen2yuan(this.DECIMAL.sub('0', item.orderAmount || '0').toNumber()), // 单据金额（元）
                    amountPaid: this.DECIMAL.sub('0', (item.settledAmount || '0')).toNumber(), // 已结算金额
                    amountPaidShow: this.fen2yuan(this.DECIMAL.sub('0', (item.settledAmount || '0')).toNumber()), // 已付金额
                    notPayAmount: this.DECIMAL.sub('0', (item.unSettledAmount || 0)).toNumber(), // 未结算金额
                    notPayAmountShow: this.fen2yuan(this.DECIMAL.sub('0', (item.unSettledAmount || 0)).toNumber()), // 未付金额
                    settlementAmount: this.DECIMAL.sub('0', (item.unSettledAmount || '0')).toNumber(), // 本次结算金额，默认给未付金额
                    settlementAmountShow: this.fen2yuan(this.DECIMAL.sub('0', (item.unSettledAmount || '0')).toNumber()), // 本次结算金额，默认给未付金额（yuan）
                    receiveDate: item.refundDate // 日期
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_SendRejectIndex': // 加盟商退货单号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    orderType: '5',
                    orderNo: item.rejectNo,
                    receivable: this.DECIMAL.sub('0', item.amount || '0').toNumber(), // 单据金额
                    receivableShow: this.fen2yuan(this.DECIMAL.sub('0', item.amount || '0').toNumber()), // 单据金额（元）
                    received: this.DECIMAL.sub('0', (item.settledAmount || '0')).toNumber(), // 已结算金额
                    receivedShow: this.fen2yuan(this.DECIMAL.sub('0', (item.settledAmount || '0')).toNumber()), // 已付金额
                    notPaid: this.DECIMAL.sub('0', (item.unSettledAmount || 0)).toNumber(), // 未结算金额
                    notPaidShow: this.fen2yuan(this.DECIMAL.sub('0', (item.unSettledAmount || 0)).toNumber()), // 未付金额
                    settleAmount: this.DECIMAL.sub('0', (item.unSettledAmount || '0')).toNumber(), // 本次结算金额，默认给未付金额
                    settleAmountShow: this.fen2yuan(this.DECIMAL.sub('0', (item.unSettledAmount || '0')).toNumber()), // 本次结算金额，默认给未付金额（yuan）
                    deliveryDate: item.rejectDate // 日期
                  })
              )
              if (this.$attrs.curr_id) {
                temp[0].id = this.$attrs.curr_id
              }
              break
            case 'type_GetCardPageIndex': // 礼品卡号
              temp = n.map(item =>
                Object.assign(
                  this.deepClone(this.initFormDetailsItem),
                  {
                    id: item.id,
                    cardNo: item.cardNo,
                    cardName: item.cardName,
                    state: item.state,
                    cardType: item.cardType,
                    amount: item.amount,
                    discount: item.discount || 0,
                    salePrice: item.salePrice,
                    ifRead: true
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
            // if (this.window_add_select_value === '' && (this.insertIndex + 1) === this.form.details.length) { // 被点击输入框内容为空并且是最后一个
            //   this.form.details.insert(this.insertIndex, ...temp)
            // this.form.details[this.form.details.length - 1] = this.deepClone(this.initFormDetailsItem)
            // } else { // 不为空，插入并拿掉被选择项目
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
          this.form.details = this.deepClone(this.$attrs.details)
          return resolve(true)
        }
        const temp = {}
        this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
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
            const weightK = this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true, type: 'weight_number' }).map(itemK => itemK.prop)
            // const selectK = this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true, type: 'select', selectValueType: undefined }).map(itemK => itemK.prop)
            this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => { // 初始化数组对象数据为空
              temp[item.prop] = ''
            })
            this.form.details = this.$attrs.details.length > 0
              ? this.$attrs.details.map(itemD => {
                Object.keys(itemD).map(key => {
                  if (priceK.includes(key)) {
                    itemD[key + 'Show'] = this.fen2yuan(itemD[key])
                  }
                  if (weightK.includes(key)) {
                    itemD[key + 'WeightShow'] = this.g2kg(itemD[key])
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
      if (typeof e.windowName === 'object' && !row[e.typeName]) {
        this.$message.error(`请先选择${e.typeTitleName}`)
        return
      }
      if (e.click === 'addItem') {
        this.addItem(null, this.form.details.length)
        return
      }
      if (e.click === 'affix') { // 附件
        this.$emit('update:affixShow', true)
        return
      }

      if (e.click === 'edits_discounts') { // 批量写折扣价
        this.$confirm(`此操作将覆盖表中原折扣价, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.form.details.map(item => {
            item.discount = this.$attrs.form_data.discount || 0
            item.discountShow = this.fen2yuan(this.$attrs.form_data.discount)
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })
        })
        return
      }

      const temp = {}
      if (e.formProData) { // 存在检索范围
        Object.keys(e.formProData).map(key => { // 检索字段keys
          temp[key] = e.formProData[key] === '' ? this.$attrs.form_data[key] : e.formProData[key]
        })
      }
      if (Object.values(temp).some(value => (value === '' || value === undefined))) { // 字段先头选择较验
        const nameList = {
          storeId: '门店',
          orgId: '组织',
          applyStoreId: '申请门店',
          shipStoreId: '发货门店',
          receiptStoreId: '收货门店',
          storageStoreId: '入库门店',
          adjustmentStore: '调价门店',
          shipStockId: '发货仓库',
          stockId: '仓库',
          receiptStockId: '收货仓库',
          storageStockId: '入库仓库',
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
        temp.orgId = this.$attrs.form_data.settleOrgId
        delete temp.settleOrgId
      }
      // if (temp.storeId !== undefined) { // (收货)门店
      //   temp.receiveStoreId = this.$attrs.form_data.storeId
      //   // delete temp.storeId
      // }
      if (temp.supplier !== undefined || temp.supplierId !== undefined) { // 供应商
        temp.supplierName = this.$attrs.form_data.supplier
        temp.supplier = this.$attrs.form_data.supplier
        temp.supplierId = this.$attrs.form_data.supplierId
        delete temp.supplier
      }
      if (temp.applyStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.form_data.applyStoreId
        delete temp.applyStoreId
      }
      if (temp.shipStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.form_data.shipStoreId
        delete temp.shipStoreId
      }
      if (temp.receiptStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.form_data.receiptStoreId
        delete temp.receiptStoreId
      }
      if (temp.storageStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.form_data.storageStoreId
        delete temp.storageStoreId
      }
      if (temp.adjustmentStore !== undefined) { // 审请门店
        temp.storeId = this.$attrs.form_data.adjustmentStore
        delete temp.adjustmentStore
      }
      if (temp.shipStockId !== undefined) { // 审请门店
        temp.stockId = this.$attrs.form_data.shipStockId
        delete temp.shipStockId
      }
      if (temp.receiptStockId !== undefined) { // 审请门店
        temp.stockId = this.$attrs.form_data.receiptStockId
        delete temp.receiptStockId
      }
      if (temp.storageStockId !== undefined) { // 审请门店
        temp.stockId = this.$attrs.form_data.storageStockId
        delete temp.storageStockId
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
.operator-father{
  display: flex;
  width:100%;
  justify-content: space-around;
  font-size: 1.25rem;
}
.my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}
.my-class >>> .el-table th  {
    padding: 10px 0px;
}
.my-class >>> .el-table td {
    padding: 6px 3px;
    /* margin: 10px 8px; */
}
.my-class .my-class-table >>> .el-form-item{
 margin-bottom:6px;
 /* margin-top:6px */
}
.el-table .cell{
 padding:8px
}
.my-class >>> .el-input__inner{
 padding:0 3px
}
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
.my-class >>> .el-form-item{
  margin-bottom:10px
}
.my-class .my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
  padding:0 3px 0 20px
}
.my-class .my-class-price >>> .el-input__inner{
  padding:0 3px 0 20px
}
.my-class .my-class-date >>> .el-input__inner{
  padding:0 3px 0 30px
}

.my-class .my-number-weight-class >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}

.my-class .my-class-semi-auto >>> .el-input__inner{
  color: #493cff;
  font-weight: 600;
  padding:0 3px 0 20px

}
.flex-center{
 display: flex;
 justify-content: center;
 align-items: center;
}
</style>
