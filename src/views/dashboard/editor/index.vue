<template>
  <div class="dashboard-editor-container" style=" background: #F5F5FA;">
    <div class="dashboardTop">
      <div class="header-search-title">
        <div class="dashboardTleft">
          经营数据<i class="el-icon-s-tools" style="margin-left:5px" @click="dialogVisible = true" />
        </div>
        <SearchHeader
          :search-header="searchHeader"
          :loading="getChainLoading"
          @upChainData="getChain"
        />
      </div>
      <!-- 营业毛利 -->
      <el-row :gutter="windowW>1473?20:10" class="dashboardTContent" style="margin-left:24px;">
        <el-col v-for="(item,index) in ARRS" :key="index" :span="4">
          <el-card shadow="hover" style="borderRadius:10px;" class="my-card" :class="{'my-card-pad10':windowW>1473}" :body-style="{padding:'10px'}">
            <div slot="header" style="width:100%;display:flex;align-items:center">
              <img :src="require('@/assets/dbimg/'+item.type+'.png')" style="width:55px">
              <div>
                <div class="arrs-item-amount">{{ ['4','6','7','8'].includes(item.type) && item.amount || item.type==='3' && (DECIMAL.mul(item.amount,'100')+'%') || fen2yuan(item.amount) }}</div>
                <!-- <div class="arrs-item-amount">9999999.99</div> -->
                <div style="color:#888888;font-size:0.8rem">{{ MenuGetPropName('manage_analysis',item.type) }}</div>
              </div>
            </div>
            <div class="arrs-item">
              <span>环比</span>
              <div>
                <i
                  :style="{color:item.chain>0?'#28FF28':'#888888',fontSize:'.9rem'}"
                  :class="item.chain>0?'el-icon-top':'el-icon-bottom'"
                />{{ DECIMAL.mul(item.chain,'100') }} %</div>
            </div>
            <div class="arrs-item">
              <span>环比额</span>
              <div>{{ ['4','6','7','8'].includes(item.type) && item.chainAmount || item.type==='3' && (DECIMAL.mul(item.chainAmount,'100')+'%') || fen2yuan(item.chainAmount) }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div style="clear:both" />
    <!-- 2 -->
    <div class="dbMiddle">
      <!-- Echart style="border:1px solid blue" -->
      <div class="dbEchart">
        <div class="dbMiddleTitle">
          <div class="dashboardTleft" style="margin-left:12px">
            经营数据图
          </div>
          <div>
            类别
            <el-select v-model="categoryValue" style="width:150px" placeholder="请选择">
              <el-option
                v-for="item in $store.state.enum.enumList.manage_analysis"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
            <i :class="EchartTitleLoading?'el-icon-loading':'el-icon-refresh'" style="font-size:20px;margin:auto 20px;" @click="getEcharts" />
          </div>
        </div>
        <div class="dbEchartbox">
          <chart
            id="echartId"
            ref="echart"
            height="100%"
            width="100%"
            :category="categoryValue"
            :x-name="searchHeader.dateType===1?'时间':'日期'"
            :y-name="dataNameArr[categoryValue].xName"
            :x_data="echartDate.map(item=>item.time)"
            :line_data="echartDate.map(item=>item[dataNameArr[categoryValue].prop])"
          />
        </div>
      </div>
      <!-- 商品数据图 -->
      <div class="dbTOP10">
        <div class="dbMiddleTitle">
          <div class="dashboardTleft">
            商品数据图（TOP10）
          </div>
          <div class="dashboardTright">
            <i :class="Top10TitleLoading?'el-icon-loading':'el-icon-refresh'" style="font-size:20px;z-index:99" @click="getTopList" />
          </div>
        </div>
        <div class="dbTOP10List" style="">
          <div class="dbdbTOPName">
            <div class="dbdbTOPName1">排名</div>
            <div class="dbdbTOPName2">商品名称</div>
            <div class="dbdbTOPName3">销售量</div>
            <div class="dbdbTOPName4">销售额</div>
          </div>
          <div style="height:90%;width:100%;overflow: auto;">
            <div v-for="(itemsa,index) in topArr" :key="index" class="dbdbTOPName" style="line-height:1.6rem">
              <div class="dbdbTOPNames1">{{ index+1 }}</div>
              <div class="dbdbTOPNames2">{{ itemsa.goodsName }}</div>
              <div class="dbdbTOPNames3">{{ itemsa.saleNumber/1000 }}</div>
              <div class="dbdbTOPNames4">{{ fen2yuan(itemsa.saleAmount) }}</div>
              <div style="clear:both" />
            </div>
          </div>
        </div>
      </div>
      <!-- 待办事项 -->
      <div class="dbTodoList">
        <div class="dbMiddleTitle">
          <div class="dashboardTleft">
            待办事项<i class="el-icon-s-tools" style="margin-left:5px" @click="dialogNeedF" />
          </div>
          <div class="dashboardTright">
            <i :class="UnReviewTitleLoading?'el-icon-loading':'el-icon-refresh'" style="font-size:20px;z-index:99;margin-right:40px" @click="refreshUnReview" />
          </div>
        </div>
        <div>
          <div class="dbTOP10Lists">
            <div v-for="(item,index) in unReviewArr" :key="index" style="cursor: pointer;" @click="goUrl(unReviewAll.filter(itemz=>itemz.value===item.matter)[0].path)">
              <div class="dbTodoListNames1">{{ unReviewAll.filter(itemz=>itemz.value===item.matter)[0].name }}</div>
              <div class="dbTodoListNames2" style="color:red">{{ item.count }}</div>
              <div style="clear:both" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="clear:both" />
    <!-- 3 -->
    <div class="dbBottom">
      <div class="dbBottomUsed">
        <div class="BottomUsedTitle">
          常用业务<i class="el-icon-s-tools" style="margin-left:5px" @click="UsedF();dialogUsed = true" />
        </div>
        <!-- </div> -->
        <div class="dbUsedbox">
          <div
            v-for="(itemsd) in usedArr"
            :key="itemsd.index"
            class="dbUsedDiv"
            @click="goUrl(itemsd.path)"
          >
            {{ itemsd.title }}
          </div>
        </div>
      </div>
      <div class="bottom-kong">功能施工中...</div>
      <div class="bottom-msg">
        <div class="BottomUsedTitle">
          新零售服务
        </div>
        <div class="bottom-msg-fa">
          <div class="bottom-msg-item">
            <el-tooltip placement="top-start" effect="light">
              <div slot="content" class="msg-ewm">
                <div class="msg-ewm-item">
                  <img src="安卓码.png">
                  Android端
                </div>
                <div class="msg-ewm-item">
                  <img src="iOS码.png">
                  iOS端
                </div>
              </div>
              <img style="margin-right:6px;width:24px" src="icon_phone.png">
            </el-tooltip>
            奔多多新零售移动端下载
          </div>
        </div>
      </div>
    </div>
    <!-- 经营数据设置弹窗 -->
    <el-dialog
      title="经营数据设置"
      :visible.sync="dialogVisible"
      width="500px"
      height="500px"
      top="10%"
      :show-close="false"
    >
      <el-table
        :data="$store.state.enum.enumList.manage_analysis"
        style="width: 400px;margin:auto"
        @row-click="(row,e)=>{
          if(e.label==='是否启用'){
            return
          }
          if(ARRS_TYPE.includes(row.value)){
            ARRS_TYPE.remove(row.value)
          }else{
            ARRS_TYPE=MergeArray(ARRS_TYPE,row.value)
          }
        }"
      >
        <el-table-column
          prop="name"
          label="数据名称"
          width="200"
          align="center"
        />
        <el-table-column
          width="200"
          label="是否启用"
          align="center"
        >
          <template slot-scope="{row}">
            <el-checkbox v-model="ARRS_TYPE" :readonly="true" :label="row.value"><br></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setAnalysisData">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 待办事项设置弹窗 -->
    <el-dialog
      title="待办事项设置"
      :visible.sync="dialogNeed"
      width="500px"
      height="500px"
      top="10%"
      :show-close="false"
    >
      <el-table
        :data="unReviewAll"
        style="width: 400px;margin:auto"
        @row-click="(row,e)=>{
          if(is_permission_comp(row.permission)){
            $message.info('联系管理员设置权限')
            return
          }
          if(e.label==='是否启用'){
            return
          }
          if(UnReviewList.includes(row.value)){
            UnReviewList.remove(row.value)
          }else{
            UnReviewList=MergeArray(UnReviewList,[row.value])
          }
        }"
      >
        <el-table-column
          label="事项名称"
          width="200"
          align="center"
        >
          <template slot-scope="{row}">
            <div>
              <span :style="{color:is_permission_comp(row.permission)?'#ccc':''}">{{ row.name }}</span>
              <el-tag v-if="is_permission_comp(row.permission)" type="info" size="mini" effect="dark" class="ml10">未授权</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          width="200"
          label="是否启用"
          align="center"
        >
          <template slot-scope="{row}">
            <el-checkbox v-model="UnReviewList" :disabled="is_permission_comp(row.permission)" :label="row.value"><br></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogNeed = false">取 消</el-button>
        <el-button type="primary" @click="setReviewFn">确 定</el-button>
      </span>
    </el-dialog>
    <!--常用业务设置弹窗 -->
    <el-dialog
      title="常用业务设置"
      :visible.sync="dialogUsed"
      width="800px"
      top="10%"
      :show-close="false"
    >
      <span>
        <tree-transfer
          ref="wl-tree-transfer"
          class="tree-my"
          :title="title"
          :from_data="fromData"
          :to_data="toData"
          :default-props="{label:'name'}"
          :mode="mode"
          height="500px"
          filter
          open-all
        />
        <div style="clear:both" />
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogUsed = false;clearChecked()">取 消</el-button>
        <el-button type="primary" @click="getUsed">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Chart from './components/LineCustomerCountRes'
