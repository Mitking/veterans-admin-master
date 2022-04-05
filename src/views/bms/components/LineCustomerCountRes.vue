<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from '../line/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chart: null,
      colorList: ['#c23531', '#59dd78']
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption({
        backgroundColor: '#ffffff',
        title: {
          top: 0,
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#333333'
          },
          left: '1%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#57617B'
            }
          }
        },
        legend: {
          icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          left: 'center',
          bottom: 'bottom',
          textStyle: {
            fontSize: 12,
            color: '#333333'
          }
        },
        grid: {
          top: 60,
          left: '2%',
          right: '100px',
          bottom: '40',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          name: '时段',
          nameLocation: 'end',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          }
        }],
        yAxis: [{
          type: 'value',
          name: '人次',
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#57617B'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          },
          splitLine: {
            lineStyle: {
              color: '#eeeeee'
            }
          }
        }]
      })
    },
    refresh() {
      const legendData = this.$attrs.legend_arr.map(item => item.name)
      const xAxisData = this.$attrs.x_data
      const series = this.$attrs.line_data.map((item, index) => {
        delete item.title
        return {
          name: legendData[index],
          type: 'line',
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            normal: {
              width: 1
            }
          },
          itemStyle: {
            normal: {
              color: this.colorList[index],
              borderColor: this.colorList[index],
              borderWidth: 5
            }
          },
          data: Object.values(item)
        }
      })
      this.chart.setOption({ series, xAxis: { data: xAxisData }, legend: { data: legendData }}, { replaceMerge: ['xAxis', 'yAxis', 'legend', 'series'] })
    }
  }
}
</script>
