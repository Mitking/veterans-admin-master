<template>
  <!-- :page-size="$attrs.form.pageSize"
    :current-page="$attrs.form.pageNum" -->
  <el-pagination
    style="margin:12px"
    :current-page.sync="$attrs.form.pageNum"
    :page-size.sync="$attrs.form.pageSize"
    background
    layout="total,sizes,prev, pager, next,jumper"
    :total="Number($attrs['table-data'].total)"
    :page-sizes="[10, 20, 30, 50]"
    @size-change="$listeners.search({prop:''},$event,null)"
    @current-change="$listeners.search({prop:''},null,$event)"
  />
</template>

<script>
export default {
  name: 'MixPage',
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
