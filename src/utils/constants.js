export const defaultPageSize = 20

export const storageKey = {
  iso36112Capital: 'cn-iso3611-2-capital',
  iso36112WorldLow: 'cn-iso3611-2-world-low',
  i18n: 'cn-i18n',
  languages: 'cn-languages',
  language: 'cn-language',
  timezone: 'cn-timezone',
  timezoneOffset: 'cn-timezone-offset',
  timezoneLocalOffset: 'cn-timezone-local-offset',
  token: 'cn-token',
  username: 'cn-username',
  sysName: 'cn-sys-name',
  sysLogo: 'cn-sys-logo',
  tableTitlePrefix: 'cn-table-title',
  tablePageSizePrefix: 'cn-page-size',
  leftMenuShrink: 'cn-left-menu-shrink',
  unsavedChange: 'cn-unsaved-change',
  entitySearchHistory: 'cn-entity-search-history'
}

// 统一定义跳转来源
export const fromRoute = {
  trafficSummary: 'trafficSummary',
  networkAppPerformance: 'networkAppPerformance',
  dnsServiceInsights: 'dnsServiceInsights',
  user: 'user',
  galaxyProxy: 'galaxyProxy',
  chart: 'chart',
  cryptocurrency: 'cryptocurrency'
}

/* panel类别和名称之间的映射 */
export const panelTypeAndRouteMapping = {
  trafficSummary: 1,
  networkAppPerformance: 2,
  dnsServiceInsights: 3,
  ipEntityDetail: 4,
  domainEntityDetail: 5,
  appEntityDetail: 6,
  cryptocurrency: 7
}

/* operationLog state 执行状态属性 值与名称之间的映射 */
export const operationLogStateMapping = {
  success: 1,
  fail: 0
}

export const position = {
  tableHeight: {
    normal: 'calc(100% - 48px)' // 常规高度，特例在下方定义
  }
}

export const entityType = {
  app: 'APP',
  domain: 'Domain',
  ip: 'IP'
}

export const entityFilterType = {
  ip: [
    {
      column: 'country_distinct_count',
      labelI18nCode: 'overall.country',
      icon: 'cn-icon cn-icon-country'
    },
    {
      column: 'province_distinct_count',
      labelI18nCode: 'overall.province',
      icon: 'cn-icon cn-icon-position'
    },
    {
      column: 'city_distinct_count',
      labelI18nCode: 'overall.city',
      icon: 'cn-icon cn-icon-city'
    },
    {
      column: 'asn_distinct_count',
      labelI18nCode: 'entities.asn',
      icon: 'cn-icon cn-icon-cloud'
    }
  ],
  domain: [
    {
      column: 'categoryGroupDistinctCount',
      labelI18nCode: 'entities.domainDetail.categoryGroup',
      icon: 'cn-icon cn-icon-category'
    },
    {
      column: 'categoryDistinctCount',
      labelI18nCode: 'entities.category',
      icon: 'cn-icon cn-icon-sub-category'
    },
    {
      column: 'categoryGroupDistinctCount',
      labelI18nCode: 'entities.reputationLevel',
      icon: 'cn-icon cn-icon-credit'
    }
  ],
  app: [
    {
      column: 'categoryDistinctCount',
      labelI18nCode: 'entities.category',
      icon: 'cn-icon cn-icon-category'
    },
    {
      column: 'subcategoryDistinctCount',
      labelI18nCode: 'entities.subcategory',
      icon: 'cn-icon cn-icon-sub-category'
    },
    {
      column: 'riskDistinctCount',
      labelI18nCode: 'entities.risk',
      icon: 'cn-icon cn-icon-risk'
    }
  ]
}

export const unitTypes = {
  time: 'time',
  number: 'number',
  byte: 'byte',
  string: 'string',
  percent: 'percent'
}

export const chartTableDefaultPageSize = 10 // table类型图表默认每页数据量
export const chartTableTopOptions = [10, 100] // table类型图表的TOP-N选项
export const chartActiveIpTableOrderOptions = ['machine'] // active ip table类型图表的order 选项
// table类型图表column映射
export const chartTableColumnMapping = {
  sessions: 'overall.sessions',
  packets: 'overall.packets',
  bytes: 'overall.bytes',
  clientIp: 'overall.clientIp',
  serverIp: 'overall.serverIp',
  domain: 'overall.domain',
  appName: 'overall.appName',
  queryRate: 'dns.queryRate',
  dnsLatency: 'dns.averageResolveLatency',
  responseFailRate: 'dns.responseFailureRate'
}
export const chartPieTableTopOptions = [
  { name: 'Sessions', value: 'sessions' },
  { name: 'Packets', value: 'packets' },
  { name: 'Bytes', value: 'bytes' }
]
export const riskLevelMapping = [
  { name: 'Trustworthy', value: 1 },
  { name: 'Low Risk', value: 2 },
  { name: 'Moderate Risk', value: 3 },
  { name: 'Suspicious', value: 4 },
  { name: 'High Risk', value: 5 }
]
export const eventSeverity = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
  info: 'info'
}
export const eventSeverityColor = {
  critical: '#D84C4C',
  high: '#FE845D',
  medium: '#FFB65A',
  low: '#FFD82D',
  info: '#D1BD50'
}
export const securityType = {
  commandAndControl: 'common and control',
  payloadDelivery: 'payload delivery',
  cryptomining: 'cryptomining',
  phishing: 'phishing',
  dga: 'dga',
  ddos: 'ddos'
}
export const detectionPageType = {
  securityEvent: 'securityEvent',
  performanceEvent: 'performanceEvent'
}

