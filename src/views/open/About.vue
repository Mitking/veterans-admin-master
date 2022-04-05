<template>
  <div class="container">
    <div v-html="data.about" />
  </div>
</template>

<script type="text/javascript">
import { getAbout } from '@/api/core/about.js'
export default {
  name: 'About',
  data() {
    return {
      data: {}
    }
  },
  created() {
    this.getAbout()
  },
  methods: {
    getAbout() {
      getAbout({ id: 1 }).then(res => {
        this.data = res.data
      })
    }
  }
}
</script>

<style scoped>
.container{
  padding: 1%;
}
</style>
