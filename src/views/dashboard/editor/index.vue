<template>
  <div class="dashboard-editor-container" style=" background: #F5F5FA;">
    <LocalAdd />
  </div>
</template>

<script>
import LocalAdd from '@/components/local/LocalAdd'
export default {
  name: 'DashboardEditor',
  components: { LocalAdd },
  data() {
    return {

    }
  },
  computed: {

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

  },
  methods: {

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
