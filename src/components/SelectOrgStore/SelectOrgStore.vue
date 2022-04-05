
<template>
  <!-- type:1 单选 type:2 单选没有全部选项，全部为默认必填 -->
  <span class="fa" style="width:600px">
    <el-form-item
      v-for="(item,index) in formlist"
      v-show="item.show"
      :key="index"
      :prop="item.show?item.prop:''"
      :label="item.title"
      style="width:300px"
      :rules="[{ validator: validatePass, trigger: 'blur' }]"
    >
      <el-select
        v-model="searchform[item.prop]"
        class="item-select-fa"
        placeholder="请选择"
        :disabled="item.disabled"
        style="width:100%"
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
  </span>
</template>

<script>
import { getAccountList } from '@/api/ums/account'
import { queryOrgByAccountId } from '@/api/ums/org'
import store from '@/store'
import { mapGetters } from 'vuex'
import { getStoreList } from '@/api/core/store'
import { getStockList } from '@/api/core/stock'

export default {
  name: 'Search',
  components: { },
  data() {
    return {
      formlist: [ // 联动数据
        { title: '组织', prop: 'orgId', defaultAllValue: this.$attrs.type === 2, show: [1, 2].includes(this.$attrs.type) && [3].includes(this.$store.getters.accountType), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        { title: '门店', prop: 'storeId', defaultAllValue: this.$attrs.type === 2, defaultName: this.$attrs['default-store-name'] || null, show: [1, 2].includes(this.$attrs.type) && [2, 3].includes(this.$store.getters.accountType), selectData: 'stores', fatherProp: 'orgId', selectOption: { label: 'name', value: 'id' }}
      ],
      searchform: {
        orgId: [1, 2].includes(this.$store.getters.accountType) ? this.$store.getters.orgId : (this.$attrs.type === 2 ? this.$store.getters.orgId : 0),
        storeId: this.$store.getters.accountType === 1 ? this.$store.getters.storeId : (this.$attrs.type === 2 ? this.$store.getters.storeId : 0)
      }
    }
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
          temp = temp.filter(item => this.searchform[propitem.fatherProp] === 0 ? true : item[propitem.fatherPropName || propitem.fatherProp] === this.searchform[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(this.searchform[propitem.prop])) {
            this.searchform[propitem.prop] = (propitem.defaultAllValue ? (temp.length ? temp[0].id : '') : 0)
          }
          return temp
        }
        return this.enumGetproplist(propitem) || []
      }
    }
  },
  watch: {
    'searchform': { // 数据变化回传
      handler(n) {
        console.log(n)
        this.$listeners.updateData(n)
      },
      deep: true
    }
  },
  created() {
    this.mixinPKey = { // 获取下拉框数据的列表和接口
      accounts: [getAccountList, {}],
      organizes: [queryOrgByAccountId, { accountId: this.$store.getters.accountType !== 0 ? this.accountId : null }],
      stores: [getStoreList, {}],
      stockId: [getStockList, {}]
    }
    const temp = []
    temp.push(...this.formlist)
    this.init(temp).then(res => {
      if (res === true) {
        console.log('请求字段数据已加载')
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
    validatePass(rule, value, callback) {
      if (this.$attrs.type === 2 && !value) {
        callback(new Error('该项不能为空!'))
      } else {
        callback()
      }
    }
  }
}
</script>

<style scoped>
/* .fa{
  display: flex;
  flex-wrap: wrap;
} */

</style>
