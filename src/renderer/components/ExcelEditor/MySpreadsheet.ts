// @ts-ignore
import { selectFile } from '@/utils';
import Spreadsheet, { Options } from 'x-data-spreadsheet';
// import './sheet_mixin.js';
// import './row_mixin.js';
import 'x-data-spreadsheet/src/index.less';
import XLSX from 'xlsx';
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { clamp, cloneDeep } from 'lodash';
// @ts-ignore 汉化
Spreadsheet.locale('zh-cn');

export default class MySpreadsheet extends Spreadsheet {
  targetEl;
  datas!: [any];
  // sheet: any;

  constructor(container: string, opts?: Options | undefined) {
    super(container, opts);
    this.targetEl = document.querySelector(container);
    // @ts-ignore
    window['FTExcel'] = this;
  }

  // loadData(excelDatas) {
  //   super.loadData(excelDatas);
  //   const { data } = this.sheet;

  //   data.settings.view = {
  //     width: () => this.targetEl.clientWidth,
  //     height: () => this.targetEl.clientHeight + 40,
  //   };

  //   data.settings.style.align = 'center';
  //   data.rows.height = 32;
  //   data.scrollx(0, () => {});
  //   data.scrolly(0, () => {});
  //   this.sheet.reload();

  //   this.sheet.verticalScrollbar.el.el.scrollTop = 0;

  //   this.sheet.horizontalScrollbar.el.el.scrollLeft = 0;

  //   this.sheet.trigger('change', this.getData());
  // }

  // // 裁剪数据
  // clipData(row, col) {
  //   const [DataProxy] = this.datas;

  //   DataProxy.rows.len = _.clamp(row, 1, 50);
  //   DataProxy.cols.len = _.clamp(col, 1, 50);

  //   // 减去多余的行数据
  //   for (let i in DataProxy.rows._) {
  //     if (i >= row) {
  //       delete DataProxy.rows._[i];
  //     }
  //   }

  //   // 减去多余的列数据
  //   for (let i in DataProxy.rows._) {
  //     for (let ii in DataProxy.rows._[i]['cells']) {
  //       if (ii >= col) {
  //         delete DataProxy.rows._[i]['cells'][ii];
  //       }
  //     }
  //   }

  //   this.sheet.reload();
  //   this.reRender();
  //   this.sheet.trigger('change', this.getData());

  //   this.recordUndo();
  // }

  // // 更具当前的数据计算最大非空行数
  // getMaxRow() {
  //   for (let r = 49; r > 0; r--) {
  //     for (let c = 0; c <= 49; c++) {
  //       let { text } = this.cell(r, c) || {};
  //       if (text) {
  //         return r + 1;
  //       }
  //     }
  //   }

  //   // 最小保留4行
  //   return 1;
  // }

  // // 更具当前的数据计算最大非空列数
  // getMaxCol() {
  //   let rowTatol = this.getMaxRow();

  //   for (let c = 49; c > 0; c--) {
  //     for (let r = 0; r <= rowTatol; r++) {
  //       let { text } = this.cell(r, c) || {};
  //       if (text) {
  //         return c + 1;
  //       }
  //     }
  //   }

  //   // 最小保留4列
  //   return 1;
  // }

  // // 获取行
  // getRow() {
  //   const [data] = this.datas;
  //   return data.rows.len;
  // }

  // // 设置行
  // setRow(rowLength) {
  //   const [data] = this.datas;
  //   data.history.add(this.getData());
  //   this.clipData(rowLength, this.getCol());
  //   this.recordUndo();

  //   //如果横向滚动条消失了, sheet就需要滚动到最前面去
  //   if (this.sheet.verticalScrollbar.el.computedStyle().display === 'none') {
  //     this.sheet.data.scrolly(0, () => {});
  //   }
  // }

  // // 获取行
  // getCol() {
  //   const [data] = this.datas;
  //   return data.cols.len;
  // }

  // // 设置列
  // setCol(colLength) {
  //   const [data] = this.datas;
  //   data.history.add(this.getData());
  //   this.clipData(this.getRow(), colLength);
  //   this.recordUndo();

  //   //如果横向滚动条消失了, sheet就需要滚动到最前面去
  //   if (this.sheet.horizontalScrollbar.el.computedStyle().display === 'none') {
  //     this.sheet.data.scrollx(0, () => {});
  //   }
  // }

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

  downExcel() {
    function xtos(sdata: any) {
      var out = XLSX.utils.book_new();
      sdata.forEach(function (xws: any) {
        var aoa = [[]];
        var rowobj = xws.rows;
        for (var ri = 0; ri < rowobj.len; ++ri) {
          var row = rowobj[ri];
          if (!row) continue;
          aoa[ri] = [];
          Object.keys(row.cells).forEach(function (k) {
            var idx = +k;
            if (isNaN(idx)) return;
            // @ts-ignore
            aoa[ri][idx] = row.cells[k].text;
          });
        }
        var ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(out, ws, xws.name);
      });
      return out;
    }

    /* build workbook from the grid data */
    var new_wb = xtos(this.getData());

    /* generate download */
    XLSX.writeFile(new_wb, 'fotorTable.xlsx');
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

    function stox(wb: any) {
      var out: any[] = [];

      wb.SheetNames.forEach(function (name: string) {
        var o = { name: name, rows: {} };
        var ws = wb.Sheets[name];
        var aoa: any[] = XLSX.utils.sheet_to_json(ws, {
          raw: false,
          header: 1,
        });
        aoa.forEach(function (r, i) {
          var cells: any = {};
          r.forEach(function (c: any, j: string) {
            cells[j] = { text: c };
          });
          // @ts-ignore
          o.rows[i] = { cells: cells };
        });
        out.push(o);
      });
      return out;
    }

    /* load data */
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
