import { observable } from 'mobx';

const StoreRoot = observable({
  currentMenu: "excel_1",
  rootLoading: false,
  init() {},
  // setStore(options: { [x: string]: any }) {
  //   for (const key in options) {
  //     if (Object.prototype.hasOwnProperty.call(options, key)) {
  //       // @ts-ignore
  //       this[key] = options[key];
  //     }
  //   }
  // },
});

export default StoreRoot;
