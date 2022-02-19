export const compareReadConfig = [
  {
    id: 'profitExcuted',
    name: '利润表-适用于已执行新金融准则',
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
      configSubjectCol: 'F',
      configSubjectIdCol: 'G',
      configDirectionCol: 'H',
      // 查找的表的列
      debitCol: 'I',
      creditCol: 'J',
      findSubjectCol: 'F',
      findSubjectIdCol: 'E',
      // 输出配置
      outAmountCol: 'D',
    },
    // 余额表配置
    balanceSheet: {
      sheetName: '余额表',
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
  },
  {
    id: 'profitNotExcute',
    name: '利润表-适用于未执行新金融准则等',
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
      configSubjectCol: 'F',
      configSubjectIdCol: 'G',
      configDirectionCol: 'H',
      // 查找的表的列
      debitCol: 'I',
      creditCol: 'J',
      findSubjectCol: 'F',
      findSubjectIdCol: 'E',
      // 输出配置
      outAmountCol: 'D',
    },
    // 余额表配置
    balanceSheet: {
      sheetName: '余额表',
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
  },
];

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
    // 输出配置
    outAmountCol: 'C',
  }
};
