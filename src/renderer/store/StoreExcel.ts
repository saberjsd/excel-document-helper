import cuid from 'cuid';
import { cloneDeep } from 'lodash';
import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';
import { FeatureType } from 'renderer/constants';
import { getColByLetter } from 'renderer/utils';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import { compareReadConfig } from './compareReadConfig';

let resultSheets: any[] = [];

const StoreExcel = observable({
  excelId: 'treeSheetCompare',
  excelInstance: {} as MySpreadsheet,
  resultExcelId: 'resultSheetCompare',
  resultExcelInstance: {} as MySpreadsheet,
  resultDialogVisible: false,
  resultDialogRendered: false,
  resultDialogCallback: null as any,
  resultType: undefined as any as FeatureType,
  // ------ 勾稽相关
  compareConfig: [] as any[],
  // 当前勾稽利润表配置
  currentCompareConfigId: 'profitExcuted',
  // 勾稽时，读取序时账时，数据是否“已汇总”（直接取汇总数据），反之是“未汇总”（需要自己汇总）
  compareIsSum: false,

  init() {
    if (this.excelInstance instanceof MySpreadsheet) {
      const dom = document.getElementById(this.excelId);
      if (dom) {
        dom.innerHTML = '';
      }
    }
    this.excelInstance = new MySpreadsheet(`#${this.excelId}`);
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
  toggleDailog(visible: boolean) {
    this.resultDialogVisible = visible;
    if (!visible) {
      // @ts-ignore
      this.resultType = undefined;
    }
  },

  // 将结果展示到弹窗
  showResultSheet(sheetData: any, isReset?: boolean) {
    sheetData.cid = cuid();
    const saveData = () => {
      if (isReset) {
        resultSheets = [sheetData];
      } else {
        resultSheets.unshift(sheetData);
        if (resultSheets.length >= 10) {
          resultSheets.length === 10;
        }
      }

      if (this.resultExcelInstance instanceof MySpreadsheet) {
      } else {
        this.resultExcelInstance = new MySpreadsheet(`#${this.resultExcelId}`);
      }
      // @ts-ignore
      this.resultExcelInstance.loadData(resultSheets);
      requestAnimationFrame(() => {
        // @ts-ignore
        this.resultExcelInstance.reRender();
      });
    };

    if (this.resultDialogRendered) {
      saveData();
    } else {
      EventBus.once(EVENT_CONSTANT.DAILOG_RENDERED, (show: boolean) => {
        saveData();
      });
    }
  },

  getGroupExcel(text: string) {
    this.resultType = FeatureType.FILTER_EXCEL;
    const filterConfig = {
      sheetName: '序时帐',
      findCol: 'F',
      groupCol: 'D',
    };

    const sheetIndex = this.excelInstance.getSheetIndexByName(
      filterConfig.sheetName
    );
    // 表头数据
    const headRows = this.excelInstance.getHeadRows(sheetIndex);
    // 打组数据
    const groupRows = this.excelInstance.getGroupRows({
      text,
      sheetIndex,
      findCol: getColByLetter(filterConfig.findCol),
      groupCol: getColByLetter(filterConfig.groupCol),
    });
    const sdata = {
      name: `筛选“${text}”结果`,
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

    this.showResultSheet(sdata);
  },

  // 三表勾稽
  compareSheet() {
    this.resultType = FeatureType.COMPARE_EXCEL;

    this.getCompareConfigList();
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

    const profitSheet = this.excelInstance.findSheetByName("利润表");
    const resultRows = profitSheet.rows._
    this.excelInstance.caclSumWithRows(resultRows, config, 'billSheet');
    this.excelInstance.caclSumWithRows(resultRows, config, 'balanceSheet');
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
    const riskConfig = this.excelInstance.loadRiskConfig();
    const outSheet = this.excelInstance.getRiskRows(riskConfig);
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

  getCompareConfigList() {
    this.compareConfig = this.excelInstance.readCompareConfig(compareReadConfig);
  },
});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
