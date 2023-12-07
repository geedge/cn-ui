export const cacheData = {
  "type": "record",
  "name": "session_record",
  "namespace": "tsg_galaxy_v3",
  "doc": {
    "primary_key": "log_id",
    "partition_key": "recv_time",
    "index_key": [
      "vsys_id",
      "security_action",
      "app",
      "proxy_action",
      "decoded_as",
      "data_center",
      "device_group",
      "recv_time"
    ],
    "ttl": 2592000,
    "default_ttl": 2592000,
    "functions": {
      "aggregation": [
        {
          "name": "COUNT",
          "label": "COUNT",
          "function": "count(expr)"
        },
        {
          "name": "COUNT_DISTINCT",
          "label": "COUNT_DISTINCT",
          "function": "count(distinct expr)"
        },
        {
          "name": "AVG",
          "label": "AVG",
          "function": "avg(expr)"
        },
        {
          "name": "SUM",
          "label": "SUM",
          "function": "sum(expr)"
        },
        {
          "name": "MAX",
          "label": "MAX",
          "function": "max(expr)"
        },
        {
          "name": "MIN",
          "label": "MIN",
          "function": "min(expr)"
        },
        {
          "name": "MEDIAN",
          "label": "MEDIAN",
          "function": "MEDIAN(expr)"
        },
        {
          "name": "QUANTILE",
          "label": "QUANTILE",
          "function": "QUANTILE(expr,level)"
        },
        {
          "name": "TIME_FLOOR_WITH_FILL",
          "label": "TIME_FLOOR_WITH_FILL",
          "function": "TIME_FLOOR_WITH_FILL(expr,period,fill)"
        }
      ],
      "date": [
        {
          "name": "UNIX_TIMESTAMP",
          "label": "UNIX_TIMESTAMP",
          "function": "UNIX_TIMESTAMP(expr)"
        },
        {
          "name": "FROM_UNIXTIME",
          "label": "FROM_UNIXTIME",
          "function": "FROM_UNIXTIME(expr)"
        },
        {
          "name": "DATE_FORMAT",
          "label": "DATE_FORMAT",
          "function": "DATE_FORMAT(expr,format)"
        },
        {
          "name": "CONVERT_TZ",
          "label": "CONVERT_TZ",
          "function": "CONVERT_TZ(expr, from_tz, to_tz)"
        }
      ],
      "operator": [
        {
          "name": "=",
          "label": "=",
          "function": "expr = value"
        },
        {
          "name": "has",
          "label": "HAS",
          "function": "has(expr, value)"
        },
        {
          "name": "in",
          "label": "IN",
          "function": "expr in (values)"
        },
        {
          "name": "like",
          "label": "LIKE",
          "function": "expr like value"
        }
      ]
    },
    "schema_query": {
      "dimensions": [
        'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
      ],
      "metrics": [
        'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
      ],
      "filters": [
        'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
      ],
      "references": {
        "aggregation": [
          {
            "type": "int",
            "functions": "COUNT,COUNT_DISTINCT,AVG,SUM,MAX,MIN,MEDIAN,QUANTILE"
          },
          {
            "type": "string",
            "functions": "COUNT,COUNT_DISTINCT"
          },
          {
            "type": "array",
            "functions": "COUNT,COUNT_DISTINCT"
          }
        ],
        "operator": [
          {
            "type": "int",
            "functions": "=,in,like,has"
          },
          {
            "type": "string",
            "functions": "=,in,like,has"
          },
          {
            "type": "array",
            "functions": "=,in,like,has"
          }
        ]
      },
      "details": {
        "general": [
          "recv_time",
          "log_id",
          "decoded_as",
          "session_id",
          "start_timestamp_ms",
          "end_timestamp_ms",
          "duration_ms",
          "tcp_handshake_latency_ms",
          "ingestion_time",
          "processing_time",
          "insert_time",
          "device_id",
          "out_link_id",
          "in_link_id",
          "device_tag",
          "data_center",
          "device_group",
          "sled_ip",
          "address_type",
          "vsys_id",
          "t_vsys_id",
          "flags",
          "flags_identify_info"
        ],
        "treatment": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "source": [
          "client_ip",
          "client_port",
          "client_os_desc",
          "client_geolocation",
          "client_asn",
          "subscriber_id",
          "imei",
          "imsi",
          "apn",
          "phone_number"
        ],
        "destination": [
          "server_ip",
          "server_port",
          "server_os_desc",
          "server_geolocation",
          "server_asn",
          "server_fqdn",
          "server_domain"
        ],
        "application": [
          "app_path",
          "app",
          "app_debug_info",
          "app_content",
          "fqdn_category_list"
        ],
        "protocol": [
          "protocol_path",
          "dns_message_id",
          "dns_qr",
          "dns_opcode",
          "dns_aa",
          "dns_tc",
          "dns_rd",
          "dns_ra",
          "dns_rcode",
          "dns_qdcount",
          "dns_ancount",
          "dns_nscount",
          "dns_arcount",
          "dns_qname",
          "dns_qtype",
          "dns_qclass",
          "dns_cname",
          "dns_sub",
          "dns_rr",
          "dns_response_latency_ms",
          "dtls_cookie",
          "dtls_version",
          "dtls_sni",
          "dtls_san",
          "dtls_cn",
          "dtls_handshake_latency_ms",
          "dtls_ja3_fingerprint",
          "dtls_ja3_hash",
          "dtls_cert_issuer",
          "dtls_cert_subject",
          "ftp_account",
          "ftp_url",
          "ftp_link_type",
          "http_url",
          "http_host",
          "http_request_line",
          "http_response_line",
          "http_request_content_length",
          "http_request_content_type",
          "http_response_content_length",
          "http_response_content_type",
          "http_request_body",
          "http_response_body",
          "http_proxy_flag",
          "http_sequence",
          "http_cookie",
          "http_referer",
          "http_user_agent",
          "http_set_cookie",
          "http_version",
          "http_status_code",
          "http_response_latency_ms",
          "http_session_duration_ms",
          "http_action_file_size",
          "mail_protocol_type",
          "mail_account",
          "mail_from_cmd",
          "mail_to_cmd",
          "mail_from",
          "mail_password",
          "mail_to",
          "mail_cc",
          "mail_bcc",
          "mail_subject",
          "mail_subject_charset",
          "mail_attachment_name",
          "mail_attachment_name_charset",
          "mail_eml_file",
          "quic_version",
          "quic_sni",
          "quic_user_agent",
          "rdp_cookie",
          "rdp_security_protocol",
          "rdp_client_channels",
          "rdp_keyboard_layout",
          "rdp_client_version",
          "rdp_client_name",
          "rdp_client_product_id",
          "rdp_desktop_width",
          "rdp_desktop_height",
          "rdp_requested_color_depth",
          "rdp_certificate_type",
          "rdp_certificate_count",
          "rdp_certificate_permanent",
          "rdp_encryption_level",
          "rdp_encryption_method",
          "ssh_version",
          "ssh_auth_success",
          "ssh_client_version",
          "ssh_server_version",
          "ssh_cipher_alg",
          "ssh_mac_alg",
          "ssh_compression_alg",
          "ssh_kex_alg",
          "ssh_host_key_alg",
          "ssh_host_key",
          "ssh_hassh",
          "ssl_version",
          "ssl_sni",
          "ssl_san",
          "ssl_cn",
          "ssl_handshake_latency_ms",
          "ssl_ja3_hash",
          "ssl_ja3s_hash",
          "ssl_cert_issuer",
          "ssl_cert_subject",
          "ssl_esni_flag",
          "ssl_ech_flag",
          "sip_call_id",
          "sip_originator_description",
          "sip_responder_description",
          "sip_user_agent",
          "sip_server",
          "sip_originator_sdp_connect_ip",
          "sip_originator_sdp_media_port",
          "sip_originator_sdp_media_type",
          "sip_originator_sdp_content",
          "sip_responder_sdp_connect_ip",
          "sip_responder_sdp_media_port",
          "sip_responder_sdp_media_type",
          "sip_responder_sdp_content",
          "sip_duration_s",
          "sip_bye",
          "rtp_payload_type_c2s",
          "rtp_payload_type_s2c",
          "rtp_pcap_path",
          "rtp_originator_dir",
          "stratum_cryptocurrency",
          "stratum_mining_pools",
          "stratum_mining_program",
          "stratum_mining_subscribe"
        ],
        "transmission": [
          "sent_pkts",
          "received_pkts",
          "sent_bytes",
          "received_bytes",
          "tcp_c2s_ip_fragments",
          "tcp_s2c_ip_fragments",
          "tcp_c2s_lost_bytes",
          "tcp_s2c_lost_bytes",
          "tcp_c2s_o3_pkts",
          "tcp_s2c_o3_pkts",
          "tcp_c2s_rtx_pkts",
          "tcp_s2c_rtx_pkts",
          "tcp_c2s_rtx_bytes",
          "tcp_s2c_rtx_bytes",
          "tcp_rtt_ms",
          "tcp_client_isn",
          "tcp_server_isn"
        ],
        "other": [
          "packet_capture_file",
          "in_src_mac",
          "out_src_mac",
          "in_dest_mac",
          "out_dest_mac",
          "tunnels",
          "dup_traffic_flag",
          "tunnel_endpoint_a_desc",
          "tunnel_endpoint_b_desc"
        ]
      }
    },
    "data_view": {
      "PROXY_INTERCEPT_EVENT_VIEW": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "security_rule_list",
          "security_action",
          "app",
          "client_ip",
          "client_port",
          "server_fqdn",
          "app",
          "server_ip",
          "server_port"
        ]
      }
    },
    "decoded_as": {
      "BASE": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "server_ip",
          "server_port"
        ]
      },
      "HTTP": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "http_url",
          "server_ip",
          "server_port"
        ]
      },
      "MAIL": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "mail_from",
          "mail_to",
          "mail_subject",
          "server_ip",
          "server_port"
        ]
      },
      "DNS": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "client_ip",
          "client_port",
          "dns_qr",
          "dns_qname",
          "dns_qtype",
          "server_ip",
          "server_port"
        ]
      },
      "SSL": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "ssl_sni",
          "server_ip",
          "server_port"
        ]
      },
      "DTLS": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "dtls_sni",
          "server_ip",
          "server_port"
        ]
      },
      "QUIC": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "quic_sni",
          "server_ip",
          "server_port"
        ]
      },
      "FTP": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "ftp_url",
          "server_ip",
          "server_port"
        ]
      },
      "SIP": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "client_ip",
          "client_port",
          "sip_originator_description",
          "sip_responder_description",
          "sip_call_id",
          "server_ip",
          "server_port"
        ]
      },
      "RTP": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "server_ip",
          "server_port",
          "rtp_pcap_path",
          "rtp_originator_dir"
        ]
      },
      "SSH": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_ip",
          "client_port",
          "server_ip",
          "server_port",
          "ssh_auth_success"
        ]
      },
      "Stratum": {
        "columns": [
          'ip', 'domain', 'app', 'ip.country', 'ip.region', 'ip.city', 'ip.asn', 'ip.isp', 'domain.category', 'app.category', 'tag', 'ip.port', 'ip.potocol', 'security_action'
        ],
        "default_columns": [
          "recv_time",
          "subscriber_id",
          "client_port",
          "client_ip",
          "server_ip",
          "server_port",
          "stratum_cryptocurrency",
          "stratum_mining_pools",
          "stratum_mining_program"
        ]
      }
    },
    "default_columns": [
      "recv_time",
      "subscriber_id",
      "client_ip",
      "client_port",
      "server_ip",
      "server_port",
      "decoded_as",
      "server_fqdn"
    ],
    "internal_columns": [
      "recv_time",
      "log_id",
      "flags_identify_info",
      "tunnels",
      "app_debug_info",
      "app_content",
      "packet_capture_file",
      "tunnel_endpoint_a_desc",
      "tunnel_endpoint_b_desc"
    ],
    "tunnel_type": {
      "GTP": [
        {
          "name": "gtp_endpoint_a_ip",
          "label": "Endpoint A IP",
          "type": "string"
        },
        {
          "name": "gtp_endpoint_b_ip",
          "label": "Endpoint B IP",
          "type": "string"
        },
        {
          "name": "gtp_endpoint_a_port",
          "label": "Endpoint A Port",
          "type": "int"
        },
        {
          "name": "gtp_endpoint_b_port",
          "label": "Endpoint B Port",
          "type": "int"
        },
        {
          "name": "gtp_endpoint_a2b_teid",
          "label": "Endpoint A2B TEID",
          "type": "long"
        },
        {
          "name": "gtp_endpoint_b2a_teid",
          "label": "Endpoint B2A TEID",
          "type": "long"
        }
      ],
      "MPLS": [
        {
          "name": "mpls_c2s_direction_label",
          "label": "Multiprotocol Label (c2s)",
          "type": {
            "type": "array",
            "items": "int",
            "logicalType": "array"
          }
        },
        {
          "name": "mpls_s2c_direction_label",
          "label": "Multiprotocol Label (s2c)",
          "type": {
            "type": "array",
            "items": "int",
            "logicalType": "array"
          }
        }
      ],
      "VLAN": [
        {
          "name": "vlan_c2s_direction_id",
          "label": "VLAN Direction (c2s)",
          "type": {
            "type": "array",
            "items": "int",
            "logicalType": "array"
          }
        },
        {
          "name": "vlan_s2c_direction_id",
          "label": "VLAN Direction (s2c)",
          "type": {
            "type": "array",
            "items": "int",
            "logicalType": "array"
          }
        }
      ],
      "ETHERNET": [
        {
          "name": "source_mac",
          "label": "Source MAC",
          "type": "string"
        },
        {
          "name": "destination_mac",
          "label": "Destination MAC",
          "type": "string"
        }
      ],
      "MULTIPATH_ETHERNET": [
        {
          "name": "c2s_source_mac",
          "label": "Source MAC (c2s)",
          "type": "string"
        },
        {
          "name": "c2s_destination_mac",
          "label": "Destination MAC (c2s)",
          "type": "string"
        },
        {
          "name": "s2c_source_mac",
          "label": "Source MAC (s2c)",
          "type": "string"
        },
        {
          "name": "s2c_destination_mac",
          "label": "Destination MAC (s2c)",
          "type": "string"
        }
      ],
      "L2TP": [
        {
          "name": "l2tp_version",
          "label": "Version",
          "type": "string"
        },
        {
          "name": "l2tp_lac2lns_tunnel_id",
          "label": "LAC2LNS Tunnel ID",
          "type": "int"
        },
        {
          "name": "l2tp_lns2lac_tunnel_id",
          "label": "LNS2LAC Tunnel ID",
          "type": "int"
        },
        {
          "name": "l2tp_lac2lns_session_id",
          "label": "LAC2LNS Session ID",
          "type": "int"
        },
        {
          "name": "l2tp_lns2lac_session_id",
          "label": "LNS2LAC Session ID",
          "type": "int"
        },
        {
          "name": "l2tp_access_concentrator_ip",
          "label": "Access Concentrator IP",
          "type": "string"
        },
        {
          "name": "l2tp_access_concentrator_port",
          "label": "Access Concentrator Port",
          "type": "int"
        },
        {
          "name": "l2tp_network_server_ip",
          "label": "Network Server IP",
          "type": "string"
        },
        {
          "name": "l2tp_network_server_port",
          "label": "Network Server Port",
          "type": "int"
        }
      ],
      "PPTP": [
        {
          "name": "pptp_uplink_tunnel_id",
          "label": "UpLink Tunnel ID",
          "type": "int"
        },
        {
          "name": "pptp_downlink_tunnel_id",
          "label": "Down Tunnel ID",
          "type": "int"
        }
      ]
    },
    "measurements": {
      "aggregates": {
        "sessions": [
          {
            "fn": "count",
            "column": "log_id",
            "value": "sessions",
            "label": "Sessions",
            "unit": "sessions"
          }
        ],
        "bytes": [
          {
            "fn": "sum",
            "column": "sent_bytes + received_bytes",
            "value": "bytes",
            "label": "Bytes",
            "unit": "bytes"
          }
        ],
        "incoming_bytes": [
          {
            "fn": "sum",
            "column": "if(bitAnd(flags, 8) = 8, received_bytes, sent_bytes)",
            "value": "incoming_bytes",
            "label": "Incoming Bytes",
            "unit": "bytes"
          }
        ],
        "outgoing_bytes": [
          {
            "fn": "sum",
            "column": "if(bitAnd(flags, 8) = 8, sent_bytes, received_bytes)",
            "value": "outgoing_bytes",
            "label": "Outgoing Bytes",
            "unit": "bytes"
          }
        ]
      }
    },
    "size": 55784179370
  },
  "fields": [
    {
      "name": "ip",
      "label": "ip",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "type": "ip",
          "operator_functions": "=,in,like"
        }
      }
    },
    {
      "name": "domain",
      "label": "domain",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "domain",
          "type": "domain",
          "operator_functions": "=,in,like"
        }
      }
    },
    {
      "name": "app_name",
      "label": "app",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "app",
          "operator_functions": "=,in,like"
        }
      }
    },
    {
      "name": "ip_country_region",
      "label": "ip.country",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      data: [
        {
          "code": "China",
          "value": "CHina"
        },
        {
          "code": "American",
          "value": "Allow"
        }
      ],
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "ip_super_admin_area",
      "label": "ip.region",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "ip_admin_area",
      "label": "ip.city",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "ip_asn",
      "label": "ip.asn",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "ip_isp",
      "label": "ip.isp",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "domain_category_name",
      "label": "domain.category",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "domain",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "app_category",
      "label": "app.category",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "app",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "entity_tags",
      "label": "tag",
      "connector": {
        "alias": "e",
        "table": "cn_entity_relation",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": {
        "type": "array",
        "items": "string"
      },
      "doc": {
        "constraints": {
          "primay": "",
          "operator_functions": "has"
        }
      }
    },
    {
      "name": "port",
      "label": "ip.port",
      "connector": {
        "alias": "dr",
        "table": "cn_ip_dynamic_attribute",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "int",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    },
    {
      "name": "security_action",
      "type": "string",
      "doc": {
        "visibility": "enabled",
        "constraints": {
          "operator_functions": "=,!=,in,not in"
        },
        "data": [
          {
            "code": "Deny",
            "value": "Deny"
          },
          {
            "code": "Allow",
            "value": "Allow"
          }
        ],
        "ttl": null,
        "size": 4882982
      },
      "label": "security.action"
    },
    {
      "name": "l7_protocol",
      "label": "ip.protocol",
      "connector": {
        "alias": "dr",
        "table": "cn_ip_dynamic_attribute",
        "schema": "cyber_narrator_galaxy",
        "catalog": "clickhouse"
      },
      "type": "string",
      "doc": {
        "constraints": {
          "primay": "ip",
          "operator_functions": "=,in"
        }
      }
    }
  ]
}
