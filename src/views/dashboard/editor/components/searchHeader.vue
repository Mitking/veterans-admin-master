<template>
  <div style="display:flex;align-items:center">
    <div v-if="[0,2,3].includes(accountType)" style="margin-right:10px">
      门店
      <el-cascader
        v-if="[0, 3].includes(accountType)"
        v-model="$attrs['search-header'].storeIds"
        style="width:350px"
        :options="storesOptions"
        :props="{ multiple: true,emitPath:false }"
        collapse-tags
        clearable
      />
      <el-select
        v-if="[2].includes(accountType)"
        v-model="$attrs['search-header'].storeIds"
        style="width:300px"
        placeholder="请选择"
        multiple
        collapse-tags
      >
        <el-option
          v-for="(itemSon,indexSon) in enumGetproplist({selectData:'stores'}).filter(item=>item.orgId===$store.getters.orgId)"
          :key="indexSon"
          :label="itemSon.name"
          :value="itemSon.id"
        />
      </el-select>
    </div>
    <div>
      日期
      <el-select v-model="$attrs['search-header'].dateType" style="width: 100px;" placeholder="请选择" @change="setDefaultDate">
        <el-option
          v-for="item in dateA"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <!-- <el-date-picker
      v-if="($attrs['search-header'].dateType===3)"
      :key="1"
      v-model="$attrs['search-header'].serachDate"
      style="margin-left:10px;margin-right:80px"
      type="year"
      value-format="yyyy"
      placeholder="选择年"
    />
    <el-date-picker
      v-if="($attrs['search-header'].dateType===2)"
      :key="2"
      v-model="$attrs['search-header'].serachDate"
      style="margin-left:10px;margin-right:80px"
      type="month"
      value-format="yyyy-MM"
      placeholder="选择月"
    />
    <el-date-picker
      v-if="($attrs['search-header'].dateType===1)"
      :key="3"
      v-model="$attrs['search-header'].serachDate"
      style="margin-left:10px;margin-right:80px"
      type="date"
      value-format="yyyy-MM-dd"
      placeholder="选择日期"
    /> -->
    <el-date-picker
      v-if="($attrs['search-header'].dateType===4)"
      :key="4"
      v-model="$attrs['search-header'].serachDate"
      :picker-options="pickerOptions"
      type="daterange"
      style="width:300px;margin-left:10px"
      value-format="yyyy-MM-dd"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
    <i :class="$attrs.loading?'el-icon-loading':'el-icon-refresh'" style="font-size:20px;line-height: 40px;margin:auto 20px" @click="$listeners.upChainData" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { queryOrgByAccountId } from '@/api/ums/org'
import { getStoreList } from '@/api/core/store'
import store from '@/store'
import dayjs from 'dayjs'
export default {
  name: 'SearchHeader',
  components: {},
  data() {
    return {
      storesOptions: [],
      dateA: [{
        value: 1,
        label: '日'
      }, {
        value: 2,
        label: '月'
      }, {
        value: 3,
        label: '年'
      }, {
        value: 4,
        label: '自定义'
      }],
      pickerOptions: {
        onPick: ({ maxDate, minDate }) => {
          this.ismonth = minDate.getTime()
          if (maxDate) {
            this.ismonth = ''
          }
        },
        disabledDate: (time) => {
          if (this.ismonth !== '') {
            const one = 30 * 24 * 3600 * 1000
            const minTime = this.ismonth - one
            const maxTime = this.ismonth + one
            return time.getTime() < minTime || time.getTime() > maxTime
          }
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'accountType',
      'accountId'
    ])
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      Promise.all([
        queryOrgByAccountId({ accountId: this.accountType !== 0 ? this.accountId : null }).catch(() => ({ code: 500 })),
        getStoreList({}).catch(() => ({ code: 500 }))
      ]).then((res) => {
        if (res[0].code === 200 && res[1].code === 200) {
          console.log('首页已加载组织门店数据')
          store.dispatch('enum/add_enum', { organizes: res[0].data || [] })
          store.dispatch('enum/add_enum', { stores: res[1].data || [] })
          const store_org = this.groupByProp(this.$store.getters.enumList.stores, 'orgId')
          this.storesOptions = store_org.map(item => ({
            label: this.MenuGetPropName('organizes', item.orgId, { label: 'orgShortName', value: 'id' }),
            value: item.id,
            children: item.children.map(itemC => ({
              label: itemC.name,
              value: itemC.id
            }))
          }))
        } else {
          this.$message.info('组织门店列表加载失败!')
        }
      })
    },
    setDefaultDate() {
      switch (this.$attrs['search-header'].dateType) {
        case 1: // 日
          this.$attrs['search-header'].serachDate = dayjs().format('YYYY-MM-DD')
          break
        case 2: // 月
          this.$attrs['search-header'].serachDate = dayjs().format('YYYY-MM')
          break
        case 3: // 年
          this.$attrs['search-header'].serachDate = dayjs().format('YYYY')
          break
        case 4: // 自定义
          this.$attrs['search-header'].serachDate = [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
          break
      }
    }
  }
}
</script>
<style>
 /* .dashboardTright{
    float: right;
  } */
   .dbrefresh{
    margin: 0 20px;
  }
</style>
