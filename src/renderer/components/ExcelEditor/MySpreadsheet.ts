// @ts-ignore
import { selectFile } from '@/utils';
import Spreadsheet, { Options } from 'x-data-spreadsheet';
// import './sheet_mixin.js';
// import './row_mixin.js';
import 'x-data-spreadsheet/src/index.less';
// import XLSX from 'xlsx';
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { clamp, cloneDeep, uniqBy } from 'lodash';
import { addStyles, getColByLetter, isEmptyText } from 'renderer/utils';
import StoreRoot from 'renderer/store/StoreRoot';
import cuid from 'cuid';
const Numeral = require('numeral');
// import { stox, xtos } from './sheetConvert';
// import { XLSXspread } from "./xlsxspread.min.js"
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
  // 表头有几行
  headRow: number = 1;
  // sheet: any;

  constructor(container: string, opts?: Options | undefined) {
    super(container, defaultOptions(container, opts));
    this.targetEl = document.querySelector(container);
  }

  /**
   * 获取所有表头行
   * @param sheetIndex
   * @param headRow
   * @returns
   */
  getHeadRows(sheetIndex: number = 0, headRow: number = this.headRow) {
    const headRows: any[] = [];
    for (let i = 0; i < headRow; i++) {
      const sheet = this.datas[sheetIndex];
      headRows.push(cloneDeep(sheet.rows._[i]));
    }
    return headRows;
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

  getCurrentSheetIndex() {
    // @ts-ignore
    return this.bottombar.items.findIndex((m) => m === this.bottombar.activeEl);
  }

  downloadExcel() {
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
    // var new_wb: any = xtos(this.getData());

    // /* generate download */
    // XLSX.writeFile(new_wb, '表格导出.xlsx');

    var new_wb = XLSXspread.xtos(this.getData());
    /* write file and trigger a download */
    // @ts-ignore
    XLSX.writeFile(new_wb, `表格导出-${new Date().toLocaleString()}.xlsx`, {
      cellStyles: true,
    });
  }

  downloadSheet(sheetIndex: number = this.getCurrentSheetIndex()) {
    const data = [this.datas[sheetIndex].getData()];
    // @ts-ignore
    const new_wb = XLSXspread.xtos(data);
    // @ts-ignore
    XLSX.writeFile(new_wb, `表格导出-${new Date().toLocaleString()}.xlsx`, {
      cellStyles: true,
    });
  }

  async importExcel() {
    let [file] = await selectFile('.xlsx,.xls,.doc');

    if (!file) {
      return;
    }
    StoreRoot.rootLoading = true;

    let workbook_object = await new Promise((resolve, rejest) => {
      let reader = new FileReader();

      reader.onload = (e) => {
        var data = e.target!.result;
        // @ts-ignore
        resolve(XLSX.read(data, { type: 'binary', cellStyles: true }));
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
    //     // @ts-ignore  根据数据行数显示多少行
    //     o.rows.len = aoa.length;
    //     out.push(o);
    //   });
    //   console.log('to x-spreadsheet:', out);
    //   return out;
    // }

    // @ts-ignore
    const sheets = XLSXspread.stox(workbook_object);

    // 导入的数据都加上主键，方便后面查找修改
    console.time('insert id');
    sheets.forEach((m: any) => {
      if (m.rows) {
        Object.entries<any>(m.rows).forEach(([ri, row]) => {
          if (typeof row === 'object') {
            row.rowId = cuid();
          }
        });
      }
    });
    console.timeEnd('insert id');

    /* load data */
    this.loadData(sheets);
    StoreRoot.rootLoading = false;
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
   * @param cols
   * @param cb
   */
  forEachCellByCols(
    sheetIndex: number = 0,
    cols: number[],
    cb: (outCols: any) => void
  ) {
    const { rows } = this.datas[sheetIndex];
    Object.entries(rows._).forEach(([ri, row]: any) => {
      const outCols: any = {};
      if (row && row.cells) {
        cols.forEach((m: any) => {
          outCols[m] = row.cells[m];
        });
        cb(outCols);
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
            if (subjectId && subjectCol) {
              if (subjectId.test(row.cells[subjectCol]?.text)) {
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
          // 记录原来的行号，方便数据回写
          item.originRow = ri;
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

  // updateSheet(sheetIndex, data){
  //   const n = this.datas[sheetIndex].name;
  //   const d = new DataProxy(n, this.options);
  //   d.change = (...args) => {
  //     this.sheet.trigger('change', ...args);
  //   };
  //   this.datas.splice(sheetIndex, 1, d);
  //   d.setData(data)
  //   return d;
  // }

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
  findSheetByCid(cid: string) {
    return this.datas.find((m) => m.cid === cid);
  }
  findSheetByName(sheetName: string) {
    return this.datas.find((m) => m.name === sheetName);
  }

  /**
   * 读取勾稽配置
   * @param readConfig
   * @returns
   */
  readCompareConfig(readConfig: any) {
    const compareConfigs: any[] = [];
    readConfig.forEach((m: any) => {
      const sheetIndex = this.getSheetIndexByName(m.name);
      const { _, len } = this.datas[sheetIndex].rows;
      const headRows: any[] = [];
      const bodyRows: any[] = [];
      Object.entries<any>(_).forEach(([ri, row]) => {
        if (ri < m.headRowNumber) {
          headRows.push(cloneDeep(row));
        } else {
          bodyRows.push(cloneDeep(row));
        }
      });
      compareConfigs.push({
        ...m,
        headRows,
        bodyRows,
        len,
      });
    });
    return compareConfigs;
  }

  /**
   * 三表勾稽，数据汇总
   * @param resultRows
   * @param config
   * @param sheetKey
   */
  caclSumWithRows(resultRows: any, config: any, sheetKey: string) {
    // sheet的通用配置
    const sheetConfig = config[sheetKey];
    // 表头的行数
    const headRowNumber = config.headRowNumber;
    const sheetIndex = this.getSheetIndexByName(sheetConfig.sheetName);
    const rows = this.datas[sheetIndex].rows._;
    const sheetHeadRow = rows['0'];
    const sheetFirstRow = rows['1'];
    // 借方金额的列次
    let debitCol = getColByLetter(sheetConfig.debitCol);
    // 贷方金额的列次
    let creditCol = getColByLetter(sheetConfig.creditCol);
    // 是否借贷一列的表格
    const isSameCol =
      sheetHeadRow.cells[debitCol]?.text === '方向' ||
      /借|贷/.test(sheetFirstRow.cells[debitCol]?.text);
    // 根据配置，计算每一行
    config.bodyRows.forEach((configRow: any, n: number) => {
      // 配置表，要匹配的科目名称，正则文本
      const configSubject = configRow.cells[getColByLetter(sheetConfig.configSubjectCol)]?.text
      // 配置表，要匹配的科目代码，正则文本
      const configSubjectId = configRow.cells[getColByLetter(sheetConfig.configSubjectIdCol)]?.text
      // 配置表，要匹配的科目借贷方向，"借"|"贷"
      const configDirection = configRow.cells[getColByLetter(sheetConfig.configDirectionCol)]?.text

      // 获取到符合的行相关信息
      const rowInfo = this.getCellInfoByText(
        new RegExp(configSubject),
        sheetIndex,
        getColByLetter(sheetConfig.findSubjectCol),
        !isEmptyText(configSubjectId) ? new RegExp(configSubjectId) : undefined,
        getColByLetter(sheetConfig.findSubjectIdCol),
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

      // 金额汇总数据写入
      resultRows[n + headRowNumber]
        .cells[getColByLetter(sheetConfig.outAmountCol)]
        .text =  Numeral(
          configDirection === '借' ? sumDebit : sumCredit
        ).format('0,0.00')
    });
  }
  // /**
  //  * 三表勾稽，数据汇总
  //  * @param resultRows
  //  * @param config
  //  * @param sheetKey
  //  */
  // caclSumWithRows(resultRows: any, config: any, sheetKey: string) {
  //   // sheet的通用配置
  //   const sheetConfig = config[sheetKey];
  //   // 表头的行数
  //   const headRowNumber = config.headRowNumber;
  //   const sheetIndex = this.getSheetIndexByName(sheetConfig.sheetName);
  //   const rows = this.datas[sheetIndex].rows._;
  //   const sheetHeadRow = rows['0'];
  //   const sheetFirstRow = rows['1'];
  //   // 借方金额的列次
  //   let debitCol = getColByLetter(sheetConfig.debitCol);
  //   // 贷方金额的列次
  //   let creditCol = getColByLetter(sheetConfig.creditCol);
  //   // 是否借贷一列的表格
  //   const isSameCol =
  //     sheetHeadRow.cells[debitCol]?.text === '方向' ||
  //     /借|贷/.test(sheetFirstRow.cells[debitCol]?.text);
  //   // 根据配置，计算每一行
  //   config.bodyRows.forEach((configRow: any, n: number) => {
  //     // 配置表，要匹配的科目名称，正则文本
  //     const configSubject = configRow.cells[getColByLetter(sheetConfig.configSubjectCol)]?.text
  //     // 配置表，要匹配的科目代码，正则文本
  //     const configSubjectId = configRow.cells[getColByLetter(sheetConfig.configSubjectIdCol)]?.text
  //     // 配置表，要匹配的科目借贷方向，"借"|"贷"
  //     const configDirection = configRow.cells[getColByLetter(sheetConfig.configDirectionCol)]?.text
  //     // 配置表，读取的利润表金额数值列
  //     const configAmountColIndex = getColByLetter(sheetConfig.configAmountCol)

  //     const outCells: any =  configRow.cells

  //     // 获取到符合的行相关信息
  //     const rowInfo = this.getCellInfoByText(
  //       new RegExp(configSubject),
  //       sheetIndex,
  //       getColByLetter(sheetConfig.findSubjectCol),
  //       !isEmptyText(configSubjectId) ? new RegExp(configSubjectId) : undefined,
  //       getColByLetter(sheetConfig.findSubjectIdCol),
  //     );
  //     let sumDebit = 0;
  //     let sumCredit = 0;
  //     if (rowInfo && rowInfo.length) {
  //       rowInfo.forEach((j: any) => {
  //         const cells = j.row.cells;
  //         if (isSameCol) {
  //           if (cells[debitCol] === '借') {
  //             sumDebit += Numeral(cells[creditCol]?.text).value();
  //           } else {
  //             sumCredit += Numeral(cells[creditCol]?.text).value();
  //           }
  //         } else {
  //           sumDebit += Numeral(cells[debitCol]?.text).value();
  //           sumCredit += Numeral(cells[creditCol]?.text).value();
  //         }
  //       });
  //     }
  //     // 金额汇总数据写入
  //     outCells[getColByLetter(sheetConfig.outAmountCol)] = {
  //       text: Numeral(
  //         configDirection === '借' ? sumDebit : sumCredit
  //       ).format('0,0.00'),
  //     };

  //     resultRows[n + headRowNumber] = { cells: outCells };
  //   });
  // }

  loadRiskConfig() {
    const readRiskConfig = {
      sheetName: '风险排查样式',
      findSubjectCol: 'A',
      findSummaryCol: 'B',
      outCol: 'C',
    };

    const riskConfig: any[] = [];
    const findSubjectIndex = getColByLetter(readRiskConfig.findSubjectCol);
    const findSummaryIndex = getColByLetter(readRiskConfig.findSummaryCol);
    const outColIndex = getColByLetter(readRiskConfig.outCol);
    this.forEachCellByCols(
      this.getSheetIndexByName(readRiskConfig.sheetName),
      [findSubjectIndex, findSummaryIndex, outColIndex],
      (outCols) => {
        const findSubjectText = outCols[findSubjectIndex]?.text;
        const findSummaryText = outCols[findSummaryIndex]?.text;
        const findSubjectReg = (findSubjectText || '')
          .split('、')
          .filter((m: any) => m)
          .join('|');
        const findSummaryReg = (findSummaryText || '')
          .split('、')
          .filter((m: any) => m)
          .join('|');
        riskConfig.push({
          findSubjectReg,
          findSummaryReg,
          outText: outCols[outColIndex]?.text,
        });
      }
    );

    console.log('====riskConfig', riskConfig);
    return riskConfig;
  }

  getRiskRows(riskConfig: any[], showAll?: boolean, isReplace?: boolean) {
    const readConfig = {
      sheetName: '序时账',
      findSubjectCol: 'E',
      findSummaryCol: 'F',
      outCol: 'N',
    };
    const findSubjectIndex = getColByLetter(readConfig.findSubjectCol);
    const findSummaryIndex = getColByLetter(readConfig.findSummaryCol);
    const outIndex = getColByLetter(readConfig.outCol);

    const outSheet = {
      name: '风险排查结果',
      rows: {} as any,
    };
    let outRows: any[] = [];

    console.time('process risk');
    const { rows } = this.datas[this.getSheetIndexByName(readConfig.sheetName)];
    Object.entries(rows._).forEach(([ri, row]: any) => {
      const tempRows: any[] = [];
      if (row && row.cells) {
        const subjectText = row.cells[findSubjectIndex]?.text;
        const summaryText = row.cells[findSummaryIndex]?.text;
        // 首行标题
        if (ri == 0) {
          // const insertRow = row;
          const insertRow = cloneDeep(row);
          insertRow.originRow = ri;
          insertRow.cells[outIndex] = { text: '风险点1' };
          insertRow.cells[outIndex + 1] = { text: '确认签字' };
          insertRow.cells[outIndex + 2] = { text: '风险点2' };
          insertRow.cells[outIndex + 3] = { text: '确认签字' };
          insertRow.cells[outIndex + 4] = { text: '风险点3' };
          insertRow.cells[outIndex + 5] = { text: '确认签字' };
          insertRow.cells[outIndex + 6] = { text: '风险点4' };
          insertRow.cells[outIndex + 7] = { text: '确认签字' };
          tempRows.push(insertRow);
        } else {
          const insertRow = cloneDeep(row);
          insertRow.originRow = ri;
          // const insertRow = row;
          const matchRisk = riskConfig.filter(
            (m) =>
              (m.findSubjectReg &&
                new RegExp(m.findSubjectReg).test(subjectText)) ||
              (m.findSummaryReg &&
                new RegExp(m.findSummaryReg).test(summaryText))
          );
          const hasRisk = matchRisk.length > 0;
          matchRisk.forEach((m, n) => {
            // 匹配科目名称和科目摘要
            insertRow.cells[outIndex + n * 2] = { text: m.outText };
          });
          if (hasRisk) {
            tempRows.push(insertRow);
            insertRow.originRow = ri;
          }
        }
      }

      // if(tempRows.length === 0){
      //   tempRows.push({
      //     ...insertRow,
      //     hide: !showAll,
      //   })
      // }
      if (showAll && tempRows.length === 0) {
        // if (tempRows.length === 0) {
        const insertRow = cloneDeep(row);
        insertRow.originRow = ri;
        // const insertRow = row;
        // insertRow.hide = true
        tempRows.unshift(insertRow);
      }

      // 添加样式
      // const newStyles = cloneDeep(row.styles || []);
      // if(row)
      // const style1 = addStyles(newStyles, {color: "#01b0f1"})
      // const style2 = addStyles(newStyles, {color: "#c00000"})
      // let rstyle: any = {};
      // if (cell.style !== undefined) {
      //   cstyle = cloneDeep(styles[cell.style]);
      // }

      // tempRows.forEach(m=>{
      //   m.style =
      // })

      outRows = outRows.concat(tempRows);
    });

    if (isReplace) {
      outRows.forEach((m, n) => {
        this.datas[this.getSheetIndexByName(readConfig.sheetName)].rows._[n] =
          m;
        this.datas[this.getSheetIndexByName(readConfig.sheetName)].rows.len =
          outRows.length;
      });
    } else {
      outRows.forEach((m, n) => {
        outSheet.rows[n] = m;
      });
      outSheet.rows.len = outRows.length;
    }

    // if(isReplace){
    //   this.datas[this.getSheetIndexByName(readConfig.sheetName)].rows = outRows
    // }

    console.timeEnd('process risk');
    console.log('risk outSheet', outSheet);
    return outSheet;
  }
}
