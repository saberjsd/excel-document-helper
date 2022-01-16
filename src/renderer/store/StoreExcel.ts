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
        direction: 'credit',
        // 科目名称 列的查找规范
        findCol: { col: 'E', reg: /科目名称/ },
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

    this.showResultSheet({
      name: `勾稽结果`,
      rows: resultRows,
    });
  },
});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
