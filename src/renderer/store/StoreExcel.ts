import cuid from 'cuid';
import { cloneDeep } from 'lodash';
import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';
import { FeatureType, JSON_PATH, SORT_DIRECTION } from 'renderer/constants';
import {
  getColByLetter,
  getLetterByCol,
  safeString,
  string2RegExp,
} from 'renderer/utils/utils';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import { readExcel } from 'renderer/utils/excelHelper';
import { compareDefaultConfig } from './compareReadConfig';
import JsonStorage from './JsonStorage';
import { FilterItem, FilterList, HistoryItem } from 'renderer/type';
const Numeral = require('numeral');

let resultSheets: any[] = [];

const filterConfig = {
  headRowNumber: 1,
  sheetName: '序时帐',
  findCol: 'G',
  findSubjectIdCol: 'F',
  findGuideCol: 'I',
  // 分组的凭证号
  groupCol: 'E',
  // 分组的月
  groupMonthCol: 'B',
  debitCol: 'J',
  creditCol: 'K',
  // 对方科目列
  oppositeCol: 'L',
};

const StoreExcel = observable({
  excelId: 'treeSheetCompare',
  excelInstance: {} as MySpreadsheet,
  resultExcelId: 'resultSheetCompare',
  resultExcelInstance: {} as MySpreadsheet,
  resultDialogVisible: false,
  resultDialogCallback: null as any,
  resultType: undefined as any as FeatureType,
  // 抽屉是否展开
  showDrawer: false,
  // 从表头列次读取的下拉列表
  headColOptions: [] as any[],

  // ------ 勾稽相关 --------
  // 勾稽利润表配置-转换后的数据
  compareConfig: {} as any,
  // 勾稽利润表配置-表格数据
  compareConfigSheets: [] as any[],
  // 勾稽时，读取序时账时，数据是否“已汇总”（直接取汇总数据），反之是“未汇总”（需要自己汇总）, 0-false 1-true
  compareIsSum: 0,

  // ----- 风险点相关 ------
  // 风险样式配置条目数据
  riskConfig: [] as any[],
  // 风险样式配置sheets
  riskConfigSheets: [] as any[],

  // ----- 科目筛选相关 ------
  // 科目多条件筛选下拉数据
  filterOptions: [] as any[],
  // 已经选择的科目名称
  filterKeys: [] as any[],
  // 科目代码筛选下拉数据
  filterSubjectIdOptions: [] as any[],
  // 已经选择的科目代码
  filterSubjectIdKeys: [] as any[],
  // 辅助项筛选下拉
  filterGuideOptions: [] as any[],
  // 筛选排序
  filterSortCol: '',
  // 筛选排序方向
  filterSortDirection: SORT_DIRECTION.DESC as SORT_DIRECTION,
  // 列次筛选条件
  filterColConfig: [] as FilterList[],
  // 是否对比高亮借贷金额异常数据
  filterCompare: true,
  // // 是否去掉借贷金额为空的组
  // filterRemoveEmpty: true,

  // --------文件历史相关--------
  // 历史导入
  historyImport: [] as HistoryItem[],
  // 历史保存
  historySave: [] as HistoryItem[],

  init() {
    if (this.excelInstance instanceof MySpreadsheet) {
      const dom = document.getElementById(this.excelId);
      if (dom) {
        dom.innerHTML = '';
      }
    }
    this.excelInstance = new MySpreadsheet(`#${this.excelId}`);
    // this.addFilterConfig();
    this.addFilterGroup();
    // @ts-ignore
    window['FTExcel'] = this.excelInstance;
  },
  // setStore(options: { [x: string]: any }) {
  //   for (const key in options) {
  //     if (Object.prototype.hasOwnProperty.call(options, key)) {
  //       // @ts-ignore
  //       this[key] = options[key];
  //     }
  //   }
  // },

  // 结果弹窗
  toggleDailog(visible: boolean, callback?: any) {
    this.resultDialogVisible = visible;
    if (!visible) {
      // @ts-ignore
      this.resultType = undefined;
      // 关闭弹窗时，把数据回显到内存
      // @ts-ignore
      resultSheets = this.resultExcelInstance.getData();
    } else {
      EventBus.once(EVENT_CONSTANT.DAILOG_RENDERED, (show: boolean) => {
        callback && callback();
      });
    }
  },

  // 将结果展示到弹窗
  showResultSheet(sheetList?: any[], isReset?: boolean) {
    const saveData = () => {
      if (sheetList && sheetList.length) {
        sheetList.forEach((sheetData) => {
          sheetData.cid = cuid();
          // 筛选结果默认冻结第一行
          sheetData.freeze = 'A2';
        });
        // 直接打开弹窗
        if (isReset) {
          resultSheets = sheetList;
        } else {
          resultSheets = sheetList.concat(resultSheets);
          if (resultSheets.length >= 10) {
            resultSheets.length === 10;
          }
        }
      }
      const dom = document.getElementById(this.resultExcelId);
      if (dom) {
        dom.innerHTML = '';
      }
      this.resultExcelInstance = new MySpreadsheet(`#${this.resultExcelId}`);
      // @ts-ignore
      this.resultExcelInstance.loadData(resultSheets);
      requestAnimationFrame(() => {
        // @ts-ignore
        this.resultExcelInstance.reRender();
      });
    };

    if (this.resultDialogVisible) {
      saveData();
    } else {
      this.toggleDailog(true, () => {
        saveData();
      });
    }
  },

  updateHeadColOptions() {
    const billSheet = this.excelInstance.getSheetByName('序时账');
    let headRow = billSheet.rows._[0]?.cells;
    const headColOptions = Object.entries<any>(headRow).map(([ri, cell]) => {
      const letter = getLetterByCol(ri);
      const text = cell.text || '';
      return {
        label: `${letter} - ${text}`,
        text,
        value: letter,
      };
    });
    this.headColOptions = headColOptions;
  },

  /**
   * 更多筛选配置更新
   */
  addFilterGroup() {
    this.filterColConfig = this.filterColConfig.concat({
      groupId: cuid(),
      relation: 'and',
      children: [
        {
          key: cuid(),
          col: undefined,
          value: '',
        },
      ],
    });
  },
  addFilterConfig(groupId: string) {
    this.filterColConfig = this.filterColConfig.map((m) => {
      if (m.groupId === groupId) {
        m.children = m.children.concat({
          key: cuid(),
          col: undefined,
          value: '',
        });
      }
      return m;
    });
  },
  deleteFilterGroup(groupId: string) {
    this.filterColConfig = this.filterColConfig.filter(
      (m) => m.groupId !== groupId
    );
  },
  deleteFilterConfig(groupId: string, key: string) {
    // const find = this.filterColConfig.find((m) => m.groupId === groupId);
    // if (find) {
    //   find.children = find.children.filter((m) => m.key != key);
    // }
    this.filterColConfig = this.filterColConfig.map((m) => {
      if (m.groupId === groupId) {
        m.children = m.children.filter((m) => m.key != key);
      }
      return m;
    });
  },
  changeFilterGroup({
    findKey,
    value,
    groupId,
  }: {
    findKey: any;
    value: any;
    groupId: string;
  }) {
    // const find = this.filterColConfig.find((m) => m.groupId === groupId);
    // if (find) {
    //   const arr = [...find.children];
    //   arr.forEach((m) => {
    //     if (m.key === key) {
    //       m[findKey] = value;
    //     }
    //   });
    //   find.children = arr;
    // }
    this.filterColConfig = this.filterColConfig.map((m) => {
      if (m.groupId === groupId) {
        // @ts-ignore
        m[findKey] = value;
      }
      return m;
    });
  },
  changeFilterConfig({
    key,
    findKey,
    value,
    groupId,
  }: {
    key: any;
    findKey: 'col' | 'value';
    value: any;
    groupId: string;
  }) {
    // const find = this.filterColConfig.find((m) => m.groupId === groupId);
    // if (find) {
    //   const arr = [...find.children];
    //   arr.forEach((m) => {
    //     if (m.key === key) {
    //       m[findKey] = value;
    //     }
    //   });
    //   find.children = arr;
    // }
    this.filterColConfig = this.filterColConfig.map((m) => {
      if (m.groupId === groupId) {
        const arr = [...m.children];
        arr.forEach((m) => {
          if (m.key === key) {
            m[findKey] = value;
          }
        });
        m.children = arr;
      }
      return m;
    });
  },

  /**
   * 科目筛选功能
   */
  filterExcel() {
    this.resultType = FeatureType.FILTER_EXCEL;
    // 替换转义符
    // const str = this.filterKeys.join('|');
    // const findReg = string2RegExp(str)!;
    const str = '';
    const findReg = string2RegExp('') as any;

    // 提前处理筛选条件
    let filterList = this.filterColConfig.map((j) => {
      const children = j.children.map((m) => {
        let regStr = m.value;
        if (m.filterType === 'equal') {
          regStr = `\^(${m.value})\$`;
        } else if (m.filterType === 'notEmpty') {
          regStr = `.+`;
        }
        return {
          ...m,
          key: m.key,
          col: getColByLetter(m.col),
          value: string2RegExp(regStr),
        };
      }) as any[];

      // 科目名称筛选
      if (j.filterKeys && j.filterKeys.length) {
        children.push({
          key: cuid(),
          col: getColByLetter(filterConfig.findCol),
          value: string2RegExp(j.filterKeys.join('|')),
          relation: 'and',
        });
      }
      // 科目代码筛选
      if (j.filterSubjectIdKeys && j.filterSubjectIdKeys.length) {
        children.push({
          key: cuid(),
          col: getColByLetter(filterConfig.findSubjectIdCol),
          value: string2RegExp(j.filterSubjectIdKeys.join('|')),
          relation: 'and',
        });
      }
      // 科目代码筛选
      if (j.findGuideKeys && j.findGuideKeys.length) {
        children.push({
          key: cuid(),
          col: getColByLetter(filterConfig.findGuideCol),
          value: string2RegExp(j.findGuideKeys.join('|')),
          relation: 'and',
        });
      }

      return {
        ...j,
        children,
      };
    }) as any[];
    // // 提前处理筛选条件
    // let filterList = (this.filterColConfig || []).map((m) => {
    //   const regStr = m.filterType === 'equal' ? `\^(${m.value})\$` : m.value;
    //   return {
    //     key: m.key,
    //     col: getColByLetter(m.col),
    //     value: string2RegExp(regStr),
    //   };
    // }) as any[];
    // // 科目名称筛选
    // if (this.filterKeys.length) {
    //   filterList.push({
    //     key: cuid(),
    //     col: getColByLetter(filterConfig.findCol),
    //     value: findReg,
    //   });
    // }
    // // 科目代码筛选
    // if (this.filterSubjectIdKeys.length) {
    //   filterList.push({
    //     key: cuid(),
    //     col: getColByLetter(filterConfig.findSubjectIdCol),
    //     value: string2RegExp(this.filterSubjectIdKeys.join('|')),
    //   });
    // }

    const sheetIndex = this.excelInstance.getSheetIndexByName(
      filterConfig.sheetName
    );
    const sheetData = this.excelInstance.getData()[sheetIndex];
    // 表头数据
    const headRows = this.excelInstance.getHeadRows(sheetIndex);
    // 打组数据
    const groupRows = this.excelInstance.getFilterGroupRows({
      sheetIndex,
      findReg,
      findCol: getColByLetter(filterConfig.findCol),
      groupCol: getColByLetter(filterConfig.groupCol),
      groupMonthCol: getColByLetter(filterConfig.groupMonthCol),
      sortCol: getColByLetter(this.filterSortCol),
      sortDirection: this.filterSortDirection,
      filterList,
      headRowNumber: filterConfig.headRowNumber,
      debitCol: getColByLetter(filterConfig.debitCol),
      creditCol: getColByLetter(filterConfig.creditCol),
      filterCompare: this.filterCompare,
    });
    // debugger
    const sdata = {
      name: `筛选“${safeString(str)}”结果`,
      // 列的属性也带上
      cols: cloneDeep(sheetData.cols),
      rows: { len: headRows.length + groupRows.length },
      styles: [
        // { bgcolor: '#fce5d5' },
        // { bgcolor: '#e3efd9' },
        // { bgcolor: '#fce5d5', color: '#ff0000' },
        // { bgcolor: '#e3efd9', color: '#ff0000' },
        { bgcolor: '#e7e5e6' },
        { bgcolor: '#ffffff' },
        { bgcolor: '#e7e5e6', color: '#ff0000' },
        { bgcolor: '#ffffff', color: '#ff0000' },
      ],
    };

    headRows.forEach((m, n) => {
      // @ts-ignore
      sdata.rows[n] = cloneDeep(m);
    });
    groupRows.forEach((m: any, n: string | number) => {
      // @ts-ignore
      sdata.rows[n + headRows.length] = m;
    });

    this.showDrawer = false;

    this.showResultSheet([sdata]);
  },

  addOppositeSubject() {
    this.excelInstance.setOppositeSubjects({
      sheetIndex: this.excelInstance.getSheetIndexByName(
        filterConfig.sheetName
      ),
      subjectCol: getColByLetter(filterConfig.findCol),
      groupCol: getColByLetter(filterConfig.groupCol),
      groupMonthCol: getColByLetter(filterConfig.groupMonthCol),
      debitCol: getColByLetter(filterConfig.debitCol),
      creditCol: getColByLetter(filterConfig.creditCol),
      oppositeCol: getColByLetter(filterConfig.oppositeCol),
      headRowNumber: filterConfig.headRowNumber,
    });
    // @ts-ignore
    this.excelInstance.reRender();
  },

  // 三表勾稽
  compareSheet() {
    this.resultType = FeatureType.COMPARE_EXCEL;
    // // 利润表
    // profitSheet
    // // 余额表
    // balanceSheet
    // // 序时帐
    // billSheet
    let config = cloneDeep(this.compareConfig);

    // const resultRows: any = {
    //   len: config.len,
    // };
    // config.headRows.forEach((m: any, n: number) => {
    //   resultRows[n] = m;
    // });

    const profitSheet = this.excelInstance.findSheetByName('利润表');
    const resultRows = profitSheet.rows._;

    this.excelInstance.caclProfitSheet(config, 'profitSheet');
    this.excelInstance.caclSumWithRows(resultRows, config, 'billSheet', {
      compareIsSum: this.compareIsSum,
    });
    this.excelInstance.caclSumWithRows(resultRows, config, 'balanceSheet', {
      compareIsSum: this.compareIsSum,
    });
    // 高亮异常数据
    if (profitSheet.styles)
      profitSheet.styles = profitSheet.styles ? profitSheet.styles : [];
    const styleIndex =
      profitSheet.styles.push({
        // bgcolor: "#fff2cd"
        bgcolor: '#f4b184',
      }) - 1;
    // debugger
    Object.entries<any>(resultRows).forEach(([ri, row]) => {
      if (isNaN(Number(ri))) {
        return;
      }
      if (Number(ri) >= config.headRowNumber && row.cells) {
        const checkArr: any[] = [];
        const findColProfit = getColByLetter(
          config['profitSheet'].outAmountCol
        );
        const findColBill = getColByLetter(config['billSheet'].outAmountCol);
        const findColBalance = getColByLetter(
          config['balanceSheet'].outAmountCol
        );
        const oneOf = row.cells[findColProfit]?.text;
        checkArr.push(oneOf);
        checkArr.push(row.cells[findColBill]?.text);
        checkArr.push(row.cells[findColBalance]?.text);
        const hasPass = checkArr.every(
          (m) => Numeral(m).value() === Numeral(oneOf).value()
        );
        if (!hasPass) {
          Object.entries<any>(row.cells).forEach(([ci, col]) => {
            // col
            col.style = styleIndex;
          });
        }
      }
    });

    // @ts-ignore
    this.excelInstance.reRender();

    // // 去除无用列
    // Object.entries<any>(resultRows).forEach(([ri, row]) => {
    //   if(typeof row === 'object'){
    //     const outCells:any = {}
    //     for (let i = 0; i < 5; i++) {
    //       outCells[i] = row.cells[i]
    //     }
    //     row.cells = outCells
    //   }
    // })

    // this.showResultSheet({
    //   name: config.name,
    //   rows: resultRows,
    // });
  },

  checkRisk() {
    this.resultType = FeatureType.CHECK_RICK;
    const outBalanceSheet = this.excelInstance.getRiskRows(this.riskConfig, {
      sheetName: '余额表',
      sheetType: 'balanceSheet',
      findSubjectCol: 'B',
      // findSummaryCol: 'B',
      outCol: 'I',
    });
    const outBillSheet = this.excelInstance.getRiskRows(this.riskConfig, {
      sheetName: '序时账',
      sheetType: 'billSheet',
      // findSubjectCol: 'G',
      findSummaryCol: 'H',
      outCol: 'Q',
    });
    this.showResultSheet([outBillSheet, outBalanceSheet]);
  },
  // 同步风险结果
  saveRisk() {
    const cid = this.resultExcelInstance.datas[0].cid;
    this.syncData(cid, { useOriginRow: true, targetSheet: '序时账' });
    // @ts-ignore
    const cid2 = this.resultExcelInstance.datas[1].cid;
    this.syncData(cid2, { useOriginRow: true, targetSheet: '余额表' });
    this.toggleDailog(false);
  },
  // 同步筛选结果
  saveFilter() {
    const cid = this.resultExcelInstance.datas[0].cid;
    this.syncData(cid, { justText: true, useOriginRow: true });
    this.toggleDailog(false);
  },
  /**
   * 同步数据到序时账
   * @param cid
   * @param options
   */
  syncData(cid: string, options = {} as any) {
    const { justText, useOriginRow } = options;
    const sourceSheet = this.resultExcelInstance.findSheetByCid(cid);
    if (sourceSheet) {
      const outSheetData = sourceSheet.getData();
      const targetSheet = this.excelInstance.findSheetByName(
        options.targetSheet || '序时账'
      );
      Object.entries(outSheetData.rows).forEach(([ri, row]) => {
        // const resRow:any = cloneDeep(row);
        const resRow: any = row;
        if (typeof resRow === 'object') {
          const rowIndex = useOriginRow ? resRow.originRow : ri;
          // 只保存文本
          if (justText) {
            // 根据原来数据的行号，回写数据
            if (rowIndex && targetSheet.rows._[rowIndex]) {
              Object.entries<any>(resRow.cells).forEach(([ci, cell]) => {
                if (targetSheet.rows._[rowIndex].cells[ci]) {
                  // 如果原来有东西，只改文案
                  targetSheet.rows._[rowIndex].cells[ci].text = cell.text;
                } else {
                  // 如果没有，就只写入文案
                  targetSheet.rows._[rowIndex].cells[ci] = {
                    text: cell.text,
                  };
                }
              });
            }
          } else {
            // 整行保存
            targetSheet.rows._[rowIndex] = resRow;
          }
        }
      });
    }
  },

  /**
   * 导入三表勾稽的配置数据
   */
  async importCompareConfigList() {
    const sheets = await readExcel().catch(() => {});
    this._convertCompareConfig(sheets);
    await JsonStorage.set(JSON_PATH.CONFIG_COMPARE_PROFILE, sheets).catch(
      () => {}
    );
  },

  /**
   * 本地获取三表勾稽的配置数据
   */
  getCompareConfigList() {
    JsonStorage.get(JSON_PATH.CONFIG_COMPARE_PROFILE)
      .then((data) => {
        this._convertCompareConfig(data);
      })
      .catch((err) => {});
  },

  _convertCompareConfig(sheets: any[]) {
    this.compareConfigSheets = sheets;
    const m = sheets[0];
    if (!m) return;
    const defaultConfig = cloneDeep(compareDefaultConfig);
    const { len } = m.rows;
    const headRows: any[] = [];
    const bodyRows: any[] = [];
    Object.entries<any>(m.rows).forEach(([ri, row]) => {
      if (isNaN(Number(ri))) {
        return;
      }
      if (Number(ri) < defaultConfig.headRowNumber) {
        headRows.push(cloneDeep(row));
      } else {
        bodyRows.push(cloneDeep(row));
      }
    });
    this.compareConfig = {
      ...defaultConfig,
      headRows,
      bodyRows,
      len,
      name: m.name,
      id: cuid(),
    };
  },

  /**
   * 本地获取风险点配置数据
   */
  getRiskConfigList() {
    JsonStorage.get(JSON_PATH.CONFIG_RISK_LIST)
      .then((data) => {
        this._convertRiskConfig(data);
      })
      .catch((err) => {});
  },
  /**
   * 导入风险点配置数据
   */
  async importRiskConfigList() {
    const sheets = await readExcel().catch(() => {});
    this._convertRiskConfig(sheets);
    await JsonStorage.set(JSON_PATH.CONFIG_RISK_LIST, sheets).catch(() => {});
  },
  _convertRiskConfig(sheets: any[]) {
    this.riskConfigSheets = sheets;

    const readRiskConfig = {
      headRowNumber: 1,
      findSubjectCol: 'A',
      outSubjectCol: 'B',
      findSummaryCol: 'C',
      outSummaryCol: 'D',
    };

    const riskConfig: any[] = [];
    const findSubjectIndex = getColByLetter(readRiskConfig.findSubjectCol);
    const findSummaryIndex = getColByLetter(readRiskConfig.findSummaryCol);
    const outSubjectColIndex = getColByLetter(readRiskConfig.outSubjectCol);
    const outSummaryColIndex = getColByLetter(readRiskConfig.outSummaryCol);

    sheets.forEach((m: any) => {
      forEachCellByCols(
        m.rows,
        [
          findSubjectIndex,
          findSummaryIndex,
          outSubjectColIndex,
          outSummaryColIndex,
        ],
        (outCols, ri) => {
          // 去掉首行
          if (Number(ri) < readRiskConfig.headRowNumber) {
            return;
          }
          const findSubjectText = outCols[findSubjectIndex]?.text;
          const findSummaryText = outCols[findSummaryIndex]?.text;
          const findSubjectReg = (findSubjectText || '')
            .split('、')
            .filter((j: any) => j)
            .join('|');
          const findSummaryReg = (findSummaryText || '')
            .split('、')
            .filter((j: any) => j)
            .join('|');
          riskConfig.push({
            findSubjectReg,
            findSummaryReg,
            outSubjectText: outCols[outSubjectColIndex]?.text,
            outSummaryText: outCols[outSummaryColIndex]?.text,
          });
        }
      );
    });

    function forEachCellByCols(
      rows: any[],
      cols: number[],
      cb: (outCols: any, ri: number) => void
    ) {
      Object.entries(rows).forEach(([ri, row]: any) => {
        const outCols: any = {};
        if (row && row.cells) {
          cols.forEach((m: any) => {
            outCols[m] = row.cells[m];
          });
          cb(outCols, ri);
        }
      });
    }

    console.log('====riskConfig', riskConfig);
    this.riskConfig = riskConfig;
  },

  /**
   * 获取筛选的科目下拉配置
   */
  getFliterOptions() {
    const findColIndex = getColByLetter(filterConfig.findCol);
    const findSubjectIdColIndex = getColByLetter(filterConfig.findSubjectIdCol);
    const findGuideColIndex = getColByLetter(filterConfig.findGuideCol);
    const filterOptions: any[] = [];
    const filterSubjectIdOptions: any[] = [];
    const filterGuideOptions: any[] = [];
    this.excelInstance.forEachCellByCols(
      '序时账',
      [findColIndex, findSubjectIdColIndex, findGuideColIndex],
      (cellsInfo, ri) => {
        // 忽略首行
        if (Number(ri) < filterConfig.headRowNumber) {
          return;
        }
        // cellsInfo
        const text = cellsInfo[findColIndex]?.text;
        if (!filterOptions.find((m) => m.value === text)) {
          filterOptions.push({
            label: text,
            value: text,
          });
        }
        const subjectId = cellsInfo[findSubjectIdColIndex]?.text;
        if (!filterSubjectIdOptions.find((m) => m.value === subjectId)) {
          filterSubjectIdOptions.push({
            label: subjectId,
            value: subjectId,
          });
        }
        const guide = cellsInfo[findGuideColIndex]?.text;
        if (!filterGuideOptions.find((m) => m.value === guide)) {
          filterGuideOptions.push({
            label: guide,
            value: guide,
          });
        }
      }
    );
    this.filterOptions = filterOptions;
    this.filterSubjectIdOptions = filterSubjectIdOptions;
    this.filterGuideOptions = filterGuideOptions;
  },
});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
