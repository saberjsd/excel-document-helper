// @ts-ignore
import { selectFile } from '@/utils';
import LuckyExcel from 'luckyexcel';
import { testaaa, exportExcel } from './export';

export default class MySheet {
  container: string;
  ins: any
  constructor(container: string, opts?: any) {
    this.container = container;
    const options = {
      lang: 'zh',
      column: 16,
      showinfobar: false,
      ...opts,
    };
    this.init(container, options);
  }

  init(container: string, options: any) {
    // @ts-ignore
    $(() => {
      this.ins = luckysheet.create({
        container,
        ...options,
      });
    });
  }

  async importExcel() {
    let [file] = await selectFile('.xlsx,.xls,.doc');
    if (!file) {
      return;
    }
    console.time("transformData:")
    LuckyExcel.transformExcelToLucky(
      file,
      (exportJson: any, luckysheetfile: any) => {
        if (exportJson.sheets == null || exportJson.sheets.length == 0) {
          alert(
            'Failed to read the content of the excel file, currently does not support xls files!'
          );
          return;
        }
        console.timeEnd("transformData:")
        window.luckysheet.destroy();

        window.luckysheet.create({
          container: this.container,
          showinfobar: false,
          data: exportJson.sheets,
          title: exportJson.info.name,
          userInfo: exportJson.info.name.creator,
        });
      }
    );
  }

  exportExcel() {
    exportExcel(luckysheet.getAllSheets(), '下载');
  }
}
