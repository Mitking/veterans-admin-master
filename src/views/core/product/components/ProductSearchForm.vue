<!--搜索栏 MixinSearch  label-width="800" -->
<template>
  <div v-entersearch:Enter="{is_child:$attrs.is_child,func:$listeners.search}" style="margin:24px 24px 0 24px" :style="{paddingBottom:($attrs.is_child || windowH<700)?0:'15px',marginTop:(windowH<700)?'12px':'24px'}">
    <el-form :rules="rules" :model="$attrs.form" class="form-fa" :size="$attrs.is_child?'mini':'small'" @submit.native.prevent>
      <el-form-item v-for="(item,index) in $attrs.formlist" :key="index" class="item-fa" :label="item.type==='checkbox'?'':item.title" :style="{width:item.width || '300px'}">
        <el-input v-if="item.type==='text'" v-model="$attrs.form[item.prop]" :placeholder="item.placeholder || ''" clearable />
        <el-cascader
          v-if="item.type==='goodsCategory'"
          ref="goodsCategory"
          v-model="$attrs.form[item.prop]"
          :disabled="item.disabled"
          placeholder="可关键字筛选"
          clearable
          filterable
          :options="options"
          :props="{
            value:item.valueProp || 'id',
            label:'name',
            emitPath:false,
            checkStrictly: true
          }"
          @focus="onfucsFn"
        />
        <el-select
          v-if="item.type==='select'"
          v-model="$attrs.form[item.prop]"
          class="item-select-fa"
          placeholder="请选择"
          :style="{width:item.width || '300px'}"
          :disabled="item.disabled"
        >
          <el-option
            :key="0"
            :label="item.defaultName || '全部'"
            :value="0"
          />
          <!--          <el-option-->
          <!--            v-for="itemSon in selectComputed(item)"-->
          <!--            :key="itemSon.value"-->
          <!--            :label="itemSon.label"-->
          <!--            :value="itemSon.value"-->
          <!--          />-->
          <el-option
            v-for="(itemSon,indexSon) in selectComputed(item)"
            :key="indexSon+100"
            :label="itemSon[item.selectOption?item.selectOption.label:'name']"
            :value="itemSon[item.selectOption?item.selectOption.value:'value']"
          />
        </el-select>
        <el-checkbox
          v-if="item.type==='checkbox'"
          v-model="$attrs.form[item.prop]"
          :disabled="item.disabled"
          border
          size="small"
          :label="item.title"
        />
        <el-date-picker
          v-if="item.type==='date'"
          v-model="$attrs.form[item.prop]"
          type="datetime"
          placeholder="选择日期时间"
        />

        <!--        <el-date-picker  双日期备用-->
        <!--          v-if="item.type==='date'"-->
        <!--          v-model="$attrs.form[item.prop]"-->
        <!--          type="datetimerange"-->
        <!--          :picker-options="pickerOptions"-->
        <!--          range-separator="至"-->
        <!--          start-placeholder="开始日期"-->
        <!--          end-placeholder="结束日期"-->
        <!--          align="right"-->
        <!--        />-->
        <div v-if="item.type==='range'" class="rang-fa">
          <el-input
            v-for="(itemRange,indexRange) in item.range"
            :key="indexRange"
            v-model="$attrs.form[itemRange.prop+'Show']"
            v-number-input.float="Object.assign({decimal:2},itemRange.float)"
            style="width: 75px"
            :placeholder="itemRange.placeholder"
            @input="()=>{$attrs.form[itemRange.prop]=yuan2fen($attrs.form[itemRange.prop+'Show'])}"
          />
          <div class="line">—</div>
        </div>
      </el-form-item>
      <el-form-item v-if="$attrs.is_child">
        <el-button type="primary" icon="el-icon-search" :loading="$attrs['search-loading']" @click="$listeners.search">查询</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getFinTaxRateList } from '@/api/oms/fin/finTaxRate'
