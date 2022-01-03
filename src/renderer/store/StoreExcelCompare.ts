import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';

const StoreExcelCompare = observable({
  excelId: 'treeSheetCompare',
  excelInstance: {} as MySpreadsheet,
  resultExcelId: 'resultSheetCompare',
  resultExcelInstance: {} as MySpreadsheet,
  resultDialogVisible: false,
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
    if (visible && document.getElementById(this.resultExcelId)) {
      this.showResult();
    }
  },
  showResult() {
    if (this.resultExcelInstance instanceof MySpreadsheet) {
      const dom = document.getElementById(this.resultExcelId);
      if (dom) {
        dom.innerHTML = '';
      }
    }
    this.resultExcelInstance = new MySpreadsheet(`#${this.resultExcelId}`);
    this.getGroupExcel("应交税费")
  },

  getGroupExcel(text: string) {
    const rows = this.excelInstance.getGroupRows({
      text,
      sheetIndex: 0,
      findCol: 8,
      groupCol: 3,
    });
    const sdata = {
      name: "sheet1111",
      rows: {
       len: rows.length
      }
    }
    rows.forEach((m: any,n: string | number)=>{
      // @ts-ignore
      sdata.rows[n] = m
    })
    this.resultExcelInstance.loadData([sdata])
  },
});

export default StoreExcelCompare;
