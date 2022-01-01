/*
 * @Author: 肖思汗 
 * @Date: 2021-01-11 17:55:38 
 * @Last Modified by: 肖思汗
 * @Last Modified time: 2021-01-Tu 05:19:13
 */

import FTintlProvider from '@components/FTintlProvider/FTintlProvider';
import { EVNET_MENU } from '@core/fabric/lib/event/FTEventConstans';
import FTEventHub from '@core/fabric/lib/event/FTEventHub';
import { ftApplication } from '@core/FTApplication';
import { Modal } from 'antd';
import _ from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styles from './ExcelDataEditor.module.less';

export enum ExcelType {
  TABLE = 'table',
  BARY = 'barY',
  BARX = 'barX',
  LINE = 'line',
  LINEAREA = 'lineArea',
  PIE = 'pie',
}

export type FTExcelControlParam = {
  arrayData?: Array<Array<any>>;
  excelData?: any;
  type: ExcelType;
}

/**
 * 点击确认返回 excel 数据
 * 点击取消 返回 undefined
 *
 * @param {*} resolve
 * @param {*} reject
 */
class excelController {

  excelDataEditor!: any;

  isShow: boolean = false;

  constructor() {

    FTEventHub.getInstance().addEventListener(EVNET_MENU.SWITCH_LANGUAGE, local => {
      this.setLanguage();
    });
  }

  setInstance(instance: React.ReactInstance) {
    this.excelDataEditor = instance;
  }

  setLanguage() {

    if (!this.excelDataEditor.excel) {
      return;
    }

    let contextMenu = this.excelDataEditor.excel.sheet.contextMenu.el.el;

    contextMenu.children[6].innerText = ftApplication.getMessage('excel_contextmanu_inset_row');
    contextMenu.children[7].innerText = ftApplication.getMessage('excel_contextmanu_inset_col');
    contextMenu.children[9].innerText = ftApplication.getMessage('excel_contextmanu_del_row');
    contextMenu.children[10].innerText = ftApplication.getMessage('excel_contextmanu_del_col');
  };

  show = ({ arrayData, excelData, type }: FTExcelControlParam) => new Promise<FTExcelControlParam>((resolve, reject) => {

    this.excelDataEditor.setVisible(true);
    this.isShow = true;

    this.callback = (value: FTExcelControlParam) => {
      this.isShow = false;
      resolve({ ...value, type });
    }

    // 设置类型  不同的类型不同的验证规则
    this.excelDataEditor.setType(type);

    if (arrayData) {
      excelData = this.arrayDataToExcelData(arrayData);
    }

    this.excelDataEditor.setExcelData(excelData);
  });

  // 执行 pormise 回调
  callback: (value: FTExcelControlParam) => void = (value) => { };

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
        } catch (e) { }

        if (arrayData[r]) {
          arrayData[r][c] = text;
        } else {
          arrayData[r] = [text];
        }
      }
    }

    return arrayData;
  }

  defaultData = {
    name: "sheet1",
    rows: { len: 4 },
    cols: { len: 4 }
  }

  // 二维数组转excel数据
  arrayDataToExcelData(arrayData: Array<Array<any>> = []) {

    let excelData = _.cloneDeep(this.defaultData);

    let rowTatol = arrayData.length;
    let colTatol = arrayData[0] ? arrayData[0].length : 0;

    excelData.rows.len = _.clamp(rowTatol, 6, 50);
    excelData.cols.len = _.clamp(colTatol, 6, 50);

    for (let r = 0; r < rowTatol; r++) {
      for (let c = 0; c < colTatol; c++) {

        let text = arrayData[r][c];

        if (r > 0 && c > 0) {
          text = String(text);
        }

        if (excelData.rows[r]) {

          excelData.rows[r].cells[c] = { text };
        } else {

          excelData.rows[r] = { cells: { "0": { text } } };
        }
      }
    }

    return excelData;
  }

  modifyConfirm = () => new Promise<boolean>((resolve, reject) => {

    Modal.confirm({
      className: styles.modify_confirm,
      icon: null,
      content: <FTintlProvider>
        <FormattedMessage id="excel_change_reconfirm" />
      </FTintlProvider>,

      okText: <FTintlProvider>
        <FormattedMessage id="excel_change_ok_btn" />
      </FTintlProvider>,

      cancelText: <FTintlProvider>
        <FormattedMessage id="excel_change_cancel_btn" />
      </FTintlProvider>,
      centered: true,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });

  });

}

const FTexcelController = new excelController();

window['FTexcelController'] = FTexcelController;

export default FTexcelController;