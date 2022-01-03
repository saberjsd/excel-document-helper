// @ts-ignore
import { selectFile } from '@/utils';
import Spreadsheet, { Options } from 'x-data-spreadsheet';
// import './sheet_mixin.js';
// import './row_mixin.js';
import 'x-data-spreadsheet/src/index.less';
import XLSX from 'xlsx';
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { clamp, cloneDeep } from 'lodash';
import { stox, xtos } from './sheetConvert';
// @ts-ignore 汉化
Spreadsheet.locale('zh-cn');

const defaultOptions = (container: string, opts: any) => {
  const dom = document.querySelector(container)!;
  return {
    view: {
      height: () => dom.clientHeight,
      width: () => dom.clientWidth,
    },
    showToolbar: false,
    ...opts,
  };
};

export default class MySpreadsheet extends Spreadsheet {
  targetEl;
  datas!: [any];
  // sheet: any;

  constructor(container: string, opts?: Options | undefined) {
    super(container, defaultOptions(container, opts));
    this.targetEl = document.querySelector(container);
    // @ts-ignore
    window['FTExcel'] = this;
  }

  // 设置数据
  cellText(ri: any, ci: any, text: any) {
    var sheetIndex =
      arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    let oldText = (this.datas[sheetIndex].getCell(ri, ci) || {}).text;

    if (text !== oldText) {
      this.datas[sheetIndex].setCellText(ri, ci, text, '');
    }

    return this;
  }

  /**
   * 设置单元格样式
   * @param ri
   * @param ci
   * @param property
   * @param value
   * @param sheetIndex
   */
  setCellStyle(
    ri: any,
    ci: any,
    property: string,
    value: any,
    sheetIndex: number = 0
  ) {
    const dataProxy = this.datas[sheetIndex];
    const { styles, rows } = dataProxy;
    const cell = rows.getCellOrNew(ri, ci);
    let cstyle: any = {};
    if (cell.style !== undefined) {
      cstyle = cloneDeep(styles[cell.style]);
    }
    if (property === 'format') {
      cstyle.format = value;
      cell.style = dataProxy.addStyle(cstyle);
    } else if (
      property === 'font-bold' ||
      property === 'font-italic' ||
      property === 'font-name' ||
      property === 'font-size'
    ) {
      const nfont: any = {};
      nfont[property.split('-')[1]] = value;
      cstyle.font = Object.assign(cstyle.font || {}, nfont);
      cell.style = dataProxy.addStyle(cstyle);
    } else if (
      property === 'strike' ||
      property === 'textwrap' ||
      property === 'underline' ||
      property === 'align' ||
      property === 'valign' ||
      property === 'color' ||
      property === 'bgcolor'
    ) {
      cstyle[property] = value;
      cell.style = dataProxy.addStyle(cstyle);
    } else {
      cell[property] = value;
    }
  }

  downExcel() {
    // function xtos(sdata: any) {
    //   var out = XLSX.utils.book_new();
    //   sdata.forEach(function (xws: any) {
    //     var aoa = [[]];
    //     var rowobj = xws.rows;
    //     for (var ri = 0; ri < rowobj.len; ++ri) {
    //       var row = rowobj[ri];
    //       if (!row) continue;
    //       aoa[ri] = [];
    //       Object.keys(row.cells).forEach(function (k) {
    //         var idx = +k;
    //         if (isNaN(idx)) return;
    //         // @ts-ignore
    //         aoa[ri][idx] = row.cells[k].text;
    //       });
    //     }
    //     var ws = XLSX.utils.aoa_to_sheet(aoa);
    //     XLSX.utils.book_append_sheet(out, ws, xws.name);
    //   });
    //   return out;
    // }

    /* build workbook from the grid data */
    // @ts-ignore
    var new_wb: any = xtos(this.getData());

    /* generate download */
    XLSX.writeFile(new_wb, '表格导出.xlsx');
  }

  async importExcel() {
    let [file] = await selectFile('.xlsx,.xls,.doc');

    if (!file) {
      return;
    }

    let workbook_object = await new Promise((resolve, rejest) => {
      let reader = new FileReader();

      reader.onload = (e) => {
        var data = e.target!.result;
        resolve(XLSX.read(data, { type: 'binary' }));
      };

      reader.onerror = () => {
        rejest(undefined);
      };

      reader.readAsBinaryString(file);
    });

    // function stox(wb: any) {
    //   var out: any[] = [];

    //   wb.SheetNames.forEach(function (name: string) {
    //     var o = { name: name, rows: {} };
    //     var ws = wb.Sheets[name];
    //     var aoa: any[] = XLSX.utils.sheet_to_json(ws, {
    //       raw: false,
    //       header: 1,
    //     });
    //     aoa.forEach(function (r, i) {
    //       var cells: any = {};
    //       r.forEach(function (c: any, j: string) {
    //         cells[j] = { text: c };
    //       });
    //       // @ts-ignore
    //       o.rows[i] = { cells: cells };
    //     });
    //     out.push(o);
    //   });
    //   return out;
    // }

    /* load data */
    // @ts-ignore
    this.loadData(stox(workbook_object));
  }

  // excel数据转二维数组
  excelDataToArrayData(excelData?: any) {
    if (!excelData) {
      [[]];
    }
    let arrayData: Array<Array<any>> = [[]];
    let rowTatol = excelData.rows.len;
    let colTatol = excelData.cols.len;

    for (let r = 0; r < rowTatol; r++) {
      for (let c = 0; c < colTatol; c++) {
        let text = 0;
        try {
          text = excelData.rows[r].cells[c].text;
          if (r > 0 && c > 0) {
            text = Number(text);
          }
        } catch (e) {}
        if (arrayData[r]) {
          arrayData[r][c] = text;
        } else {
          arrayData[r] = [text];
        }
      }
    }
    return arrayData;
  }

  // 二维数组转excel数据
  arrayDataToExcelData(arrayData: Array<Array<any>> = []) {
    let excelData = {};

    let rowTatol = arrayData.length;
    let colTatol = arrayData[0] ? arrayData[0].length : 0;

    // excelData.rows.len = clamp(rowTatol, 6, 50);
    // excelData.cols.len = clamp(colTatol, 6, 50);

    for (let r = 0; r < rowTatol; r++) {
      for (let c = 0; c < colTatol; c++) {
        let text = arrayData[r][c];

        if (r > 0 && c > 0) {
          text = String(text);
        }

        // if (excelData.rows[r]) {
        //   excelData.rows[r].cells[c] = { text };
        // } else {
        //   excelData.rows[r] = { cells: { '0': { text } } };
        // }
      }
    }

    return excelData;
  }
}
