import * as turf from '@turf/turf'

export function generateRectanglePolygon (minLongitude, minLatitude, maxLongitude, maxLatitude) {
  return turf.polygon([
    [
      [minLongitude, minLatitude],
      [minLongitude, maxLatitude],
      [maxLongitude, maxLatitude],
      [maxLongitude, minLatitude],
      [minLongitude, minLatitude]
    ]
  ])
}
