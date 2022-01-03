import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';

const StoreExcelCompare = observable({
  excelId: 'treeSheetCompare',
  excelInstance: {} as MySpreadsheet,
  init() {
    if (!(this.excelInstance instanceof MySpreadsheet)) {
      this.excelInstance = new MySpreadsheet(`#${this.excelId}`);
    }
  },
  setStore(options: { [x: string]: any }) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        // @ts-ignore
        this[key] = options[key];
      }
    }
  },
});

export default StoreExcelCompare;
