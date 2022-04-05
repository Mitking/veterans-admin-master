<template>
  <!-- :page-size="$attrs.form.pageSize"
    :current-page="$attrs.form.pageNum" -->
  <el-pagination
    style="margin:12px"
    :current-page="$attrs.form.pageNum"
    background
    layout="total,sizes,prev, pager, next,jumper"
    :total="$attrs['table-data'].total"
    :page-sizes="[10, 20, 30, 50]"
    @size-change="$listeners.search(null,$event)"
    @current-change="$listeners.search($event,null)"
  />
</template>

<script>
export default {
  name: 'LocalPage',
  computed: {},
  watch: {
    // '$attrs.form.pageNum': {
    //   handler(n) {
    //     if (n) {
    //       this.$listeners.search()
    //     }
    //   },
    //   deep: true
    // },
    //
    // '$attrs.form.pageSize': {
    //   handler(n) {
    //     if (n) {
    //       this.$listeners.search()
    //     }
    //   },
    //   deep: true
    // }
  }
}
</script>

<style scoped>

</style>
