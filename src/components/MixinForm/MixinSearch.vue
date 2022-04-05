<!--搜索栏 MixinSearch  label-width="800" -->
<template>
  <div v-entersearch:Enter="{is_child:$attrs.is_child,func:$listeners.search,handFunc:$listeners.handsearch}" style="margin:0 24px 0 24px" :style="{paddingBottom:($attrs.is_child || windowH<700)?0:'15px',marginTop:(windowH<700)?'12px':'24px'}">
    <el-form :rules="rules" :model="$attrs.form" :size="($attrs.is_child || windowH<700)?'mini':'small'" class="form-fa" @submit.native.prevent>
      <el-form-item
        v-for="(item,index) in $attrs.formlist"
        v-show="showFn(item)"
        :key="index"
        class="item-fa"
        :label="item.type==='checkbox'?'':item.title"
        :style="{width:item.width || '300px'}"
      >
        <el-input v-if="item.type==='text'" v-model="$attrs.form[item.prop]" :placeholder="item.placeholder || ''" clearable />
        <!--   -->
        <el-input
          v-if="item.type==='PRICE'"
          v-model="$attrs.form[item.prop+'Show']"
          @input="$attrs.form[item.prop]=yuan2fen($event)"
        />
        <el-input
          v-if="item.type==='selectFromPage'"
          v-model="$attrs.form[item.prop]"
          :readonly="$attrs['readonly-from-page']"
          :disabled="item.disabled"
          :placeholder="item.placeholder || '全部'"
          clearable
          @focus="$listeners.opForm(item)"
          @clear="$listeners.clickClear(item.reallyProp)"
        />
        <el-cascader
          v-if="item.type==='goodsCategory'"
          v-model="$attrs.form[item.prop]"
          :disabled="item.disabled"
          placeholder="可关键字筛选"
          filterable
          clearable
          :options="goodsOptions"
          :props="{
            value:item.valueProp || 'code',
            label:'name',
            emitPath:false,
            checkStrictly: true
          }"
          @focus="getCategoryFn"
        />
        <el-cascader
          v-if="item.type==='feeName'"
          v-model="$attrs.form[item.prop]"
          clearable
          :props="{
            value:'id',
            emitPath:false,
            label:'showName',
            leaf:'ifLast'
          }"
          :options="$store.state.enum.enumList.feeSelectListLast"
        />
        <el-select v-if="item.type==='select'" v-model="$attrs.form[item.prop]" class="item-select-fa" placeholder="请选择" :style="{width:item.width || '300px'}" :disabled="item.disabled">
          <el-option
            v-if="!item.defaultAllValue"
            :key="0"
            :label="item.defaultName || '全部'"
            :value="0"
            :disabled="item.lockValue!==undefined ? !item.lockValue.includes(0):false"
          />
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon+100"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
            :disabled="item.lockValue!==undefined
              ? !item.lockValue.includes(itemSon[item.selectOption?item.selectOption.value:'value'])
              :false"
          />
        </el-select>
        <el-checkbox
          v-if="item.type==='checkbox'"
          v-model="$attrs.form[item.prop]"
          border
          :size="($attrs.is_child || windowH<700)?'mini':'small'"
          :disabled="item.disabled || false"
          :label="item.title"
        />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="$attrs.form[item.prop]"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择日期"
        />

        <el-date-picker
          v-if="item.type==='datetime'"
          v-model="$attrs.form[item.prop]"
          type="datetime"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期时间"
          :default-time="item.defaultTime"
          :picker-options="item.pickerOptions || {}"
        />

        <el-date-picker
          v-if="item.type==='daterange'"
          v-model="$attrs.form[item.prop]"
          type="daterange"
          :picker-options="pickerOptions"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          align="right"
        />
        <div v-if="item.type==='range'" class="rang-fa">
          <el-input v-for="(itemRange,indexRange) in item.range" :key="indexRange" v-model="$attrs.form[itemRange.prop]" v-number-input.float="Object.assign({decimal:2},itemRange.float)" style="width: 75px" :placeholder="itemRange.placeholder" />
          <div class="line">—</div>
        </div>
      </el-form-item>
      <el-form-item v-if="$attrs.is_child">
        <el-button type="primary" icon="el-icon-search" @click="$listeners.search">查询</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getPriceAlgTeamEntity } from '@/api/core/algteam'
