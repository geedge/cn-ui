const data = {
  status: 200,
  code: 200,
  queryKey: '4f362f9ee3ffefc777e57fc65af78a2f',
  success: true,
  message: null,
  formatType: 'json',
  data: {
    resultType: 'matrix',
    result:
                [
                  {
                    values: [
                      ['1642575780', '4324'],
                      ['1642575840', '5978'],
                      ['1642575900', '3458'],
                      ['1642575960', '2533'],
                      ['1642576020', '4431'],
                      ['1642576080', '9557'],
                      ['1642576140', '3131'],
                      ['1642576200', '2358'],
                      ['1642576260', '3049'],
                      ['1642576320', '2602'],
                      ['1642576380', '2446'],
                      ['1642576440', '3357'],
                      ['1642576500', '2777'], ['1642576560', '2080'], ['1642576620', '6080'], ['1642576680', '2620'], ['1642576740', '4394'], ['1642576800', '3403'], ['1642576860', '3820'], ['1642576920', '3022'], ['1642576980', '3139'], ['1642577040', '3012'], ['1642577100', '3749'], ['1642577160', '4947'], ['1642577220', '4005'], ['1642577280', '4724'], ['1642577340', '3426'], ['1642577400', '2785'], ['1642577460', '3451'], ['1642577520', '3317'], ['1642577580', '4970'], ['1642577640', '1869'], ['1642577700', '3491'], ['1642577760', '2410'], ['1642577820', '1802'], ['1642577880', '2199'], ['1642577940', '3083'], ['1642578000', '6992'], ['1642578060', '1782'], ['1642578120', '1610'], ['1642578180', '2993'], ['1642578240', '2195'], ['1642578300', '1855'], ['1642578360', '3784'], ['1642578420', '2969'], ['1642578480', '5891'], ['1642578540', '7949'], ['1642578600', '1655'], ['1642578660', '4799'], ['1642578720', '9208'], ['1642578780', '9159'], ['1642578840', '3296'], ['1642578900', '5717'], ['1642578960', '3911'], ['1642579020', '6369'], ['1642579080', '3183'], ['1642579140', '3051'], ['1642579200', '4449'], ['1642579260', '4990'], ['1642579320', '6962']],
                    legend: 'packets_received_rate',
                    aggregation: { first: 4324, last: 6962, avg: '3942.80', max: 9557 }
                  }
                ]
  },
  originalUrl: 'http://192.168.44.55:9999?query=SELECT%20%20%20%20%20TIME_FLOOR_WITH_FILL%28UNIX_TIMESTAMP%28common_recv_time%29%2C%27PT1M%27%2C%27zero%27%29%20AS%20stat_time%2C%20%20%20%20%20ROUND%28SUM%28common_s2c_pkt_num%29%2F60%29%20AS%20packets_received_rate%2C%20%20%20%20%20ROUND%28SUM%28common_c2s_pkt_num%29%2F60%29%20AS%20packets_sent_rate%2C%20%20%20%20%20ROUND%28SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%2F60%29%20AS%20packets_rate%20FROM%20%20%20%20%20tsg_base_metrics%20WHERE%20%20%20%20%20common_recv_time%20%3E%3DtoDateTime%281642575761%29%20%20%20%20%20AND%20common_recv_time%20%3C%20toDateTime%281642579361%29%20GROUP%20BY%20%20%20%20%20stat_time&format=json&option=real-time',
  msg: 'OK'
}
const data2 = {
  status: 200,
  code: 200,
  queryKey: '4f362f9ee3ffefc777e57fc65af78a2f',
  success: true,
  message: null,
  formatType: 'json',
  originalUrl: 'http://192.168.44.55:9999?query=SELECT%20%20%20%20%20TIME_FLOOR_WITH_FILL%28UNIX_TIMESTAMP%28common_recv_time%29%2C%27PT1M%27%2C%27zero%27%29%20AS%20stat_time%2C%20%20%20%20%20ROUND%28SUM%28common_s2c_pkt_num%29%2F60%29%20AS%20packets_received_rate%2C%20%20%20%20%20ROUND%28SUM%28common_c2s_pkt_num%29%2F60%29%20AS%20packets_sent_rate%2C%20%20%20%20%20ROUND%28SUM%28common_c2s_pkt_num%20%2B%20common_s2c_pkt_num%29%2F60%29%20AS%20packets_rate%20FROM%20%20%20%20%20tsg_base_metrics%20WHERE%20%20%20%20%20common_recv_time%20%3E%3DtoDateTime%281642575761%29%20%20%20%20%20AND%20common_recv_time%20%3C%20toDateTime%281642579361%29%20GROUP%20BY%20%20%20%20%20stat_time&format=json&option=real-time',
  msg: 'OK',
  data: {
    resultType: 'table',
    result: [{
      serverCountry: 'America',
      serverRegion: 'Washington',
      serverId: 'US',
      clientCountry: 'China',
      clientRegion: 'Beijing',
      clientId: 'CN',
      events: 27010
    }, {
      serverCountry: 'America2',
      serverRegion: 'Washington2',
      serverId: 'US',
      clientCountry: 'China',
      clientRegion: 'ShangHai',
      clientId: 'CN',
      events: 13000
    }
    ]
  }
}
export default { data, data2 }
