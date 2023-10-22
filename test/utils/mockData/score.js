export const zeroData = {
  tcpLostlenPercent: 0,
  pktRetransPercent: 0,
  sslConLatency: null,
  httpResponseLatency: 0,
  establishLatencyMs: 0
}

export const undefinedData = {
  tcpLostlenPercent: undefined,
  pktRetransPercent: undefined,
  sslConLatency: undefined,
  httpResponseLatency: undefined,
  establishLatencyMs: undefined
}

export const commonData = {
  tcpLostlenPercent: 0.02,
  pktRetransPercent: 0.005,
  sslConLatency: 350,
  httpResponseLatency: 160,
  establishLatencyMs: 180
}

export const commonScoreBase = {
  establishLatencyMs: {
    p10: 10,
    p90: 200
  },
  httpResponseLatency: {
    p10: 20,
    p90: 200
  },
  sslConLatency: {
    p10: 30,
    p90: 300
  },
  tcpLostlenPercent: {
    p10: 0.005,
    p90: 0.05
  },
  pktRetransPercent: {
    p10: 0.01,
    p90: 0.2
  }
}

export const commonData2 = {
  tcpLostlenPercent: 0.034,
  pktRetransPercent: 0.145,
  sslConLatency: 500,
  httpResponseLatency: 32,
  establishLatencyMs: 183
}

export const commonScoreBase2 = {
  establishLatencyMs: {
    p10: 90,
    p90: 250
  },
  httpResponseLatency: {
    p10: 60,
    p90: 200
  },
  sslConLatency: {
    p10: 300,
    p90: 800
  },
  tcpLostlenPercent: {
    p10: 0.01,
    p90: 0.2
  },
  pktRetransPercent: {
    p10: 0.05,
    p90: 0.3
  }
}