import { getInvDiffReasonGroup } from '@/api/wms/InvDiffReason'
import { getInvDiffReasonGroup as getAdjustReason } from '@/api/wms/AdjustReason'
import { getCustomerTypeGroup } from '@/api/core/Customer'
import { getFinTaxRateList } from '@/api/oms/fin/finTaxRate'
import { getAccountList } from '@/api/ums/account'
import { getCategoryList, getCategoryTree } from '@/api/core/goodscategory'
import { queryOrgByAccountId } from '@/api/ums/org'
import store from '@/store'
import { getStoreList } from '@/api/core/store'
import { getStockGroupList, getStockList } from '@/api/core/stock'
import { getBrandList } from '@/api/core/brand'
import { getSupplierGroupList } from '@/api/core/supplier'
import { getGroupList } from '@/api/core/store'
import { getUsersByRoleName } from '@/api/ums/role'
import { mapGetters } from 'vuex'
// import { getFeeList } from '@/api/oms/fin/feemanage'
import { getFeeSelectList } from '@/api/oms/fin/feemanage'
export default {
  name: 'MixinSearch',
  components: { },
  data() {
    return {
      goodsOptions: [],
      selectForm: false,
      mixinPKey: {
        alg_team: [getPriceAlgTeamEntity, {}],
        FinTaxRateList: [getFinTaxRateList, {}],
        CustomerType: [getCustomerTypeGroup, {}],
        accounts: [getAccountList, {}],
        organizes: [queryOrgByAccountId, { accountId: this.$store.getters.accountType !== 0 ? this.accountId : null }],
        stores: [getStoreList, {}],
        stockId: [getStockList, {}],
        categoryList: [getCategoryList, {}],
        brandList: [getBrandList, {}],
        feeSelectListLast: [getFeeSelectList, { ifLastQuery: true }],
        feeSelectList: [getFeeSelectList, { ifLastQuery: false }],
        supplier_group: [getSupplierGroupList, {}],
        store_group: [getGroupList, {}],
        stock_group: [getStockGroupList, {}],
        diff_reason: [getInvDiffReasonGroup, {}],
        adjust_reason: [getAdjustReason, {}],
        personListCG: [getUsersByRoleName, { roleName: '采购员' }, 'id_to_string'],
        personListSH: [getUsersByRoleName, { roleName: '仓储收货' }, 'id_to_string'],
        personListSJ: [getUsersByRoleName, { roleName: '司机' }, 'id_to_string']
      },
      goodstypeshowvalue: '',
      searchShow: false,
      treeData: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近3天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
            picker.$emit('pick', [start, end])
          }
        },
        {
          text: '最近7天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近30天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  computed: {
    ...mapGetters(['accountId', 'enumList']),
    rules() { // 相关校验
      const temp = {}
      this.$attrs.formlist.map(item => {
        if (item.rule) {
          temp[item.prop] = item.rule
        }
      })
      return temp
    },
    showFn() {
      return function(item) { // 如果被连接表且不可使用，便隐藏
        if (this.$attrs.is_child && item.disabled) {
          return false
        }
        return item.accountTypeShowFn === undefined ? true : item.accountTypeShowFn()
      }
    },
    selectComputed() { // select选项集
      return function(propitem) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        if (propitem.accountTypeShowFn && !propitem.accountTypeShowFn()) { // 不显示该条件
          this.$attrs.form[propitem.prop] = propitem.defaultValue || 0
          return
        }
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) || []
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherPropName || propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = (propitem.defaultAllValue !== undefined ? (temp.length > 0 ? temp[0][propitem.selectOption ? propitem.selectOption.value : 'value'] : '') : 0)
          }
          return temp
        }
        return this.enumGetproplist(propitem) || []
      }
    }
  },
  created() {
    this.createFn()
  },
  methods: {
    createFn() {
      let temp = []
      if (this.$attrs['form-data']) {
        temp = this.deepClone(this.$attrs['form-data'])
      }
      temp.push(...this.$attrs.formlist)
      this.init(temp).then(res => {
        if (res === true) {
          console.log('请求字段数据已加载')
          if (this.$attrs.is_child && this.$attrs.create_init === false) {
            this.$emit('update:create_init', true)
          }
          if (this.$listeners.search) {
            this.$listeners.search()
            console.log('加载完成')
          }
        } else {
          console.log('有未加载成功字段,请检查刷新重试')
        }
      })
    },
    // 加载下拉框字段数据
    async init(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].selectData && Object.keys(this.mixinPKey).includes(arr[i].selectData) && this.enumList[arr[i].selectData].length === 0) {
          if (arr[i].selectData === 'organizes') { // 刷新页面没有获取到accountId
            this.mixinPKey.organizes = [queryOrgByAccountId, { accountId: this.$store.getters.accountType !== 0 ? this.accountId : null }]
          }
          const { code, data } = await this.mixinPKey[arr[i].selectData][0](this.mixinPKey[arr[i].selectData][1])
          if (code === 200) {
            await store.dispatch('enum/add_enum', { [arr[i].selectData]: data || [] })
            console.log(`检索栏已加载${arr[i].selectData}数据`)
          } else {
            console.log(`${arr[i].selectData}数据出现错误`)
            return Promise.resolve(false)
          }
        }
        if (arr[i].type === 'goodsCategory') { // 直接代入数据
          this.getCategoryFn()
        }
      }
      return Promise.resolve(true)
    },
    // 获取商品分类
    getCategoryFn() {
      getCategoryTree({}).then(res => {
        this.goodsOptions = res.data
      })
    },
    searchSync(e) {
      this.$set(this.$attrs.form, 'parentCode', e.code)
      this.goodstypeshowvalue = e.name
    },
    // 商品分类
    codeOnfocus(e = '', node) {
      if (node.hasChildren === false) {
        return Promise.resolve([])
      }
      return new Promise((resolve, reject) => {
        getCategoryList({ 'parentCode': e }).then(res => {
          if (res.code === 200) {
            if (res.data && res.data.length > 0) {
              const treeData = res.data.map(item => ({
                leaf: !item.haveChild,
                value: this.$attrs.cascaderbycode ? item.code : item.id,
                code: item.code,
                label: item.name,
                disabled: (!item.enable)
              }))
              // if (e === '') {
              //   treeData.unshift({
              //     leaf: true,
              //     value: this.$attrs.cascaderbycode ? '0' : 1,
              //     code: '0',
              //     label: '起始类',
              //     disabled: false
              //   })
              // }
              resolve(treeData)
            } else {
              resolve([
                {
                  leaf: true,
                  value: this.$attrs.cascaderbycode ? '0' : 1,
                  code: '0',
                  label: '起始类',
                  disabled: false
                }
              ])
            }
          }
        })
      })
    },
    lazyLoad(node, resolve) {
      this.codeOnfocus(node.level === 0 ? '0' : node.data.code, node).then(res => {
        resolve(res)
      })
    }
  }
}
</script>

<style scoped>
.form-fa{
  display: flex;
  flex-wrap: wrap;
}
.form-fa >>> .el-form-item__content{
  display: flex;
  /*justify-content: flex-start;*/
  /*align-items:center;*/
  padding:0 30px 0 0;
  margin: 0;
  /*margin:5px;*/
  /*flex: 1;*/
}
.form-fa >>> .el-form-item{
  margin-bottom:10px
}
.rang-fa{
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.line{
  position: absolute;
  left: 39%;
  /*width: 100px; !* 要设定宽度 *!*/
  /*border:1px solid blue;*/
  /*transform: translateX(-150%);*/
  color: #b4b4b4;
}

/*el-form-item item-fa el-form-item--medium*/
</style>
