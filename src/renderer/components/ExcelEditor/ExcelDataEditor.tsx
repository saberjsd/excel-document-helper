/*
 * @Author: 肖思汗 
 * @Date: 2021-01-11 17:51:25 
 * @Last Modified by: 肖思汗
 * @Last Modified time: 2021-01-Tu 02:52:16
 */

import FTButton from '@components/Antd/FTButton';
import { FTInputNumber } from '@components/Antd/FTInputNumber/FTInputNumber';
import { FTSvg } from '@components/FTIcons';
import QuestionMarkTip from '@components/QuestionMarkTip/QuestionMarkTip';
import { EVNET_MESSAGE } from '@core/fabric/lib/event/FTEventConstans';
import FTEventHub from '@core/fabric/lib/event/FTEventHub';
import tools from '@utils/tool';
import cuid from 'cuid';
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { Rnd } from "react-rnd";
import styles from './ExcelDataEditor.module.less';
import FTexcelController, { ExcelType } from './FTexcelController';
import FTSpreadsheet from "./FTSpreadsheet";


interface Props {
}

interface State {
  row: number;
  col: number;
  isInit: boolean;
}

export default class ExcelDataEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  state = {
    row: 4,
    col: 4,
    isInit: false
  };

  type: ExcelType = ExcelType.PIE;

  key = `FTExcel_${cuid()}`;

  hasChange: boolean = false; // 内容是否有改变

  excelData?: any;

  excel!: any;

  rndInstance!: React.ReactNode;

  markDom!: HTMLDivElement;

  //用来写css 控制样式的容器
  styleDom!: HTMLStyleElement;

  focusOnInput: boolean = false;

  defaultData = {
    name: "sheet1",
    rows: { len: 4 },
    cols: { len: 4 }
  }

  componentDidMount() {
    FTexcelController.setInstance(this);

    this.init();

    const rootDom = ReactDOM.findDOMNode(this) as HTMLDivElement;
    rootDom.style.display = 'none';
    this.markDom.style.display = 'none';

  }

  setVisible = async visible => {

    if (visible && this.state.isInit === false) {
      this.setState({ isInit: true });
    }

    if (visible) {
      this.hideSelectBox();
      setTimeout(() => {
        this.hasChange = false;
      }, 500);
    }

    const rootDom = ReactDOM.findDOMNode(this) as HTMLDivElement;

    rootDom.style.display = visible ? '' : 'none';
    this.markDom.style.display = visible ? '' : 'none';

    // 弹窗的位置设置在中间
    if (visible) {
      let width = parseInt(rootDom.style.width);
      let height = parseInt(rootDom.style.height);
      let { clientWidth: docW, clientHeight: docH } = document.documentElement;
      rootDom.style.transform = `translate(${(docW - width) / 2}px,${(docH - height - 64) / 2}px)`;

      //@ts-ignore 
      Object.assign(this.rndInstance.draggable.state, {
        x: (docW - width) / 2,
        y: (docH - height - 64) / 2
      });

    }

  }

  setExcelData = (excelData = this.defaultData) => {
    this.excelData = _.cloneDeep(excelData);
    this.excel.loadData(_.cloneDeep(excelData));
  }

  setType = type => {
    this.type = type;
  }

  typeIsChart = () => {

    return (
      this.type === ExcelType.BARX ||
      this.type === ExcelType.BARY ||
      this.type === ExcelType.LINE ||
      this.type === ExcelType.LINEAREA ||
      this.type === ExcelType.PIE
    );

  }

  init = (excelData?: any) => {

    this.hideSelectBox();

    const rootDom = document.getElementById(this.key);
    const excelInstance = this;

    if (rootDom) {
      rootDom.innerHTML = '';
    }

    this.excel = new FTSpreadsheet(`#${this.key}`, { showToolbar: false, showGrid: true, showContextmenu: true });

    FTexcelController.setInstance(this);

    // 当 excel 展示出来时 焦点没有在 数字输入框中时 即视为焦点在 sheet 上
    Object.defineProperty(this.excel.sheet, 'focusing', {
      set(val) { },
      get() {
        return !excelInstance.focusOnInput && FTexcelController.isShow;
      }
    });

    FTexcelController.setLanguage();

    this.excel.on('cell-selected', (cell, ri, ci) => {

      this.verfiyExcelData();

      // 首行首列 没有右键菜单
      this.excel.showContextMenu({
        addRow: this.excel.getRow() < 50,
        addCol: this.excel.getCol() < 50,
        all: !((ri <= 0 || ci <= 0) && this.typeIsChart())
      });

      this.showSelectBox();

    });

    this.excel.on('cells-selected', (cell, { sri, sci, eri, eci }) => {

      this.verfiyExcelData();

      this.excel.showContextMenu({
        addRow: this.excel.getRow() < 50,
        addCol: this.excel.getCol() < 50,
        all: !((sri <= 0 || sci <= 0) && this.typeIsChart())
      });

      this.showSelectBox();

    });

    this.excel.on('cell-edited', (text, ri, ci) => {
      this.verfiyExcelData();
      this.showSelectBox();
    });

    this.excel.change(excelData => {

      this.hasChange = true;

      this.verfiyExcelData();

      let row = this.excel.getRow();
      let col = this.excel.getCol();

      // 非手动修改数据时 就是导入和粘贴 需要裁剪多余的空格
      let maxRow = this.excel.getMaxRow();
      let maxCol = this.excel.getMaxCol();

      if (maxRow > row || maxCol > col) {
        row = maxRow;
        col = maxCol;
        this.excel.clipData(maxRow, maxCol);
      }

      if (this.state.row !== row || this.state.col !== col) {
        this.setState({ row, col });
      }
    });

    // undo redo 触发的回调
    this.excel.sheet.onChange(() => {
      let row = this.excel.getRow();
      let col = this.excel.getCol();
      if (this.state.row !== row || this.state.col !== col) {
        this.setState({ row, col });
      }
    });

    // 设置默认数据
    this.setExcelData(excelData);
  }

  // 验证excelData的格式
  verfiyExcelData = async () => {

    await new Promise((resolve, reject) => setTimeout(resolve, 0));

    // chart 数据格式的校验规则
    if (this.typeIsChart()) {

      let numReg = /-?\d+((\.)?\d+)?/;
      let posinumReg = /\d+((\.)?\d+)?/;
      let row = this.excel.getRow();
      let col = this.excel.getCol();

      this.excel.cellText(0, 0, '');

      const [data] = this.excel.datas;

      for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
          if ((r > 0 && c > 0)) {

            let { text = '' } = this.excel.cell(r, c) || { text: '' };

            // 图标数据只能是数字 饼图只能是正数
            let num = text.match(this.type === ExcelType.PIE ? posinumReg : numReg);

            let newText = num ? num[0] : '';

            if (text !== newText) {
              data.rows.setCellText(r, c, newText);
            }

          }
        }
      }

    }

    if (!this.excel.editing) {
      this.excel.recordUndo();
    }

    this.excel.reRender();
  }

  ok = () => {

    // 图表数据 不保留空行空列
    if (this.typeIsChart()) {
      let row = this.excel.getMaxRow();
      let col = this.excel.getMaxCol();
      this.excel.clipData(row, col);
    }

    this.setVisible(false);
    const excelData = this.excel.getData();
    let arrayData = FTexcelController.excelDataToArrayData(excelData);

    FTexcelController.callback &&
      FTexcelController.callback({ excelData, arrayData, type: this.type });
  }

  cancel = async () => {

    let isModify = true;

    let currentData = _.cloneDeep(this.excel.getData());
    let initData = _.cloneDeep(this.excelData);

    // 删除不需要做比较的数据
    delete currentData.rows.len;
    delete currentData.cols.len;
    delete initData.rows.len;
    delete initData.cols.len;

    if (!tools.isEqualByKey(currentData, initData, ['rows', 'cols'])) {
      isModify = await FTexcelController.modifyConfirm();
    }

    if (this.hasChange && isModify) {

      this.ok();

    } else {
      const { type } = this;
      this.setVisible(false);
      FTexcelController.callback({ type });
    }

  }

  // 最大行提示
  maxRowToast = () => {
    FTEventHub.getInstance().dispatchEvent(EVNET_MESSAGE.SHOW_TOAST, { type: 'warning', content: 'excel_add_to_max_row_toast', key: 'excel_add_to_max_row_toast' })
  }

  // 最大列提示
  maxColToast = () => {
    FTEventHub.getInstance().dispatchEvent(EVNET_MESSAGE.SHOW_TOAST, { type: 'warning', content: 'excel_add_to_max_col_toast', key: 'excel_add_to_max_col_toast' })
  }

  // 隐藏excel的选择框
  hideSelectBox = () => {
    this.styleDom.innerText = `.x-spreadsheet-selector-area{ display: none !important; }`;
  }

  // 显示excel的选择框
  showSelectBox = () => {
    this.styleDom.innerText = '';
  }

  render() {
    const { row, col, isInit } = this.state;

    return (
      <React.Fragment>
        <Rnd
          default={{ x: 0, y: 0, width: 800, height: 430 }}
          className={styles.excel_dragbox}
          ref={dom => dom && (this.rndInstance = dom)}
          minWidth={800}
          minHeight={430}
          maxHeight={800}
          maxWidth={1200}
        >
          <span
            onClick={this.cancel}
            className={styles.close}
          >
            <FTSvg icon="iconi-close-big" />
          </span>

          <div className={styles.title}>
            <FormattedMessage id="excel_editor_title" />
          </div>

          <div
            className={styles.body}
            onMouseDown={e => e.stopPropagation()}
          >

            <div
              id={this.key}
              className={styles.excel_container}
              onMouseDown={e => e.stopPropagation()}
              onWheel={e => e.stopPropagation()}
            >

            </div>
            <div
              className={styles.footer}
              onMouseDown={e => e.stopPropagation()}
            >
              <FTButton
                type="border"
                className={styles.import_data_btn}
                onClick={() => this.excel.importExcel()}
              >
                <FormattedMessage id="excel_import_data" />
              </FTButton>

              {isInit &&
                <QuestionMarkTip
                  getPopupContainer={(triggerNode) => triggerNode}
                  tipText={
                    <FormattedMessage
                      id="excel_help_doc"
                      values={{
                        link: (
                          <a
                            href=""
                            onClick={e => {
                              e.preventDefault();
                              this.excel.downExcel();
                            }}
                          >
                            <FormattedMessage id="excel_help_doc_link" />
                          </a>
                        )
                      }}
                    />
                  }
                  className={styles.questionMarkTip}
                  placement="top"
                  type='excel'
                  theme="light"
                />
              }

              <span className={styles.row_number} >
                <FormattedMessage id="excel_row" />
              </span>

              <FTInputNumber
                key={'rowInput'}
                min={1}
                max={50}
                step={1}
                value={row}
                onBlur={e => {
                  this.focusOnInput = false;
                }}
                onFocus={e => {
                  this.focusOnInput = true;
                }}
                onChange={row => {
                  row = Number(row);

                  if (_.isNaN(row)) {
                    row = this.excel.getRow();
                  }

                  if ((row as number) > 50) {
                    this.maxRowToast();
                  }

                  //@ts-ignore
                  this.setState({ row });
                  this.excel.setRow(row);
                }}
              />

              <span className={styles.col_number}>
                <FormattedMessage id="excel_col" />
              </span>

              <FTInputNumber
                min={1}
                max={50}
                step={1}
                value={col}
                onBlur={e => {
                  this.focusOnInput = false;
                }}
                onFocus={e => {
                  this.focusOnInput = true;
                }}
                onChange={col => {
                  col = Number(col);

                  if (_.isNaN(col)) {
                    col = this.excel.getCol();
                  }

                  if ((col as number) > 50) {
                    this.maxColToast();
                  }

                  if (col) {
                    this.setState({ col });
                    this.excel.setCol(col);
                  }
                }}
              />

              <FTButton
                type="primary"
                onClick={this.ok}
                className={styles.ok}
              >
                <FormattedMessage id="excel_ok" />
              </FTButton>

            </div>

            <FTSvg
              className={styles.resizeIcon}
              icon="iconStretch"
            />

          </div>
        </Rnd>

        <style ref={dom => { dom && (this.styleDom = dom); }} />

        <div
          className={styles.mark}
          ref={dom => dom && (this.markDom = dom)}
        ></div>

      </React.Fragment >
    );
  }
}