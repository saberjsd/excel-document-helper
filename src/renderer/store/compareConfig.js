export const compareConfig = {
  billSheet: {
    sheetName: '序时帐',
    debit: { col: 'H', reg: /借方金额/ },
    credit: { col: 'I', reg: /贷方金额/ },
    amountCol: '1',
    // 科目名称 列的查找规范
    findCol: { col: 'E', reg: /科目名称/ },
    subjectCol: { col: 'D', reg: /科目代码/ },
  },
  balanceSheet: {
    sheetName: '余额表',
    debit: { col: 'E', reg: /本期借方/ },
    credit: { col: 'F', reg: /本期贷方/ },
    amountCol: '2',
    // 科目名称 列的查找规范
    findCol: { col: 'B', reg: /科目名称/ },
    subjectCol: { col: 'A', reg: /科目代码/ },
  },
  rows: [
    {
      name: '营业收入',
      billSheet: {
        direction: 'credit',
        search: /主营业务收入|其他业务收入/,
      },
      balanceSheet: {
        direction: 'credit',
        search: /主营业务收入|其他业务收入/,
      },
      profitSheet: { search: /主营业务收入|其他业务收入/ },
    },
    {
      name: '营业成本',
      billSheet: {
        direction: 'debit',
        search: /主营业务收入|其他业务收入/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /主营业务收入|其他业务收入/,
      },
      profitSheet: { search: /主营业务收入|其他业务收入/ },
    },
    {
      name: '税金及附加',
      billSheet: {
        direction: 'debit',
        search: /税金及附加/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /税金及附加/,
      },
      profitSheet: { search: /税金及附加/ },
    },
    {
      name: '销售费用',
      billSheet: {
        direction: 'debit',
        search: /销售费用/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /销售费用/,
      },
      profitSheet: { search: /销售费用/ },
    },
    {
      name: '研发费用',
      billSheet: {
        direction: 'debit',
        search: /(研发费用)|(管理费用.*(研发支出|技术开发费))/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /(研发费用)|(管理费用.*(研发支出|技术开发费))/,
      },
      profitSheet: { search: /研发费用/ },
    },
    {
      name: '财务费用',
      billSheet: {
        direction: 'debit',
        search: /财务费用/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /财务费用/,
      },
      profitSheet: { search: /财务费用/ },
    },
    {
      name: '其他收益',
      billSheet: {
        direction: 'debit',
        search: /其他收益/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /其他收益/,
      },
      profitSheet: { search: /其他收益/ },
    },
    {
      name: '投资收益',
      billSheet: {
        direction: 'debit',
        search: /投资收益/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /投资收益/,
      },
      profitSheet: { search: /投资收益/ },
    },
    {
      name: '公允价值变动收益',
      billSheet: {
        direction: 'debit',
        search: /公允价值变动损益/,
        subjectId: /^6/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /公允价值变动损益/,
        subjectId: /^6/,
      },
      profitSheet: { search: /公允价值变动损益/ },
    },
    {
      name: '信用减值损失',
      billSheet: {
        direction: 'debit',
        search: /信用减值损失/,
        subjectId: /^6/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /信用减值损失/,
        subjectId: /^6/,
      },
      profitSheet: { search: /信用减值损失/ },
    },
    {
      name: '资产减值损失',
      billSheet: {
        direction: 'debit',
        search: /资产减值损失/,
        subjectId: /^6/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /资产减值损失/,
        subjectId: /^6/,
      },
      profitSheet: { search: /资产减值损失/ },
    },
    {
      name: '资产处置损益',
      billSheet: {
        direction: 'debit',
        search: /资产处置损益/,
        subjectId: /^6/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /资产处置损益/,
        subjectId: /^6/,
      },
      profitSheet: { search: /资产处置损益/ },
    },
    {
      name: '营业外收入',
      billSheet: {
        direction: 'debit',
        search: /营业外收入/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /营业外收入/,
      },
      profitSheet: { search: /营业外收入/ },
    },
    {
      name: '营业外支出',
      billSheet: {
        direction: 'credit',
        search: /营业外支出/,
      },
      balanceSheet: {
        direction: 'credit',
        search: /营业外支出/,
      },
      profitSheet: { search: /营业外支出/ },
    },
    {
      name: '所得税费用',
      billSheet: {
        direction: 'debit',
        search: /所得税费用/,
      },
      balanceSheet: {
        direction: 'debit',
        search: /所得税费用/,
      },
      profitSheet: { search: /所得税费用/ },
    },
  ],
};
