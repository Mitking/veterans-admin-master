<template>
  <div class="formFeather" :style="{height:(windowHeight-150)+'px'}">
    <el-card style="margin:24px">
      <div style="color:#42b983;font-size: 1.2rem;font-weight:500">批量添加</div>
      <component
        :is="Comp"
        :select_window_name="$attrs.select_window_name"
        :is_child="true"
        :add_arr="$attrs.add_arr"
        :table_goods_code_arr="$attrs.table_goods_code_arr"
        @selectList="$listeners.selectList"
        @addlist="$listeners.addlist"
      />
      <!--    底部    -->
      <div class="footer">
        <el-button @click="$listeners.closeAddwindow">关 闭</el-button>
        <el-button type="primary" :disabled="$attrs.add_arr.length===0" @click="$listeners.addlist">确 定</el-button>
      </div>
    </el-card>
  </div>

</template>

<script>
import ProductIndex from '@/views/core/product/product/index'
import User from '@/views/ums/admin/userSelectPage'
export default {
  name: 'CoreAddCardForm',
  components: { ProductIndex, User },
  data() {
    return {
      Comp: this.$attrs.select_window_name,
      windowHeight: document.documentElement.clientHeight,
      select_add_list: []
    }
  }
}
</script>

<style scoped>
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  height: 200%;
}
.footer{
  /*border:1px solid blue;*/
  position: relative;
  padding: 12px 24px 36px 0;
  float: right;
  z-index: 100;
}
</style>
