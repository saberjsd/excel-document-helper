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
    ],
  },
};
