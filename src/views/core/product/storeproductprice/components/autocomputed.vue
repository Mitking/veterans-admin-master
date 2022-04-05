<template>
  <el-card style="margin:14px">
    <div class="mb10">自动计算测试<span style="color:#999999;font-size: 0.8rem">四舍五入，保留两位小数</span>
      <el-button class="ml10" size="small" @click="$listeners.pushItem">追加</el-button>
    </div>
    <el-table
      :data="$attrs['auto-list']"
      border
      style="width:611px"
    >
      <el-table-column
        prop="switch"
        label="启用"
        width="100"
        align="center"
      >
        <template slot-scope="{row}">
          <el-checkbox v-model="row.switch" label="启用" />
        </template>
      </el-table-column>
      <el-table-column
        prop="basicPrice"
        label="原数据"
        width="180"
        align="center"
      >
        <template slot-scope="{row}">
          <el-select v-model="row.basicPrice" placeholder="基本价">
            <el-option
              v-for="(itemSon,indexSon) in selectComputed"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.value"
              :disabled="row.targetPrice===itemSon.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        prop="multiple"
        label="倍数"
        width="150"
        align="center"
      >
        <template slot-scope="{row}">
          <el-input v-model="row.multiple" style="width: 100px" />
        </template>
      </el-table-column>
      <el-table-column
        prop="targetPrice"
        label="修改数据"
        align="center"
        width="180"
      >
        <template slot-scope="{row}">
          <el-select v-model="row.targetPrice" placeholder="修改价">
            <el-option
              v-for="(itemSon,indexSon) in selectComputed"
              :key="indexSon"
              :label="itemSon.name"
              :value="itemSon.value"
              :disabled="$attrs['auto-list'].map(e=>e.targetPrice).includes(itemSon.value) || $attrs['auto-list'].map(e=>e.basicPrice).includes(itemSon.value)"
            />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  name: 'AutoComputed',
  data() {
    return {
      autoList: [
        {
          targetPrice: '',
          basicPrice: '',
          multiple: '',
          round: ''
        }
      ]
    }
  },
  computed: {
    selectComputed() {
      return this.$store.state.enum.enumList.price_type
    },
    comp_checkbox_value: {
      get() {
        return this.$attrs['auto-list-switch']
      },
      set(val) {
        this.$emit('update:auto_switch', val)
      }
    }
  },
  created() {}
}
</script>

<style scoped>

</style>