import { getFlavorList } from '@/api/core/flavor'
import { getCategoryList, getCategoryTree } from '@/api/core/goodscategory'
import store from '@/store'
import { queryOrgByAccountId } from '@/api/ums/org'
import { getStoreList } from '@/api/core/store'
import { getStockList } from '@/api/core/stock'
import { getBrandList } from '@/api/core/brand'
import { getAlgJson } from '@/api/core/product'
import { getPriceAlgTeamEntity } from '@/api/core/algteam'
import { mapGetters } from 'vuex'
export default {
  name: 'ProductSearchForm',
  components: { },
  data() {
    return {
      options: [],
      searchShow: false,
      treeData: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
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
    selectComputed() { // select选项集
      return function(propitem) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) || []
          temp = temp.filter(item => this.$attrs.form[propitem.fatherProp] === 0 ? true : item[propitem.fatherProp] === this.$attrs.form[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.$attrs.form[propitem.prop])) {
            this.$attrs.form[propitem.prop] = 0
          }
          return temp
        }
        return this.enumGetproplist(propitem) || []
      }
    }
  },
  created() {
    getCategoryTree().then(res => {
      this.options = res.data
    })
    this.mixinPKey = {
      organizes: [queryOrgByAccountId, { accountId: this.accountId }],
      stores: [getStoreList, {}],
      stockId: [getStockList, {}],
      categoryList: [getCategoryList, {}],
      brandList: [getBrandList, {}],
      algList: [getAlgJson, {}],
      alg_team: [getPriceAlgTeamEntity, {}],
      FinTaxRateList: [getFinTaxRateList, {}],
      FlavorList: [getFlavorList, {}]
    }
    let temp = []
    if (this.$attrs['form-data']) {
      temp = this.deepClone(this.$attrs['form-data'])
    }
    temp.push(...this.$attrs.formlist)
    this.init(temp).then(res => {
      if (res === true) {
        console.log('请求字段数据已加载')
        if (this.$listeners.search) {
          this.$listeners.search()
          console.log('加载完成')
        }
      } else {
        console.log('有未加载成功字段，请检查代码')
      }
    })
  },
  methods: {
    // 加载下拉框字段数据
    async init(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].selectData && Object.keys(this.mixinPKey).includes(arr[i].selectData) && this.enumList[arr[i].selectData].length === 0) {
          const { code, data } = await this.mixinPKey[arr[i].selectData][0](this.mixinPKey[arr[i].selectData][1])
          if (code === 200) {
            await store.dispatch('enum/add_enum', { [arr[i].selectData]: data || [] })
            console.log(`检索栏已加载${arr[i].selectData}数据`)
          } else {
            console.log(`${arr[i].selectData}数据出现错误`)
            return Promise.resolve(false)
          }
        }
      }
      return Promise.resolve(true)
    },
    onfucsFn() {
      getCategoryTree().then(res => {
        this.options = res.data
      })
    },
    // comp(e) {
    //   return this.$attrs.form[e]
    // },
    // 商品分类
    codeOnfocus(e = '', node) {
      if (node.hasChildren === false) {
        return Promise.resolve([])
      }
      return new Promise((resolve, reject) => {
        getCategoryList({ 'parentCode': e }).then(res => {
          if (res.code === 200) {
            if (res.data) {
              const treeData = res.data.map(item => ({
                leaf: !item.haveChild,
                value: this.$attrs.cascaderbycode ? item.code : item.id,
                code: item.code,
                label: item.name,
                disabled: (!item.enable)
              }))
              resolve(treeData)
            } else {
              resolve([])
            }

            // if (e === '') {
            //   treeData.unshift({
            //     leaf: true,
            //     value: this.$attrs.cascaderbycode ? '0' : 1,
            //     code: '0',
            //     label: '起始类',
            //     disabled: false
            //   })
            // }
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
  /* padding-bottom: 15px; */
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
