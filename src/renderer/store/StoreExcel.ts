import cuid from 'cuid';
import { cloneDeep } from 'lodash';
import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';
import { FeatureType, JSON_PATH, SORT_DIRECTION } from 'renderer/constants';
import { getColByLetter, getLetterByCol, string2RegExp } from 'renderer/utils/utils';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import { readExcel } from 'renderer/utils/excelHelper';
import { compareDefaultConfig, compareReadConfig } from './compareReadConfig';
import JsonStorage from './JsonStorage';
const Numeral = require('numeral');

let resultSheets: any[] = [];

const filterConfig = {
  headRowNumber: 1,
  sheetName: '序时帐',
  findCol: 'G',
  // 分组的凭证号
  groupCol: 'E',
  // 分组的月
  groupMonthCol: 'B',
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
  compareConfig: [] as any[],
  // 勾稽利润表配置-表格数据
  compareConfigSheets: [] as any[],
  // 当前勾稽利润表配置
  currentCompareConfigId: '',
  // 勾稽时，读取序时账时，数据是否“已汇总”（直接取汇总数据），反之是“未汇总”（需要自己汇总）, 0-false 1-true
  compareIsSum: 0,

  // ----- 风险点相关 ------
  // 风险样式配置条目数据
  riskConfig: [] as any[],
  // 风险样式配置sheets
  riskConfigSheets: [] as any[],

  // ----- 科目筛选相关 ------
  // 科目多条件筛选数据
  filterOptions: [] as any[],
  // 已经选择的科目名称
  filterKeys: [] as any[],
  // 筛选排序
  filterSortCol: '',
  //
  filterSortDirection: SORT_DIRECTION.DESC as SORT_DIRECTION,
  // 列次筛选条件
  filterColConfig: [] as any[],

  init() {
    if (this.excelInstance instanceof MySpreadsheet) {
      const dom = document.getElementById(this.excelId);
      if (dom) {
        dom.innerHTML = '';
      }
    }
    this.excelInstance = new MySpreadsheet(`#${this.excelId}`);
    this.addFilterConfig();
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
      resultSheets = this.resultExcelInstance.getData()
    } else {
      EventBus.once(EVENT_CONSTANT.DAILOG_RENDERED, (show: boolean) => {
        callback && callback();
      });
    }
  },

  // 将结果展示到弹窗
  showResultSheet(sheetData?: any, isReset?: boolean) {
    const saveData = () => {
      if (sheetData) {
        sheetData.cid = cuid();
        // 筛选结果默认冻结第一行
        sheetData.freeze = "A2"
        // 直接打开弹窗
        if (isReset) {
          resultSheets = [sheetData];
        } else {
          resultSheets.unshift(sheetData);
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
  addFilterConfig() {
    this.filterColConfig = this.filterColConfig.concat({
      key: cuid(),
      col: undefined,
      value: '',
    });
  },
  deleteFilterConfig(key: string) {
    this.filterColConfig = this.filterColConfig.filter((m, n) => m.key !== key);
  },
  changeFilterConfig({
    key,
    findKey,
    value,
  }: {
    key: any;
    findKey: 'col' | 'value';
    value: any;
  }) {
    const arr = [...this.filterColConfig];
    arr.forEach((m) => {
      if (m.key === key) {
        m[findKey] = value;
      }
    });
    this.filterColConfig = arr;
  },

  /**
   * 科目筛选功能
   * @param filterKeys
   */
  filterExcel(filterKeys: string[]) {
    this.resultType = FeatureType.FILTER_EXCEL;
    // 替换转义符
    const str = filterKeys.join('|');
    const findReg = string2RegExp(str)!;

    const sheetIndex = this.excelInstance.getSheetIndexByName(
      filterConfig.sheetName
    );
    const sheetData = this.excelInstance.getData()[sheetIndex]
    // 表头数据
    const headRows = this.excelInstance.getHeadRows(sheetIndex);
    // 打组数据
    const groupRows = this.excelInstance.getGroupRows({
      sheetIndex,
      findReg,
      findCol: getColByLetter(filterConfig.findCol),
      groupCol: getColByLetter(filterConfig.groupCol),
      groupMonthCol: getColByLetter(filterConfig.groupMonthCol),
      sortCol: getColByLetter(this.filterSortCol),
      sortDirection: this.filterSortDirection,
      filterList: this.filterColConfig,
    });
    // debugger
    const sdata = {
      name: `筛选“${str}”结果`,
      // 列的属性也带上
      cols: cloneDeep(sheetData.cols),
      rows: { len: headRows.length + groupRows.length },
      styles: [{ bgcolor: '#fce5d5' }, { bgcolor: '#e3efd9' }],
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

    this.showResultSheet(sdata);
  },

  // 三表勾稽
  compareSheet() {
    this.resultType = FeatureType.COMPARE_EXCEL;

    // this.getCompareConfigList();
    // // 利润表
    // profitSheet
    // // 余额表
    // balanceSheet
    // // 序时帐
    // billSheet
    let config = this.compareConfig.find(
      (m) => m.id === this.currentCompareConfigId
    );
    config = cloneDeep(config);

    // const resultRows: any = {
    //   len: config.len,
    // };
    // config.headRows.forEach((m: any, n: number) => {
    //   resultRows[n] = m;
    // });

    const profitSheet = this.excelInstance.findSheetByName('利润表');
    const resultRows = profitSheet.rows._;
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
    // const riskConfig = this.excelInstance.loadRiskConfig();
    const outSheet = this.excelInstance.getRiskRows(this.riskConfig);
    this.showResultSheet(outSheet);
  },
  // 同步风险结果
  saveRisk() {
    const cid = this.resultExcelInstance.datas[0].cid;
    this.syncData(cid, { useOriginRow: true });
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
      const targetSheet = this.excelInstance.findSheetByName('序时账');
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
    const compareConfigs: any[] = [];
    sheets.forEach((m: any) => {
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
      compareConfigs.push({
        ...defaultConfig,
        headRows,
        bodyRows,
        len,
        name: m.name,
        id: cuid(),
      });
    });
    this.compareConfig = compareConfigs;
    this.currentCompareConfigId = this.compareConfig[0].id;
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
      sheetName: '风险排查样式',
      headRowNumber: 1,
      findSubjectCol: 'A',
      findSummaryCol: 'B',
      outCol: 'C',
    };

    const riskConfig: any[] = [];
    const findSubjectIndex = getColByLetter(readRiskConfig.findSubjectCol);
    const findSummaryIndex = getColByLetter(readRiskConfig.findSummaryCol);
    const outColIndex = getColByLetter(readRiskConfig.outCol);

    sheets.forEach((m: any) => {
      forEachCellByCols(
        m.rows,
        [findSubjectIndex, findSummaryIndex, outColIndex],
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
            outText: outCols[outColIndex]?.text,
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
    const filterOptions: any[] = [];
    this.excelInstance.forEachCellByCols(
      '序时账',
      [findColIndex],
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
      }
    );
    this.filterOptions = filterOptions;
  },
});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
