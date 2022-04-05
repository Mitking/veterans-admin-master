<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style>
   .my-class-pt0 .el-dialog__body{
    padding-top: 0;
   }
   .el-table--border .el-table__cell:first-child .cell{
    padding-left: 0 !important;
  }
  .el-table--border .el-table__cell:first-child .cell{
   padding-right: 0 !important;
  }
  .el-table th, .el-table td {
    padding:8px 8px
    }
    .el-table--mini th{
     padding:6px
    }
    .el-table--mini td{
      padding:3px
    }
    .el-table .cell{
     padding:0px
    }
  .app-main {
    padding: 0 8px;
  }
  .m10 {
    margin: 10px;
  }
  .m24 {
    margin: 24px;
  }
  .m24-24-10-24 {
    margin: 24px 24px 10px 24px;
  }
  .m10-24-24-24 {
    margin: 10px 24px 24px 24px;
  }

  .ml10 {
    margin-left: 10px;
  }
  .mr10 {
    margin-right: 10px;
  }
  .mt10 {
    margin-top: 10px;
  }
  .mb10 {
    margin-bottom: 10px;
  }
  .rep-tab-max-height{
   height:calc(100vh - 300px);
   overflow: auto;
  }
  .title-add-form {
    width: 100%;
    background-color: #ffffff;
    line-height: 3.6rem;
    padding-left: 20px;
    font-size: 20px;
    color: #42b983;
    font-weight: bold;
  }
  .my-op-class{
    padding:0;
    font-size:20px;
    line-height:24px;
    height: 26px;
    box-sizing:border-box;
   }
.my-op-class:hover {
  font-size:22px;
  color:rgb(0, 68, 195);
}
/* 滚动条优化 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
:hover::-webkit-scrollbar-thumb {
 background-color:#d8d8e7;
}

::-webkit-scrollbar-thumb {
  background-color:#dedfe2 ;
  border-radius: 5px;
}
.path-lint-to{
 cursor: pointer;
 color: rgb(23, 103, 251);
 text-decoration:underline
}
.path-lint-to:hover{
 color: rgb(0, 73, 207);
}
</style>
