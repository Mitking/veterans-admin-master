<template>
  <div>
    <!-- 操作栏目 -->
    <mix-operate
      style="margin-top:20px"
      :operate-list="operateList"
      :back="false"
    />
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      style="margin-top:0"
      :form="searchForm"
      :formlist="searchList"
      :form-data="dataList"
      v-bind="$attrs"
      @search="getDate"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%"
      :style="{width:minxin_width_total(ArrFilter(dataList,{show:true}))}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      max-height="700"
      highlight-current-row
      :data="tableData"
    >
      <el-table-column
        v-for="(item,index) in dataList"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '200'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="editShow">
            <div v-if="item.prop==='generateMonth'">{{ item.selectData[row[item.prop]].name }}</div>
            <el-select
              v-else-if="item.type==='select'"
              v-model="row[item.prop]"
              size="mini"
              placeholder="请选择"
              :style="{width:item.width || '150px'}"
            >
              <el-option
                v-for="(itemSon,indexSon) in selectComputed(item,row)"
                :key="indexSon+100"
                :label="itemSon[item.selectOption?item.selectOption.label:'name']"
                :value="itemSon[item.selectOption?item.selectOption.value:'value']"
              />
            </el-select>
            <el-input
              v-else-if="item.type==='PRICE'"
              v-model="row[item.prop+'Show']"
              v-number-input.float="{decimal:2}"
              size="mini"
              :readonly="item.readonly"
              :placeholder="item.placeholder || ''"
              @input="()=>{row[item.prop]=yuan2fen(row[item.prop+'Show'])}"
            >
              <div slot="prefix" style="line-height: 1.75rem">
                <span>￥</span>
              </div>
            </el-input>
            <el-input v-else v-model="row[item.prop]" size="mini" />
          </div>
          <div v-else>
            <div v-if="item.prop==='generateMonth'">{{ item.selectData[row[item.prop]].name }}</div>
            <div v-else-if="item.type==='select'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
            <div v-else-if="item.type==='PRICE'">{{ row[item.prop+'Show'] }}</div>
            <div v-else>{{ row[item.prop] }}</div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage, updateOrSave } from '@/api/wms/retaildistributional'
