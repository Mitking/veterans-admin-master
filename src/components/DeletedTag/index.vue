<template>
  <!--  !点击有效返回上级无效，点击无效返回上级有效-->
  <div>
    <el-button v-if="!removed" plain size="mini" icon="el-icon-success" type="primary" @click="trigger(1)">
      {{ removedText }}
    </el-button>
    <el-button v-else plain size="mini" icon="el-icon-error" type="danger" @click="trigger(0)">
      {{ invalidText }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'DeletedTag',
  props: {
    deleted: {
      type: [Number, Boolean],
      default: () => {
        return -1
      }
    },
    removedText: {
      type: String,
      default: () => {
        return '临时删除'
      }
    },
    invalidText: {
      type: String,
      default: () => {
        return '有效'
      }
    }
  },
  data() {
    return {
      removed: this.deleted
    }
  },
  methods: {
    trigger(deleted) {
      if (deleted) {
        this.$confirm('确认删除该条记录么？', '提示', { type: 'warning' }).then(() => {
          this.removed = true
          this.tellParent(deleted)
        }).catch(() => {
        })
      } else {
        this.removed = false
        this.tellParent(deleted)
      }
    },
    tellParent(deleted) {
      this.$emit('change', deleted)
    }
  }
}
</script>
