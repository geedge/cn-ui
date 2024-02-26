import turf from 'turf'
import { propEach, featureReduce } from '@turf/meta'
import simpleStats from 'simple-statistics'
import { extent } from 'd3-array'

// cellSize: 六角网格每一边的大小（公里）
export default function hexbinDataConverter (data, cellSize = 0.5) {
  // 纽约的粗略地理边界框
  const bbox = [-74.24939, 40.50394, -73.701195, 40.90995]
  // const bbox = [74, 18, 136, 42]
  // const bbox = [74, 18, 136, 54]

  // 为给定的 bbox 和cellSize创建 hexbin（六边形） 几何形状
  const hexGrid = turf.hexGrid(bbox, cellSize)

  // 对我们的六边形几何体和数据点执行“空间连接”
  const collected = turf.collect(hexGrid, data, 'data', 'data')

  // 为每个六边形设置一个唯一id
  collected.features.forEach((feature, i) => {
    feature.id = i
  })
  // 过滤掉没有连接数据的多边形
  collected.features = collected.features.filter(d => d.properties.data.length)

  // 计算每个六边形里点的总数 count
  propEach(collected, props => {
    props.count = props.data.reduce((acc, cur) => acc += 1, 0)
  })

  // 将 count 拎出来
  const reduced = featureReduce(collected, (acc, cur) => {
    acc.push(cur.properties.count)
    return acc
  }, [])

  // 用 ckmeans 算法将值按大小分成3（设计图中的颜色数量）层
  const levels = simpleStats.ckmeans(reduced, 3)

  // 将六边形层级和该层的范围添加到数据中
  propEach(collected, props => {
    levels.forEach((level, index) => {
      if (level.indexOf(props.count) > -1) {
        props.level = index
        props.levelRange = extent(level)
      }
    })
  })

  return collected
}
