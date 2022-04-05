<template>
  <!--  !点击有效返回上级无效，点击无效返回上级有效-->
  <div>
    <el-button v-if="data.state" size="mini" type="success" @click="trigger(0)">
      {{ validText }}
    </el-button>
    <el-button v-else size="mini" type="danger" @click="trigger(1)">
      {{ invalidText }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'StateTag',
  props: {
    row: {
      required: true,
      type: Object,
      default: () => {
        return {}
      }
    },
    validText: {
      type: String,
      default: () => {
        return '有效'
      }
    },
    invalidText: {
      type: String,
      default: () => {
        return '无效'
      }
    }
  },
  data() {
    return {
      data: this.row
    }
  },
  methods: {
    trigger(flag) {
      if (!flag) {
        this.$confirm('确认禁用该条记录么？', '提示', { type: 'warning' }).then(() => {
          this.data.state = flag
          this.tellParent(this.data)
        }).catch(() => {
        })
      } else {
        this.data.state = flag
        this.tellParent(this.data)
      }
    },
    tellParent(data) {
      this.$emit('change', data)
    }
  }
}
</script>
