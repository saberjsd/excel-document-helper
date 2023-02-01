import { observable } from 'mobx';
import { MENU } from 'renderer/constants';

const StoreRoot = observable({
  currentMenu: MENU.EXCEL_BOARD as MENU,
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
