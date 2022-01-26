import cuid from 'cuid';
import { cloneDeep } from 'lodash';
import { observable } from 'mobx';
import MySpreadsheet from 'renderer/components/ExcelEditor/MySpreadsheet';
import { FeatureType } from 'renderer/constants';
import { getColByLetter } from 'renderer/utils';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import { compareConfig } from './compareConfig';

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
  setStore(options: { [x: string]: any }) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        // @ts-ignore
        this[key] = options[key];
      }
    }
  },

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
      firstRow: 1,
      findCol: 'E',
      groupCol: 'C',
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

    headRows.forEach((m,n)=>{
      // @ts-ignore
      sdata.rows[n] = cloneDeep(m);
    })
    groupRows.forEach((m: any, n: string | number) => {
      // @ts-ignore
      sdata.rows[n + headRows.length] = m;
    });

    this.showResultSheet(sdata);
  },

  // 三表勾稽
  compareSheet() {
    this.resultType = FeatureType.COMPARE_EXCEL;
    // 利润表
    const profitSheet = this.excelInstance.getSheetByName('利润表');
    // 余额表
    const balanceSheet = this.excelInstance.getSheetByName('余额表');
    // 序时帐
    const billSheet = this.excelInstance.getSheetByName('序时帐');

    const resultRows = {
      len: 100,
      '0': {
        cells: {
          '0': { text: '科目名称' },
          '1': { text: '序时账' },
          '2': { text: '余额表' },
          '3': { text: '利润表' },
        },
      },
    };

    this.excelInstance.caclSumWithRows(resultRows, compareConfig, 'billSheet');
    this.excelInstance.caclSumWithRows(
      resultRows,
      compareConfig,
      'balanceSheet'
    );

    this.showResultSheet({
      name: `勾稽结果`,
      rows: resultRows,
    });
  },

  checkRisk() {
    this.resultType = FeatureType.CHECK_RICK;
    const riskConfig = this.excelInstance.loadRiskConfig();
    const outSheet = this.excelInstance.getRiskRows(riskConfig);
    this.showResultSheet(outSheet);
  },
  saveRisk() {
    // const riskConfig = this.excelInstance.loadRiskConfig()
    // const outSheet = this.excelInstance.getRiskRows(riskConfig, true, true)
    // this.showResultSheet(outSheet);
    const cid = this.resultExcelInstance.datas[0].cid;
    this.syncData(cid);
    this.toggleDailog(false);
  },

  saveFilter() {
    const cid = this.resultExcelInstance.datas[0].cid;
    this.syncData(cid);
    this.toggleDailog(false);
  },

  syncData(cid: string, options = {} as any) {
    const { justText } = options
    const sourceSheet = this.resultExcelInstance.findSheetByCid(cid);
    if (sourceSheet) {
      const outSheetData = sourceSheet.getData();
      const targetSheet = this.excelInstance.findSheetByName('序时账');
      Object.entries(outSheetData.rows).forEach(([ri, row]) => {
        // const resRow:any = cloneDeep(row);
        const resRow: any = row;
        if (typeof resRow === 'object' && !resRow.hide) {
          if(justText){
            // Object.entries(resRow.cells).forEach(([ci,col])=>{

            // })

          } else {
            targetSheet.rows._[ri] = resRow;
          }
        }
      });
    }
  },
});

// @ts-ignore
window['StoreExcel'] = StoreExcel;
export default StoreExcel;
