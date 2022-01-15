import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';

const StoreExcel = observable({
  excelId: 'treeSheetCompare',
  excelInstance: {} as MySpreadsheet,
  resultExcelId: 'resultSheetCompare',
  resultExcelInstance: {} as MySpreadsheet,
  resultDialogVisible: false,
  resultDialogCallback: null as any,
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

  showFilterResult({ search }: { search: string }) {
    if (this.resultExcelInstance instanceof MySpreadsheet) {
      const dom = document.getElementById(this.resultExcelId);
      if (dom) {
        dom.innerHTML = '';
      }
    }
    this.resultExcelInstance = new MySpreadsheet(`#${this.resultExcelId}`);
    this.getGroupExcel(search);
  },

  getGroupExcel(text: string) {
    const rows = this.excelInstance.getGroupRows({
      text,
      sheetIndex: 0,
      findCol: 8,
      groupCol: 3,
    });
    const sdata = {
      name: 'sheet1',
      rows: {
        len: rows.length,
      },
      styles: [
        {
          // 淡黄色
          bgcolor: '#f7ccac',
        },
        {
          // 淡绿色
          bgcolor: '#e3efd9',
        },
      ],
    };
    rows.forEach((m: any, n: string | number) => {
      // @ts-ignore
      sdata.rows[n] = m;
    });
    this.resultExcelInstance.loadData([sdata]);
  },
});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
