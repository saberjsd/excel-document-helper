export const compareDefaultConfig = {
  headRowNumber: 3,
  // // 利润表配置
  // profitSheet: {
  //   sheetName: "利润表",
  //   configAmountCol: 'C',
  //   // 输出配置
  //   outAmountCol: "C",
  // },
  // 序时账配置
  billSheet: {
    sheetName: '序时账',
    headRowNumber: 1,
    configSubjectCol: 'F',
    configSubjectIdCol: 'G',
    configDirectionCol: 'H',
    // 查找的表的列
    debitCol: 'J',
    creditCol: 'K',
    findSubjectCol: 'G',
    findSubjectIdCol: 'F',
    // 输出配置
    outAmountCol: 'D',
  },
  // 余额表配置
  balanceSheet: {
    sheetName: '余额表',
    headRowNumber: 1,
    configSubjectCol: 'I',
    configSubjectIdCol: 'J',
    configDirectionCol: 'K',
    // 查找的表的列
    debitCol: 'E',
    creditCol: 'F',
    findSubjectCol: 'B',
    findSubjectIdCol: 'A',
    // 输出配置
    outAmountCol: 'E',
  },
  profitSheet: {
    sheetName: '利润表',
    headRowNumber: 3,
    configSubjectCol: 'A',
    // 查找配置
    findSubjectCol: 'A',
    findAmountCol: 'A',
    // 输出配置
    outAmountCol: 'C',
  },
};
