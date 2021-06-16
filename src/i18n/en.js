import enLocale from 'element-plus/lib/locale/lang/en' // 引入element语言包
const en = {
  ...enLocale,
  overall: {
    uploadCustomPicture: 'Upload custom picture',
    customPicture: 'Custom picture',
    endpointTemplate: 'Endpoint template',
    AddByTemplate: 'Add by template',
    exprTemp: 'Expr temp',
    oneHour: '1 hour',
    twoHour: '2 hours',
    sixHour: '6 hours',
    twelveHour: '12 hours',
    oneDay: '1 day',
    twoDay: '2 days',
    week: '1 week',
    folder: 'Folder',
    key: 'Key',
    state: 'State',
    projectName: 'Project name',
    startTime: 'Start time',
    endTime: 'End time',
    metric: 'Metric',
    locked: 'Locked',
    unlocked: 'Unlocked',
    dashboard: 'Dashboards', // '仪表盘'
    project: 'Project', // '系统'
    monitor: 'Monitor', // 监控
    alert: 'Alert', // "告警"
    asset: 'Asset', // '资产'
    config: 'Setting', // '设置'
    administration: 'Administration',
    configuration: 'configuration',
    create: 'New', // '新增'
    edit: 'Edit', // '编辑'
    delete: 'Delete', // '删除'
    view: 'View',
    type: 'Type',
    esc: 'Cancel', // '取消'
    cancel: 'Cancel', // '取消'
    save: 'Save', // '保存'
    download: 'Download', // 下载
    preview: 'Preview', // 预览
    search: 'Search', // '搜索'
    add: 'Create', // "新增"
    addProject: 'Add',
    addAssetList: 'Add',
    batchEdit: 'Batch Edit',
    option: 'Operation', // "操作"
    remark: 'Description',
    clear: 'Clear', // "清除"
    name: 'Name', // '名称'
    version: 'Version', // 版本
    components: 'Components', // 组件
    cover: 'Override', // '覆盖'
    signOut: 'Logout', // '登出'
    select: 'Select', // '选择'
    ok: 'Ok', // OK
    entity: 'Entity',
    all: 'All', // '全选'
    value: 'Value',
    other: 'Others', // "其他"
    about: 'About', // 关于
    detail: 'Detail', // 详情
    query: 'Query', // 查询
    account: 'Account',
    back: 'Back', // 返回
    unavailable: 'Unavailable',
    available: 'Available',
    changePin: 'Change password', // 修改密码
    createChart: 'New chart',
    createProject: 'New project',
    createEndpoint: 'New endpoint',
    batchEndpoint: 'Batch modify endpoint',
    createAsset: 'New asset',
    createAlertRule: 'New alert rule',
    createUser: 'New user',
    createRole: 'New role',
    createPrometheusServer: 'New agent',
    createDatacenter: 'New Data center',
    createCabinet: 'New cabinet',
    createModel: 'New model',
    createModule: 'New module',
    createMib: 'New MIB',
    createAssetType: 'New asset type',
    createAssetState: 'New asset state',
    createTemplate: 'New template',
    exportExcel: 'Export',
    importExcel: 'Import',
    importExcelLower: 'import',
    exportExcelLower: 'export',
    rollbackImport: 'Rollback',
    exportCur: 'Current page',
    exportAll: 'All',
    importFile: 'Please upload file',
    importTip: 'Only allowed xlsx/xls file',
    importTipImg: 'Only allowed jpg/png file',
    dragFileTip: 'Drag file here',
    or: 'or',
    clickUpload: 'Click to upload',
    upload: 'upload',
    template: 'Template',
    active: 'Active',
    result: {
      total: 'Total',
      failed: 'Failed',
      success: 'Success',
      failedDetail: 'Failed Detail',
      line: 'Line {0}:'
    },
    reset: 'Reset',
    submit: 'Save',
    noData: 'No data',
    tag: 'Tag',
    placeHolder: 'Please enter',
    syncChart: 'Synchronize chart',
    toolBox: {
      zoom: 'Area scaling',
      back: 'Area scaling restore',
      stack: 'Show stack chart',
      stackBack: 'Back to original chart'
    },
    SyncSave: 'Save&Sync',
    copySuccess: 'Copy success',
    parent: 'Parent',
    dc: 'Data center',
    labels: 'Label',
    moreOption: 'More option',
    copy: 'Copy',
    silence: 'Silence',
    editType: 'Type',
    searchCondition: 'Search condition',
    batchDel: 'Batches delete',
    tempPrev: 'Template preview',
    silenceAlert: 'silence alert',
    quickSilent: 'Quick silent',
    configEndpoint: 'Config'
  },
  tip: {
    confirmDelete: 'Are you sure you want to delete?', // Are you sure you want to delete?
    confirmOvertime: "Are you sure it's off?",
    killTerm: 'Are you sure you want to kill terminal?',
    confirmBatchDelete: 'Are you sure to delete these {0} pieces of data',
    assetConfirmDelete: 'Related endpoints and alerts will be removed, are you sure you want to delete this asset?', // Related endpoints and alerts will be removed, are you sure you want to delete this asset?
    yes: 'Yes', // "是"
    no: 'No', // No
    deleteSuccess: 'Delete success', // "删除成功"
    saveSuccess: 'Save success', // "保存成功"
    addSuccess: 'Add success', // "保存成功"
    duplicateSuccess: 'Duplicate success', // "复制成功"
    coverSuccess: 'Override success', // '覆盖成功'
    refreshLater: 'Refresh later', // '请稍后刷新'
    testSuccess: 'Test success',
    downloadSuccess: 'Download success',
    uploadSuccess: 'Upload success',
    pressEnterToAdd: 'Press enter to add new line',
    resetSuccess: 'Reset success',
    syncSuccess: 'Synchronize success',
    syncTip: 'This operation may cause the original data or chart to be overwritten. Are you sure to synchronize?',
    noImportFile: 'No import file found',
    noAccess: 'No access',
    confirmDuplicate: 'Are you sure to duplicate this chart?',
    confirmCancel: 'Changes you made are not saved?',
    copySuccess: 'Copy success',
    lnglatError: 'Wrong format of latitude and longitude'
  },
  validate: { // 校验规则
    required: 'Required', // '必填项'
    number: 'Numberic', // '必须是数字'
    integer: 'Integer',
    positiveInteger: 'Positive integer',
    email: 'Invalid email', // '不合法的E-mail地址'
    tel: 'Invalid phone number', // '不合法的电话号码'
    telephone: 'Phone number cannot be empty',
    host: 'Invalid Host', // '不合法的Host'
    domain: 'Invalid domain',
    usize: 'Must be number(1 - 47)',
    fileSize: 'File exceed max size', // File exceed max size.
    port: 'Invalid port',
    url: 'Invalid URL',
    uSize: 'Must be number(1 - 47)',
    requiredIdc: 'dc is required',
    key: 'Invalid key',
    repeat: 'Repeat',
    tooLong: 'Too long content',
    onlyWord: 'only input a-z、A-Z、0-9、"_" ',
    mobile: 'Invalid mobile'
  },
  config: {
    config: 'Setting', // "设置"
    user: {
      userList: 'User list', // "用户列表"
      user: 'User',
      // 列表表头
      name: 'Name', // "用户"
      username: 'Username', // 登录名
      roles: 'Role',
      language: 'Language', // "语言"
      receiver: 'Receiver', // "用户组"
      createTime: 'New time', // "创建时间"
      enable: 'Enable', // "可用"
      option: 'Operation', // "操作"
      lastLoginTime: 'Last login time', // 最后登录时间
      lastLoginIp: 'Last login IP', // 最后登录IP
      source: 'Source',
      // 侧滑框//
      userId: 'User ID', // "用户ID"
      createUser: 'New user', // "新增用户"
      editUser: 'Edit user', // "编辑用户"
      notCurrentlySupport: 'Not available', // '暂不支持'
      pin: 'Password', // '密码'
      oldPin: 'Old password',
      inputOldPin: 'Please input old password',
      newPin: 'New password',
      inputNewPin: 'Please input new password',
      confirmPin: 'Confirm password',
      inputConfirmPin: 'Please input confirm password',
      invalidPin: 'invalide password,the length at least 6',
      confirmPinErr: 'The two passwords are inconsistent',
      reinputPin: 'Enter password again',
      notification: 'Notification',
      mobile: 'Mobile'
    },
    roles: {
      roles: 'Role',
      name: 'Name',
      description: 'Description',
      option: 'Operation', // "操作"
      permission: 'Permission',
      menu: 'Menu',
      createRole: 'New role',
      editRole: 'Edit role',
      remark: 'Remark'
    },
    operationlog: {
      operationlog: 'Operation log',
      id: 'ID',
      username: 'User',
      operation: 'Operation',
      type: 'Type',
      createDate: 'Time',
      ip: 'IP',
      userId: 'UserId',
      operaId: 'Resources',
      time: 'Duration',
      params: 'Params',
      state: 'State',
      response: 'Response',
      operations: {
        add: 'add',
        query: 'query',
        update: 'update',
        import: 'import',
        export: 'export',
        delete: 'delete',
        reset: 'reset',
        unknown: 'unknown',
        login: 'login',
        logout: 'logout'
      }
    },
  },
}
export default en
