<template>
  <el-pagination
    style="margin-top: 10px;"
    :current-page="options.currentPage"
    :total="options.total"
    :page-size="options.pageSize"
    :page-sizes="[10, 20, 30, 50, 60, 100, 200]"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script>
export default {
  name: 'MyPagination',
  props: {
    options: {
      type: Object,
      default: () => {
        return {
          currentPage: 1,
          pageSize: 10,
          total: 0
        }
      }
    }
  },
  data() {
    return {
      currentPage: 1
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('size-change', val)
    },
    handleCurrentChange(val) {
      this.$emit('current-change', val)
    }
  }
}
</script>

<style scoped>

</style>
