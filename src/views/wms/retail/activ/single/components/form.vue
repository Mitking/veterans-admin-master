<template>
  <div>
    <el-form ref="form" class="form-fa" :model="form" label-width="120px">
      <el-form-item style="width:25%" label="特价单号" prop="singleNo">
        <el-input v-model="form.singleNo" placeholder="" :readonly="true" />
      </el-form-item>
      <el-form-item :style="{'width':this.$store.getters.accountType===1?'25%':'50%'}" :label="this.$store.getters.accountType===1?'门店':'门店(可多选)'" prop="storeIds" :rules="[{ required: true, message: '门店不能为空', trigger: 'change' }]">
        <el-cascader
          v-if="this.$store.getters.accountType === 3"
          v-model="form.storeIds"
          style="width:60%"
          :options="storesOptions"
          :props="{ multiple: true,emitPath:false }"
          collapse-tags
          clearable
        />
        <el-select
          v-if="this.$store.getters.accountType === 2"
          v-model="form.storeIds"
          placeholder="请选择"
          multiple
          collapse-tags
          style="width:100%"
        >
          <el-option
            v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'}).filter(item=>item.orgId===$store.getters.orgId)"
            :key="indexSon"
            :label="itemSon.name"
            :value="itemSon.id"
          />
        </el-select>
        <el-input v-if="this.$store.getters.accountType === 1" :value="MenuGetPropName('stores',form.storeIds[0],{ value: 'id', label: 'name' })" :readonly="true" />
      </el-form-item>
      <el-form-item style="width:25%" label="审核状态" prop="auditStatus">
        <el-input :value="MenuGetPropName('audit_status',form.auditStatus)" :readonly="true" />
      </el-form-item>
      <el-form-item style="width:25%" label="开始时间" prop="beginTime" :rules="[{ required: true, message: '开始时间不能为空', trigger: 'change' }]">
        <el-date-picker
          v-model="form.beginTime"
          type="datetime"
          style="width: 100%"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="{disabledDate(time) {return time.getTime()+24*60*60*1000 < Date.now()}}"
        />
      </el-form-item>
      <el-form-item style="width:25%" label="结束时间" prop="endTime" :rules="[{ validator: endTimeCheck, trigger: 'change' }]">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          style="width: 100%"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="23:59:59"
          :picker-options="{disabledDate(time) {return time.getTime()+24*60*60*1000 < Date.now()}}"
        />
      </el-form-item>

      <el-form-item style="width: 100%;padding-right: 0" />
      <el-form-item
        label="备注"
        style="width: 50%;padding-right: 0"
      >
        <el-input v-model="form.remark" :rows="3" type="textarea" placeholder="备注最多120字数" :maxlength="120" />
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
// import { ArrFilter } from '@/utils'
// import { getCategoryList, getCategoryTree } from '@/api/core/goodscategory'

export default {
  name: 'FormItem',
  data() {
    return {
      form: {
        'id': 0,
        'singleNo': '',
        'storeIds': this.$store.getters.accountType === 1 ? [this.$store.getters.storeId] : [],
        'beginTime': '',
        'endTime': '',
        'dateType': '',
        'remark': '',
        'orgId': 0,
        'auditStatus': '1',
        'attachRemark': ''
      },
      goodsOptions: []
    }
  },
  computed: {
    storesOptions() {
      const store_org = this.groupByProp(this.$store.getters.enumList.stores, 'orgId')
      const res = store_org.map(item => ({
        label: this.MenuGetPropName('organizes', item.orgId, { label: 'orgShortName', value: 'id' }),
        value: item.id,
        children: item.children.map(itemC => ({
          label: itemC.name,
          value: itemC.id
        }))
      }))

      return res
    },
    comp_price_auto() {
      return function(item) { // 总金额自动计算
        this.form[item.prop] = item.design(...item.arg)
        return this.fen2yuan(this.form[item.prop])
      }
    },

    comp_number_auto() {
      return function(item) { // 个数自动计算
        this.form[item.prop] = item.design()
        return this.form[item.prop]
      }
    }
  },
  watch: {
    '$attrs.show': {
      handler(n) {
        if (n) {
          console.log(`表单${n ? '打开' : '关闭'}`)
          this.init().then(res => {
            console.log('强制重置')
            if (this.$refs.form) {
              this.$refs.form.resetFields()
            }
            if (res) {
              this.$nextTick(() => {
                if (this.$listeners.dataIsChange && this.$attrs['operate-item'].prop !== 'insert') { this.$listeners.dataIsChange(false) }
              })
            }
          })
        }
      },
      immediate: true
    },
    form: {
      handler(n) {
        // if (this.$listeners.formChange) { this.$listeners.formChange(n) }
        // if (this.$listeners.indexPageFormChange) { this.$listeners.indexPageFormChange(n) }
        if (this.$listeners.dataIsChange) { this.$listeners.dataIsChange(true) }
      },
      immediate: true,
      deep: true
    },
    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          switch (this.$attrs.select_window_name) {
            case 'form_SupplierIndex': // 供应商选择
              //
              this.form.supplierId = n[0].id
              this.form.supplier = n[0].name
              break
            case 'form_StoreProductIndex': // 商品选择

              this.form.goodsCode = n[0].goodsCode
              this.form.goodsName = n[0].goodsName
              this.form.weightType = n[0].unitConversionRateRes.stockWeightType
              this.form.price = n[0].price
              this.form.priceShow = this.fen2yuan(n[0].price)
              this.form.costPrice = n[0].costPrice
              this.form.costPriceShow = this.fen2yuan6cover(n[0].costPrice)
              this.form.whetherCount = n[0].whetherCount
              break
          }
        }
      } }
  },
  methods: {
    init() {
      return new Promise(resolve => {
        console.log('数据开始初始化')
        this.loading = true
        let temp = {}
        if (this.$attrs['operate-item'].prop === 'insert') { // 新增
          temp.singleNo = this.$attrs.order_no
        } else {
          temp = this.$attrs['current-row']
        }
        this.form = Object.assign(this.form, temp)

        resolve(true)
      })
    },
    endTimeCheck(r, v, callback) {
      if (v === '') {
        return callback(new Error('结束时间不能为空！'))
      }

      if (v < this.form.beginTime) {
        return callback(new Error('结束时间不能晚于开始时间！'))
      }
      callback()
    },
    openFromPage(item) {
      if (item.formProData) {
        const temp = {}
        Object.keys(item.formProData).map(key => {
          temp[key] = item.formProData[key] === '' ? this.form[key] : item.formProData[key]
        })
        if (Object.values(temp).some(value => (value === '' || value === undefined))) { // 字段先头选择较验
          const nameList = {
            storeId: '门店',
            stockId: '仓库'
          }
          for (const key of Object.keys(temp)) {
            if (temp[key] === '' || temp[key] === undefined) {
              this.$message.error(`请先选择${nameList[key]}`)
              return
            }
          }
        }
        this.$listeners.openSelectWindow({ name: item.windowName, curr: { id: null }, type: 'form', addedList: [], formProData: temp })
        return
      }
      this.$listeners.openSelectWindow({ name: item.windowName, curr: { id: null }, type: 'form', addedList: [] })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
  /*padding-bottom:15px*/
}
.wid{
  width: 25%;
  padding:0 10px;
}
.my-class-auto >>> .el-input__inner{
  color: #3CB371;
  font-weight: 600;
}
.rang-fa{
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.line{
  position: absolute;
  left: 48%;
  /*width: 100px; !* 要设定宽度 *!*/
  /*border:1px solid blue;*/
  /*transform: translateX(-150%);*/
  color: #b4b4b4;
}
</style>
