export const mockData = {
  common: {
    drillDown: {
      data1: {
        status: 200,
        data: { status: 200, code: 200, queryKey: '176825b31c1b552bca8b3ec494cb7af3', success: true, message: null, statistics: { elapsed: 10, rows_read: 112586, bytes_read: 10235742, result_size: 771, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ip', type: 'string', category: 'Dimension' }, { name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p50', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p90', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p95', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p99', type: 'double', category: 'Metric' }, { name: 'http_response_latency_avg', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p50', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p90', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p95', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p99', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p50', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p90', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p95', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p99', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p50', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p90', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p95', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p99', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p50', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p90', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p95', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { ip: '116.178.70.242', establishLatencyMsAvg: 130.8252, establishLatencyMsP50: 81, establishLatencyMsP90: 262, establishLatencyMsP95: 445, establishLatencyMsP99: 601, httpResponseLatencyAvg: 598.2844, httpResponseLatencyP50: 88, httpResponseLatencyP90: 2282, httpResponseLatencyP95: 2949, httpResponseLatencyP99: 4620, sslConLatencyAvg: 1, sslConLatencyP50: 0, sslConLatencyP90: 0, sslConLatencyP95: 0, sslConLatencyP99: 0, tcpLostlenPercentAvg: 0.0108, tcpLostlenPercentP50: 0.0017, tcpLostlenPercentP90: 0.0224, tcpLostlenPercentP95: 0.0346, tcpLostlenPercentP99: 0.1372, pktRetransPercentAvg: 0.0379, pktRetransPercentP50: 0.0202, pktRetransPercentP90: 0.0946, pktRetransPercentP95: 0.1047, pktRetransPercentP99: 0.183 } }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20ip%20AS%20ip%2C%20ROUND%28AVG%28avg_establish_latency_ms%29%2C%204%29%20AS%20establish_latency_ms_avg%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.50%29%29%20AS%20establish_latency_ms_p50%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.90%29%29%20AS%20establish_latency_ms_p90%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.95%29%29%20AS%20establish_latency_ms_p95%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.99%29%29%20AS%20establish_latency_ms_p99%2C%20ROUND%28AVG%28avg_http_response_latency_ms%29%2C%204%29%20AS%20http_response_latency_avg%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.50%29%29%20AS%20http_response_latency_p50%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.90%29%29%20AS%20http_response_latency_p90%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.95%29%29%20AS%20http_response_latency_p95%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.99%29%29%20AS%20http_response_latency_p99%2C%20ROUND%28AVG%28avg_ssl_con_latency_ms%29%2C%204%29%20AS%20ssl_con_latency_avg%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.50%29%29%20AS%20ssl_con_latency_p50%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.90%29%29%20AS%20ssl_con_latency_p90%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.95%29%29%20AS%20ssl_con_latency_p95%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.99%29%29%20AS%20ssl_con_latency_p99%2C%20ROUND%28AVG%28tcp_lostlen_ratio%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.50%29%2C%204%29%20AS%20tcp_lostlen_percent_p50%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.90%29%2C%204%29%20AS%20tcp_lostlen_percent_p90%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.95%29%2C%204%29%20AS%20tcp_lostlen_percent_p95%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.99%29%2C%204%29%20AS%20tcp_lostlen_percent_p99%2C%20ROUND%28AVG%28pkt_retrans_ratio%29%2C%204%29%20AS%20pkt_retrans_percent_avg%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.50%29%2C%204%29%20AS%20pkt_retrans_percent_p50%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.90%29%2C%204%29%20AS%20pkt_retrans_percent_p90%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.95%29%2C%204%29%20AS%20pkt_retrans_percent_p95%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.99%29%2C%204%29%20AS%20pkt_retrans_percent_p99%20FROM%20metric_ip%20WHERE%20%20stat_time%20%3E%3D%201675215165%20AND%20stat_time%20%3C%201675218765%20%20%20AND%20%28ip%3D%27116.178.70.242%27%20and%20side%3D%27server%27%29%20%20GROUP%20BY%20ip&format=json&option=real-time', msg: 'OK' }
      },
      data2: {
        status: 200,
        data: { status: 200, code: 200, queryKey: 'c45cc8bbb2aecd158c72a550093c07bb', success: true, message: null, statistics: { elapsed: 10, rows_read: 109487, bytes_read: 9949922, result_size: 769, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ip', type: 'string', category: 'Dimension' }, { name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p50', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p90', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p95', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p99', type: 'double', category: 'Metric' }, { name: 'http_response_latency_avg', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p50', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p90', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p95', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p99', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p50', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p90', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p95', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p99', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p50', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p90', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p95', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p99', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p50', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p90', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p95', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { ip: '116.178.70.242', establishLatencyMsAvg: 86.5147, establishLatencyMsP50: 68, establishLatencyMsP90: 131, establishLatencyMsP95: 152, establishLatencyMsP99: 321, httpResponseLatencyAvg: 311.6164, httpResponseLatencyP50: 66, httpResponseLatencyP90: 305, httpResponseLatencyP95: 592, httpResponseLatencyP99: 5724, sslConLatencyAvg: 1, sslConLatencyP50: 0, sslConLatencyP90: 0, sslConLatencyP95: 0, sslConLatencyP99: 0, tcpLostlenPercentAvg: 0.0147, tcpLostlenPercentP50: 0.0011, tcpLostlenPercentP90: 0.0226, tcpLostlenPercentP95: 0.0357, tcpLostlenPercentP99: 0.2522, pktRetransPercentAvg: 0.0357, pktRetransPercentP50: 0.0192, pktRetransPercentP90: 0.0919, pktRetransPercentP95: 0.1043, pktRetransPercentP99: 0.2249 } }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20ip%20AS%20ip%2C%20ROUND%28AVG%28avg_establish_latency_ms%29%2C%204%29%20AS%20establish_latency_ms_avg%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.50%29%29%20AS%20establish_latency_ms_p50%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.90%29%29%20AS%20establish_latency_ms_p90%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.95%29%29%20AS%20establish_latency_ms_p95%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.99%29%29%20AS%20establish_latency_ms_p99%2C%20ROUND%28AVG%28avg_http_response_latency_ms%29%2C%204%29%20AS%20http_response_latency_avg%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.50%29%29%20AS%20http_response_latency_p50%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.90%29%29%20AS%20http_response_latency_p90%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.95%29%29%20AS%20http_response_latency_p95%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.99%29%29%20AS%20http_response_latency_p99%2C%20ROUND%28AVG%28avg_ssl_con_latency_ms%29%2C%204%29%20AS%20ssl_con_latency_avg%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.50%29%29%20AS%20ssl_con_latency_p50%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.90%29%29%20AS%20ssl_con_latency_p90%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.95%29%29%20AS%20ssl_con_latency_p95%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.99%29%29%20AS%20ssl_con_latency_p99%2C%20ROUND%28AVG%28tcp_lostlen_ratio%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.50%29%2C%204%29%20AS%20tcp_lostlen_percent_p50%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.90%29%2C%204%29%20AS%20tcp_lostlen_percent_p90%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.95%29%2C%204%29%20AS%20tcp_lostlen_percent_p95%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.99%29%2C%204%29%20AS%20tcp_lostlen_percent_p99%2C%20ROUND%28AVG%28pkt_retrans_ratio%29%2C%204%29%20AS%20pkt_retrans_percent_avg%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.50%29%2C%204%29%20AS%20pkt_retrans_percent_p50%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.90%29%2C%204%29%20AS%20pkt_retrans_percent_p90%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.95%29%2C%204%29%20AS%20pkt_retrans_percent_p95%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.99%29%2C%204%29%20AS%20pkt_retrans_percent_p99%20FROM%20metric_ip%20WHERE%20%20stat_time%20%3E%3D%201675215165-3600%20AND%20stat_time%20%3C%201675218765-3600%20%20%20AND%20%28ip%3D%27116.178.70.242%27%20and%20side%3D%27server%27%29%20%20GROUP%20BY%20ip&format=json&option=real-time', msg: 'OK' }
      }
    },
    notDrillDown: {
      cycle0: {
        tcp0: {
          status: 200,
          data: { status: 200, code: 200, queryKey: '43786ef6059289466ee0870e51fd4e10', success: true, message: null, statistics: { elapsed: 13, rows_read: 112696, bytes_read: 3831664, result_size: 149, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p50', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p90', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p95', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { establishLatencyMsAvg: 92, establishLatencyMsP50: 49, establishLatencyMsP90: 91, establishLatencyMsP95: 160, establishLatencyMsP99: 789 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28common_establish_latency_ms%29%29%20AS%20establish_latency_ms_avg%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.5%29%29%20AS%20establish_latency_ms_p50%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.9%29%29%20AS%20establish_latency_ms_p90%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.95%29%29%20AS%20establish_latency_ms_p95%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.99%29%29%20AS%20establish_latency_ms_p99%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%27IPv6_TCP%27%29%20&format=json&option=real-time', msg: 'OK' }
        },
        http0: {
          status: 200,
          data: { status: 200, code: 200, queryKey: '9c24dd3ad820f76adc84c261c7754a1e', success: true, message: null, statistics: { elapsed: 8, rows_read: 112696, bytes_read: 3319507, result_size: 157, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'http_response_latency_avg', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p50', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p90', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p95', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { httpResponseLatencyAvg: 193, httpResponseLatencyP50: 56, httpResponseLatencyP90: 128, httpResponseLatencyP95: 266, httpResponseLatencyP99: 2093 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28http_response_latency_ms%29%29%20AS%20http_response_latency_avg%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.5%29%29%20AS%20http_response_latency_p50%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.9%29%29%20AS%20http_response_latency_p90%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.95%29%29%20AS%20http_response_latency_p95%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.99%29%29%20AS%20http_response_latency_p99%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_schema_type%20%3D%20%27HTTP%27%20&format=json&option=real-time', msg: 'OK' }
        },
        ssl0: {
          status: 200,
          data: { status: 200, code: 200, queryKey: '15433596850b0bc440b087db3995b073', success: true, message: null, statistics: { elapsed: 7, rows_read: 112696, bytes_read: 3319507, result_size: 117, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p50', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p90', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p95', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { sslConLatencyAvg: 1, sslConLatencyP50: 0, sslConLatencyP90: 0, sslConLatencyP95: 0, sslConLatencyP99: 0 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28ssl_con_latency_ms%29%29%20AS%20ssl_con_latency_avg%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.5%29%29%20AS%20ssl_con_latency_p50%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.9%29%29%20AS%20ssl_con_latency_p90%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.95%29%29%20AS%20ssl_con_latency_p95%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.99%29%29%20AS%20ssl_con_latency_p99%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_schema_type%20%3D%20%27SSL%27%20&format=json&option=real-time', msg: 'OK' }
        },
        tcpPercent0: {
          status: 200,
          data: { status: 200, code: 200, queryKey: '4249cc0e01eaa33feb66a35885c4497c', success: true, message: null, statistics: { elapsed: 10, rows_read: 112696, bytes_read: 6649064, result_size: 162, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p50', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p90', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p95', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { tcpLostlenPercentAvg: 0.0156, tcpLostlenPercentP50: 0.0068, tcpLostlenPercentP90: 0.0169, tcpLostlenPercentP95: 0.0223, tcpLostlenPercentP99: 0.2187 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28sequence_gap_loss_percent%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.5%29%2C%204%29%20AS%20tcp_lostlen_percent_p50%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.9%29%2C%204%29%20AS%20tcp_lostlen_percent_p90%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.95%29%2C%204%29%20AS%20tcp_lostlen_percent_p95%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.99%29%2C%204%29%20AS%20tcp_lostlen_percent_p99%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%20%2F%20SUM%28common_c2s_byte_num%20%2B%20common_s2c_byte_num%20%2B%20common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%2C%204%29%20AS%20sequence_gap_loss_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2C%20INTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
        },
        packetPercent0: {
          status: 200,
          data: { status: 200, code: 200, queryKey: '00ccdfe80cd8e68ca8e60c57ac9cb60b', success: true, message: null, statistics: { elapsed: 9, rows_read: 112696, bytes_read: 6649064, result_size: 161, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p50', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p90', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p95', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { pktRetransPercentAvg: 0.0382, pktRetransPercentP50: 0.0353, pktRetransPercentP90: 0.0593, pktRetransPercentP95: 0.066, pktRetransPercentP99: 0.0926 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28pkt_retrans_percent%29%2C%204%29%20AS%20pkt_retrans_percent_avg%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.5%29%2C%204%29%20AS%20pkt_retrans_percent_p50%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.9%29%2C%204%29%20AS%20pkt_retrans_percent_p90%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.95%29%2C%204%29%20AS%20pkt_retrans_percent_p95%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.99%29%2C%204%29%20AS%20pkt_retrans_percent_p99%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_pkt_retrans%20%2B%20common_s2c_pkt_retrans%29%2F%20SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%2C4%29%20AS%20pkt_retrans_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2C%20INTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
        }
      },
      cycle1: {
        tcp1: {
          status: 200,
          data: { status: 200, code: 200, queryKey: '45b6f5188d3d59a11c95061ebeef5297', success: true, message: null, statistics: { elapsed: 7, rows_read: 116184, bytes_read: 3950256, result_size: 31, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { establishLatencyMsAvg: 96 } }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20ROUND%28AVG%28common_establish_latency_ms%29%29%20AS%20establish_latency_ms_avg%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%27IPv6_TCP%27%29%20&format=json&option=real-time', msg: 'OK' }
        },
        http1: {
          status: 200,
          data: { status: 200, code: 200, queryKey: 'd807b6dd867a37c57d512768b4cebfc4', success: true, message: null, statistics: { elapsed: 12, rows_read: 116184, bytes_read: 3422832, result_size: 33, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'http_response_latency_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { httpResponseLatencyAvg: 184 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28http_response_latency_ms%29%29%20AS%20http_response_latency_avg%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_schema_type%20%3D%20%27HTTP%27%20&format=json&option=real-time', msg: 'OK' }
        },
        ssl1: {
          status: 200,
          data: { status: 200, code: 200, queryKey: 'b8cd46d7a83f032bc5bd31092707c9fb', success: true, message: null, statistics: { elapsed: 8, rows_read: 116184, bytes_read: 3422832, result_size: 25, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { sslConLatencyAvg: 1 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28ssl_con_latency_ms%29%29%20AS%20ssl_con_latency_avg%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_schema_type%20%3D%20%27SSL%27%20&format=json&option=real-time', msg: 'OK' }
        },
        tcpPercent1: {
          status: 200,
          data: { status: 200, code: 200, queryKey: 'b2cbf07a6bd9e131f433fd17a784aa95', success: true, message: null, statistics: { elapsed: 11, rows_read: 116184, bytes_read: 6854856, result_size: 34, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { tcpLostlenPercentAvg: 0.0258 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28sequence_gap_loss_percent%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%20%2F%20SUM%28common_c2s_byte_num%20%2B%20common_s2c_byte_num%20%2B%20common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%2C%204%29%20AS%20sequence_gap_loss_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2CINTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
        },
        packetPercent1: {
          status: 200,
          data: { status: 200, code: 200, queryKey: 'b87afb99b22c44769f4a284ed8b62d5b', success: true, message: null, statistics: { elapsed: 11, rows_read: 116184, bytes_read: 6854856, result_size: 34, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { pktRetransPercentAvg: 0.0419 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28pkt_retrans_percent%29%2C%204%29%20AS%20pkt_retrans_percent_avg%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_pkt_retrans%20%2B%20common_s2c_pkt_retrans%29%2F%20SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%2C4%29%20AS%20pkt_retrans_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2C%20INTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
        }
      }
    },
    query: {
      t: '1675218280698',
      curTab: 'country',
      networkOverviewBeforeTab: 'ip',
      tabOperationBeforeType: 4,
      tabOperationType: 4,
      queryCondition: "common_client_ip='116.178.70.242' OR common_server_ip='116.178.70.242'",
      panelName: '116.178.70.242',
      thirdMenu: 'network.ips',
      dimensionType: 'ip',
      fourthMenu: '116.178.70.242',
      tabIndex: '1',
      thirdPanel: '12',
      fourthPanel: '8',
      startTime: 1675215165,
      endTime: 1675218765,
      range: 60
    }
  },
  empty: {
    data: {
      status: 200,
      data: {
        status: 200,
        code: 200,
        data: {
          resultType: 'table',
          result: []
        },
        msg: 'OK'
      }
    }
  },
  boundary: {
    drillDown: {
      data1: {
        status: 200,
        data: {
          status: 200,
          code: 200,
          data: {
            resultType: 'object',
            result: {
              ip: '116.178.70.242',
              establishLatencyMsAvg: 13082520,
              establishLatencyMsP50: 81,
              establishLatencyMsP90: 262,
              establishLatencyMsP95: 0,
              establishLatencyMsP99: 0,
              httpResponseLatencyAvg: 5982844,
              httpResponseLatencyP50: 88,
              httpResponseLatencyP90: 2282,
              httpResponseLatencyP95: 294900,
              httpResponseLatencyP99: 462000,
              sslConLatencyAvg: 10000000,
              sslConLatencyP50: 0,
              sslConLatencyP90: 0,
              sslConLatencyP95: 10000,
              sslConLatencyP99: 10000,
              tcpLostlenPercentAvg: 108,
              tcpLostlenPercentP50: 0.0017,
              tcpLostlenPercentP90: 0.0224,
              tcpLostlenPercentP95: 0.0346,
              tcpLostlenPercentP99: 0.1372,
              pktRetransPercentAvg: 379,
              pktRetransPercentP50: 0.0202,
              pktRetransPercentP90: 0.0946,
              pktRetransPercentP95: 0.1047,
              pktRetransPercentP99: 0.183
            }
          }
        }
      },
      data2: {
        status: 200,
        data: {
          status: 200,
          code: 200,
          data: {
            resultType: 'object',
            result: {
              ip: '116.178.70.242',
              establishLatencyMsAvg: 865147,
              establishLatencyMsP50: 68000000,
              establishLatencyMsP90: 131000000,
              establishLatencyMsP95: 152000000,
              establishLatencyMsP99: 32100000000,
              httpResponseLatencyAvg: 0,
              httpResponseLatencyP50: 0,
              httpResponseLatencyP90: 0,
              httpResponseLatencyP95: 0,
              httpResponseLatencyP99: 0,
              sslConLatencyAvg: 1000000,
              sslConLatencyP50: 1000000,
              sslConLatencyP90: 1000000,
              sslConLatencyP95: 1000000,
              sslConLatencyP99: 1000000,
              tcpLostlenPercentAvg: 147,
              tcpLostlenPercentP50: 11,
              tcpLostlenPercentP90: 226,
              tcpLostlenPercentP95: 357,
              tcpLostlenPercentP99: 2522,
              pktRetransPercentAvg: 357,
              pktRetransPercentP50: 192,
              pktRetransPercentP90: 919,
              pktRetransPercentP95: 1043,
              pktRetransPercentP99: 2249
            }
          }
        }
      }
    }
  }
}