import treeTransfer from 'el-tree-transfer' // 引入
import dayjs from 'dayjs'
import {
  getChainData,
  getManageDataGroup,
  getUnReviewInfo,
  unreviewConfigForAdminister,
  getProductAnalysisRes,
  getDailyBusinessGroup,
  saveOrUpdateDailyBusiness,
  manageAnalysisConfig
} from '@/api/bms/dashboard'
import SearchHeader from './components/searchHeader'
export default {
  name: 'DashboardEditor',
  components: { treeTransfer, Chart, SearchHeader },
  data() {
    return {
      getChainLoading: false,
      EchartTitleLoading: false,
      Top10TitleLoading: false,
      UnReviewTitleLoading: false,
      searchHeader: {
        storeIds: [this.$store.getters.storeId],
        serachDate: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
        dateType: 4,
        beginDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD')
      },
      ARRS: [],
      ARRS_TYPE: [],
      echartDate: [],
      dataNameArr: {
        1: { type: '1', prop: 'turnover', xName: '营业额' },
        2: { type: '2', prop: 'gross', xName: '营业毛利' },
        3: { type: '3', prop: 'grossRate', xName: '毛利率(%)' },
        4: { type: '4', prop: 'upt', xName: '客单数' },
        5: { type: '5', prop: 'atv', xName: '客单价' },
        6: { type: '6', prop: 'grandTotalMembers', xName: '人数' },
        7: { type: '7', prop: 'newMembers', xName: '人数' },
        8: { type: '8', prop: 'inShoppers', xName: '人次' }
      },
      UnReviewList: [],
      unReviewAll: [
        { name: '未审核门店调出单', value: 1, path: '/send/sendcall', permission: 'wms:sendCall:getList' },
        { name: '未审核采购任务', value: 2, path: '/wms/pur/manage/task', permission: 'wms:pur:task:getList' },
        { name: '未审核采购订单', value: 3, path: '/wms/pur/manage/order', permission: 'wms:pur:order:getList' },
        { name: '未审核验收单', value: 4, path: '/send/accept', permission: 'wms:sendAccept:getList' },
        { name: '未审核差异单', value: 5, path: '/oms/fin/business/diff-index', permission: 'wms:pur:diff:order:getList' },
        // { name: '未审核采购补货', value: 6, path: '/wms/pur/diff/replenishment', permission: 'wms:pur:replenishment:order:getList' },
        { name: '未审核门店入库单', value: 7, path: '/send/storage', permission: 'wms:sendStorage:getList' },
        { name: '未审核报损单', value: 8, path: '/sto-inv/loss-order', permission: 'wms:stoLossOrder:getList' },
        { name: '未审核报溢单', value: 9, path: '/sto-inv/overflow-order', permission: 'wms:stoOverflowOrder:getList' },
        { name: '未审核盘点单', value: 10, path: '/sto-check/order', permission: 'wms:stoInvOrder:getList' },
        { name: '未审核仓储调出单', value: 11, path: '/sto-chain/sendcall', permission: 'wms:sendCall:getList' },
        { name: '未审核仓库收货单', value: 12, path: '/pur-sto/receive', permission: 'wms:stoReceiveOrder:getList' },
        { name: '未审核配送单', value: 13, path: '/sto-chain/delivery', permission: 'wms:sendDelivery:update:review' }
      ],
      dialogNeed: false,
      unReviewArr: [],
      emptyGif: 'https://wpimg.wallstcn.com/0e03b7da-db9e-4819-ba10-9016ddfdaed3',
      dialogVisible: false,
      dialogUsed: false,
      categoryValue: '1',
      topArr: [],
      usedArr: [],
      mode: 'transfer',
      title: ['全部业务', '常用业务'],
      fromData: [], // 穿梭框 - 源数据 - 树形
      toData: [], // 穿梭框 - 目标数据 - 树形
      toDatashow: []
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'storeId',
      'routes',
      'accountId'
    ]),
    is_permission_comp() {
      return function(per) {
        return !this.roles.includes(per)
      }
    }
  },
  watch: {
    'ARRS_TYPE': {
      handler(n) {
        if (n.length > 6) {
          this.ARRS_TYPE.pop()
          this.$message.info('不能大于6项')
        }
      },
      deep: true
    },
    'UnReviewList': {
      handler(n) {
        if (n.length > 10) {
          this.UnReviewList.pop()
          this.$message.info('不能大于10项')
        }
      },
      deep: true
    }
  },
  created() {},
  mounted() {
    this.getChain()
    // this.getEcharts()
    // this.refreshUnReview()
    this.UsedF()
    // this.getTopList()
  },
  methods: {
    dealDate() {
      const data = this.deepClone(this.searchHeader)
      if (!data.serachDate || data.serachDate.length === 0) {
        this.$message.info('请先选择日期')
        return false
      }
      if (data.storeIds.length === 0) {
        this.$message.info('请选择门店!')
        return false
      }

      if (data.dateType === 4) { // 自定义
        data.beginDate = data.serachDate[0]
        data.endDate = data.serachDate[1]
      }
      if (data.dateType === 1) { // 日
        data.beginDate = data.serachDate
        data.endDate = data.serachDate
      }
      if (data.dateType === 2) { // 月
        data.beginDate = data.serachDate + '-01'
        if (dayjs(data.serachDate).format('YYYY-MM') === dayjs().format('YYYY-MM')) { // 当前月
          data.endDate = dayjs().format('YYYY-MM-DD')
        } else {
          data.endDate = data.serachDate + '-' + dayjs(data.serachDate).daysInMonth()
        }
      }
      if (data.dateType === 3) { // 年
        data.beginDate = data.serachDate + '-01-01'
        if (dayjs(data.serachDate).format('YYYY') === dayjs().format('YYYY')) { // 当前年
          data.endDate = dayjs().format('YYYY-MM-DD')
        } else {
          data.endDate = data.serachDate + '-12-31'
        }
      }
      return data
    },
    getChain() {
      const data = this.dealDate()
      if (data === false) {
        return
      }
      this.getEcharts()
      this.refreshUnReview()
      // this.UsedF()
      this.getTopList()
      this.getChainLoading = true
      getChainData(data).then(res => {
        this.ARRS = res.data.items
        this.ARRS_TYPE = res.data.items.map(item => item.type)
      }).finally(() => {
        this.getChainLoading = false
      })
    },
    getEcharts() { // 经营数据图
      if (!this.searchHeader.serachDate || this.searchHeader.serachDate.length === 0) {
        return this.$message.info('请选择日期!')
      }
      if (this.searchHeader.storeIds.length === 0) {
        return this.$message.info('请选择门店!')
      }
      const data = this.dealDate()
      this.EchartTitleLoading = true
      getManageDataGroup(data).then((res) => {
        res.data.map(item => {
          item.turnover = this.fen2yuan(item.turnover)
          item.gross = this.fen2yuan(item.gross)
          item.atv = this.fen2yuan(item.atv)
          item.grossRate = this.yuan2fen(item.grossRate)
        })
        this.echartDate = res.data
        this.$nextTick(() => {
          this.$refs.echart.refresh()
        })
      }).finally(() => {
        this.EchartTitleLoading = false
      })
    },
    getTopList() {
      if (!this.searchHeader.serachDate || this.searchHeader.serachDate.length === 0) {
        return this.$message.info('请选择日期!')
      }
      if (this.searchHeader.storeIds.length === 0) {
        return this.$message.info('请选择门店!')
      }
      const data = this.dealDate()
      this.Top10TitleLoading = true
      getProductAnalysisRes(data).then(res => {
        this.topArr = res.data.top10
      }).finally(() => {
        this.Top10TitleLoading = false
      })
    },

    refreshUnReview() {
      if (this.searchHeader.storeIds.length === 0) {
        return this.$message.info('请选择门店!')
      }
      const data = { 'ifMobile': false, 'storeIds': this.searchHeader.storeIds }
      this.UnReviewTitleLoading = true
      getUnReviewInfo(data).then(res => {
        this.UnReviewList = res.data.items.map(item => item.matter)
        this.unReviewArr = res.data.items
      }).finally(() => {
        this.UnReviewTitleLoading = false
      })
    },
    dialogNeedF() {
      if (this.searchHeader.storeIds.length === 0) {
        return this.$message.info('请选择门店!')
      }
      this.dialogNeed = true
    },
    setReviewFn() {
      if (this.searchHeader.storeIds.length === 0) {
        return this.$message.info('请选择门店!')
      }
      unreviewConfigForAdminister({ matters: this.UnReviewList }).then(() => {
        this.$message.info('设置成功')
        this.dialogNeed = false
        this.refreshUnReview()
      })
    },
    UsedF() {
      var productJson = []
      this.routes.map((k) => {
        productJson.push({ id: k.meta.id, pid: '', name: k.meta.title, path: k.path, children: [] })
        if (k.children.length > 0) {
          k.children.map((c) => {
            productJson.map((w) => {
              if (c.meta.parentId === w.id && c.meta.title.substr(-4, 4) !== '(手机)') {
                w.children.push({ id: c.meta.id, pid: c.meta.parentId, path: k.path + '/' + c.path, name: c.meta.title })
              }
            })
          })
        }
      })
      this.fromData = productJson // 左侧数据
      var GJson = []
      getDailyBusinessGroup({}).then(res => {
        this.usedArr = res.data
        this.fromData.map((w) => {
          this.usedArr.map((p) => {
            if (w.id === p.menuId) {
              GJson.push({ id: w.id, pid: '', name: w.name, path: w.path })
            }

            if (w.children.length > 0) {
              w.children.map((v) => {
                if (v.id === p.menuId) {
                  GJson.push({ id: v.id, pid: v.pid, name: v.name, path: v.path })
                }
              })
            }
          })
        })
        this.toDatashow = GJson
        this.toData = []
        var isRight = []
        this.toDatashow.map((c) => {
          isRight.push(c.id)
        })
        setTimeout(() => {
          this.setChecked(isRight, isRight)
        }, 0)
      })
    },
    setAnalysisData() {
      manageAnalysisConfig({ manageAnalysisGroup: this.ARRS_TYPE }).then(() => {
        this.$message.info('设置成功')
        this.dialogVisible = false
        this.getChain()
      })
    },
    goUrl(url) {
      this.$router.push(url)
    },
    getDBGroup() {
      var GJson = []
      getDailyBusinessGroup({}).then(res => {
        this.usedArr = res.data
        this.fromData.map((w) => {
          this.usedArr.map((p) => {
            if (w.id === p.menuId) {
              GJson.push({ id: w.id, pid: '', name: w.name, path: w.path })
            }

            if (w.children.length > 0) {
              w.children.map((v) => {
                if (v.id === p.menuId) {
                  GJson.push({ id: v.id, pid: v.pid, name: v.name, path: w.path + '/' + v.path })
                }
              })
            }
          })
        })
        this.toDatashow = GJson
      }).catch(() => {
        this.$message.info('常用业务查询失败！')
      })
    },
    getUsed() {
      // 常用数据弹框确认
      // this.dialogUsed = false
      const checkeds = this.$refs['wl-tree-transfer'].getChecked()
      var trueArr = []
      checkeds.rightNodes.map((w) => {
        if (w.pid) {
          trueArr.push({ 'menuId': w.id, 'title': w.name, 'path': w.path })
        }
      })
      if (trueArr.length > 18 || trueArr.length === 0) {
        this.$message.info(`当前已选常用业务为${trueArr.length},不能为0项且设置最多18个`)
      } else {
        const Bdata = {
          'items': trueArr
        }
        saveOrUpdateDailyBusiness(Bdata).then(() => {
          this.dialogUsed = false
          this.getDBGroup()
        }).catch(() => {
          this.$message.info('常用业务设置失败！')
        })
      }
    },
    // 设置选中
    setChecked(left, right) {
      if (this.$refs['wl-tree-transfer']) {
        this.$refs['wl-tree-transfer'].setChecked(left, right)
      }
    },
    // 清除选中
    clearChecked() {
      this.$refs['wl-tree-transfer'].clearChecked()
    }
  }
}
</script>
// -
<style lang="scss" scoped>
  .emptyGif {
    display: block;
    width: 45%;
    margin: 0 auto;
  }
  .arrs-item{
    width:100%;
    display:flex;
    justify-content:space-between;
    color:#888888;font-size:0.8rem;
    line-height:1.2rem
  }
  .arrs-item-amount{
   font-weight:900;
   color:#000;
   font-size:1.2rem;
   line-height:1.8rem
  }
  .dashboardTop{
     width: 100%;
     min-width: 1200px;
     max-width: 2000px;
     height: 220px;
     margin: 0;
  }
  .header-search-title{
    width:100%;
    padding-left: 24px;
    padding-right: 24px;
    height: 40px;
    line-height: 40px;
    margin: 10px auto;
    display: flex;
    justify-content: space-between;
  }
  .dbMiddleTitle{
   display: flex;
   justify-content: space-between;
   align-items: center;
    width: 96%;
    height: 40px;
    line-height: 30px;
    margin-left:10px
  }
  .dashboardTleft{
   float: left;
   font-weight: bold;
  }
  .dashboardTright{
    float: right;
  }
  .dashboardTContent{
    width:96%;
    height: 150px;
  }
  .dashboard-editor-container {
     overflow-x:scroll;
     padding-bottom: 10px;
     max-height: 90vh;
     height: calc(100vh - 150px);
  }
  .dbrefresh{
    margin: 0 20px;
  }
  // 中间内容
  .dbMiddle{
    // width: 100%;
    // border: 1px solid blue;
    min-width: 1470px;
    max-width: 2000px;
    height: 320px;
    // margin-top: 30px;
  }
  .dbEchart{
     width: 49%;
    // width: 820px;
    min-width: 700px;
    height: 320px;
    // border: 1px solid;
    float: left;
    z-index: -1;
  }
  .dbEchartbox{
    height: 300px;
    background: #fff;
    border-radius: 8px;
    margin: 1px 24px;
    overflow: hidden;
    box-shadow: 2px 2px 5px #E9E9ED;
  }
  .dbTOP10List{
    width: 100%;
    height: 300px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 2px 2px 5px #E9E9ED;
  }
  .dbTOP10{
    width: 30%;
    min-width: 470px ;
    height: 320px;
    float: left;
    margin-left: 1%;
  }
  .dbdbTOPName1{
    font-size: 14px;
    color: #999999;
    width: 40px;
    text-align: center;
    float: left;
    margin-left: 10px;
    margin-top: 10px;
  }
  .dbdbTOPName2{
    font-size: 14px;
    color: #999999;
    // width: 254px;
    width: 240px;
    text-align: left;
    float: left;
    margin-top: 10px;
  }
  .dbdbTOPName3{
    font-size: 14px;
    color: #999999;
    width: 80px;
    text-align: center;
    float: left;
    margin-top: 10px;
  }
  .dbdbTOPName4{
    font-size: 14px;
    color: #999999;
    width: 90px;
    text-align: center;
    float: right;
    margin-right: 10px;
    margin-top: 10px;
  }
  .dbdbTOPNames1{
    font-size: 14px;
    width: 40px;
    text-align: center;
    float: left;
    margin-left: 10px;
    // margin-top: 10px;
  }
  .dbdbTOPNames2{
    font-size: 14px;
    width: 240px;
    text-align: left;
    float: left;
    // margin-top: 10px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .dbdbTOPNames3{
    font-size: 14px;
    width: 80px;
    text-align: center;
    float: left;
    // margin-top: 10px;
  }
  .dbdbTOPNames4{
    font-size: 14px;
    width: 90px;
    text-align: center;
    float: right;
    // margin-right: 10px;
    // margin-top: 10px;
  }
  //待办事项
  .dbTodoList{
    width: 16%;
    height: 350px;
    // border: 1px solid;
    float: left;
    z-index: -1;
    margin-left: 2%;
  }
  .dbTOP10Lists{
    width: 90%;
    height: 300px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 2px 2px 5px #E9E9ED;
    padding-bottom: 10px;
    overflow: auto;
  }
  .dbTodoListNames1{
    font-size: 14px;
    float: left;
    margin-left: 10px;
    margin-top: 12px;
  }
  .dbTodoListNames2{
    font-size: 14px;
    float: right;
    text-align: right;
    margin-left: 10px;
    margin-top: 12px;
    margin-right: 22px;
  }
  .dbBottom{
    min-width: 1470px;
    max-width: 2000px;
    display: flex;
  }
  /* 常用业务 */
  .dbBottomUsed{
   width: 49%;
  }
  .bottom-kong{
   width: 30%;
   min-width: 470px;
   margin-left: 1%;
   border-radius: 8px;
   background: #ffffff;
   display: flex;
   align-items: center;
   justify-content: center;
   color:#ccc;
   margin-top:31px;
   box-shadow: 2px 2px 5px #E9E9ED;
  }
  .bottom-msg{
   width:14.5%;
   margin-left: 2%;
  }
  .bottom-msg-fa{
   border-radius: 8px;
   background: #ffffff;
   height: 81%;
   box-shadow: 2px 2px 5px #E9E9ED;
  }
  .bottom-msg-item{
   display: flex;
   align-items: center;
   justify-content: center;
   line-height: 4rem;
   font-size: 0.95rem;
   font-weight: 600;
  }
  .msg-ewm{
   background: #fff;
   display: flex;
  }
  .msg-ewm-item{
    display: flex;
    flex-direction: column;
    color:#000000;
    margin:5px;
    justify-content: center;
    align-items: center;
  }
  .BottomUsedTitle{
    margin-left:24px;
    height:2rem;
    line-height: 2rem;
    font-weight: bold;
  }
  .dbUsedbox{
    min-width:670px;
    max-width:930px;
    min-height: 100px;
    background: #fff;
    border-radius: 8px;
    margin: 0 24px;
    box-shadow: 2px 2px 5px #E9E9ED;
    padding: 10px 0;
  }
  .dbUsedDiv{
    display: inline-block;
    // border: 1px solid blue;
    width: 8rem;
    // float: left;
    text-align: left;
    margin: 6px 8px;
    cursor: pointer;
  }
  .el-form-item__error{
    display: none !important;
  }
  .el-form-item{
    margin-bottom: 0 !important;
  }
  ::v-deep .wl-transfer .transfer-main{
    height: calc(100% - 61px) !important
  }
  ::v-deep .el-table__header .el-table-column--selection .cell .el-checkbox:after {
  content: "全选";
}
  ::v-deep .wl-transfer .transfer-title {
  margin:0;
}
.my-card ::v-deep .el-card__header{
 padding:20px 5px
}
.my-card-pad10 ::v-deep .el-card__header{
 padding:20px 10px
}
</style>
