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
      colorList: {
        1: '#c23531',
        2: '#2f4554',
        3: '#61a0a8',
        4: '#d48265',
        5: '#91c7ae',
        6: '#749f83',
        7: '#ca8622',
        8: '#bda29a'
      }
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
          top: 20,
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
          top: 20,
          icon: 'rect',
          itemWidth: 14,
          itemHeight: 5,
          itemGap: 13,
          right: '4%',
          textStyle: {
            fontSize: 12,
            color: '#333333'
          }
        },
        grid: {
          top: 100,
          left: '2%',
          right: '100px',
          bottom: '2%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          name: '日期',
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
          name: '(元)',
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
      }, true)
    },
    refresh() {
      this.initChart()
      const keys = Object.keys(this.$attrs.line_data.priceTypeMap)
      const legendData = this.$attrs.legend_arr.map(item => item.name)
      const xAxisData = this.$attrs.x_data
      const series = keys.map(item => {
        return {
          name: this.MenuGetPropName('price_type', item),
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
              color: this.colorList[item],
              borderColor: this.colorList[item],
              borderWidth: 5
            }
          },
          data: this.$attrs.line_data.priceTypeMap[item].map(item => [item.date, this.fen2yuan(item.price)])
        }
      })
      this.chart.setOption({ series, xAxis: { data: xAxisData }, legend: { data: legendData }})
    }
  }
}
</script>
