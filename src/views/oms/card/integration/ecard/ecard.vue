<template>
  <div>
    <!--搜索栏目 @enter="transition=false;transitionMarginTop=0"-->
    <mix-search
      v-show="searchFormShow"
      ref="searchForm"
      :readonly-from-page="mixin_select_form_show"
      :form="searchForm"
      :formlist="searchList"
      v-bind="$attrs"
      @search="search({ prop: true })"
      @opForm="MixinOpenForm"
      @clickClear="searchForm[$event]=''"
    />
    <!-- 操作栏目 -->
    <mix-operate
      :style="{'margin-top':searchFormShow?'0px':'24px','transition':transition?null:'all .3s ease'}"
      :operate-list="operateList"
      :ids="ids"
      :current-row="currentRow"
      :back="true"
      :rows="mixin_rows"
      :search-form-show="searchFormShow"
      @search-form-act="
        searchFormShow = !searchFormShow;
        $nextTick(() => {
          $emit('update:search_form_height', $refs.searchForm.$el.offsetHeight)
        })"
    />
    <!--    表格 @row-dblclick="openModel(operateItem=operateList[1])" " -->
    <el-table
      ref="Tab"
      v-loading="Mixin_loading"
      style="margin:0 24px;max-width:98%;"
      :style="{width:minxin_width_total(ArrFilter($attrs['form-data'],{show:true,tabHidden:undefined}),{op:true,opWidth:55+(mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0)})}"
      :header-cell-style="{background:'#F3F4F7',color:'#555'}"
      border
      :max-height="mixin_tab_max_height"
      highlight-current-row
      :data="tableData.records"
      @row-click="(row) => {$refs.Tab.toggleRowSelection(row)}"
      @selection-change="handleSelectionChange"
    >
      <!--   可选  -->
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :fixed="!!tableData.records.length?'left':false"
      />
      <!--   v-if="item.show" 表头  -->
      <el-table-column
        v-for="(item,index) in ArrFilter($attrs['form-data'],{show:true})"
        :key="index"
        :prop="item.prop"
        align="center"
        :width="item.width || '220'"
      >
        <template slot="header">
          <div>{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <div v-if="item.type==='if_type' || item.type==='if_enable'" :style="{color:row[item.prop]?null:'#999999'}">{{ MenuGetPropName(item.type,row[item.prop]) }}</div>
          <div v-else-if="item.type==='select' || item.type==='selectState' || item.type==='selectFromPage'">{{ MenuGetPropName(item.selectData,row[item.prop],item.selectOption?item.selectOption:{ value: '', label: '' }) }}</div>
          <div v-else-if="item.type==='PRICE' || item.type==='PRICE_AUTOMATIC'">{{ fen2yuan(row[item.prop]) }}</div>
          <!--          v-else-->
          <div v-else>{{ row[item.prop] }}</div>
        </template>
      </el-table-column>
      <!-- 操作单条 -->
      <el-table-column
        v-if="mixTableOprateLength"
        :width="mixTableOprateLength===1 && 70 || mixTableOprateLength>1 && mixTableOprateLength*40 || 0"
        align="center"
        :fixed="!!tableData.records.length?'right':false"
        label="操作"
        class="my-op-fa"
      >
        <template slot-scope="{ row }">
          <el-tooltip
            v-for="item in operateTableList"
            :key="item.prop"
            effect="light"
            :content="item.title"
            placement="top"
            :hide-after="1000"
            :enterable="false"
            :disabled="$store.state.app.tooltipDisabled"
          >
            <el-button
              v-show="item.show"
              v-permission="item.permission"
              class="my-op-class"
              type="text"
              size="mini"
              :loading="item.loading"
              :icon="item.icon"
              @click.stop="
                if(operateTableList.every(item => !item.loading )){
                  currentRow=row;
                  $listeners.currentSelect(currentRow);
                  item.click(item)
                }"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <mix-page ref="mixinPage" :form="searchForm" :table-data="tableData" @search="search" />
    <!--搜索条件弹窗-->
    <el-dialog
      class="my-class-pt0"
      :title="mixin_dialog_item.selectForm==='SupplierIndex' && '供应商' ||
        mixin_dialog_item.selectForm==='User' && '员工选择'"
      :visible.sync="mixin_select_form_show"
      :width="mixin_dialog_item.selectForm==='User' && '50%' || '80%'"
    >
      <div style="width: 100%;padding-right:15px">
        <component
          :is="mixin_dialog_item.selectForm"
          :is_child="true"
          @selectList="MixinDialogSelect"
          @addlist="mixin_select_form_show=false"
        />
      </div>
      <div slot="footer" style="marginTop:-20px">
        <el-button type="primary" @click="mixin_select_form_show = false">确 定</el-button>
      </div>
    </el-dialog>
    <!--导入弹窗-->
    <el-dialog
      title="导入乐檬电子会员卡"
      :visible.sync="inputCardShow"
      :before-close="(done)=>{if(uploading){return}operateList[1].loading=false;done()}"
      width="400px"
    >
      <div style="display:flex;justify-content:center">
        <el-upload
          v-loading="uploading"
          :show-file-list="false"
          action=""
          drag
          :http-request="handleSuccess"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
import { getPage, importLemengCardInfo } from '@/api/oms/card/ecard'
import User from '@/views/ums/admin/userSelectPage'

export default {
  name: 'Order',
  components: { User },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      searchList: [ // 搜索栏项目
        // { title: '组织', accountTypeShowFn: () => [3].includes(this.$store.getters.accountType), width: 200, prop: 'orgId', type: 'select', defaultValue: [3].includes(this.$store.getters.accountType) ? 0 : this.$store.getters.orgId, selectData: 'organizes', selectOption: { label: 'orgShortName', value: 'id' }},
        // { title: '门店', show: false, width: 200, prop: 'storeId', type: 'select', selectData: 'stores', fatherProp: 'orgId', selectOption: { label: 'name', value: 'id' }},
        { title: '会员卡号', prop: 'cardNo', type: 'text', width: '300px' },
        { title: '会员手机号', prop: 'mobile', type: 'text', width: '300px' }
      ],
      operateTableList: [
        { title: '充值', show: true, prop: 'edit', click: this.$listeners.openModel, loading: false, icon: 'el-icon-money', disabled: 'isRow', type: 'primary', permission: ['oms:ecard:recharge'], width: 80 },
        { title: '金额流水', show: true, prop: 'repaylog', click: this.$listeners.openModel, loading: false, icon: 'el-icon-bank-card', disabled: 'isRow', type: 'primary', permission: ['oms:ecard:getEcardLogList'], width: 80 },
        { title: '积分流水', show: true, prop: 'onaccountlog', click: this.$listeners.openModel, loading: false, icon: 'el-icon-coin', disabled: 'isRow', type: 'primary', permission: ['oms:ecard:ecardPointLogList'], width: 80 }
      ],
      operateList: [ // 操作栏项目
        { title: '查询', show: true, prop: 'search', click: this.search, icon: 'el-icon-search', disabled: false, type: 'primary', permission: ['oms:ecard:getEcardList'], width: 80 }
        // { title: '导入乐檬电子会员卡', show: true, prop: 'import', click: this.inputCard, icon: 'el-icon-download', disabled: false, type: 'primary', permission: ['oms:ecard:store:importLemengCardInfo'], width: 80 }
      ],
      inputCardShow: false,
      uploading: false,
      ids: [],
      selectRows: [],
      currentRow: { id: '' }, // 当前选择数据

      transition: true, // 动画开始
      transitionMarginTop: 0, // 上部
      otherOffsetHeight: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10
      },
      operateItem: { title: '', prop: '', icon: '' },
      tableData: {
        records: [],
        total: 0
      },
      details: [] // 详细数据
    }
  },
  computed: {
    idsLength() {
      return true
    }
  },
  watch: {},
  created() {
    console.log('重新加载')
    this.mixTableOprateLength = this.mix_oprate_length(this.operateTableList)
    this.searchList.map(item => {
      this.$set(this.searchForm, item.prop, this.searchForm[item.prop] || (item.defaultValue !== undefined ? item.defaultValue : '')) // searchForm有值，优先用值
    })
    this.$nextTick(() => {
      this.$emit('update:search_form_height', this.$refs.searchForm.$el.offsetHeight)
    })
  },
  methods: {
    inputCard(e) {
      e.loading = true
      this.inputCardShow = true
    },
    handleSuccess(files) {
      this.uploading = true
      const file = new FormData()
      file.append('file', files.file)
      importLemengCardInfo(file).then(res => {
        this.inputCardShow = false
        this.message(res)
      }).finally(() => {
        this.operateList[1].loading = false
        this.uploading = false
      })
    },
    handleSelectionChange(rows) {
      this.selectRows = rows
      this.ids = rows.map(item => item.id)
      this.mixin_rows = rows
    },
    message(res) {
      if (res.code === 200) {
        this.search({ prop: '' }, null, this.searchForm.pageNum)
        this.$success('操作成功')
      } else {
        this.$error(res.data)
      }
    },
    search(operateItem = { prop: '' }, pageSize = null, pageNum = null) { // 操作
      this.searchForm.pageSize = pageSize || this.searchForm.pageSize
      this.searchForm.pageNum = pageNum || this.searchForm.pageNum
      this.searchForm.pageNum = operateItem.prop ? 1 : this.searchForm.pageNum
      const searchForm = this.deepClone(this.searchForm)
      Object.keys(searchForm).forEach(item => { searchForm[item] = searchForm[item] || null })

      this.Mixin_loading = true
      getPage(searchForm).then(res => {
        this.currentRow = { id: '' }
        if (res.code === 200) {
          if (res.data.records.length === 0 && searchForm.pageNum !== 1) {
            this.search({ prop: '' }, null, searchForm.pageNum - 1)
          } else {
            this.tableData = res.data
            this.Mixin_loading = false
          }
        }
      })
    }
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