export const dnsServerRole = {
  RTDNS: 'RTDNS',
  TLDNS: 'TLDNS',
  OPRDNS: 'OPRDNS',
  ADNS: 'ADNS',
  SBDNS: 'SBDNS',
  RTDNSM: 'RTDNSM'
}

export const chartColor = ['#5370C6', '#90CC74', '#FAC858', '#EE6666',
  '#73BFDE', '#3BA172', '#FC8452', '#9960B4',
  '#E97CCC', '#FEA69E', '#0F8AB2', '#57CBAC',
  '#5888BC', '#63B6AC', '#EDC6B2', '#D5746B']

export const iso36112 = {
  [storageKey.iso36112Capital]: 'data/countriesWithCapital',
  [storageKey.iso36112WorldLow]: 'worldChinaLow',
  IE: 'irelandLow',
  MM: 'myanmarLow',
  TZ: 'tanzaniaLow',
  BS: 'bahamasLow',
  DM: 'dominicaLow',
  VC: 'saintVincentLow',
  BG: 'bulgariaLow',
  SK: 'slovakiaLow',
  UZ: 'uzbekistanLow',
  IS: 'icelandLow',
  CA: 'canadaLow',
  AT: 'austriaLow',
  DO: 'dominicanRepublicLow',
  MY: 'malaysiaLow',
  BW: 'botswanaLow',
  SH: 'saintHelenaLow',
  NO: 'norway2020Low',
  CF: 'centralAfricanRepublicLow',
  GA: 'gabonLow',
  GD: 'grenadaLow',
  RU: 'russiaLow',
  FR: 'franceLow',
  TJ: 'tajikistanLow',
  CU: 'cubaLow',
  NP: 'nepalLow',
  ZW: 'zimbabweLow',
  CW: 'curacaoLow',
  GW: 'guineaBissauLow',
  EE: 'estoniaLow',
  AG: 'antiguaBarbudaLow',
  TT: 'trinidadTobagoLow',
  BF: 'burkinaFasoLow',
  LI: 'liechtensteinLow',
  OM: 'omanLow',
  GY: 'guyanaLow',
  GR: 'greeceLow',
  KG: 'kyrgyzstanLow',
  SD: 'sudanLow',
  AE: 'uaeLow',
  KY: 'caymanIslandsLow',
  LA: 'laosLow',
  LT: 'lithuaniaLow',
  UG: 'ugandaLow',
  MR: 'mauritaniaLow',
  SS: 'southSudan2015Low',
  SI: 'sloveniaLow',
  MX: 'mexicoLow',
  GH: 'ghanaLow',
  GN: 'guineaLow',
  BB: 'barbadosLow',
  HN: 'hondurasLow',
  SN: 'senegalLow',
  BD: 'bangladeshLow',
  BQ: 'bonaireSintEustatiusSabaLow',
  CC: 'cocosKeelingLow',
  HR: 'croatiaLow',
  PL: 'polandLow',
  ST: 'saoTomePrincipeLow',
  TC: 'turksCaicosLow',
  GT: 'guatemalaLow',
  IT: 'italyLow',
  RW: 'rwandaLow',
  LC: 'saintLuciaLow',
  TL: 'timorLesteLow',
  CZ: 'czechiaLow',
  GQ: 'equatorialGuineaLow',
  FJ: 'fijiEastLow',
  MA: 'moroccoLow',
  DJ: 'djiboutiLow',
  NE: 'nigerLow',
  LV: 'latviaLow',
  RS: 'serbiaLow',
  PE: 'peruLow',
  SE: 'swedenLow',
  GE: 'georgiaLow',
  DE: 'bosniaHerzegovinaLow',
  AF: 'afghanistanLow',
  AR: 'argentinaLow',
  KE: 'kenyaLow',
  AS: 'americanSamoaLow',
  FI: 'finlandLow',
  IR: 'iranLow',
  UY: 'uruguayLow',
  SA: 'saudiArabiaLow',
  EC: 'ecuadorLow',
  AW: 'arubaLow',
  ZA: 'southAfricaLow',
  PM: 'stPierreMiquelonLow',
  SC: 'seychellesLow',
  MG: 'madagascarProvinceLow',
  YE: 'yemenLow',
  BR: 'brazilLow',
  ML: 'maliLow',
  CL: 'chileLow',
  LB: 'lebanonLow',
  DZ: 'algeriaLow',
  FO: 'faroeIslandsLow',
  VE: 'venezuelaLow',
  CR: 'costaRicaLow',
  GP: 'guadeloupeLow',
  SV: 'elSalvadorLow',
  LK: 'sriLankaLow',
  KZ: 'kazakhstanLow',
  NL: 'netherlandsLow',
  GM: 'gambiaLow',
  TR: 'turkeyLow',
  be: 'belgiumLow',
  PA: 'panamaLow',
  AZ: 'azerbaijanLow',
  PT: 'portugalLow',
  VA: 'vaticanLow',
  MW: 'malawiLow',
  KN: 'stKittsNevisLow',
  NI: 'nicaraguaLow',
  MD: 'moldovaLow',
  IN: 'indiaLow',
  MZ: 'mozambiqueLow',
  WS: 'samoaLow',
  ET: 'ethiopiaLow',
  MV: 'maldivesLow',
  TH: 'thailandLow',
  PH: 'philippinesLow',
  MQ: 'martiniqueLow',
  KP: 'northKoreaLow',
  PR: 'puertoRicoLow',
  CV: 'capeVerdeLow',
  TG: 'togoLow',
  AL: 'albaniaLow',
  SJ: 'svalbardLow',
  BH: 'bahrainLow',
  AU: 'australiaLow',
  BI: 'burundiLow',
  QA: 'qatarLow',
  TD: 'chadLow',
  BZ: 'belizeLow',
  GS: 'georgiaSouthOssetiaLow',
  MS: 'montserratLow',
  BM: 'bermudaLow',
  ZM: 'zambiaLow',
  JP: 'japanLow',
  JO: 'jordanLow',
  BT: 'bhutanLow',
  NZ: 'newZealandLow',
  MK: 'northMacedoniaLow',
  TN: 'tunisiaLow',
  bl: 'stBarthelemyLow',
  PY: 'paraguayLow',
  ID: 'indonesiaLow',
  HT: 'haitiLow',
  FK: 'falklandIslandsLow',
  MP: 'northernMarianaLow',
  PS: 'palestineLow',
  CD: 'congoDRLow',
  AM: 'armeniaLow',
  DK: 'denmarkLow',
  NG: 'nigeriaLow',
  RO: 'romaniaLow',
  ER: 'eritreaLow',
  BN: 'bruneiDarussalamLow',
  AO: 'angolaLow',
  BA: 'bosniaHerzegovinaCantonsLow',
  PK: 'pakistanLow',
  GL: 'greenlandLow',
  TM: 'turkmenistanLow',
  BJ: 'beninLow',
  CI: 'cotedIvoireLow',
  CN: 'chinaLow',
  CH: 'switzerlandLow',
  VG: 'britishVirginIslandsLow',
  VI: 'usVirginIslandsLow',
  IL: 'israelLow',
  SR: 'surinameLow',
  CO: 'colombiaLow',
  MT: 'maltaLow',
  CM: 'cameroonLow',
  LY: 'libyaLow',
  IQ: 'iraqLow',
  UA: 'ukraineLow',
  VN: 'vietnamLow',
  KH: 'cambodiaLow',
  AI: 'anguillaLow',
  ME: 'montenegroLow',
  SB: 'solomonIslandsLow',
  KR: 'southKoreaLow',
  GB: 'ukLow',
  SG: 'singaporeLow',
  EG: 'egyptLow',
  CY: 'cyprusLow',
  KM: 'comorosLow',
  GU: 'guamLow',
  HK: 'hongKongLow',
  SO: 'somaliaLow',
  NA: 'namibiaLow',
  HU: 'hungaryLow',
  BY: 'belarusLow',
  BO: 'boliviaLow',
  GF: 'frenchGuianaLow',
  US: 'usaLow',
  SL: 'sierraLeoneLow',
  SM: 'sanMarinoLow',
  AD: 'andorraLow',
  ES: 'spainLow',
  KW: 'kuwaitLow',
  CG: 'congoLow',
  LU: 'luxembourgLow',
  JM: 'jamaicaLow',
  SY: 'syriaLow',
  SZ: 'eswatiniLow',
  MN: 'mongoliaLow'
}
