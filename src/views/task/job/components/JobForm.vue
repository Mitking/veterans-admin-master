<template>
  <el-form ref="form" :rules="rules" :model="form" label-width="80px">
    <el-form-item label="模块" prop="module">
      <el-select v-model="form.module">
        <el-option v-for="(value, key) in modules" :key="key" :label="value" :value="parseInt(key)" />
      </el-select>
    </el-form-item>
    <el-form-item label="任务名称" prop="taskName">
      <el-input v-model.trim="form.taskName" />
    </el-form-item>
    <el-form-item label="触发" prop="jobHandler">
      <el-input v-model.trim="form.jobHandler" placeholder="触发Bean，首字母小写" />
    </el-form-item>
    <el-form-item label="CRON" prop="cron">
      <el-input v-model.trim="form.cron" />
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model.trim="form.remark" />
    </el-form-item>
    <el-form-item>
      <el-button v-loading="loading" type="primary" @click="onSubmit">
        <template v-if="formType === 'insert'">
          创建
        </template>
        <template v-else>
          修改
        </template>
      </el-button>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { addJob, updateJob } from '@/api/task/task'

export default {
  name: 'JobForm',
  props: {
    row: {
      type: Object,
      default: () => {
      }
    },
    formType: {
      type: String,
      default: () => ''
    },
    modules: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      form: {},
      loading: false,
      rules: {
        module: [
          { required: true, message: '请选择所属模块' }
        ],
        taskName: [
          { required: true, message: '请输入任务名称' },
          { min: 1, max: 40, message: '任务名称长度1 - 40' }
        ],
        jobHandler: [
          { required: true, message: '请输入触发Bean' },
          { min: 1, max: 40, message: '触发Bean长度1 - 40' }
        ],
        cron: [
          { required: true, message: '请输入表达式' },
          { min: 1, max: 30, message: '表达式长度1 - 30' }
        ],
        remark: [
          { min: 1, max: 80, message: '备注长度1 - 80' }
        ]
      }
    }
  },
  mounted() {
    this.reset()
  },
  methods: {
    reset() {
      this.form = {
        module: null,
        taskName: '',
        jobHandler: '',
        rate: 0,
        cron: '',
        remark: ''
      }
      this.$refs.form.resetFields()
      if (this.formType !== 'insert') {
        this.form = { ...this.row }
      }
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.formType === 'insert') {
            addJob(this.form).then(res => {
              this.$message.info('添加成功')
              this.$emit('success')
            })
          } else {
            updateJob(this.form).then(res => {
              this.$message.info('添加成功')
              this.$emit('success')
            })
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
