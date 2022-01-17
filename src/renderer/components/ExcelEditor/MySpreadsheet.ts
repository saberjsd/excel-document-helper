// @ts-ignore
import { selectFile } from '@/utils';
import Spreadsheet, { Options } from 'x-data-spreadsheet';
// import './sheet_mixin.js';
// import './row_mixin.js';
import 'x-data-spreadsheet/src/index.less';
import XLSX from 'xlsx';
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { clamp, cloneDeep, uniqBy } from 'lodash';
import { getColByLetter } from 'renderer/utils';
const Numeral = require('numeral');
// import { stox, xtos } from './sheetConvert';
// @ts-ignore 汉化
Spreadsheet.locale('zh-cn');

const defaultOptions = (container: string, opts: any) => {
  const dom = document.querySelector(container)!;
  return {
    view: {
      height: () => dom.clientHeight,
      width: () => dom.clientWidth,
    },
    // showToolbar: false,
    // row:{
    //   len: 10000
    // },
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
        // @ts-ignore  根据数据行数显示多少行
        o.rows.len = aoa.length;
        out.push(o);
      });
      console.log('to x-spreadsheet:', out);
      return out;
    }

    /* load data */
    // @ts-ignore
    this.loadData(stox(workbook_object));
  }

  /**
   * 遍历单元格
   * @param sheetIndex
   * @param cb
   */
  forEachCells(
    sheetIndex: number = 0,
    cb: {
      ({ ri, ci, cell, row }: { ri: any; ci: any; cell: any; row: any }): void;
    }
  ) {
    const { rows } = this.datas[sheetIndex];
    Object.entries(rows._).forEach(([ri, row]) => {
      // @ts-ignore
      if (row && row.cells) {
        // @ts-ignore
        Object.entries(row.cells).forEach(([ci, cell]) => {
          // @ts-ignore
          cb({ ri, ci, row, cell });
        });
      }
    });
  }
  /**
   * 遍历行
   * @param sheetIndex
   * @param cb
   */
  forEachRows(
    sheetIndex: number = 0,
    cb: (arg0: { ri: string; row: any }) => void
  ) {
    const { rows } = this.datas[sheetIndex];
    Object.entries(rows._).forEach(([ri, row]) => {
      cb({ ri, row });
    });
  }
  /**
   * 根据指定列遍历cell
   * @param sheetIndex
   * @param ci
   * @param cb
   */
  forEachCellByCol(
    sheetIndex: number = 0,
    ci: number,
    cb: (cell: any) => void
  ) {
    const { rows } = this.datas[sheetIndex];
    Object.entries(rows._).forEach(([ri, row]: any) => {
      if (row && row.cells && row.cells[ci]) {
        cb(row.cells[ci]);
      }
    });
  }

  /**
   * 通过单元格内容，获取单元格信息。可以指定列
   * @param text
   * @param sheetIndex
   * @param col
   * @returns
   */
  getCellInfoByText(
    text: string | RegExp,
    sheetIndex: number = 0,
    col?: number,
    subjectId?: RegExp,
    subjectCol?: number
  ) {
    const out: any = [];
    this.forEachCells(sheetIndex, ({ ri, ci, cell, row }) => {
      const filterCol = col === undefined || col == ci;
      if (filterCol) {
        const type = Object.prototype.toString.call(text).slice(8, -1);
        if (type === 'RegExp') {
          // @ts-ignore
          if (text.test(String(cell.text))) {
            // 额外的“科目编号”筛选条件
            if(subjectId && subjectCol){
              if(subjectId.test(row.cells[subjectCol]?.text) ){
                out.push({ ri, ci, row, cell });
              }
            } else {
              out.push({ ri, ci, row, cell });
            }
          }
        } else {
          // @ts-ignore
          if (String(cell.text).includes(text)) {
            out.push({ ri, ci, row, cell });
          }
        }
      }
    });
    return out;
  }

  /**
   * 获取findCol列的值等于text的行，然后以groupCol列的值分组
   * @param param0
   * @returns
   */
  getGroupRows({
    text,
    sheetIndex,
    findCol,
    groupCol,
  }: {
    text: string;
    sheetIndex: number;
    findCol: number;
    groupCol: number;
  }) {
    const findRows: any[] = this.getCellInfoByText(text, sheetIndex, findCol);
    let groupKeys: any[] = findRows.map((m) => m.row.cells[groupCol].text);
    groupKeys = Array.from(new Set(groupKeys));
    const rows: any = [];
    groupKeys.forEach((i, j) => {
      this.forEachRows(sheetIndex, ({ ri, row }) => {
        if (
          row &&
          row.cells &&
          row.cells[groupCol] &&
          row.cells[groupCol].text &&
          row.cells[groupCol].text == i
        ) {
          const item = cloneDeep(row);
          Object.entries(item.cells).forEach(([ci, cell]) => {
            // @ts-ignore
            cell.style = j % 2;
          });
          rows.push(item);
        }
      });
    });
    return rows;
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

  resize() {
    try {
      const ev = document.createEvent('Event');
      ev.initEvent('resize', true, true);
      window.dispatchEvent(ev);
    } catch (e) {}
  }

  /**
   * 根据工作表名获取索引
   * @param name
   * @returns
   */
  getSheetIndexByName(name: string) {
    for (let i = 0; i < this.datas.length; i++) {
      const item = this.datas[i];
      if (item.name === name) {
        return i;
      }
    }
    return 0;
  }
  getSheetByName(name: string) {
    for (let i = 0; i < this.datas.length; i++) {
      const item = this.datas[i];
      if (item.name === name) {
        return item;
      }
    }
    return null;
  }

  // caclSumWithRows(resultRows: any,config: any, sheetIndex: number) {
  //   const rows = this.datas[sheetIndex].rows._;
  //   const sheetHeadRow = rows["0"];
  //   const sheetFirstRow = rows["1"];
  //   // 借方金额的列次
  //   let debitCol = getColByLetter(config.debit.col);
  //   // 贷方金额的列次
  //   let creditCol = getColByLetter(config.credit.col);
  //   // 是否借贷一列的表格
  //   const isSameCol = sheetHeadRow.cells[debitCol]?.text === "方向" ||
  //                     /借|贷/.test(sheetFirstRow.cells[debitCol]?.text);
  //   // 存放数组，方便插入首行
  //   const outRows:any = []
  //   // const
  //   config.findRows.forEach((m: any, n: number) => {
  //     const outCells: any = {}
  //     // 获取到符合的行相关信息
  //     const rowInfo = this.getCellInfoByText(
  //       m.findSubjectKeys,
  //       sheetIndex,
  //       getColByLetter(m.findSubjectCol.col)
  //     );
  //     let sumDebit = 0;
  //     let sumCredit = 0;
  //     if(rowInfo && rowInfo.length){
  //       rowInfo.forEach((j:any)=>{
  //         const cells = j.row.cells
  //         if(isSameCol){
  //           if(cells[debitCol] === "借"){
  //             sumDebit += Numeral(cells[creditCol]?.text).value();
  //           } else {
  //             sumCredit += Numeral(cells[creditCol]?.text).value();
  //           }
  //         } else {
  //           sumDebit += Numeral(cells[debitCol]?.text).value();
  //           sumCredit += Numeral(cells[creditCol]?.text).value();
  //         }
  //       })
  //     }
  //     // 首列显示名称
  //     outCells[0] = { text: m.name };
  //     // 其中一表的
  //     outCells[config.amountCol] = {
  //       text: Numeral(m.direction === "debit" ? sumDebit : sumCredit).format("0,0.00")
  //     };

  //     // outRows.push({cells: outCells})
  //     resultRows[n+1] = {cells: outCells}
  //   });

  //   // return outRows
  // }
  caclSumWithRows(resultRows: any, config: any, sheetKey: string) {
    // sheet的通用配置
    const sheetConfig = config[sheetKey];
    const sheetIndex = this.getSheetIndexByName(sheetConfig.sheetName);
    const rows = this.datas[sheetIndex].rows._;
    const sheetHeadRow = rows['0'];
    const sheetFirstRow = rows['1'];
    // 借方金额的列次
    let debitCol = getColByLetter(sheetConfig.debit.col);
    // 贷方金额的列次
    let creditCol = getColByLetter(sheetConfig.credit.col);
    // 是否借贷一列的表格
    const isSameCol =
      sheetHeadRow.cells[debitCol]?.text === '方向' ||
      /借|贷/.test(sheetFirstRow.cells[debitCol]?.text);
    // 根据配置，计算每一行
    config.rows.forEach((m: any, n: number) => {
      // sheet每一行的配置
      const sheetRowConfig = m[sheetKey];
      const outCells: any = resultRows[n + 1]?.cells || {};
      // 获取到符合的行相关信息
      const rowInfo = this.getCellInfoByText(
        sheetRowConfig.search,
        sheetIndex,
        getColByLetter(sheetConfig.findCol.col)
      );
      let sumDebit = 0;
      let sumCredit = 0;
      if (rowInfo && rowInfo.length) {
        rowInfo.forEach((j: any) => {
          const cells = j.row.cells;
          if (isSameCol) {
            if (cells[debitCol] === '借') {
              sumDebit += Numeral(cells[creditCol]?.text).value();
            } else {
              sumCredit += Numeral(cells[creditCol]?.text).value();
            }
          } else {
            sumDebit += Numeral(cells[debitCol]?.text).value();
            sumCredit += Numeral(cells[creditCol]?.text).value();
          }
        });
      }
      // 首列显示名称
      outCells[0] = { text: m.name };
      // 其中一表的
      outCells[sheetConfig.amountCol] = {
        text: Numeral(
          sheetRowConfig.direction === 'debit' ? sumDebit : sumCredit
        ).format('0,0.00'),
      };

      resultRows[n + 1] = { cells: outCells };
    });
  }
}
