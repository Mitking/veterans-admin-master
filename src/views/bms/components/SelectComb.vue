<!--搜索栏 MixinSearch  label-width="800" comp_disabled -->
<template>
  <div>
    <el-form-item
      v-for="(item,index) in $attrs.formlist"
      :key="index"
      :label="item.title"
      :style="{marginRight:'55px'}"
    >
      <el-select
        v-model="$attrs.searchform[item.prop]"
        class="item-select-fa"
        placeholder="请选择"
        :style="{width:'200px'}"
        :disabled="item.disabled"
      >
        <el-option
          v-if="!item.defaultAllValue"
          :key="0"
          :label="item.defaultName || '全部'"
          :value="0"
        />
        <el-option
          v-for="(itemSon,indexSon) in selectComputed(item)"
          :key="indexSon+100"
          :label="itemSon[item.selectOption?item.selectOption.label:'name']"
          :value="itemSon[item.selectOption?item.selectOption.value:'value']"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script>
import { getAccountList } from '@/api/ums/account'
import { getCategoryList } from '@/api/core/goodscategory'
import { queryOrgByAccountId } from '@/api/ums/org'
import store from '@/store'
import { getStoreList } from '@/api/core/store'
import { getStockGroupList, getStockList } from '@/api/core/stock'
import { getBrandList } from '@/api/core/brand'
import { getSupplierGroupList } from '@/api/core/supplier'
import { getGroupList } from '@/api/core/store'
import { getUsersByRoleName } from '@/api/ums/role'
import { mapGetters } from 'vuex'
import { getFeeSelectList } from '@/api/oms/fin/feemanage'
export default {
  name: 'Search',
  components: { },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['accountId', 'enumList']),
    selectComputed() { // select选项集
      return function(propitem) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) || []
          temp = temp.filter(item => this.$attrs.searchform[propitem.fatherProp] === 0 ? true : item[propitem.fatherPropName || propitem.fatherProp] === this.$attrs.searchform[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.$attrs.searchform[propitem.prop])) {
            this.$attrs.searchform[propitem.prop] = (propitem.defaultAllValue !== undefined ? (temp.length > 0 ? temp[0][propitem.selectOption ? propitem.selectOption.value : 'value'] : '') : 0)
          }
          return temp
        }
        return this.enumGetproplist(propitem) || []
      }
    }
  },
  created() {
    this.mixinPKey = {
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
      // personList: [getUsersByRoleName, { roleName: '' }, 'id_to_string'],
      personListCG: [getUsersByRoleName, { roleName: '采购员' }, 'id_to_string'],
      personListSH: [getUsersByRoleName, { roleName: '仓储收货' }, 'id_to_string'],
      personListCCRK: [getUsersByRoleName, { roleName: '仓储部长' }, 'id_to_string'],
      personListSJ: [getUsersByRoleName, { roleName: '司机' }, 'id_to_string']
    }
    // /fin/fee/name/getFeeNameList
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
            // if (this.mixinPKey[arr[i].selectData][2] === 'id_to_string') {
            //   data.map(item => { item.id = item.id.toString() })
            // }
            await store.dispatch('enum/add_enum', { [arr[i].selectData]: data || [] })
            console.log(`检索栏已加载${arr[i].selectData}数据`)
          } else {
            console.log(`${arr[i].selectData}数据出现错误`)
            return Promise.resolve(false)
          }
        }
      }
      return Promise.resolve(true)
    }
  }
}
</script>

<style scoped>
</style>
