import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';
import { getColByLetter } from 'renderer/utils';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';

const StoreExcel = observable({
  excelId: 'treeSheetCompare',
  excelInstance: {} as MySpreadsheet,
  resultExcelId: 'resultSheetCompare',
  resultExcelInstance: {} as MySpreadsheet,
  resultDialogVisible: false,
  resultDialogRendered: false,
  resultDialogCallback: null as any,
  resultSheets: [] as any[],
  init() {
    if (this.excelInstance instanceof MySpreadsheet) {
      const dom = document.getElementById(this.excelId);
      if (dom) {
        dom.innerHTML = '';
      }
    }
    this.excelInstance = new MySpreadsheet(`#${this.excelId}`);
    // @ts-ignore
    window['FTExcel'] = this.excelInstance;
  },
  setStore(options: { [x: string]: any }) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        // @ts-ignore
        this[key] = options[key];
      }
    }
  },

  // 结果弹窗
  toggleDailog(visible: boolean) {
    this.resultDialogVisible = visible;
  },

  // 将结果展示到弹窗
  showResultSheet(sheetData: any, isReset?: boolean) {
    const saveData = () => {
      if (isReset) {
        this.resultSheets = [];
      } else {
        this.resultSheets.unshift(sheetData);
      }

      if (this.resultExcelInstance instanceof MySpreadsheet) {
      } else {
        this.resultExcelInstance = new MySpreadsheet(`#${this.resultExcelId}`);
      }
      // @ts-ignore
      this.resultExcelInstance.loadData(this.resultSheets);
      requestAnimationFrame(() => {
        // @ts-ignore
        this.resultExcelInstance.reRender();
      });
    };

    if (this.resultDialogRendered) {
      saveData();
    } else {
      EventBus.once(EVENT_CONSTANT.DAILOG_RENDERED, (show: boolean) => {
        saveData();
      });
    }
  },

  getGroupExcel(text: string) {
    const filterConfig = {
      sheetName: '序时帐',
      findCol: 'E',
      groupCol: 'C',
    };
    const rows = this.excelInstance.getGroupRows({
      text,
      sheetIndex: this.excelInstance.getSheetIndexByName(
        filterConfig.sheetName
      ),
      findCol: getColByLetter(filterConfig.findCol),
      groupCol: getColByLetter(filterConfig.groupCol),
    });
    const sdata = {
      name: `筛选“${text}”结果`,
      rows: { len: rows.length },
      styles: [{ bgcolor: '#f7ccac' }, { bgcolor: '#e3efd9' }],
    };
    rows.forEach((m: any, n: string | number) => {
      // @ts-ignore
      sdata.rows[n] = m;
    });

    this.showResultSheet(sdata);
  },

  // 三表勾稽
  compareSheet() {
    // 利润表
    const profitSheet = this.excelInstance.getSheetByName('利润表');
    // 余额表
    const balanceSheet = this.excelInstance.getSheetByName('余额表');
    // 序时帐
    const billSheet = this.excelInstance.getSheetByName('序时帐');

    const compareConfig = {
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

    const resultRows = {
      len: 100,
      '0': {
        cells: {
          '0': { text: '科目名称' },
          '1': { text: '序时账' },
          '2': { text: '余额表' },
          '3': { text: '利润表' },
        },
      },
    };

    this.excelInstance.caclSumWithRows(resultRows, compareConfig, 'billSheet');
    this.excelInstance.caclSumWithRows(resultRows, compareConfig, 'balanceSheet');

    this.showResultSheet({
      name: `勾稽结果`,
      rows: resultRows,
    });
  },

  checkRisk(){
    const riskConfig = this.excelInstance.loadRiskConfig()
  }

});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
