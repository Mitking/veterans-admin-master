<!--搜索栏 MixinSearch  label-width="800" comp_disabled -->
<template>
  <div style="margin:24px 24px 15px 24px" :style="{marginBottom:$attrs.formlist.length===0?'0px':'15px'}">
    <el-form :rules="rules" :model="$attrs.form" class="form-fa">
      <el-form-item
        v-for="(item,index) in $attrs.formlist"
        v-show="item.accountTypeShowFn===undefined?true:item.accountTypeShowFn()"
        :key="index"
        class="item-fa"
        :label="item.type==='checkbox'?'':item.title"
        :style="{width:item.width || '300px'}"
      >
        <el-input v-if="item.type==='text'" v-model="$attrs.form[item.prop]" :placeholder="item.placeholder || ''" clearable />
        <el-input
          v-if="item.type==='selectFromPage'"
          v-model="$attrs.form[item.prop]"
          :readonly="false"
          :disabled="item.disabled"
          :placeholder="item.placeholder || '全部'"
          clearable
          @focus="$listeners.opForm(item)"
          @clear="$listeners.clickClear(item.reallyProp)"
        />
        <el-cascader
          v-if="item.type==='goodType'"
          v-model="$attrs.form[item.prop]"
          clearable
          :props="{
            lazy:true,
            selfdata:item.prop,
            lazyLoad:lazyLoad,
            checkStrictly: true,
            emitPath:false
          }"
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
          size="medium"
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
          <el-input v-for="(itemRange,indexRange) in item.range" :key="indexRange" v-model="$attrs.form[itemRange.prop]" style="width: 75px" :placeholder="itemRange.placeholder" />
          <div class="line">—</div>
        </div>
      </el-form-item>
      <el-form-item
        v-for="(item,index) in $attrs.operatelist"
        v-show="item.show"
        :key="index"
        v-permission="item.permission"
      >
        <!-- :disabled="comp_disabled(item)" -->
        <el-button
          v-if="item.prop !== 'otherProfession'"
          :loading="item.loading"
          :type="item.type"
          :icon="item.icon"
          @click="item.click(item)"
        >{{ item.title }}</el-button>
        <el-dropdown v-if="item.prop === 'otherProfession'" @command="handleCommand">
          <el-button :type="item.type" :loading="item.loading">
            {{ item.title }}<i class="el-icon-caret-bottom" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="itemOther in item.otherProfession"
              :key="itemOther.prop"
              v-permission="itemOther.permission"
              :disabled="comp_disabled(itemOther)"
              :command="{item:item,itemOther:itemOther}"
            >
              <span>{{ itemOther.title }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>

    </el-form>
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
// import { getFeeList } from '@/api/oms/fin/feemanage'
import { getFeeSelectList } from '@/api/oms/fin/feemanage'
export default {
  name: 'Search',
  components: { },
  data() {
    return {
      selectForm: false,
      mixinPKey: {},
      goodstypeshowvalue: '',
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
    },
    handleCommand(command) {
      command.itemOther.click(command.itemOther, command.item)
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

.item-select-fa{
  /*flex: 1;*/
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
