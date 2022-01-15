import { observable } from 'mobx';
import MySheet from 'renderer/components/ExcelEditor/MySheet';

const StoreRoot = observable({
  excelId: 'luckySheetDemo',
  excelInstance: {} as MySheet,
  init() {
    this.excelInstance = new MySheet(this.excelId)
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

// @ts-ignore
window["StoreRoot"] = StoreRoot

export default StoreRoot;
