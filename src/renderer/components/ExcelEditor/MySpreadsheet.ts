import Spreadsheet, { Options } from 'x-data-spreadsheet';
// import './sheet_mixin.js';
// import './row_mixin.js';
import 'x-data-spreadsheet/src/index.less';
// import XLSX from 'xlsx';
import 'x-data-spreadsheet/dist/locale/zh-cn';
import { clamp, cloneDeep, uniqBy } from 'lodash';
import {
  addStyles,
  getColByLetter,
  getMonthFromString,
  isEmptyText,
  string2RegExp,
} from 'renderer/utils/utils';
import StoreRoot from 'renderer/store/StoreRoot';
import cuid from 'cuid';
import { readExcel, writeExcel } from 'renderer/utils/excelHelper';
import { SORT_DIRECTION } from 'renderer/constants';
import { FilterItem, FilterList } from 'renderer/type';
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
    col: {
      len: 34,
    },
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

  /**
   * 导出整个表格
   */
  exportExcel() {
    const data = this.getData();
    // 导出时需要保证每个sheet.name 不重复
    const sheetNames = data.map((m) => m.name);
    const map = {};
    data.forEach((m) => {
      if (sheetNames.includes(m.name)) {
        if (map[m.name] == undefined) {
          map[m.name] = 0;
        } else {
          map[m.name] += 1;
        }
        if (map[m.name] > 0) {
          m.name += `(${map[m.name]})`;
        }
      }
    });
    // @ts-ignore
    writeExcel(data);
  }

  /**
   * 导出单个sheet
   * @param sheetIndex
   */
  exportSheet(sheetIndex: number = this.getCurrentSheetIndex()) {
    const data = [this.datas[sheetIndex].getData()];
    // @ts-ignore
    writeExcel(data);
  }

  /**
   * 导入表格
   */
  async importExcel() {
    readExcel().then((sheets) => {
      this.loadData(sheets);
    });
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
   * @param sheetName
   * @param cols
   * @param cb
   */
  forEachCellByCols(
    sheetName: string,
    cols: number[],
    cb: (outCols: any, ri: number) => void
  ) {
    const sheet = this.getSheetByName(sheetName);
    if (!sheet) return;
    const { rows } = sheet;
    Object.entries(rows._).forEach(([ri, row]: any) => {
      const outCols: any = {};
      if (row && row.cells) {
        cols.forEach((m: any) => {
          outCols[m] = row.cells[m];
        });
        cb(outCols, ri);
      }
    });
  }

  /**
   * 通过单元格内容，获取单元格信息。可以指定列
   * @param text
   * @param sheetIndex
   * @param textCol
   * @returns
   */
  getCellInfoByText(
    sheetIndex: number = 0,
    text: string | RegExp,
    textCol?: number,
    subjectIdReg?: RegExp[],
    subjectIdCol?: number
  ) {
    const out: any = [];
    this.forEachCells(sheetIndex, ({ ri, ci, cell, row }) => {
      const filterCol = textCol === undefined || textCol == ci;
      if (filterCol) {
        const type = Object.prototype.toString.call(text).slice(8, -1);
        if (type === 'RegExp') {
          // @ts-ignore
          if (text.test(String(cell.text))) {
            // 额外的“科目编号”筛选条件
            if (subjectIdReg && subjectIdReg.length && subjectIdCol) {
              let text = row.cells[subjectIdCol]?.text;
              text = text ? text.replaceAll('\\r', '') : text;
              const find = subjectIdReg.every((reg) => {
                return reg.test(text);
              });
              if (find) {
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
   * 获得序时账分组
   * @param sourceRows
   * @param options
   * @returns
   */
  _getGroupMap(sourceRows: [any, any][], options: any = {}) {
    // 分组后的数据
    const map: any = {};
    sourceRows.forEach(([ri, row]) => {
      if (Number(ri) < options.headRowNumber) return;

      const id = row?.cells[options.groupCol]?.text;
      let mid = id;
      if (options.groupMonthCol) {
        const month = getMonthFromString(
          row?.cells[options.groupMonthCol]?.text
        );
        mid = `${id}-${month}`;
      }

      if (mid) {
        const item = cloneDeep(row);
        // 记录原来的行号，方便数据回写
        item.originRow = ri;
        if (!map[mid]) {
          map[mid] = [item];
        } else {
          map[mid].push(item);
        }
      }
    });
    return map;
  }
  /**
   * 获取findCol列的值等于text的行，然后以groupCol列的值分组
   * @param param0
   * @returns
   */
  getFilterGroupRows({
    sheetIndex,
    findReg,
    findCol,
    groupCol,
    groupMonthCol,
    headRowNumber,
    sortDirection = SORT_DIRECTION.DESC,
    sortCol,
    filterList = [],
    debitCol,
    creditCol,
    filterCompare,
  }: {
    findReg: RegExp;
    sheetIndex: number;
    findCol: number;
    // 分组条件：凭证号
    groupCol: number;
    // 分组条件：月份
    groupMonthCol: number;
    headRowNumber: number;
    // 组间排序方向
    sortDirection?: SORT_DIRECTION;
    // 组间排序依据列次
    sortCol?: number;
    filterList: FilterList[];
    // 借方
    debitCol: number;
    // 贷方
    creditCol: number;
    filterCompare: boolean;
  }) {
    let outRows: any = [];

    const { rows } = this.datas[sheetIndex];
    const sourceRows = Object.entries<any>(rows._);
    // 分组后的数据
    const map: any = this._getGroupMap(sourceRows, {
      headRowNumber,
      groupCol,
      groupMonthCol,
    });

    const mapArr = Object.entries<any>(map);
    if (sortCol !== undefined && findReg) {
      mapArr.sort(([keyA, rowsA], [keyB, rowsB]) => {
        const sortRowA = rowsA.find((m: any) =>
          findReg.test(m?.cells[findCol]?.text)
        );
        const sortRowB = rowsB.find((m: any) =>
          findReg.test(m?.cells[findCol]?.text)
        );
        const sortA = Numeral(sortRowA?.cells[sortCol]?.text).value();
        const sortB = Numeral(sortRowB?.cells[sortCol]?.text).value();
        if (sortDirection === SORT_DIRECTION.ASC) {
          return sortA - sortB;
        } else {
          return sortB - sortA;
        }
      });
    }

    // 间隔颜色
    let nextStyle = 0;
    // // 借贷方求和
    // let debitSum = 0;
    // let creditSum = 0;

    mapArr.forEach(([key, rows]) => {
      // 组内是否匹配
      let hasFiltered = true;
      // 借贷方求和
      let debitSum = 0;
      let creditSum = 0;
      const filterMatch: any = {};
      // 更多过滤条件
      if (filterList && filterList.length) {
        // 组内遍历每行
        rows.forEach((row: any) => {
          // 是否求和了，用来每行只计算一次的标识
          let isSum = false;
          row.isMatched = false;
          const debitText = row?.cells[debitCol]?.text;
          // 当前行的借贷方向
          const rowDirection = !isEmptyText(debitText) ? 'debit' : 'credit';
          filterList.forEach((item) => {
            // 多个行内条件是否匹配
            let isMatch = true;
            // 如果配置了借贷方向，需要匹配借贷方向
            const isSameDirection =
              !item.direction || rowDirection === item.direction;
            item.children.forEach((m) => {
              // 行内匹配
              if (m.col && m.value) {
                const val = row.cells[m.col]?.text;
                if (m.relation === 'or') {
                  isMatch = isMatch || (m.value.test(val) && isSameDirection);
                } else {
                  isMatch = isMatch && m.value.test(val) && isSameDirection;
                }
              }
            });
            // 求和 && 标记
            if (!isSum && isMatch) {
              if (item.direction === 'credit') {
                const creditText = row?.cells[creditCol]?.text || 0;
                creditSum = Numeral(creditText).add(creditSum).value();
                // 标记是否匹配，用力来判断高亮的前提
                row.isMatched = true;
              } else {
                // 默认是借方
                const debitText = row?.cells[debitCol]?.text || 0;
                debitSum += Numeral(debitText).add(creditSum).value();
                // 标记是否匹配，用力来判断高亮的前提
                row.isMatched = true;
              }
              isSum = true;
            }
            // 匹配到的组内条件，记录下
            if (isMatch) {
              filterMatch[item.groupId] = true;
            }
          });
        });

        // 组内条件
        filterList.forEach((item) => {
          if (item.relation === 'or') {
            hasFiltered = hasFiltered || !!filterMatch[item.groupId];
          } else {
            hasFiltered = hasFiltered && !!filterMatch[item.groupId];
          }
        });
      }

      // 展平数据
      if (hasFiltered && rows.length) {
        rows.forEach((m: any) => {
          const isEqual =
            Numeral(debitSum).value().toFixed(2) ===
            Numeral(creditSum).value().toFixed(2);
          Object.entries(m.cells).forEach(([ci, cell]) => {
            // @ts-ignore 设置分组样式
            cell.style = nextStyle;
            if (filterCompare && !isEqual && m.isMatched) {
              // @ts-ignore 设置异常数据样式
              cell.style = nextStyle + 2;
            }
          });
        });
        // if(Numeral(debitSum).value() !== Numeral(creditSum).value()){
        //   rows.forEach((m: any) => {
        //     Object.entries(m.cells).forEach(([ci, cell]) => {
        //       // @ts-ignore 设置分组样式
        //       cell.style = nextStyle + 2;
        //     });
        //   });
        // }
        nextStyle = Number(!nextStyle);
        outRows = outRows.concat(rows);
      }
    });

    // console.log("outRows",outRows)
    return outRows;
  }

  setOppositeSubjects({
    sheetIndex,
    groupCol,
    groupMonthCol,
    subjectCol,
    debitCol,
    creditCol,
    oppositeCol,
    headRowNumber,
  }: {
    sheetIndex: number;
    // 分组条件：凭证号
    groupCol: number;
    // 分组条件：月份
    groupMonthCol: number;
    subjectCol: number;
    // 借方
    debitCol: number;
    // 贷方
    creditCol: number;
    // 对方科目列次
    oppositeCol: number;
    headRowNumber: number;
  }) {
    let outRows: any = [];
    const { rows } = this.datas[sheetIndex];
    const sourceRows = Object.entries<any>(rows._);

    // 分组后的数据
    const map: any = {};
    sourceRows.forEach(([ri, row]) => {
      if (Number(ri) < headRowNumber) return;
      const month = getMonthFromString(row?.cells[groupMonthCol]?.text);
      const id = row?.cells[groupCol]?.text;
      const subjectText = row?.cells[subjectCol]?.text;
      // const debitText = row?.cells[debitCol]?.text;
      // const creditText = row?.cells[creditCol]?.text;
      const mid = `${id}-${month}`;
      if (mid) {
        // const item = row;
        const isDebit = !isEmptyText(row?.cells[debitCol]?.text);

        // if(row && row.cells){
        //   row.cells[oppositeCol] = {
        //     text: subjectText
        //   }
        // }
        if (!map[mid]) {
          map[mid] = {
            rows: [],
            debitText: [],
            creditText: [],
          };
        }
        map[mid].rows.push(row);
        if (isDebit) {
          if (!map[mid].debitText.includes(subjectText)) {
            map[mid].debitText.push(subjectText);
          }
        } else {
          if (!map[mid].creditText.includes(subjectText)) {
            map[mid].creditText.push(subjectText);
          }
        }
      }
    });

    // console.log("==== opposite map:", map)

    const mapArr = Object.entries<any>(map);
    mapArr.forEach(([key, rowInfo]) => {
      rowInfo.rows.forEach((row: any) => {
        const isDebit = !isEmptyText(row?.cells[debitCol]?.text);
        row.cells[oppositeCol] = {
          text: isDebit
            ? rowInfo.creditText.join('、')
            : rowInfo.debitText.join('、'),
        };
      });
      // outRows = outRows.concat(rowInfo);
    });

    return outRows;
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
      if (item.name.trim() === name.trim()) {
        return i;
      }
    }
    return 0;
  }
  getSheetByName(name: string) {
    for (let i = 0; i < this.datas.length; i++) {
      const item = this.datas[i];
      if (item.name.trim() === name.trim()) {
        return item;
      }
    }
    return null;
  }
  findSheetByCid(cid: string) {
    return this.datas.find((m) => m.cid === cid);
  }
  findSheetByName(sheetName: string) {
    return this.datas.find((m) => m.name.trim() === sheetName.trim());
  }

  /**
   * 三表勾稽，数据汇总
   * @param resultRows
   * @param config
   * @param sheetKey
   */
  caclSumWithRows(
    resultRows: any,
    config: any,
    sheetKey: string,
    options: any
  ) {
    // sheet的通用配置
    const sheetConfig = config[sheetKey];
    // 表头的行数
    const sheetIndex = this.getSheetIndexByName(sheetConfig.sheetName);
    const rows = this.datas[sheetIndex].rows._;
    const sheetHeadRow = rows[sheetConfig.headRowNumber - 1];
    const sheetFirstRow = rows[sheetHeadRow];
    // 借方金额的列次
    let debitCol = getColByLetter(sheetConfig.debitCol);
    // 贷方金额的列次
    let creditCol = getColByLetter(sheetConfig.creditCol);
    // 是否借贷一列的表格
    const isSameCol =
      sheetHeadRow?.cells[debitCol]?.text === '方向' ||
      /借|贷/.test(sheetFirstRow?.cells[debitCol]?.text);
    // 根据配置，计算每一行
    config.bodyRows.forEach((configRow: any, n: number) => {
      // 配置表，要匹配的科目名称，正则文本
      const configSubject =
        configRow.cells[getColByLetter(sheetConfig.configSubjectCol)]?.text;
      // 配置表，要匹配的科目代码，正则文本
      const configSubjectId =
        configRow.cells[getColByLetter(sheetConfig.configSubjectIdCol)]?.text;
      // 配置表，要匹配的科目借贷方向，"借"|"贷"
      const configDirection =
        configRow.cells[getColByLetter(sheetConfig.configDirectionCol)]?.text;

      let configSubjectIdRegArr: RegExp[] = [];
      if (!isEmptyText(configSubjectId)) {
        configSubjectIdRegArr = [string2RegExp(configSubjectId)!];
      }
      // 如果是已汇总的，只取汇总后的科目
      if (options.compareIsSum) {
        // 目前汇总后的数据在一级科目，一级科目的科目编码只有四位数字
        configSubjectIdRegArr.push(/^\d{4}$/);
      }

      // 获取到符合的行相关信息
      const rowInfo = this.getCellInfoByText(
        sheetIndex,
        string2RegExp(configSubject)!,
        getColByLetter(sheetConfig.findSubjectCol),
        configSubjectIdRegArr,
        getColByLetter(sheetConfig.findSubjectIdCol)
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
      resultRows[configRow.profitRow].cells[
        getColByLetter(sheetConfig.outAmountCol)
      ].text = Numeral(configDirection === '借' ? sumDebit : sumCredit).format(
        '0,0.00'
      );
    });
  }

  /**
   * 根据实际利润表，决定哪些配置可用
   * @param config
   * @param sheetKey
   */
  caclProfitSheet(config: any, sheetKey: string) {
    // sheet的通用配置
    const sheetConfig = config[sheetKey];
    // 表头的行数
    const sheetIndex = this.getSheetIndexByName(sheetConfig.sheetName);
    // 根据配置，计算每一行
    config.bodyRows = config.bodyRows.map((configRow: any, n: number) => {
      // 配置表，要匹配的科目名称，正则文本
      const configSubject =
        configRow.cells[getColByLetter(sheetConfig.configSubjectCol)]?.text;

      // 获取到符合的行相关信息
      const rowInfo = this.getCellInfoByText(
        sheetIndex,
        string2RegExp(configSubject)!,
        getColByLetter(sheetConfig.findSubjectCol)
      );
      if (rowInfo && rowInfo.length) {
        // 记录实际利润表中的行次
        configRow.profitRow = rowInfo[0].ri;
        return configRow;
        // rowInfo.forEach((j: any) => {
        //   const cells = j.row.cells;
        //   // Numeral(cells[creditCol]?.text).value();
        //   if()
        // });
      }
    });
  }

  getRiskRows(riskConfig: any[], readConfig: any) {
    // const findSubjectIndex = getColByLetter(readConfig.findSubjectCol);
    // const findSummaryIndex = getColByLetter(readConfig.findSummaryCol);
    const isBalanceSheet = readConfig.sheetType === 'balanceSheet';
    const findIndex = isBalanceSheet
      ? getColByLetter(readConfig.findSubjectCol)
      : getColByLetter(readConfig.findSummaryCol);
    const outIndex = getColByLetter(readConfig.outCol);
    const sheetIndex = this.getSheetIndexByName(readConfig.sheetName);
    const sheetData = this.getData()[sheetIndex];

    const outSheet = {
      name: `${readConfig.sheetName}-风险排查结果`,
      rows: {} as any,
      cols: cloneDeep(sheetData.cols),
    };
    let outRows: any[] = [];

    console.time('process risk');

    const { rows } = this.datas[sheetIndex];
    Object.entries(rows._).forEach(([ri, row]: any) => {
      const tempRows: any[] = [];
      if (row && row.cells) {
        // const subjectText = row.cells[findSubjectIndex]?.text;
        // const summaryText = row.cells[findSummaryIndex]?.text;
        const findText = row.cells[findIndex]?.text;
        // 首行标题
        if (ri == 0) {
          // const insertRow = row;
          const insertRow = cloneDeep(row);
          insertRow.originRow = ri;
          insertRow.cells[outIndex] = { text: '风险点' };
          insertRow.cells[outIndex + 1] = { text: '确认签字' };
          // insertRow.cells[outIndex + 2] = { text: '风险点2' };
          // insertRow.cells[outIndex + 3] = { text: '确认签字' };
          // insertRow.cells[outIndex + 4] = { text: '风险点3' };
          // insertRow.cells[outIndex + 5] = { text: '确认签字' };
          // insertRow.cells[outIndex + 6] = { text: '风险点4' };
          // insertRow.cells[outIndex + 7] = { text: '确认签字' };
          tempRows.push(insertRow);
        } else {
          const insertRow = cloneDeep(row);
          insertRow.originRow = ri;
          const matchRisk = riskConfig.filter(
            (m) => {
              const reg = isBalanceSheet ? m.findSubjectReg : m.findSummaryReg;
              return reg && string2RegExp(reg)?.test(findText);
            }
            // (m.findSubjectReg &&
            //   string2RegExp(m.findSubjectReg)?.test(subjectText)) ||
            // (m.findSummaryReg &&
            //   string2RegExp(m.findSummaryReg)?.test(summaryText))
          );
          // const hasRisk = matchRisk.length > 0;
          let riskString = '';
          matchRisk.forEach((m, n) => {
            // 匹配科目名称和科目摘要
            // insertRow.cells[outIndex + n * 2] = { text: m.outText };
            const outText = isBalanceSheet
              ? m.outSubjectText
              : m.outSummaryText;
            riskString += `(${n + 1})${outText}${
              n < matchRisk.length - 1 ? '\n' : ''
            }`;
          });
          if (riskString) {
            insertRow.cells[outIndex] = { text: riskString };
            tempRows.push(insertRow);
            insertRow.originRow = ri;
          }
        }
      }

      // if (showAll && tempRows.length === 0) {
      //   // if (tempRows.length === 0) {
      //   const insertRow = cloneDeep(row);
      //   insertRow.originRow = ri;
      //   // const insertRow = row;
      //   // insertRow.hide = true
      //   tempRows.unshift(insertRow);
      // }

      // 添加样式
      // const newStyles = cloneDeep(row.styles || []);
      // if(row)
      // const style1 = addStyles(newStyles, {color: "#01b0f1"})
      // const style2 = addStyles(newStyles, {color: "#c00000"})
      // let rstyle: any = {};
      // if (cell.style !== undefined) {
      //   cstyle = cloneDeep(styles[cell.style]);
      // }

      outRows = outRows.concat(tempRows);
    });

    // if (isReplace) {
    //   outRows.forEach((m, n) => {
    //     this.datas[sheetIndex].rows._[n] = m;
    //     this.datas[sheetIndex].rows.len = outRows.length;
    //   });
    // } else {
    // }
    outRows.forEach((m, n) => {
      outSheet.rows[n] = m;
    });
    outSheet.rows.len = outRows.length;

    console.timeEnd('process risk');
    console.log('risk outSheet', outSheet);
    return outSheet;
  }

  addSheets(sheets: any[]) {
    if (sheets && sheets.length) {
      sheets.forEach((m, n) => {
        // @ts-ignore
        const nd = this.addSheet(m.name, n === 0);
        nd.setData(m);
      });
    }
  }
}
