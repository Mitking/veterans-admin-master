<template>
  <div class="dashboard-editor-container">
    <h1 calss="m24">你好，{{ name }}</h1>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DashboardAdmin',
  data() {
    return {}
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
