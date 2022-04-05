<template>
  <!--<div>{{ $attrs['form-data'] }}</div>-->
  <div>
    <el-table
      :data="$attrs.form"
      style="width: 100%;margin: 10px"
      :row-class-name="tableRowClassName"
      border
    >
      <el-table-column
        v-for="(item,index) in $attrs['form-data']"
        :key="index"
        :width="180"
      >
        <template slot="header">
          <div class="table-header">{{ item.title }}</div>
        </template>
        <template slot-scope="{row}">
          <!--          <div v-if="item.type==='if_type'">{{ MenuGetPropName(item.type,row[item.prop].toString()) }}</div>-->
          <!--          <div v-else>{{ row[item.prop] }}</div>-->
          <el-input v-if="item.type==='text' && !$attrs.readonly" v-model="row[item.prop]" :placeholder="item.placeholder || ''" :disabled="item.disabled" />
          <el-input v-if="item.type==='text' && $attrs.readonly" :value="row[item.prop]" placeholder="-" />
          <el-select v-if="item.type==='select' && !$attrs.readonly" v-model="row[item.prop]" class="item-select-fa" placeholder="请选择" :style="{width:item.width || '300px'}">
            <el-option
              v-for="itemSon in selectComputed(item)"
              :key="itemSon.value"
              :label="itemSon.name"
              :value="itemSon.value"
            />
          </el-select>
          <el-input v-if="item.type==='select' && $attrs.readonly" :readonly="$attrs.readonly" :value="selectComputed(item).filter(itemSon=>itemSon.value===row[item.prop])[0].name" />
          <div v-if="item.type==='if_type'" class="table-header">
            <span style="margin:0 3px">{{ MenuGetPropName(item.type,row[item.prop]?row[item.prop].toString():'false') }}</span>
            <!--      active-value="1" inactive-value="0"-->
            <el-switch
              v-if="!$attrs.readonly"
              v-model="row[item.prop]"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!$attrs.readonly" :width="180">
        <template slot="header">
          <div class="table-header">操作</div>
        </template>
        <template slot-scope="{row,$index}">
          <div class="footer">
            <el-button class="footer" :type="row.id?'danger':'warning'" size="mini" :loading="row.loading" @click="$set(row,'loading',true);del(row,$index)">
              {{ row.id?'删除':'移除' }}</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="!$attrs.readonly" class="footer-fa">
      <el-button class="footer" type="primary" size="mini" @click="add">追加</el-button>
    </div>
  </div>
</template>

<script>
import { deleteCombo } from '@/api/core/product'
export default {
  name: 'MixTable',
  data() {
    return {
      formwork: {}
    }
  },
  created() {
    this.$attrs['form-data'].map(item => {
      this.$set(this.formwork, item.prop, typeof (item.defaultValue) !== 'undefined' ? item.defaultValue : null)
    })
  },
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },
    add() {
      this.$attrs.form.push(this.deepClone(this.formwork))
    },
    del(e, index) {
      if (!e.id) {
        this.$attrs.form.splice(index, 1)
        return
      }
      if (this.$attrs.form.some(item => item.id === null)) {
        this.$message('移除或者提交新增组合品后操作！')
        e.loading = false
        return
      }
      this.$confirm(`此操作将永久删除组合品「ID:${e.id}」, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCombo({ 'id': e.id }).then(res => {
          if (res.code === 200) {
            this.$listeners.bresh()
            this.$success('操作成功')
          } else {
            this.$error(res.data)
          }
          e.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
        e.loading = false
      })
    }
  }
}
</script>

<style scoped>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.table-header{
  display: flex;
  justify-content: center;
}
.footer-fa{
  display: flex;
  /*border: 1px solid blue;*/
  flex-direction: column;
  width: 85%;
}
.footer{
  align-self: flex-end;
  /*margin-right: 180px;*/
}
</style>
