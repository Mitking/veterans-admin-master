<template>
  <div>
    <el-form ref="form" class="form-fa" :model="form" label-width="120px">
      <el-form-item style="width:25%" label="特价单号" prop="singleNo">
        <div>{{ form.singleNo }}</div>
      </el-form-item>
      <el-form-item style="width:25%" label="门店(可多选)" prop="storeIds" :rules="[{ required: true, message: '门店不能为空', trigger: 'change' }]">
        <el-tooltip
          effect="dark"
          :content="form.storeIds.map(item=>MenuGetPropName('stores',item,{ value: 'id', label: 'name' })).toString()"
          placement="top-start"
        >
          <div>
            {{ form.storeIds.map(item=>MenuGetPropName('stores',item,{ value: 'id', label: 'name' })).toString() | sizeFilter(10) }}
          </div>
        </el-tooltip>
      </el-form-item>
      <el-form-item style="width:25%" label="审核状态" prop="auditStatus">
        <div>{{ MenuGetPropName('audit_status',form.auditStatus) }}</div>
      </el-form-item>
      <el-form-item style="width:25%" label="开始时间" prop="beginTime" :rules="[{ required: true, message: '开始时间不能为空', trigger: 'change' }]">
        <div>{{ form.beginTime }}</div>
      </el-form-item>
      <el-form-item style="width:25%" label="结束时间" prop="endTime" :rules="[{ validator: endTimeCheck, trigger: 'change' }]">
        <div>{{ form.endTime }}</div>
      </el-form-item>
      <el-form-item style="width:25%" label="制单人">
        <div>{{ form.creatorName || '-' }}</div>
      </el-form-item>

      <el-form-item style="width:25%" label="制单时间">
        <div>{{ form.createTime || '-' }}</div>
      </el-form-item>

      <el-form-item style="width:25%" label="审核人">
        <div>{{ form.reviewer || '-' }}</div>
      </el-form-item>

      <el-form-item style="width:25%" label="审核时间">
        <div>{{ form.reviewerTime || '-' }}</div>
      </el-form-item>
      <el-form-item style="width: 100%;padding-right: 0" />
      <el-form-item
        label="备注"
        style="width: 50%;padding-right: 0"
      >
        <div>{{ form.remark }}</div>
        <!-- <el-input v-model="form.remark" :rows="3" type="textarea" placeholder="备注最多120字数" :maxlength="120" /> -->
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
        'storeIds': [],
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
      console.log(res)
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
    // form: {
    //   handler(n) {
    //     if (this.$listeners.formChange) { this.$listeners.formChange(n) }
    //     if (this.$listeners.indexPageFormChange) { this.$listeners.indexPageFormChange(n) }
    //     if (this.$listeners.dataIsChange) { this.$listeners.dataIsChange(true) }
    //   },
    //   immediate: true,
    //   deep: true
    // },
    '$attrs.add_arr': { // 当有添加数据时
      handler(n) {
        if (n.length > 0) {
          switch (this.$attrs.select_window_name) {
            case 'form_SupplierIndex': // 供应商选择
              // console.log(n[0].name)
              this.form.supplierId = n[0].id
              this.form.supplier = n[0].name
              break
            case 'form_StoreProductIndex': // 商品选择
              console.log(n[0])
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
        this.form = Object.assign(this.form, this.$attrs['current-row'])
        console.log(this.form)
        resolve(true)
      })
    },
    endTimeCheck(r, v, callback) {
      if (v === '') {
        return callback(new Error('结束时间不能为空！'))
      }
      console.log(v)
      console.log(this.form.beginTime)
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
              console.log(key)
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
