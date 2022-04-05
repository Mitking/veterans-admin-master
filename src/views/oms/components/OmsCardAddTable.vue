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
    <!--   :rules="rules" :rules="rules"-->
    <el-form ref="Form" :model="form">
      <el-table
        v-loading="loading"
        :data="form.details"
        :style="{
          width: width_total(ArrFilter($attrs['form-data'],$attrs['operate-item'].prop==='insert'?{addFatherProp: 'detailReqs',tableHidden:undefined,editShow:true}:{addFatherProp: 'detailReqs',tableHidden:undefined}),{op:true,opWidth:['edit','insert'].includes($attrs['operate-item'].prop)?150:50}),
          margin: '10px'
        }"
        border
        :summary-method="getSummaries"
        :show-summary="$attrs.summary"
      >
        <el-table-column v-if="!($attrs['operate-item'].prop==='detail') && form.details.length>0 && !$attrs['edit-detail-disable']" :width="100" fixed>
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
          :width="item.tableWidth || 180"
          :prop="item.prop"
        >
          <template slot="header">
            <div class="table-header">
              <div>{{ item.title }}</div>
              <el-tooltip v-if="item.tipMsg && !$store.state.app.tooltipDisabled" :content="item.tipMsg" placement="top" effect="light">
                <i class="el-icon-warning-outline" />
              </el-tooltip>
            </div>
          </template>
          <template slot-scope="{row,$index}">
            <div v-if="item.readonly || $attrs['operate-item'].prop==='detail' || $attrs['edit-detail-disable']" style="display: flex;justify-content: center">
              {{
                item.type==='select' && MenuGetPropName(item.selectData,row[item.prop])
                  || item.type==='if_type' && MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false')
                  || ['PRICE','PRICE_AUTOMATIC'].includes(item.type) && fen2yuan(row[item.prop])
                  || row[item.prop] || '-'
              }}
            </div>
            <!--:prop="`Arrays[${scope.$index}].rule.name`"    :prop="`details[${scope.$index}][${item.prop}]`"   <el-form ref="form" class="form-fa" :rules="rules" :model="form" label-width="100px">   -->
            <el-form-item v-else :prop="`details[${$index}][${item.prop}]`" :rules="item.rule" :style="{'width':'100%','height':'30px'}">
              <el-input v-if="item.type==='text'" :ref="item.prop+$index" v-model="row[item.prop]" :placeholder="item.placeholder || ''" @input="(key)=>inputFn(item,row,key,$index)" @keyup.enter.native="inputFn(item,row,'enter',$index)" />
              <el-input v-if="item.type==='number'" v-model.number="row[item.prop]" :placeholder="item.placeholder || ''" />
              <el-select v-if="item.type==='select'" v-model="row[item.prop]" class="item-select-fa" placeholder="请选择" :style="{'width':'100%'}">
                <el-option
                  v-for="itemSon in selectComputed(item)"
                  :key="itemSon.value"
                  :label="itemSon.name"
                  :value="itemSon.value"
                />
              </el-select>
              <el-date-picker
                v-if="item.type==='date'"
                v-model="row[item.prop]"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
              <div v-if="item.type==='if_type'" class="table-header">
                <span style="margin:0 3px">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>
                <el-switch
                  v-model="row[item.prop]"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </div>
              <!--     弹出按列表  -->
              <el-input
                v-if="item.type==='selectFromPage'"
                :value="item.selectData?MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }):row[item.propFromPageName || item.prop]"
                :readonly="true"
                :placeholder="item.placeholder"
                @focus="openFunc(item,$index,row)"
              />
              <!-- 价格 -->
              <el-input
                v-if="item.type==='PRICE'"
                v-model="row[item.prop+'Show']"
                v-number-input.float="comp_price_float(item,row,100)"
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
import { getCardList } from '@/api/oms/card/getcardpage'
export default {
  name: 'OmsCardIssueTable',
  data() {
    return {
      form: { details: [] },
      initFormDetailsItem: {},
      deleteDetails: [],
      summary: [],
      loading: false
    }
  },
  computed: {
    formProData() { // 检索范围
      if (this.$store.getters.accountType === 3) { // 账套级别
        return ({})
      } else if (this.$store.getters.accountType === 2) { // 组织级别
        return ({ orgId: this.$store.getters.orgId })
      } else {
        return ({ orgId: this.$store.getters.orgId, storeId: this.$store.getters.storeId })
      }
    },
    width_total() { // 表格总宽度计算
      return function(arr, widthArg = null) {
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
        return { addFatherProp: 'detailReqs', 'detailShow': true, 'tableHidden': undefined }
      }
      return { addFatherProp: 'detailReqs', 'editShow': true, 'tableHidden': undefined }
    },
    selectComputed() { // select选项集 检索字段keys
      return function(propitem) {
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item.value).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        return this.enumGetproplist(propitem) ? this.enumGetproplist(propitem) : this[propitem.selectData]
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
          console.log(`wms列表${n ? '打开' : '关闭'}`)
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
    'form.details': {
      handler(n) {
        if (this.$listeners.tabDateChange) {
          this.$listeners.tabDateChange(n)
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
        if (n.length > 0) {
          let temp = []

          if (this.$attrs.select_window_name.split('_')[0] === 'form') {
            return
          }
          temp = n.map(item =>
            Object.assign(
              this.deepClone(this.initFormDetailsItem),
              {
                // id: item.id,
                faceNo: item.faceNo,
                cardNo: item.cardNo,
                cardName: item.cardName,
                state: item.state,
                cardType: item.cardType,
                amount: item.amount,
                discount: item.discount || 0,
                discountShow: this.fen2yuan(item.discount || 0),
                salePrice: item.salePrice,
                balance: item.balance || 0,
                balanceShow: this.fen2yuan(item.balance || 0),
                ifRead: true
              })
          )
          if (this.$attrs.curr_id) {
            temp[0].id = this.$attrs.curr_id
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
        this.deleteDetails = []
        this.$attrs['form-data'].map(item => {
          if (item.summary) {
            this.summary.push(item.prop)
          }
        })
        this.form.details = this.deepClone(this.$attrs.details) // 详情

        const temp = {}
        const price_k = []

        if (['edit', 'insert'].includes(this.$attrs['operate-item'].prop)) { // 创建,修改
          this.ArrFilter(this.$attrs['form-data'], { addFatherProp: 'detailReqs', 'editShow': true }).map(item => {
            if (item.summary) {
              this.summary.push(item.prop)
            }
            if (item.type === 'PRICE' && !item.readonly) {
              temp[item.prop + 'Show'] = ''
              price_k.push(item.prop)
            }
            temp[item.prop] = item.defaultValue || ''
          })

          this.initFormDetailsItem = this.deepClone(temp)

          if (this.$attrs['operate-item'].prop === 'insert') { // 创建
            this.form.details = [this.deepClone(this.initFormDetailsItem)]
          } else { // 修改
            this.$attrs.details.map(item => {
              Object.keys(item).map(key => {
                if (price_k.includes(key)) {
                  item[key + 'Show'] = this.fen2yuan(item[key])
                }
              })
            })
            this.form.details = this.deepClone(this.$attrs.details)
          }
        }
        resolve(true)
      })
    },
    inputFn(item, row, key, index) { // 输入函数
      if (item.inputFn) {
        item.inputFn(row, this.$attrs.base_form, key, index, this.$refs)
      }
    },
    deleteItem(row, i) {
      if (row.id) {
        this.deleteDetails.push(row.id)
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          const temp = this.deepClone(this.initFormDetailsItem)
          this.$set(this.form.details, 0, temp)
        } else {
          this.form.details.splice(i, 1)
        }
      } else {
        if (this.form.details.length === 1) {
          console.log('剩一项了')
          const temp = this.deepClone(this.initFormDetailsItem)
          this.$set(this.form.details, 0, temp)
        } else {
          this.form.details.splice(i, 1)
        }
      }
    },
    opFunc(op) {
      switch (op.prop) {
        case 'clearList':
          this.form.details = [this.deepClone(this.initFormDetailsItem)]
          break
        case 'addItem':
          this.addItem(null, this.$attrs.details.length)
          break
        case 'addList':
          this.addAll('0')
          break
        case 'addListIssue':
          this.addAll('7')
          break
        case 'addListSeize': // 收缴
          this.addAll('3', op.formProData)
          break
        case 'addListSale': // 销售
          this.addAll('3', op.formProData)
          break
        case 'addListMake': // 制卡
          this.addAll('6', op.formProData)
          break
        case 'edits_discounts': // 批量折扣
          this.$confirm(`此操作将覆盖表中原折扣价, 是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.form.details.map(item => {
              item.discount = this.$attrs.base_form.discount || 0
              item.discountShow = this.fen2yuan((this.$attrs.base_form.discount || 0))
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消操作'
            })
          })
          break
      }
    },
    addItem(row, i) {
      this.form.details.splice((i + 1), 0, this.deepClone(this.initFormDetailsItem))
    },
    addAll(type, formProData = null) {
      if (isNaN(this.$attrs.base_form.originCardNo) ||
        isNaN(this.$attrs.base_form.endCardNo) ||
        Number(this.$attrs.base_form.originCardNo) === 0 ||
        Number(this.$attrs.base_form.endCardNo) === 0) {
        this.$message.error('请填写正确的面号')
        return
      }
      if (this.$attrs.base_form.endCardNo - this.$attrs.base_form.originCardNo > 100 || this.$attrs.base_form.endCardNo - this.$attrs.base_form.originCardNo < 0) {
        this.$message.error('制卡数量不能大于100张且结束卡号大于等于起始卡号')
        return
      }

      if (formProData) { // 有条件限制
        const nameList = {
          storeId: '门店',
          orgId: '组织'
        }
        for (const key of Object.keys(formProData)) {
          Object.keys(formProData).map(key => {
            formProData[key] = this.$attrs.base_form[key] || ''
          })
          if (formProData[key] === '') {
            this.$message.error(`请先选择${nameList[key]}`)
            return
          }
        }
      }
      const temp_key_value = Object.values(this.form.details[0]).map(item => (item === true || item === '-') ? '' : item)
      if (this.form.details.length > 1 || temp_key_value.some(item => (item !== ''))) {
        this.autoAddList(this.$attrs.base_form, type, false, !!formProData)
      } else {
        this.autoAddList(this.$attrs.base_form, type, true, !!formProData)
      }
    },
    async autoAddList(form, type, isSure = false, formProData = false) {
      if (!isSure) {
        this.$confirm(`此操作将覆盖原有列表, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.autoAddList(form, type, true, formProData)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消批量添加'
          })
        })
        return
      }
      this.$emit('update:loading', true)

      let temp = []
      switch (type) {
        case '0': // 创建
          { const { data } = await getCardList({ 'originCardNo': form.originCardNo, 'endCardNo': form.endCardNo, 'state': null })
            const cardNos = data.map(item => item.faceNo)
            for (let i = form.originCardNo; i <= form.endCardNo; i++) {
              if (!cardNos.includes(i.toString())) {
                temp.push({
                  'faceNo': i,
                  'cardNo': this.$attrs.base_form.cardMeson === '3' ? '' : i,
                  'amount': form.cardAmount,
                  'amountShow': this.fen2yuan(form.cardAmount)
                })
              }
            }
            if (temp.length > 100) {
              this.$message.info('添加卡数量不能超过100张')
              this.loading = false
              this.$emit('update:loading', false)
              return
            } else if (temp.length === 0) {
              this.$message.info('卡号重复')
              this.loading = false
              this.$emit('update:loading', false)
              return
            } else if (cardNos.length > 0) {
              this.$message.info(`已过滤重复卡号${cardNos.length}张`)
            }
          }
          break
        default: // 其他
          { const { data } = await getCardList(Object.assign({
            'originCardNo': form.originCardNo,
            'endCardNo': form.endCardNo,
            'state': type
          }, { orgId: formProData ? form.orgId : this.$store.getters.orgId, storeId: formProData ? form.storeId : this.$store.getters.storeId }))
          if (data.length > 0 && data.length <= 100) {
            data.map(item => {
              if (type === '6') {
                item.discount = this.$attrs.base_form.discount || item.discount
                item.discountShow = this.fen2yuan((this.$attrs.base_form.discount || item.discount))
                item.balance = this.$attrs.base_form.rechargeAmount || 0
                item.balanceShow = this.fen2yuan((this.$attrs.base_form.rechargeAmount || 0))
              }
            })
            temp = data
          } else if (data.length > 100) {
            this.$message.info('添加卡数量不能超过100张')
            this.loading = false
            this.$emit('update:loading', false)
            return
          } else {
            this.$message.info('未查到有效数据')
            this.loading = false
            this.$emit('update:loading', false)
            return
          } }
          break
      }
      temp.map(item => { item.id = null })
      this.form.details = temp
      this.loading = false
      this.$emit('update:loading', false)
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
      return sums
    },
    openFunc(e, i = null, row = { id: null }) {
      const temp = {}
      if (e.formProData) { // 存在检索范围
        Object.keys(e.formProData).map(key => { // 检索字段keys
          temp[key] = e.formProData[key] === '' ? this.$attrs.base_form[key] : e.formProData[key]
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
        temp.receiveOrgId = this.$attrs.base_form.settleOrgId
        temp.franchiseeOrgId = this.$attrs.base_form.settleOrgId
        delete temp.settleOrgId
      }
      if (temp.applyStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.base_form.applyStoreId
        delete temp.applyStoreId
      }
      if (temp.shipStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.base_form.shipStoreId
        delete temp.shipStoreId
      }
      if (temp.receiptStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.base_form.receiptStoreId
        delete temp.receiptStoreId
      }
      if (temp.storageStoreId !== undefined) { // 审请门店
        temp.storeId = this.$attrs.base_form.storageStoreId
        delete temp.storageStoreId
      }
      if (temp.adjustmentStore !== undefined) { // 审请门店
        temp.storeId = this.$attrs.base_form.adjustmentStore
        delete temp.adjustmentStore
      }
      if (temp.shipStockId !== undefined) { // 审请门店
        temp.stockId = this.$attrs.base_form.shipStockId
        delete temp.shipStockId
      }
      if (temp.receiptStockId !== undefined) { // 审请门店
        temp.stockId = this.$attrs.base_form.receiptStockId
        delete temp.receiptStockId
      }
      if (temp.storageStockId !== undefined) { // 审请门店
        temp.stockId = this.$attrs.base_form.storageStockId
        delete temp.storageStockId
      }
      this.insertIndex = i
      if (i !== null && e.prop) {
        this.window_add_select_value = this.form.details[i][e.prop] // 被点击的值
      } else {
        this.window_add_select_value = null
      }
      switch (e.click) {
        case 'addItems': // 打开选择列表
          this.$listeners.openSelectWindow({
            name: typeof e.windowName === 'string' ? e.windowName : e.windowName[row[e.typeName]],
            addedList: this.form.details,
            formProData: temp,
            curr: row }) // 固定选择范围
          break
      }
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
  align-items: center;
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
