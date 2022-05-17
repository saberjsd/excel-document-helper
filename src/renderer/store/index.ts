export const sheetConfigList = {};

export const collectionConfig = {
  list: {
    fromRow: 3,
    keyCol: 'A',
    from: 'baseSheet',
    to: 'listSheet',
    head: [
      {
        label: '项目编号',
        fromCol: 'B',
        toCol: 'D',
        toRow: 3,
      },
      {
        label: '项目名称',
        fromCol: 'F',
        toCol: 'G',
        toRow: 3,
      },
      {
        label: '完成情况',
        fromCol: 'C',
        toCol: 'I',
        toRow: 3,
      },
      {
        label: '支出类型',
        fromCol: 'D',
        toCol: 'K',
        toRow: 3,
      },
    ],
    body: [
      {
        label: '日期',
        fromCol: 'I',
        fromCol1: 'J',
        toCol: 'A',
        toRow: 7,
      },
      {
        label: '种类',
        fromCol: 'K',
        toCol: 'B',
        toRow: 7,
      },
      {
        label: '号数',
        fromCol: 'L',
        toCol: 'C',
        toRow: 7,
      },
      {
        label: '摘要',
        fromCol: 'M',
        toCol: 'D',
        toRow: 7,
      },
      {
        label: '会计凭证记载金额',
        fromCol: 'Q',
        toCol: 'E',
        toRow: 7,
      },
      // 重分类
      {
        label: '人员人工费用',
        fromCol: 'Y',
        toCol: 'G',
        toRow: 7,
      },
      {
        label: '直接投入费用',
        fromCol: 'Z',
        toCol: 'H',
        toRow: 7,
      },
      {
        label: '折旧费用',
        fromCol: 'AA',
        toCol: 'I',
        toRow: 7,
      },
      {
        label: '无形资产摊销',
        fromCol: 'AB',
        toCol: 'J',
        toRow: 7,
      },
      {
        label: '新产品设计费等',
        fromCol: 'AC',
        toCol: 'K',
        toRow: 7,
      },
      {
        label: '其他相关费用',
        fromCol: 'AD',
        toCol: 'L',
        toRow: 7,
      },
      {
        label: '委托境内机构或个人进行研发活动所发生的费用',
        fromCol: 'AE',
        toCol: 'M',
        toRow: 7,
      },
      {
        label: '委托境外机构进行研发活动所发生的费用',
        fromCol: 'AF',
        toCol: 'N',
        toRow: 7,
      },
      {
        label: '不允许加计扣除的费用',
        fromCol: 'U',
        toCol: 'O',
        toRow: 7,
      },
      {
        label: '税法规定的归集金额',
        fromCol: 'R',
        // 用来区分条件的值
        diffVal: '不允许加计扣除的费用',
        // 求和的列
        sum: ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
        // 求差值的项
        sub: ['E', '0'],
        toCol: 'F',
        toRow: 7,
      },
    ],
    footer: [
      // 合计部分
      {
        label: '会计凭证记载金额-合计',
        sumStartRow: 7,
        toCol: 'E',
        toRow: 8,
      },
      {
        label: '税法规定的归集金额-合计',
        sumStartRow: 7,
        toCol: 'F',
        toRow: 8,
      },
      {
        label: '人员人工费用-合计',
        sumStartRow: 7,
        toCol: 'G',
        toRow: 8,
      },
      {
        label: '直接投入费用-合计',
        sumStartRow: 7,
        toCol: 'H',
        toRow: 8,
      },
      {
        label: '折旧费用-合计',
        sumStartRow: 7,
        toCol: 'I',
        toRow: 8,
      },
      {
        label: '无形资产摊销-合计',
        sumStartRow: 7,
        toCol: 'J',
        toRow: 8,
      },
      {
        label: '新产品设计费等-合计',
        sumStartRow: 7,
        toCol: 'K',
        toRow: 8,
      },
      {
        label: '其他相关费用-合计',
        sumStartRow: 7,
        toCol: 'L',
        toRow: 8,
      },
      {
        label: '委托境内机构或个人进行研发活动所发生的费用-合计',
        sumStartRow: 7,
        toCol: 'M',
        toRow: 8,
      },
      {
        label: '委托境外机构进行研发活动所发生的费用-合计',
        sumStartRow: 7,
        toCol: 'N',
        toRow: 8,
      },
      {
        label: '不允许加计扣除的费用-合计',
        sumStartRow: 7,
        toCol: 'O',
        toRow: 8,
      },
    ],
  },

  // -----汇总部分------
  total: {
    from: 'listSheet',
    to: 'totalSheet',
    head: [
      {
        label: '纳税人识别号（统一社会信用代码）',
        fromRow: 6,
        fromCol: 'C',
        toCol: 'E',
        toRow: 3,
      },
      {
        label: '纳税人名称',
        fromRow: 5,
        fromCol: 'C',
        toCol: 'K',
        toRow: 3,
      },
      {
        label: '属期',
        fromRow: 4,
        fromCol: 'C',
        toCol: 'O',
        toRow: 3,
      },
    ],
    body: [
      {
        label: '项目编号',
        fromRow: 3,
        fromCol: 'D',
        toCol: 'A',
        toRow: 8,
      },
      {
        label: '项目名称',
        fromRow: 3,
        fromCol: 'G',
        toCol: 'B',
        toRow: 8,
      },
      {
        label: '完成情况',
        fromRow: 3,
        fromCol: 'I',
        toCol: 'C',
        toRow: 8,
      },
      {
        label: '支持类型',
        fromRow: 3,
        fromCol: 'K',
        toCol: 'D',
        toRow: 8,
      },
      {
        label: '允许加计扣除金额合计',
        fromRow: 7,
        fromCol: 'F',
        toCol: 'E',
        toRow: 8,
      },
      {
        label: '人员人工费用',
        fromRow: 7,
        fromCol: 'G',
        toCol: 'F',
        toRow: 8,
      },
      {
        label: '直接投入费用',
        fromRow: 7,
        fromCol: 'H',
        toCol: 'G',
        toRow: 8,
      },
      {
        label: '折旧费用',
        fromRow: 7,
        fromCol: 'I',
        toCol: 'H',
        toRow: 8,
      },
      {
        label: '无形资产摊销',
        fromRow: 7,
        fromCol: 'J',
        toCol: 'I',
        toRow: 8,
      },
      {
        label: '新产品设计费等',
        fromRow: 7,
        fromCol: 'K',
        toCol: 'J',
        toRow: 8,
      },
      {
        label: '前五项 小计',
        fromRow: 8,
        // 计算规则
        rule: '6',
        // 求和的列
        sum: ['F', 'G', 'H', 'I', 'J'],
        toCol: 'K',
        toRow: 8,
      },
      {
        label: '其他相关费用合计',
        fromRow: 7,
        fromCol: 'L',
        toCol: 'L',
        toRow: 8,
      },
      {
        label: '经限额调整后的其他相关费用',
        fromRow: 8,
        // 需要对比计算的列, 第一个直接取
        directCol: "L",
        calcCol: "K",
        // 计算规则
        rule: '7.2',
        toCol: 'M',
        toRow: 8,
      },
      {
        label: '委托境内机构或个人进行研发活动所发生的费用',
        fromRow: 7,
        fromCol: 'M',
        toCol: 'N',
        toRow: 8,
      },
      {
        label: '允许加计扣除的委托境内机构或个人进行研发活动所发生的费用',
        fromRow: 8,
        calcCol: "N",
        // 计算规则
        rule: '8.2',
        toCol: 'O',
        toRow: 8,
      },
      {
        label: '委托境外机构进行研发活动所发生的费用',
        fromRow: 7,
        fromCol: 'N',
        toCol: 'P',
        toRow: 8,
      },
      // {
      //   label: '经限额调整后的其他相关费用',
      //   fromRow: 8,
      //   // 需要对比计算的列
      //   compare: ['L', 'K'],
      //   // 计算规则
      //   rule: '7.2',
      //   toCol: 'M',
      //   toRow: 8,
      // },
      {
        label: '不允许加计扣除的费用',
        fromRow: 7,
        fromCol: 'O',
        toCol: 'R',
        toRow: 8,
      },
    ],
    footer: [
      {
        label: '资本化金额小计',
        key: '资本化',
        keyCol: 'D',
        fromRow: 8,
        sum: ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'N', 'P', 'R'],
        toRow: 9,
      },
      {
        label: '费用化金额小计',
        key: '费用化',
        keyCol: 'D',
        fromRow: 8,
        sum: ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'N', 'P', 'R'],
        toRow: 10,
      },
      {
        label: '金额合计',
        fromRow: 8,
        sum: ['E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
        toRow: 12,
      },
    ],
  },
};
