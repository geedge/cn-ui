export default {
  "nodes": [
    {
      "isRoot": true,
      "type": "circle",
      "id": "baidu.com",
      "label": "baidu.com",
      "size": 82,
      "x": 0,
      "y": 0,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored2.svg",
        "width": 36,
        "height": 30
      },
      "style": {
        "fill": "white",
        "stroke": "#AFDEED",
        "lineWidth": 5
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "1",
        "childNodes": [
          {
            "id": "ip-1",
            "label": "Resolve IP(3)",
            "x": 0,
            "y": 300,
            "data": {
              "level": "2",
              "sourceName": "baidu.com",
              "sourceType": "domain",
              "type": "ip",
              "count": 3,
              "loaded": [
                {
                  "vertex": "116.178.71.35",
                  "detail": {
                    "location": {
                      "continent": "Asia",
                      "owner": "China Unicom",
                      "knowledgeId": 1,
                      "country": "China",
                      "province": "Xinjiang",
                      "lngwgs": 87.555502,
                      "city": "Urumqi City",
                      "isp": "China Unicom",
                      "isValid": 1,
                      "latwgs": 43.833288
                    },
                    "asn": {
                      "knowledgeId": 6,
                      "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                      "isValid": 1,
                      "id": 172831,
                      "asn": "4837"
                    }
                  }
                },
                {
                  "vertex": "119.249.102.33",
                  "detail": {
                    "location": {
                      "continent": "Asia",
                      "owner": "China Unicom",
                      "knowledgeId": 1,
                      "country": "China",
                      "province": "Hebei",
                      "lngwgs": 115.481957,
                      "city": "Baoding City",
                      "isp": "China Unicom",
                      "isValid": 1,
                      "latwgs": 38.879992
                    },
                    "asn": {
                      "knowledgeId": 6,
                      "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                      "isValid": 1,
                      "id": 172932,
                      "asn": "4837"
                    }
                  }
                },
                {
                  "vertex": "27.221.27.35",
                  "detail": {
                    "location": {
                      "continent": "Europe",
                      "owner": "Vodafone GmbH",
                      "knowledgeId": 1,
                      "country": "Germany",
                      "province": "Rheinland-Pfalz",
                      "lngwgs": 8.207885,
                      "city": "Freinsheim",
                      "isp": "Vodafone GmbH",
                      "isValid": 1,
                      "latwgs": 49.501895
                    },
                    "asn": {
                      "knowledgeId": 6,
                      "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                      "isValid": 1,
                      "id": 172121,
                      "asn": "4837"
                    }
                  }
                }
              ],
              "childNodes": [
                {
                  "id": "116.178.71.35",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
                    "width": 20,
                    "height": 18
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "ip",
                    "name": "116.178.71.35",
                    "data": {
                      "vertex": "116.178.71.35",
                      "detail": {
                        "location": {
                          "continent": "Asia",
                          "owner": "China Unicom",
                          "knowledgeId": 1,
                          "country": "China",
                          "province": "Xinjiang",
                          "lngwgs": 87.555502,
                          "city": "Urumqi City",
                          "isp": "China Unicom",
                          "isValid": 1,
                          "latwgs": 43.833288
                        },
                        "asn": {
                          "knowledgeId": 6,
                          "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                          "isValid": 1,
                          "id": 172831,
                          "asn": "4837"
                        }
                      }
                    }
                  }
                },
                {
                  "id": "119.249.102.33",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
                    "width": 20,
                    "height": 18
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "ip",
                    "name": "119.249.102.33",
                    "data": {
                      "vertex": "119.249.102.33",
                      "detail": {
                        "location": {
                          "continent": "Asia",
                          "owner": "China Unicom",
                          "knowledgeId": 1,
                          "country": "China",
                          "province": "Hebei",
                          "lngwgs": 115.481957,
                          "city": "Baoding City",
                          "isp": "China Unicom",
                          "isValid": 1,
                          "latwgs": 38.879992
                        },
                        "asn": {
                          "knowledgeId": 6,
                          "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                          "isValid": 1,
                          "id": 172932,
                          "asn": "4837"
                        }
                      }
                    }
                  }
                },
                {
                  "id": "27.221.27.35",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
                    "width": 20,
                    "height": 18
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "ip",
                    "name": "27.221.27.35",
                    "data": {
                      "vertex": "27.221.27.35",
                      "detail": {
                        "location": {
                          "continent": "Europe",
                          "owner": "Vodafone GmbH",
                          "knowledgeId": 1,
                          "country": "Germany",
                          "province": "Rheinland-Pfalz",
                          "lngwgs": 8.207885,
                          "city": "Freinsheim",
                          "isp": "Vodafone GmbH",
                          "isValid": 1,
                          "latwgs": 49.501895
                        },
                        "asn": {
                          "knowledgeId": 6,
                          "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                          "isValid": 1,
                          "id": 172121,
                          "asn": "4837"
                        }
                      }
                    }
                  }
                }
              ]
            },
            "type": "circle",
            "size": 66,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/ip.svg",
              "width": 24,
              "height": 22
            },
            "style": {
              "fill": "white",
              "stroke": "#A7B0B9",
              "lineWidth": 1
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "edges": [
              {
                "id": "ip-1-116.178.71.35",
                "source": "ip-1",
                "target": "116.178.71.35",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "ip-1-119.249.102.33",
                "source": "ip-1",
                "target": "119.249.102.33",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "ip-1-27.221.27.35",
                "source": "ip-1",
                "target": "27.221.27.35",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              }
            ]
          },
          {
            "id": "domain-1",
            "label": "Subdomain(9)",
            "x": 260,
            "y": -150,
            "data": {
              "level": "2",
              "sourceName": "baidu.com",
              "sourceType": "domain",
              "type": "domain",
              "count": 9,
              "loaded": [
                {
                  "vertex": "imeres.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "img0.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "img1.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "luimg.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "pics0.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "pics1.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "pn.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "ss0.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                },
                {
                  "vertex": "wjz-cdn.baidu.com",
                  "detail": {
                    "whois": null,
                    "category": null
                  }
                }
              ],
              "childNodes": [
                {
                  "id": "imeres.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "imeres.baidu.com",
                    "data": {
                      "vertex": "imeres.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "img0.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "img0.baidu.com",
                    "data": {
                      "vertex": "img0.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "img1.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "img1.baidu.com",
                    "data": {
                      "vertex": "img1.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "luimg.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "luimg.baidu.com",
                    "data": {
                      "vertex": "luimg.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "pics0.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "pics0.baidu.com",
                    "data": {
                      "vertex": "pics0.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "pics1.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "pics1.baidu.com",
                    "data": {
                      "vertex": "pics1.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "pn.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "pn.baidu.com",
                    "data": {
                      "vertex": "pn.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "ss0.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "ss0.baidu.com",
                    "data": {
                      "vertex": "ss0.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                },
                {
                  "id": "wjz-cdn.baidu.com",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
                    "width": 20,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "domain",
                    "name": "wjz-cdn.baidu.com",
                    "data": {
                      "vertex": "wjz-cdn.baidu.com",
                      "detail": {
                        "whois": null,
                        "category": null
                      }
                    }
                  }
                }
              ]
            },
            "type": "circle",
            "size": 66,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain.svg",
              "width": 24,
              "height": 24
            },
            "style": {
              "fill": "white",
              "stroke": "#A7B0B9",
              "lineWidth": 1
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "edges": [
              {
                "id": "domain-1-imeres.baidu.com",
                "source": "domain-1",
                "target": "imeres.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-img0.baidu.com",
                "source": "domain-1",
                "target": "img0.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-img1.baidu.com",
                "source": "domain-1",
                "target": "img1.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-luimg.baidu.com",
                "source": "domain-1",
                "target": "luimg.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-pics0.baidu.com",
                "source": "domain-1",
                "target": "pics0.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-pics1.baidu.com",
                "source": "domain-1",
                "target": "pics1.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-pn.baidu.com",
                "source": "domain-1",
                "target": "pn.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-ss0.baidu.com",
                "source": "domain-1",
                "target": "ss0.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              },
              {
                "id": "domain-1-wjz-cdn.baidu.com",
                "source": "domain-1",
                "target": "wjz-cdn.baidu.com",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              }
            ]
          },
          {
            "id": "app-1",
            "label": "Related APP(1)",
            "x": -260,
            "y": -150,
            "data": {
              "level": "2",
              "sourceName": "baidu.com",
              "sourceType": "domain",
              "type": "app",
              "count": 1,
              "loaded": [
                {
                  "vertex": "baidu",
                  "detail": {
                    "category": {
                      "appName": "baidu",
                      "isValid": 1,
                      "appDescription": "Baidu is a Chinese search engine for websites, audio files and images. Baidu means \"\"One hundred degrees\"\" in English.",
                      "appTechnology": "network-protocol",
                      "appCategory": "general-internet",
                      "updateTime": "2023-06-21 06:39:57",
                      "knowledgeId": 12,
                      "appLongname": "Baidu.com",
                      "appCompanyCategory": "",
                      "createTime": "2023-06-21 06:39:57",
                      "appId": 548,
                      "appCompany": "Baidu",
                      "appRisk": 1,
                      "appSubcategory": "internet-utility"
                    }
                  }
                }
              ],
              "childNodes": [
                {
                  "id": "baidu",
                  "type": "circle",
                  "size": 28,
                  "icon": {
                    "show": true,
                    "img": "http://localhost/images/entity-symbol2/app-colored.svg",
                    "width": 17,
                    "height": 20
                  },
                  "style": {
                    "fill": "transparent",
                    "stroke": "transparent",
                    "lineWidth": 0
                  },
                  "labelCfg": {
                    "position": "bottom",
                    "offset": 10,
                    "style": {
                      "fill": "#353636",
                      "fontSize": 12
                    }
                  },
                  "data": {
                    "level": "2.5",
                    "type": "app",
                    "name": "baidu",
                    "data": {
                      "vertex": "baidu",
                      "detail": {
                        "category": {
                          "appName": "baidu",
                          "isValid": 1,
                          "appDescription": "Baidu is a Chinese search engine for websites, audio files and images. Baidu means \"\"One hundred degrees\"\" in English.",
                          "appTechnology": "network-protocol",
                          "appCategory": "general-internet",
                          "updateTime": "2023-06-21 06:39:57",
                          "knowledgeId": 12,
                          "appLongname": "Baidu.com",
                          "appCompanyCategory": "",
                          "createTime": "2023-06-21 06:39:57",
                          "appId": 548,
                          "appCompany": "Baidu",
                          "appRisk": 1,
                          "appSubcategory": "internet-utility"
                        }
                      }
                    }
                  }
                }
              ]
            },
            "type": "circle",
            "size": 66,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/app.svg",
              "width": 20,
              "height": 24
            },
            "style": {
              "fill": "white",
              "stroke": "#A7B0B9",
              "lineWidth": 1
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "edges": [
              {
                "id": "app-1-baidu",
                "source": "app-1",
                "target": "baidu",
                "style": {
                  "stroke": "#BEBEBE",
                  "endArrow": {
                    "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
                  }
                }
              }
            ]
          }
        ]
      },
      "edges": [
        {
          "id": "baidu.com-ip-1",
          "source": "baidu.com",
          "target": "ip-1",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "baidu.com-domain-1",
          "source": "baidu.com",
          "target": "domain-1",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "baidu.com-app-1",
          "source": "baidu.com",
          "target": "app-1",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        }
      ]
    },
    {
      "id": "ip-1",
      "label": "Resolve IP(3)",
      "x": 0,
      "y": 300,
      "data": {
        "level": "2",
        "sourceName": "baidu.com",
        "sourceType": "domain",
        "type": "ip",
        "count": 3,
        "loaded": [
          {
            "vertex": "116.178.71.35",
            "detail": {
              "location": {
                "continent": "Asia",
                "owner": "China Unicom",
                "knowledgeId": 1,
                "country": "China",
                "province": "Xinjiang",
                "lngwgs": 87.555502,
                "city": "Urumqi City",
                "isp": "China Unicom",
                "isValid": 1,
                "latwgs": 43.833288
              },
              "asn": {
                "knowledgeId": 6,
                "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                "isValid": 1,
                "id": 172831,
                "asn": "4837"
              }
            }
          },
          {
            "vertex": "119.249.102.33",
            "detail": {
              "location": {
                "continent": "Asia",
                "owner": "China Unicom",
                "knowledgeId": 1,
                "country": "China",
                "province": "Hebei",
                "lngwgs": 115.481957,
                "city": "Baoding City",
                "isp": "China Unicom",
                "isValid": 1,
                "latwgs": 38.879992
              },
              "asn": {
                "knowledgeId": 6,
                "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                "isValid": 1,
                "id": 172932,
                "asn": "4837"
              }
            }
          },
          {
            "vertex": "27.221.27.35",
            "detail": {
              "location": {
                "continent": "Europe",
                "owner": "Vodafone GmbH",
                "knowledgeId": 1,
                "country": "Germany",
                "province": "Rheinland-Pfalz",
                "lngwgs": 8.207885,
                "city": "Freinsheim",
                "isp": "Vodafone GmbH",
                "isValid": 1,
                "latwgs": 49.501895
              },
              "asn": {
                "knowledgeId": 6,
                "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                "isValid": 1,
                "id": 172121,
                "asn": "4837"
              }
            }
          }
        ],
        "childNodes": [
          {
            "id": "116.178.71.35",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
              "width": 20,
              "height": 18
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "ip",
              "name": "116.178.71.35",
              "data": {
                "vertex": "116.178.71.35",
                "detail": {
                  "location": {
                    "continent": "Asia",
                    "owner": "China Unicom",
                    "knowledgeId": 1,
                    "country": "China",
                    "province": "Xinjiang",
                    "lngwgs": 87.555502,
                    "city": "Urumqi City",
                    "isp": "China Unicom",
                    "isValid": 1,
                    "latwgs": 43.833288
                  },
                  "asn": {
                    "knowledgeId": 6,
                    "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                    "isValid": 1,
                    "id": 172831,
                    "asn": "4837"
                  }
                }
              }
            }
          },
          {
            "id": "119.249.102.33",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
              "width": 20,
              "height": 18
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "ip",
              "name": "119.249.102.33",
              "data": {
                "vertex": "119.249.102.33",
                "detail": {
                  "location": {
                    "continent": "Asia",
                    "owner": "China Unicom",
                    "knowledgeId": 1,
                    "country": "China",
                    "province": "Hebei",
                    "lngwgs": 115.481957,
                    "city": "Baoding City",
                    "isp": "China Unicom",
                    "isValid": 1,
                    "latwgs": 38.879992
                  },
                  "asn": {
                    "knowledgeId": 6,
                    "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                    "isValid": 1,
                    "id": 172932,
                    "asn": "4837"
                  }
                }
              }
            }
          },
          {
            "id": "27.221.27.35",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
              "width": 20,
              "height": 18
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "ip",
              "name": "27.221.27.35",
              "data": {
                "vertex": "27.221.27.35",
                "detail": {
                  "location": {
                    "continent": "Europe",
                    "owner": "Vodafone GmbH",
                    "knowledgeId": 1,
                    "country": "Germany",
                    "province": "Rheinland-Pfalz",
                    "lngwgs": 8.207885,
                    "city": "Freinsheim",
                    "isp": "Vodafone GmbH",
                    "isValid": 1,
                    "latwgs": 49.501895
                  },
                  "asn": {
                    "knowledgeId": 6,
                    "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
                    "isValid": 1,
                    "id": 172121,
                    "asn": "4837"
                  }
                }
              }
            }
          }
        ]
      },
      "type": "circle",
      "size": 66,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/ip.svg",
        "width": 24,
        "height": 22
      },
      "style": {
        "fill": "white",
        "stroke": "#A7B0B9",
        "lineWidth": 1
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "edges": [
        {
          "id": "ip-1-116.178.71.35",
          "source": "ip-1",
          "target": "116.178.71.35",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "ip-1-119.249.102.33",
          "source": "ip-1",
          "target": "119.249.102.33",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "ip-1-27.221.27.35",
          "source": "ip-1",
          "target": "27.221.27.35",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        }
      ]
    },
    {
      "id": "domain-1",
      "label": "Subdomain(9)",
      "x": 260,
      "y": -150,
      "data": {
        "level": "2",
        "sourceName": "baidu.com",
        "sourceType": "domain",
        "type": "domain",
        "count": 9,
        "loaded": [
          {
            "vertex": "imeres.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "img0.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "img1.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "luimg.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "pics0.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "pics1.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "pn.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "ss0.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          },
          {
            "vertex": "wjz-cdn.baidu.com",
            "detail": {
              "whois": null,
              "category": null
            }
          }
        ],
        "childNodes": [
          {
            "id": "imeres.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "imeres.baidu.com",
              "data": {
                "vertex": "imeres.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "img0.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "img0.baidu.com",
              "data": {
                "vertex": "img0.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "img1.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "img1.baidu.com",
              "data": {
                "vertex": "img1.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "luimg.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "luimg.baidu.com",
              "data": {
                "vertex": "luimg.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "pics0.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "pics0.baidu.com",
              "data": {
                "vertex": "pics0.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "pics1.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "pics1.baidu.com",
              "data": {
                "vertex": "pics1.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "pn.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "pn.baidu.com",
              "data": {
                "vertex": "pn.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "ss0.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "ss0.baidu.com",
              "data": {
                "vertex": "ss0.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          },
          {
            "id": "wjz-cdn.baidu.com",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
              "width": 20,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "domain",
              "name": "wjz-cdn.baidu.com",
              "data": {
                "vertex": "wjz-cdn.baidu.com",
                "detail": {
                  "whois": null,
                  "category": null
                }
              }
            }
          }
        ]
      },
      "type": "circle",
      "size": 66,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain.svg",
        "width": 24,
        "height": 24
      },
      "style": {
        "fill": "white",
        "stroke": "#A7B0B9",
        "lineWidth": 1
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "edges": [
        {
          "id": "domain-1-imeres.baidu.com",
          "source": "domain-1",
          "target": "imeres.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-img0.baidu.com",
          "source": "domain-1",
          "target": "img0.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-img1.baidu.com",
          "source": "domain-1",
          "target": "img1.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-luimg.baidu.com",
          "source": "domain-1",
          "target": "luimg.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-pics0.baidu.com",
          "source": "domain-1",
          "target": "pics0.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-pics1.baidu.com",
          "source": "domain-1",
          "target": "pics1.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-pn.baidu.com",
          "source": "domain-1",
          "target": "pn.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-ss0.baidu.com",
          "source": "domain-1",
          "target": "ss0.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        },
        {
          "id": "domain-1-wjz-cdn.baidu.com",
          "source": "domain-1",
          "target": "wjz-cdn.baidu.com",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        }
      ]
    },
    {
      "id": "app-1",
      "label": "Related APP(1)",
      "x": -260,
      "y": -150,
      "data": {
        "level": "2",
        "sourceName": "baidu.com",
        "sourceType": "domain",
        "type": "app",
        "count": 1,
        "loaded": [
          {
            "vertex": "baidu",
            "detail": {
              "category": {
                "appName": "baidu",
                "isValid": 1,
                "appDescription": "Baidu is a Chinese search engine for websites, audio files and images. Baidu means \"\"One hundred degrees\"\" in English.",
                "appTechnology": "network-protocol",
                "appCategory": "general-internet",
                "updateTime": "2023-06-21 06:39:57",
                "knowledgeId": 12,
                "appLongname": "Baidu.com",
                "appCompanyCategory": "",
                "createTime": "2023-06-21 06:39:57",
                "appId": 548,
                "appCompany": "Baidu",
                "appRisk": 1,
                "appSubcategory": "internet-utility"
              }
            }
          }
        ],
        "childNodes": [
          {
            "id": "baidu",
            "type": "circle",
            "size": 28,
            "icon": {
              "show": true,
              "img": "http://localhost/images/entity-symbol2/app-colored.svg",
              "width": 17,
              "height": 20
            },
            "style": {
              "fill": "transparent",
              "stroke": "transparent",
              "lineWidth": 0
            },
            "labelCfg": {
              "position": "bottom",
              "offset": 10,
              "style": {
                "fill": "#353636",
                "fontSize": 12
              }
            },
            "data": {
              "level": "2.5",
              "type": "app",
              "name": "baidu",
              "data": {
                "vertex": "baidu",
                "detail": {
                  "category": {
                    "appName": "baidu",
                    "isValid": 1,
                    "appDescription": "Baidu is a Chinese search engine for websites, audio files and images. Baidu means \"\"One hundred degrees\"\" in English.",
                    "appTechnology": "network-protocol",
                    "appCategory": "general-internet",
                    "updateTime": "2023-06-21 06:39:57",
                    "knowledgeId": 12,
                    "appLongname": "Baidu.com",
                    "appCompanyCategory": "",
                    "createTime": "2023-06-21 06:39:57",
                    "appId": 548,
                    "appCompany": "Baidu",
                    "appRisk": 1,
                    "appSubcategory": "internet-utility"
                  }
                }
              }
            }
          }
        ]
      },
      "type": "circle",
      "size": 66,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/app.svg",
        "width": 20,
        "height": 24
      },
      "style": {
        "fill": "white",
        "stroke": "#A7B0B9",
        "lineWidth": 1
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "edges": [
        {
          "id": "app-1-baidu",
          "source": "app-1",
          "target": "baidu",
          "style": {
            "stroke": "#BEBEBE",
            "endArrow": {
              "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
            }
          }
        }
      ]
    },
    {
      "id": "116.178.71.35",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
        "width": 20,
        "height": 18
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "ip",
        "name": "116.178.71.35",
        "data": {
          "vertex": "116.178.71.35",
          "detail": {
            "location": {
              "continent": "Asia",
              "owner": "China Unicom",
              "knowledgeId": 1,
              "country": "China",
              "province": "Xinjiang",
              "lngwgs": 87.555502,
              "city": "Urumqi City",
              "isp": "China Unicom",
              "isValid": 1,
              "latwgs": 43.833288
            },
            "asn": {
              "knowledgeId": 6,
              "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
              "isValid": 1,
              "id": 172831,
              "asn": "4837"
            }
          }
        }
      }
    },
    {
      "id": "119.249.102.33",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
        "width": 20,
        "height": 18
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "ip",
        "name": "119.249.102.33",
        "data": {
          "vertex": "119.249.102.33",
          "detail": {
            "location": {
              "continent": "Asia",
              "owner": "China Unicom",
              "knowledgeId": 1,
              "country": "China",
              "province": "Hebei",
              "lngwgs": 115.481957,
              "city": "Baoding City",
              "isp": "China Unicom",
              "isValid": 1,
              "latwgs": 38.879992
            },
            "asn": {
              "knowledgeId": 6,
              "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
              "isValid": 1,
              "id": 172932,
              "asn": "4837"
            }
          }
        }
      }
    },
    {
      "id": "27.221.27.35",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/ip-colored.svg",
        "width": 20,
        "height": 18
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "ip",
        "name": "27.221.27.35",
        "data": {
          "vertex": "27.221.27.35",
          "detail": {
            "location": {
              "continent": "Europe",
              "owner": "Vodafone GmbH",
              "knowledgeId": 1,
              "country": "Germany",
              "province": "Rheinland-Pfalz",
              "lngwgs": 8.207885,
              "city": "Freinsheim",
              "isp": "Vodafone GmbH",
              "isValid": 1,
              "latwgs": 49.501895
            },
            "asn": {
              "knowledgeId": 6,
              "organization": "CHINA169-BACKBONE CHINA UNICOM China169 Backbone",
              "isValid": 1,
              "id": 172121,
              "asn": "4837"
            }
          }
        }
      }
    },
    {
      "id": "imeres.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "imeres.baidu.com",
        "data": {
          "vertex": "imeres.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "img0.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "img0.baidu.com",
        "data": {
          "vertex": "img0.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "img1.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "img1.baidu.com",
        "data": {
          "vertex": "img1.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "luimg.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "luimg.baidu.com",
        "data": {
          "vertex": "luimg.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "pics0.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "pics0.baidu.com",
        "data": {
          "vertex": "pics0.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "pics1.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "pics1.baidu.com",
        "data": {
          "vertex": "pics1.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "pn.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "pn.baidu.com",
        "data": {
          "vertex": "pn.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "ss0.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "ss0.baidu.com",
        "data": {
          "vertex": "ss0.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "wjz-cdn.baidu.com",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/domain-colored.svg",
        "width": 20,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "domain",
        "name": "wjz-cdn.baidu.com",
        "data": {
          "vertex": "wjz-cdn.baidu.com",
          "detail": {
            "whois": null,
            "category": null
          }
        }
      }
    },
    {
      "id": "baidu",
      "type": "circle",
      "size": 28,
      "icon": {
        "show": true,
        "img": "http://localhost/images/entity-symbol2/app-colored.svg",
        "width": 17,
        "height": 20
      },
      "style": {
        "fill": "transparent",
        "stroke": "transparent",
        "lineWidth": 0
      },
      "labelCfg": {
        "position": "bottom",
        "offset": 10,
        "style": {
          "fill": "#353636",
          "fontSize": 12
        }
      },
      "data": {
        "level": "2.5",
        "type": "app",
        "name": "baidu",
        "data": {
          "vertex": "baidu",
          "detail": {
            "category": {
              "appName": "baidu",
              "isValid": 1,
              "appDescription": "Baidu is a Chinese search engine for websites, audio files and images. Baidu means \"\"One hundred degrees\"\" in English.",
              "appTechnology": "network-protocol",
              "appCategory": "general-internet",
              "updateTime": "2023-06-21 06:39:57",
              "knowledgeId": 12,
              "appLongname": "Baidu.com",
              "appCompanyCategory": "",
              "createTime": "2023-06-21 06:39:57",
              "appId": 548,
              "appCompany": "Baidu",
              "appRisk": 1,
              "appSubcategory": "internet-utility"
            }
          }
        }
      }
    }
  ],
  "edges": [
    {
      "id": "baidu.com-ip-1",
      "source": "baidu.com",
      "target": "ip-1",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "baidu.com-domain-1",
      "source": "baidu.com",
      "target": "domain-1",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "baidu.com-app-1",
      "source": "baidu.com",
      "target": "app-1",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "ip-1-116.178.71.35",
      "source": "ip-1",
      "target": "116.178.71.35",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "ip-1-119.249.102.33",
      "source": "ip-1",
      "target": "119.249.102.33",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "ip-1-27.221.27.35",
      "source": "ip-1",
      "target": "27.221.27.35",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-imeres.baidu.com",
      "source": "domain-1",
      "target": "imeres.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-img0.baidu.com",
      "source": "domain-1",
      "target": "img0.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-img1.baidu.com",
      "source": "domain-1",
      "target": "img1.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-luimg.baidu.com",
      "source": "domain-1",
      "target": "luimg.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-pics0.baidu.com",
      "source": "domain-1",
      "target": "pics0.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-pics1.baidu.com",
      "source": "domain-1",
      "target": "pics1.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-pn.baidu.com",
      "source": "domain-1",
      "target": "pn.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-ss0.baidu.com",
      "source": "domain-1",
      "target": "ss0.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "domain-1-wjz-cdn.baidu.com",
      "source": "domain-1",
      "target": "wjz-cdn.baidu.com",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    },
    {
      "id": "app-1-baidu",
      "source": "app-1",
      "target": "baidu",
      "style": {
        "stroke": "#BEBEBE",
        "endArrow": {
          "path": "M 0,0 L 5,-2.5 L 5,2.5 Z"
        }
      }
    }
  ]
}