export default {
  name: 'Order',
  components: {},
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    const mouthList = [
      { name: '一月', value: 0 }, { name: '二月', value: 1 }, { name: '三月', value: 2 }, { name: '四月', value: 3 },
      { name: '五月', value: 4 }, { name: '六月', value: 5 }, { name: '七月', value: 6 }, { name: '八月', value: 7 },
      { name: '九月', value: 8 }, { name: '十月', value: 9 }, { name: '十一月', value: 10 }, { name: '十二月', value: 11 }
    ]
    return {
      editShow: false,
      searchList: [ // 搜索栏项目
        { title: '组织', prop: 'orgId', type: 'select', defaultValue: this.$store.getters.orgId, accountTypeShowFn: () => ([0, 3].includes(this.$store.getters.accountType)), selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, width: '300px' },
        { title: '门店', prop: 'storeId', defaultValue: this.$store.getters.accountType === 1 ? this.$store.state.user.storeId : 0, accountTypeShowFn: () => ([0, 3, 2].includes(this.$store.getters.accountType)), type: 'select', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, width: '300px', fatherProp: 'orgId',
          defaultAllValue: this.$store.state.user.storeId }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.getDate, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['retail:distributional:target:getAll'], width: 80 },
        { title: '编辑', show: true, prop: 'insert', click: this.edit, loading: false, icon: 'el-icon-edit-outline', disabled: false, type: 'primary', permission: ['retail:distributional:target:save'], width: 80 },
        { title: '生成', show: true, prop: 'detail', click: this.generator, loading: false, icon: 'el-icon-document', disabled: false, type: 'primary', permission: ['retail:distributional:target:save'], width: 80 }
        // { title: '修改', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        // { title: '删除', show: true, prop: 'delete', click: this.del, loading: false, icon: 'el-icon-minus', disabled: 'isRow', type: 'primary', permission: ['ums:role:page'], width: 80 },
        // { title: '审核', show: true, prop: 'edit', click: this.$listeners.review, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
        // { title: '审核', prop: 'edit', click: this.reviews, loading: false, icon: 'el-icon-edit-outline', disabled: 'ids', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 }
        // { title: '复制', prop: 'copy', click: this.$listeners.openModel, loading: false, icon: 'el-icon-edit-outline', disabled: 'isRow', type: 'primary', permission: ['ums:role:grantMenu', 'ums:role:page'], width: 80 },
      ],
      dataList: [
        { title: '生成月份', width: 100, prop: 'generateMonth', show: true, type: 'select', selectData: mouthList, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: 'ID', prop: 'id', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '组织', prop: 'generateOrgId', show: true, type: 'select', selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        // { title: '门店', prop: 'generateStoreId', show: true, type: 'select', fatherPropName: 'orgId', fatherProp: 'generateOrgId', selectData: 'stores', selectOption: { label: 'name', value: 'id' }, editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月配送额目标', width: 150, prop: 'mdat', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月配销差额目标', width: 150, prop: 'mdbt', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月会员存款额目标', width: 150, prop: 'mmdt', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月新增会员数目标', width: 150, prop: 'mnmt', show: true, type: 'text', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月客单数目标', width: 150, prop: 'mont', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月毛利额目标', width: 150, prop: 'monthGrossProfitTarget', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' },
        { title: '月销售额目标', width: 150, prop: 'monthSalesTarget', show: true, type: 'PRICE', editShow: true, detailShow: true, addFatherProp: 'Req' }
      ],

      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: [],
      details: [] // 详细数据
    }
  },
  computed: {
    priceKeys() {
      return this.dataList.filter(item => item.type === 'PRICE').map(k => k.prop)
    },
    TEMP_DATA() { // 模板数据
      const temp = []
      const temp_obj = {}
      this.dataList.map(item => {
        temp_obj[item.prop] = ''
        if (item.type === 'PRICE') {
          temp_obj[item.prop + 'Show'] = '-'
        }
        // if (item.prop === 'generateOrgId' || item.prop === 'generateStoreId') {
        //   temp_obj[item.prop] = ''
        // }
      })
      this.dataList[0].selectData.map(item => {
        const obj = this.deepClone(Object.assign(temp_obj, { generateMonth: item.value }))
        temp.push(obj)
      })
      return temp
    },
    selectComputed() { // select选项集
      return function(propitem, row) {
        if (this.enumGetproplist(propitem) === undefined) { // 不存在字典数据
          console.log('更新视图后即可获取数据')
        }
        if (propitem.fatherProp) { // 当有父级过滤的时候,二级联动
          let temp = this.enumGetproplist(propitem) || []
          temp = temp.filter(item => row[propitem.fatherProp] === 0 ? true : item[propitem.fatherPropName || propitem.fatherProp] === row[propitem.fatherProp])
          if (!temp.map(item => item[propitem.selectOption ? propitem.selectOption.value : 'value']).includes(row[propitem.prop])) {
            row[propitem.prop] = (propitem.defaultAllValue !== undefined ? (temp.length > 0 ? temp[0][propitem.selectOption ? propitem.selectOption.value : 'value'] : '') : '')
          }
          return temp
        }
        return this.enumGetproplist(propitem) || propitem.selectData || []
      }
    }
  },
  watch: {
    editShow: {
      handler(n) {
        this.operateList[2].disabled = !n
      },
      deep: true,
      immediate: true
    },
    'searchForm.storeId': {
      handler() {
        this.getDate()
      },
      deep: false,
      immediate: false
    }
  },
  created() {
    console.log('重新加载')
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
  },
  methods: {
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    getDate() {
      this.Mixin_loading = true
      this.operateList[1].loading = true
      getPage({ storeId: this.searchForm.storeId }).then(res => {
        if (res.code === 200) {
          res.data.map(item => {
            Object.keys(item).map(key => {
              if (this.priceKeys.includes(key)) {
                item[key + 'Show'] = this.fen2yuan(item[key])
              } else {
                item[key] = Number(item[key])
              }
            })
          })
          const temp = this.deepClone(this.TEMP_DATA)
          temp.map((item, index) => {
            res.data.map(itemZ => {
              if (item.generateMonth === itemZ.generateMonth) {
                temp[index] = itemZ
              }
            })
          })
          this.tableData = temp
          this.Mixin_loading = false
        }
      }).finally(() => {
        this.Mixin_loading = false
        this.operateList[1].loading = false
      })
    },
    save() {
      console.log('save')

      if (!this.searchForm.storeId) {
        this.$message.error('请先选择门店')
        this.operateList[1].loading = false
        return
      }
      const temp = this.deepClone(this.tableData)
      temp.map(item => { item.generateStoreId = this.searchForm.storeId })
      updateOrSave({ distributionalSaveModels: temp }).then(res => {
        if (res.code === 200) {
          this.getDate()
          this.operateList[1].title = '编辑'
          this.editShow = false
        }
      }).catch(() => {
        this.$message.error('网络错误,请查看控制台')
      }).finally(() => {
        this.operateList[1].loading = false
      })
    },
    edit() {
      if (this.operateList[1].title === '编辑') {
        this.editShow = true
        this.operateList[1].title = '保存'
      } else {
        this.operateList[1].loading = true
        this.save()
      }
    },
    generator() {
      this.tableData.map((item, index) => {
        const temp = this.deepClone(Object.assign(this.deepClone(this.tableData[0]), { generateMonth: item.generateMonth }, { id: (item.id || null) }))
        this.$set(this.tableData, index, temp)
      })
    }
    // save(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
    //   this.searchForm.pageSize = pageSize || this.searchForm.pageSize
    //   this.searchForm.pageNum = pageNum || this.searchForm.pageNum
    //   this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
    //   const searchForm = this.deepClone(this.searchForm)
    //   Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })
    //
    //   this.Mixin_loading = true
    //   getPage(searchForm).then(res => {
    //     this.currentRow = { id: '' }
    //     if (res.code === 200) {
    //       if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
    //         this.search({ prop: '' }, null, searchForm.pageNum - 1)
    //       } else {
    //         this.tableData = res.data
    //         this.Mixin_loading = false
    //       }
    //     }
    //   })
    // }
    // del(operateItem = {}) {
    //   operateItem.loading = true
    //   this.$confirm(`此操作将永久删除${this.mix_comp_find_order_title_name('stoInvPlanNo', this.$attrs['form-data'])}「${this.currentRow.stoInvPlanNo}」, 是否继续?`, '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     // this.operateItem.loading = true
    //     deleteOrder({ 'stoInvPlanNo': this.currentRow.stoInvPlanNo }).then(res => {
    //       this.message(res)
    //       operateItem.loading = false
    //     }).catch(err => {
    //       operateItem.loading = false
    //       throw err
    //     })
    //   }).catch(() => {
    //     this.$message({
    //       type: 'info',
    //       message: '已取消删除'
    //     })
    //     operateItem.loading = false
    //   })
    // },
    // reviews() { // 批量审核
    //   review({ 'ids': this.ids, 'auditStatus': '3' }).then(res => {
    //     this.message(res)
    //   })
    // },

  }
}
</script>

<style scoped>
.transition{
  /*position: absolute;*/
  transition:all .3s ease;
  margin-top: 0;
  top: 0;
}
</style>
