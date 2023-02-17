import NpmNetworkQuantity from '@/views/charts2/charts/npm/NpmNetworkQuantity'
import { mount } from '@vue/test-utils'
import axios from 'axios'
// 下钻
const mockGet0 = {
  data: { status: 200, code: 200, queryKey: '176825b31c1b552bca8b3ec494cb7af3', success: true, message: null, statistics: { elapsed: 10, rows_read: 112586, bytes_read: 10235742, result_size: 771, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ip', type: 'string', category: 'Dimension' }, { name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p50', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p90', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p95', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p99', type: 'double', category: 'Metric' }, { name: 'http_response_latency_avg', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p50', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p90', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p95', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p99', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p50', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p90', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p95', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p99', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p50', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p90', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p95', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p99', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p50', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p90', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p95', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { ip: '116.178.70.242', establishLatencyMsAvg: 130.8252, establishLatencyMsP50: 81, establishLatencyMsP90: 262, establishLatencyMsP95: 445, establishLatencyMsP99: 601, httpResponseLatencyAvg: 598.2844, httpResponseLatencyP50: 88, httpResponseLatencyP90: 2282, httpResponseLatencyP95: 2949, httpResponseLatencyP99: 4620, sslConLatencyAvg: 1, sslConLatencyP50: 0, sslConLatencyP90: 0, sslConLatencyP95: 0, sslConLatencyP99: 0, tcpLostlenPercentAvg: 0.0108, tcpLostlenPercentP50: 0.0017, tcpLostlenPercentP90: 0.0224, tcpLostlenPercentP95: 0.0346, tcpLostlenPercentP99: 0.1372, pktRetransPercentAvg: 0.0379, pktRetransPercentP50: 0.0202, pktRetransPercentP90: 0.0946, pktRetransPercentP95: 0.1047, pktRetransPercentP99: 0.183 } }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20ip%20AS%20ip%2C%20ROUND%28AVG%28avg_establish_latency_ms%29%2C%204%29%20AS%20establish_latency_ms_avg%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.50%29%29%20AS%20establish_latency_ms_p50%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.90%29%29%20AS%20establish_latency_ms_p90%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.95%29%29%20AS%20establish_latency_ms_p95%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.99%29%29%20AS%20establish_latency_ms_p99%2C%20ROUND%28AVG%28avg_http_response_latency_ms%29%2C%204%29%20AS%20http_response_latency_avg%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.50%29%29%20AS%20http_response_latency_p50%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.90%29%29%20AS%20http_response_latency_p90%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.95%29%29%20AS%20http_response_latency_p95%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.99%29%29%20AS%20http_response_latency_p99%2C%20ROUND%28AVG%28avg_ssl_con_latency_ms%29%2C%204%29%20AS%20ssl_con_latency_avg%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.50%29%29%20AS%20ssl_con_latency_p50%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.90%29%29%20AS%20ssl_con_latency_p90%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.95%29%29%20AS%20ssl_con_latency_p95%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.99%29%29%20AS%20ssl_con_latency_p99%2C%20ROUND%28AVG%28tcp_lostlen_ratio%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.50%29%2C%204%29%20AS%20tcp_lostlen_percent_p50%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.90%29%2C%204%29%20AS%20tcp_lostlen_percent_p90%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.95%29%2C%204%29%20AS%20tcp_lostlen_percent_p95%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.99%29%2C%204%29%20AS%20tcp_lostlen_percent_p99%2C%20ROUND%28AVG%28pkt_retrans_ratio%29%2C%204%29%20AS%20pkt_retrans_percent_avg%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.50%29%2C%204%29%20AS%20pkt_retrans_percent_p50%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.90%29%2C%204%29%20AS%20pkt_retrans_percent_p90%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.95%29%2C%204%29%20AS%20pkt_retrans_percent_p95%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.99%29%2C%204%29%20AS%20pkt_retrans_percent_p99%20FROM%20metric_ip%20WHERE%20%20stat_time%20%3E%3D%201675215165%20AND%20stat_time%20%3C%201675218765%20%20%20AND%20%28ip%3D%27116.178.70.242%27%20and%20side%3D%27server%27%29%20%20GROUP%20BY%20ip&format=json&option=real-time', msg: 'OK' }
}
const mockGet1 = {
  data: { status: 200, code: 200, queryKey: 'c45cc8bbb2aecd158c72a550093c07bb', success: true, message: null, statistics: { elapsed: 10, rows_read: 109487, bytes_read: 9949922, result_size: 769, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ip', type: 'string', category: 'Dimension' }, { name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p50', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p90', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p95', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p99', type: 'double', category: 'Metric' }, { name: 'http_response_latency_avg', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p50', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p90', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p95', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p99', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p50', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p90', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p95', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p99', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p50', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p90', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p95', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p99', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p50', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p90', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p95', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { ip: '116.178.70.242', establishLatencyMsAvg: 86.5147, establishLatencyMsP50: 68, establishLatencyMsP90: 131, establishLatencyMsP95: 152, establishLatencyMsP99: 321, httpResponseLatencyAvg: 311.6164, httpResponseLatencyP50: 66, httpResponseLatencyP90: 305, httpResponseLatencyP95: 592, httpResponseLatencyP99: 5724, sslConLatencyAvg: 1, sslConLatencyP50: 0, sslConLatencyP90: 0, sslConLatencyP95: 0, sslConLatencyP99: 0, tcpLostlenPercentAvg: 0.0147, tcpLostlenPercentP50: 0.0011, tcpLostlenPercentP90: 0.0226, tcpLostlenPercentP95: 0.0357, tcpLostlenPercentP99: 0.2522, pktRetransPercentAvg: 0.0357, pktRetransPercentP50: 0.0192, pktRetransPercentP90: 0.0919, pktRetransPercentP95: 0.1043, pktRetransPercentP99: 0.2249 } }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20ip%20AS%20ip%2C%20ROUND%28AVG%28avg_establish_latency_ms%29%2C%204%29%20AS%20establish_latency_ms_avg%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.50%29%29%20AS%20establish_latency_ms_p50%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.90%29%29%20AS%20establish_latency_ms_p90%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.95%29%29%20AS%20establish_latency_ms_p95%2C%20ROUND%28QUANTILE%28avg_establish_latency_ms%2C0.99%29%29%20AS%20establish_latency_ms_p99%2C%20ROUND%28AVG%28avg_http_response_latency_ms%29%2C%204%29%20AS%20http_response_latency_avg%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.50%29%29%20AS%20http_response_latency_p50%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.90%29%29%20AS%20http_response_latency_p90%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.95%29%29%20AS%20http_response_latency_p95%2C%20ROUND%28QUANTILE%28avg_http_response_latency_ms%2C0.99%29%29%20AS%20http_response_latency_p99%2C%20ROUND%28AVG%28avg_ssl_con_latency_ms%29%2C%204%29%20AS%20ssl_con_latency_avg%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.50%29%29%20AS%20ssl_con_latency_p50%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.90%29%29%20AS%20ssl_con_latency_p90%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.95%29%29%20AS%20ssl_con_latency_p95%2C%20ROUND%28QUANTILE%28avg_ssl_con_latency_ms%2C0.99%29%29%20AS%20ssl_con_latency_p99%2C%20ROUND%28AVG%28tcp_lostlen_ratio%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.50%29%2C%204%29%20AS%20tcp_lostlen_percent_p50%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.90%29%2C%204%29%20AS%20tcp_lostlen_percent_p90%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.95%29%2C%204%29%20AS%20tcp_lostlen_percent_p95%2C%20ROUND%28QUANTILE%28tcp_lostlen_ratio%2C0.99%29%2C%204%29%20AS%20tcp_lostlen_percent_p99%2C%20ROUND%28AVG%28pkt_retrans_ratio%29%2C%204%29%20AS%20pkt_retrans_percent_avg%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.50%29%2C%204%29%20AS%20pkt_retrans_percent_p50%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.90%29%2C%204%29%20AS%20pkt_retrans_percent_p90%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.95%29%2C%204%29%20AS%20pkt_retrans_percent_p95%2C%20ROUND%28QUANTILE%28pkt_retrans_ratio%2C0.99%29%2C%204%29%20AS%20pkt_retrans_percent_p99%20FROM%20metric_ip%20WHERE%20%20stat_time%20%3E%3D%201675215165-3600%20AND%20stat_time%20%3C%201675218765-3600%20%20%20AND%20%28ip%3D%27116.178.70.242%27%20and%20side%3D%27server%27%29%20%20GROUP%20BY%20ip&format=json&option=real-time', msg: 'OK' }
}

// 未下钻 cycle 为 0
const tcp0 = {
  data: { status: 200, code: 200, queryKey: '43786ef6059289466ee0870e51fd4e10', success: true, message: null, statistics: { elapsed: 13, rows_read: 112696, bytes_read: 3831664, result_size: 149, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p50', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p90', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p95', type: 'double', category: 'Metric' }, { name: 'establish_latency_ms_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { establishLatencyMsAvg: 92, establishLatencyMsP50: 49, establishLatencyMsP90: 91, establishLatencyMsP95: 160, establishLatencyMsP99: 789 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28common_establish_latency_ms%29%29%20AS%20establish_latency_ms_avg%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.5%29%29%20AS%20establish_latency_ms_p50%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.9%29%29%20AS%20establish_latency_ms_p90%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.95%29%29%20AS%20establish_latency_ms_p95%2C%20ROUND%28QUANTILE%28common_establish_latency_ms%2C0.99%29%29%20AS%20establish_latency_ms_p99%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%27IPv6_TCP%27%29%20&format=json&option=real-time', msg: 'OK' }
}
const http0 = {
  data: { status: 200, code: 200, queryKey: '9c24dd3ad820f76adc84c261c7754a1e', success: true, message: null, statistics: { elapsed: 8, rows_read: 112696, bytes_read: 3319507, result_size: 157, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'http_response_latency_avg', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p50', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p90', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p95', type: 'double', category: 'Metric' }, { name: 'http_response_latency_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { httpResponseLatencyAvg: 193, httpResponseLatencyP50: 56, httpResponseLatencyP90: 128, httpResponseLatencyP95: 266, httpResponseLatencyP99: 2093 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28http_response_latency_ms%29%29%20AS%20http_response_latency_avg%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.5%29%29%20AS%20http_response_latency_p50%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.9%29%29%20AS%20http_response_latency_p90%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.95%29%29%20AS%20http_response_latency_p95%2C%20ROUND%28QUANTILE%28http_response_latency_ms%2C0.99%29%29%20AS%20http_response_latency_p99%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_schema_type%20%3D%20%27HTTP%27%20&format=json&option=real-time', msg: 'OK' }
}
const ssl0 = {
  data: { status: 200, code: 200, queryKey: '15433596850b0bc440b087db3995b073', success: true, message: null, statistics: { elapsed: 7, rows_read: 112696, bytes_read: 3319507, result_size: 117, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p50', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p90', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p95', type: 'double', category: 'Metric' }, { name: 'ssl_con_latency_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { sslConLatencyAvg: 1, sslConLatencyP50: 0, sslConLatencyP90: 0, sslConLatencyP95: 0, sslConLatencyP99: 0 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28ssl_con_latency_ms%29%29%20AS%20ssl_con_latency_avg%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.5%29%29%20AS%20ssl_con_latency_p50%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.9%29%29%20AS%20ssl_con_latency_p90%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.95%29%29%20AS%20ssl_con_latency_p95%2C%20ROUND%28QUANTILE%28ssl_con_latency_ms%2C0.99%29%29%20AS%20ssl_con_latency_p99%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_schema_type%20%3D%20%27SSL%27%20&format=json&option=real-time', msg: 'OK' }
}
const tcpPercent0 = {
  data: { status: 200, code: 200, queryKey: '4249cc0e01eaa33feb66a35885c4497c', success: true, message: null, statistics: { elapsed: 10, rows_read: 112696, bytes_read: 6649064, result_size: 162, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p50', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p90', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p95', type: 'double', category: 'Metric' }, { name: 'tcp_lostlen_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { tcpLostlenPercentAvg: 0.0156, tcpLostlenPercentP50: 0.0068, tcpLostlenPercentP90: 0.0169, tcpLostlenPercentP95: 0.0223, tcpLostlenPercentP99: 0.2187 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28sequence_gap_loss_percent%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.5%29%2C%204%29%20AS%20tcp_lostlen_percent_p50%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.9%29%2C%204%29%20AS%20tcp_lostlen_percent_p90%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.95%29%2C%204%29%20AS%20tcp_lostlen_percent_p95%2C%20ROUND%28QUANTILE%28sequence_gap_loss_percent%2C%200.99%29%2C%204%29%20AS%20tcp_lostlen_percent_p99%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%20%2F%20SUM%28common_c2s_byte_num%20%2B%20common_s2c_byte_num%20%2B%20common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%2C%204%29%20AS%20sequence_gap_loss_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2C%20INTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
}
const packetPercent0 = {
  data: { status: 200, code: 200, queryKey: '00ccdfe80cd8e68ca8e60c57ac9cb60b', success: true, message: null, statistics: { elapsed: 9, rows_read: 112696, bytes_read: 6649064, result_size: 161, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p50', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p90', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p95', type: 'double', category: 'Metric' }, { name: 'pkt_retrans_percent_p99', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { pktRetransPercentAvg: 0.0382, pktRetransPercentP50: 0.0353, pktRetransPercentP90: 0.0593, pktRetransPercentP95: 0.066, pktRetransPercentP99: 0.0926 } }, originalUrl: 'http://192.168.44.55:9999?query=%20SELECT%20ROUND%28AVG%28pkt_retrans_percent%29%2C%204%29%20AS%20pkt_retrans_percent_avg%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.5%29%2C%204%29%20AS%20pkt_retrans_percent_p50%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.9%29%2C%204%29%20AS%20pkt_retrans_percent_p90%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.95%29%2C%204%29%20AS%20pkt_retrans_percent_p95%2C%20ROUND%28QUANTILE%28pkt_retrans_percent%2C%200.99%29%2C%204%29%20AS%20pkt_retrans_percent_p99%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_pkt_retrans%20%2B%20common_s2c_pkt_retrans%29%2F%20SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%2C4%29%20AS%20pkt_retrans_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2C%20INTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930%20AND%20common_recv_time%20%3C%201675144530%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
}

// 未下钻 cycle 为 1
const tcp1 = {
  data: { status: 200, code: 200, queryKey: '45b6f5188d3d59a11c95061ebeef5297', success: true, message: null, statistics: { elapsed: 7, rows_read: 116184, bytes_read: 3950256, result_size: 31, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'establish_latency_ms_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { establishLatencyMsAvg: 96 } }, originalUrl: 'http://192.168.44.55:9999?query=SELECT%20ROUND%28AVG%28common_establish_latency_ms%29%29%20AS%20establish_latency_ms_avg%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%27IPv6_TCP%27%29%20&format=json&option=real-time', msg: 'OK' }
}
const http1 = {
  data: { status: 200, code: 200, queryKey: 'd807b6dd867a37c57d512768b4cebfc4', success: true, message: null, statistics: { elapsed: 12, rows_read: 116184, bytes_read: 3422832, result_size: 33, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'http_response_latency_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { httpResponseLatencyAvg: 184 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28http_response_latency_ms%29%29%20AS%20http_response_latency_avg%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_schema_type%20%3D%20%27HTTP%27%20&format=json&option=real-time', msg: 'OK' }
}
const ssl1 = {
  data: { status: 200, code: 200, queryKey: 'b8cd46d7a83f032bc5bd31092707c9fb', success: true, message: null, statistics: { elapsed: 8, rows_read: 116184, bytes_read: 3422832, result_size: 25, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'ssl_con_latency_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { sslConLatencyAvg: 1 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28ssl_con_latency_ms%29%29%20AS%20ssl_con_latency_avg%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_schema_type%20%3D%20%27SSL%27%20&format=json&option=real-time', msg: 'OK' }
}
const tcpPercent1 = {
  data: { status: 200, code: 200, queryKey: 'b2cbf07a6bd9e131f433fd17a784aa95', success: true, message: null, statistics: { elapsed: 11, rows_read: 116184, bytes_read: 6854856, result_size: 34, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'tcp_lostlen_percent_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { tcpLostlenPercentAvg: 0.0258 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28sequence_gap_loss_percent%29%2C%204%29%20AS%20tcp_lostlen_percent_avg%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%20%2F%20SUM%28common_c2s_byte_num%20%2B%20common_s2c_byte_num%20%2B%20common_c2s_tcp_lostlen%20%2B%20common_s2c_tcp_lostlen%29%2C%204%29%20AS%20sequence_gap_loss_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2CINTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
}
const packetPercent1 = {
  data: { status: 200, code: 200, queryKey: 'b87afb99b22c44769f4a284ed8b62d5b', success: true, message: null, statistics: { elapsed: 11, rows_read: 116184, bytes_read: 6854856, result_size: 34, result_rows: 1 }, job: null, formatType: 'json', meta: [{ name: 'pkt_retrans_percent_avg', type: 'double', category: 'Metric' }], data: { resultType: 'object', result: { pktRetransPercentAvg: 0.0419 } }, originalUrl: 'http://192.168.44.55:9999?query=%20%20SELECT%20ROUND%28AVG%28pkt_retrans_percent%29%2C%204%29%20AS%20pkt_retrans_percent_avg%20FROM%28%20SELECT%20ROUND%28SUM%28common_c2s_pkt_retrans%20%2B%20common_s2c_pkt_retrans%29%2F%20SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%2C4%29%20AS%20pkt_retrans_percent%2C%20toDateTime%28toStartOfInterval%28toDateTime%28common_recv_time%29%2C%20INTERVAL%2036%20SECOND%29%29%20AS%20granularity%20FROM%20session_record_cn%20WHERE%20common_recv_time%20%3E%3D%201675140930-3600%20AND%20common_recv_time%20%3C%201675144530-3600%20AND%20common_l4_protocol%20IN%20%28%27IPv4_TCP%27%2C%20%27IPv6_TCP%27%29%20GROUP%20BY%20granularity%20%29%20&format=json&option=real-time', msg: 'OK' }
}

const timeFilter = {
  dateRangeValue: -1,
  startTime: 1675043912,
  endTime: 1675047512
}

const query = {
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

describe('views/charts2/charts/npm/NpmNetworkQuantity.vue测试', () => {
  test('Npm概况信息：服务质量图 下钻', async () => {
    // 下钻时需要将模拟下钻 query 对象传入
    require('vue-router').useRoute.mockReturnValue({ query: query })
    // 模拟 axios 返回数据
    axios.get.mockResolvedValueOnce(mockGet0)
    axios.get.mockResolvedValueOnce(mockGet1)

    const wrapper = mount(NpmNetworkQuantity, {
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(() => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('130 ms')
      expect(textNode1.text()).toEqual('598 ms')
      expect(textNode2.text()).toEqual('1 ms')
      expect(textNode3.text()).toEqual('1.08 %')
      expect(textNode4.text()).toEqual('3.79 %')

      const trendIconNode0 = wrapper.get('[test-id="singleValueTrendIcon0"]')
      const trendIconNode1 = wrapper.get('[test-id="singleValueTrendIcon1"]')
      /*
       * 当元素存在的时候，find 和 get 是一样的；
       * 当找不到元素的时候:
       *    (1) find 会返回 null, 不会报错，case 通过
       *    (2) get 会报错，case 失败
       * 一般总是使用 get ，除非想要判断一些元素不存在的时候，使用 find；
       */
      const trendIconNode2 = wrapper.find('[test-id="singleValueTrendIcon2"]')
      const trendIconNode3 = wrapper.get('[test-id="singleValueTrendIcon3"]')
      const trendIconNode4 = wrapper.get('[test-id="singleValueTrendIcon4"]')

      expect(trendIconNode0.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode1.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode2.classes()).toContain('cn-icon-constant')
      expect(trendIconNode3.classes()).toContain('cn-icon-decline')
      expect(trendIconNode4.classes()).toContain('cn-icon-rise1')

      const trendValueNode0 = wrapper.get('[test-id="singleValueTrendValue0"]')
      const trendValueNode1 = wrapper.get('[test-id="singleValueTrendValue1"]')
      const trendValueNode2 = wrapper.find('[test-id="singleValueTrendValue2"]')
      const trendValueNode3 = wrapper.get('[test-id="singleValueTrendValue3"]')
      const trendValueNode4 = wrapper.find('[test-id="singleValueTrendValue4"]')

      expect(trendValueNode0.text()).toEqual('51.22%')
      expect(trendValueNode1.text()).toEqual('91.99%')
      expect(trendValueNode2 === null)
      expect(trendValueNode3.text()).toEqual('-26.53%')
      expect(trendValueNode4.text()).toEqual('6.16%')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95:445 ms')
      expect(p95Node1.text()).toEqual('P95:2.95 s')
      expect(p95Node2.text()).toEqual('P95:0 ms')
      expect(p95Node3.text()).toEqual('P95:3.46 %')
      expect(p95Node4.text()).toEqual('P95:10.47 %')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99:601 ms')
      expect(p99Node1.text()).toEqual('P99:4.62 s')
      expect(p99Node2.text()).toEqual('P99:0 ms')
      expect(p99Node3.text()).toEqual('P99:13.72 %')
      expect(p99Node4.text()).toEqual('P99:18.30 %')
      resolve()
    }, 400))
  })
  test('Npm概况信息：服务质量图 未下钻', async () => {
    require('vue-router').useRoute.mockReturnValue({ query: {} })
    // 模拟 axios 返回数据
    // 未下钻 cycle 为 0
    axios.get.mockResolvedValueOnce(tcp0)
    axios.get.mockResolvedValueOnce(http0)
    axios.get.mockResolvedValueOnce(ssl0)
    axios.get.mockResolvedValueOnce(tcpPercent0)
    axios.get.mockResolvedValueOnce(packetPercent0)

    // 未下钻 cycle 为 1
    axios.get.mockResolvedValueOnce(tcp1)
    axios.get.mockResolvedValueOnce(http1)
    axios.get.mockResolvedValueOnce(ssl1)
    axios.get.mockResolvedValueOnce(tcpPercent1)
    axios.get.mockResolvedValueOnce(packetPercent1)

    const wrapper = mount(NpmNetworkQuantity, {
      propsData: {
        timeFilter
      }
    })

    await new Promise(resolve => setTimeout(async () => {
      const textNode0 = wrapper.get('[test-id="singleValueContent0"]')
      const textNode1 = wrapper.get('[test-id="singleValueContent1"]')
      const textNode2 = wrapper.get('[test-id="singleValueContent2"]')
      const textNode3 = wrapper.get('[test-id="singleValueContent3"]')
      const textNode4 = wrapper.get('[test-id="singleValueContent4"]')

      expect(textNode0.text()).toEqual('92 ms')
      expect(textNode1.text()).toEqual('193 ms')
      expect(textNode2.text()).toEqual('1 ms')
      expect(textNode3.text()).toEqual('1.56 %')
      expect(textNode4.text()).toEqual('3.82 %')

      const trendIconNode0 = wrapper.get('[test-id="singleValueTrendIcon0"]')
      const trendIconNode1 = wrapper.get('[test-id="singleValueTrendIcon1"]')
      // /*
      //  * 当元素存在的时候，find 和 get 是一样的；
      //  * 当找不到元素的时候:
      //  *    (1) find 会返回 null, 不会报错，case 通过
      //  *    (2) get 会报错，case 失败
      //  * 一般总是使用 get ，除非想要判断一些元素不存在的时候，使用 find；
      //  */
      const trendIconNode2 = wrapper.find('[test-id="singleValueTrendIcon2"]')
      const trendIconNode3 = wrapper.get('[test-id="singleValueTrendIcon3"]')
      const trendIconNode4 = wrapper.get('[test-id="singleValueTrendIcon4"]')
      //
      expect(trendIconNode0.classes()).toContain('cn-icon-decline')
      expect(trendIconNode1.classes()).toContain('cn-icon-rise1')
      expect(trendIconNode2.classes()).toContain('cn-icon-constant')
      expect(trendIconNode3.classes()).toContain('cn-icon-decline')
      expect(trendIconNode4.classes()).toContain('cn-icon-decline')

      const trendValueNode0 = wrapper.get('[test-id="singleValueTrendValue0"]')
      const trendValueNode1 = wrapper.get('[test-id="singleValueTrendValue1"]')
      const trendValueNode2 = wrapper.find('[test-id="singleValueTrendValue2"]')
      const trendValueNode3 = wrapper.get('[test-id="singleValueTrendValue3"]')
      const trendValueNode4 = wrapper.find('[test-id="singleValueTrendValue4"]')

      expect(trendValueNode0.text()).toEqual('-4.17%')
      expect(trendValueNode1.text()).toEqual('4.89%')
      expect(trendValueNode2 === null)
      expect(trendValueNode3.text()).toEqual('-39.53%')
      expect(trendValueNode4.text()).toEqual('-8.83%')

      const p95Node0 = wrapper.get('[test-id="singleValueP950"]')
      const p95Node1 = wrapper.get('[test-id="singleValueP951"]')
      const p95Node2 = wrapper.get('[test-id="singleValueP952"]')
      const p95Node3 = wrapper.get('[test-id="singleValueP953"]')
      const p95Node4 = wrapper.get('[test-id="singleValueP954"]')

      expect(p95Node0.text()).toEqual('P95:160 ms')
      expect(p95Node1.text()).toEqual('P95:266 ms')
      expect(p95Node2.text()).toEqual('P95:0 ms')
      expect(p95Node3.text()).toEqual('P95:2.23 %')
      expect(p95Node4.text()).toEqual('P95:6.60 %')

      const p99Node0 = wrapper.get('[test-id="singleValueP990"]')
      const p99Node1 = wrapper.get('[test-id="singleValueP991"]')
      const p99Node2 = wrapper.get('[test-id="singleValueP992"]')
      const p99Node3 = wrapper.get('[test-id="singleValueP993"]')
      const p99Node4 = wrapper.get('[test-id="singleValueP994"]')

      expect(p99Node0.text()).toEqual('P99:789 ms')
      expect(p99Node1.text()).toEqual('P99:2.09 s')
      expect(p99Node2.text()).toEqual('P99:0 ms')
      expect(p99Node3.text()).toEqual('P99:21.87 %')
      expect(p99Node4.text()).toEqual('P99:9.26 %')
      resolve()
    }, 300))
  })
})
