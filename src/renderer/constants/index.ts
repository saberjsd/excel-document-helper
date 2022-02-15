export enum FeatureType {
  // 三表勾稽
  COMPARE_EXCEL = "compare_excel",
  // 风险检查
  CHECK_RICK = "check_rick",
  // 科目筛选
  FILTER_EXCEL = "filter_excel",
}

export enum MENU {
  EXCEL_BOARD = "excel_board",
  EXCEL_FILTER = "excel_filter",
  WORD_EXPORT = "word_export",
  SETTINGS_PROFIT = "settings_profit",
  SETTINGS_RISK = "settings_risk",
}


export enum JSON_PATH {
  // 三表勾稽，利润表配置
  CONFIG_COMPARE_PROFILE = "config_compare_profile",
  // 风险样式配置
  CONFIG_RISK_LIST = "config_risk_list",
  // 验证过的密码暂存
  PASSWORD_STASH = "password_stash"
}
