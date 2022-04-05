<template>
  <!--  -->
  <el-table
    ref="Tab"
    size="mini"
    style="margin:0 24px;max-width:98%;width:751px"
    :header-cell-style="{background:'#F3F4F7',color:'#555'}"
    border
    highlight-current-row
    :max-height="tab_max_height"
    :data="$attrs['purchase-list']"
  >

    <el-table-column
      type="index"
      align="center"
      width="50"
      label="#"
      :fixed="!!$attrs['purchase-list'].length?'left':false"
    />
    <el-table-column
      prop="goodsName"
      align="center"
      width="300"
      label="商品名称"
    />
    <el-table-column
      prop="goodsCategoryId"
      align="center"
      width="120"
      label="商品类别"
    >
      <template slot-scope="{row}">
        {{ MenuGetPropName('categoryList',row.goodsCategoryId,{ value: 'id', label: 'name' }) }}
      </template>
    </el-table-column>

    <el-table-column
      prop="spec"
      align="center"
      width="200"
      label="规格"
    />
    <!-- 操作单条 -->
    <el-table-column
      :width="80"
      align="center"
      :fixed="!!$attrs['purchase-list'].length?'right':false"
      label="操作"
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
            class="my-op-class"
            type="text"
            size="mini"
            :loading="item.loading"
            :icon="item.icon"
            @click.stop="
              if(operateTableList.every(item => !item.loading )){
                item.click(item,row)
              }"
          />
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import MixinGlobal from '@/components/MixinGlobal'
export default {
  name: 'Order',
  components: { },
  // 全局常用字段
  mixins: [MixinGlobal],
  data() {
    return {
      operateTableList: [
        { title: '移除', show: true, prop: 'del', click: this.del, loading: false, icon: 'el-icon-delete', disabled: 'isRow', type: 'primary', width: 80 }
      ]
    }
  },
  computed: {
    tab_max_height() {
      return this.windowH - 400
    }
  },
  watch: {},
  created() {},
  methods: {
    del(e, row) { // 批量审核
      this.$listeners.del([row])
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
