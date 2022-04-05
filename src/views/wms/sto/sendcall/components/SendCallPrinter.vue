<template>
  <div>
    <div id="printPage">
      <div v-for="(item,index) in list" :key="index" class="page-box">
        <div class="top">
          <div class="title">调出单</div>
          <div class="page-num">第{{ item.pageNum }}页，共{{ item.pageMax }}页</div>
          <ul class="list-items">
            <li>调出单号：{{ item.callNo }}</li>
            <li>发货门店：{{ item.shipStoreName }}</li>
            <li>发货仓库：{{ item.shipStockName }}</li>
            <li>收货门店：{{ item.receiptStoreName }}</li>
          </ul>
        </div>
        <div class="table-box">
          <table>
            <thead>
              <tr>
                <th style="width:30px">序号</th>
                <th style="width:140px">商品代码</th>
                <th style="width:220px">商品名称</th>
                <th style="width:70px">规格</th>
                <th style="width:40px">单位</th>
                <th style="width:70px">数量</th>
                <th style="width:120px">备注</th>
                <th style="width:200px">其他</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node,_index) in item.nodes" :key="_index">
                <td v-if="item.pageNum === 1">{{ _index+1 }}</td>
                <td v-else>{{ (_index + 1) + (item.pageNum - 1) * maxLine }}</td>
                <td>{{ node.goodsCode }}</td>
                <td>{{ node.goodsName }}</td>
                <td>{{ node.spec }}</td>
                <td>{{ node.weightType }}</td>
                <td>{{ g2kg(node.number) }}</td>
                <td>{{ node.remark }}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <div class="sign">
          <ul class="table-total">
            <li>合计</li>
            <li>品项：{{ item.goodsCount }}件</li>
            <li>数量：{{ item.sum }}</li>
          </ul>
          <ul class="sign-list">
            <li class="sign-list-item1">制单人：{{ item.creatorName }}</li>
            <li class="sign-list-item1">审核人：{{ item.auditPerson }}</li>
            <li class="sign-list-item1">打印人：{{ item.printPerson }}</li>
            <li class="sign-list-item2">打印时间：{{ item.printTime }}</li>
            <li class="sign-list-item3">备注：</li>
          </ul>
          <ul class="sign-list">
            <li class="sign-list-item1">仓管员签字：</li>
            <li class="sign-list-item1">财务签字：</li>
            <li class="sign-list-item1">出库人签字：</li>
            <li class="sign-list-item2">司机签字：</li>
            <li>店长签字：</li>
          </ul>
        </div>
      </div>
    </div>
    <div slot="footer" class="footer">
      <el-button v-print="'#printPage'" type="primary">打 印</el-button>
    </div>
  </div>
</template>

<script type="text/javascript">
import { getSendCallPrint } from '@/api/wms/sendcall'

export default {
  name: 'SendCallPrinter',
  props: {
    callNumbers: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      maxLine: 5 || 20,
      list: [],
      pageMax: 1,
      currentPage: 1
    }
  },
  mounted() {
    this.getSendCallPrint()
  },
  methods: {
    getSendCallPrint() {
      getSendCallPrint({ callNos: this.callNumbers }).then(res => {
        res.data.forEach(item => {
          // 总行
          const lines = item.printItems.length
          const itemMaxPage = parseInt((lines - 1) / this.maxLine + 1)
          for (let l = 1; l <= itemMaxPage; l++) {
            // 一行
            const line = {
              callNo: item.callNo,
              shipStoreName: item.shipStoreName,
              shipStockName: item.shipStockName,
              receiptStoreName: item.receiptStoreName,
              creatorName: item.creatorName,
              auditPerson: item.auditPerson,
              printPerson: item.printPerson,
              printTime: item.printTime,
              goodsCount: lines,
              nodes: item.printItems.splice(0, this.maxLine),
              pageNum: l
            }
            const sum = line.nodes.map(item => item.number).reduce((pre, cur) => pre + cur, 0)
            line.sum = this.g2kg(sum)
            line.pageMax = itemMaxPage
            this.list.push(line)
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.page-box{
  color: #000000!important;
  height: 820px;
  width: 1200px;
  position: relative;
}
.top{
  height: 80px;
  width: 100%;
}
.title{
  font-size: 20px;
  text-align: center;
  padding-bottom: 10px;
  position: relative;
}
ul,li{
  list-style: none;
  padding: 0;
}
.list-items{
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-start;
}
.list-items li{
  flex: 0 0 25%;
  font-size: 12px;
  margin: 4px 0;
}
.page-num{
  font-size: 10px;
  position: absolute;
  right: 0;
  top: 0;
}
table,table tr th, table tr td {
  border:1px solid #333333;
  padding: 2px;
  overflow: hidden;
}
table{
  table-layout: fixed;
  width: 500px;

}
tr{
  height: 20px;
}
td{
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
table{
  border-collapse: collapse;
  width: 100%;
  line-height: 24px;
  font-size: 12px;
  text-align: center;
}
.table-total{
  display: flex;
  font-size: 14px;
  font-weight: bold;
  justify-content: flex-end;
}
.table-total li{
  margin-left: 20px;
}
.sign{
  height: 80px;
}
.sign-list{
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-start;
  font-size: 12px;
}
.sign-list-item1{
  flex: 0 0 14%;
}
.sign-list-item2{
  flex: 0 0 22%;
}
.sign-list-item3{
  flex: 0 0 35%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.footer{
  padding: 16px 24px;
  text-align: right;
  position: fixed;
  bottom: 0;
  right: 24px;
}
</style>
