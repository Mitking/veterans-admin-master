<template>
  <div class="formFeather" :style="{height:(windowHeight-150)+'px'}">
    <el-card style="margin:24px">
      <div style="color:#42b983;font-size: 1.2rem;font-weight:500">{{ $attrs['operate-item'].prop === 'repaylog'?'还款':'挂账' }}流水</div>
      <el-form size="mini" label-width="80px" inline style="margin-top:24px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="form.createTime"
            placeholder="全部"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="$listeners.RepayLog(form)">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="$attrs.loading"
        size="mini"
        :header-cell-style="{background:'#F3F4F7',color:'#555'}"
        style="margin-left:24px;max-width: 97%;"
        border
        :max-height="windowHeight-450"
        :data="$attrs['onaccount-log']"
      >
        <el-table-column
          align="center"
          prop="createTime"
          label="时间"
          width="160"
        />
        <el-table-column
          prop="name"
          label="挂账人"
          align="center"
        />
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'repaylog'"
          prop="repayAmount"
          label="本次还款"
          align="center"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.repayAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'onaccountlog'"
          prop="onaccountAmount"
          label="挂账金额"
          align="center"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.onaccountAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'onaccountlog'"
          prop="orderNo"
          label="挂账订单号"
          width="260"
          align="center"
        />
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'onaccountlog'"
          prop="storeId"
          label="挂账门店"
          align="center"
        >
          <template slot-scope="{row}">
            {{ MenuGetPropName('stores',row.storeId,{ value: 'id', label: 'name' }) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'onaccountlog'"
          prop="cashierAccount"
          label="收银账号"
          align="center"
        />

        <el-table-column
          v-if="$attrs['operate-item'].prop === 'repaylog'"
          prop="surplusRepayAmount"
          label="剩余待还"
          align="center"
        >
          <template slot-scope="{row}">
            {{ fen2yuan(row.surplusRepayAmount) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'repaylog'"
          prop="mobile"
          label="电话"
          align="center"
        />
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'repaylog'"
          prop="onaccountType"
          label="类型"
          align="center"
        ><template slot-scope="{row}">
          {{ MenuGetPropName('onaccount_type',row.onaccountType) }}
        </template>
        </el-table-column>
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'repaylog'"
          prop="company"
          label="公司"
          align="center"
          width="200"
        />
        <el-table-column
          v-if="$attrs['operate-item'].prop === 'repaylog'"
          prop="creatorName"
          label="操作人"
          align="center"
        />
      </el-table>
      <!--    底部    -->
      <div class="footer">
        <el-button @click="$listeners.formSave('detail')">关 闭</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'OmsAddCardForm',
  components: { },
  data() {
    return {
      form: {
        createTime: '',
        onaccountId: this.$attrs['current-row'].id
      },
      windowHeight: document.documentElement.clientHeight
    }
  },
  watch: {
    '$attrs.select_window_name': {
      handler(n) {
        this.Comp = n
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.formFeather{
  background-color: #f2f3f5;
  overflow-y: auto;
  width: 100%;
  height: 200%;
}
.footer{
  /*border:1px solid blue;*/
  position: relative;
  padding: 12px 24px 36px 0;
  float: right;
  z-index: 100;
}
</style>
