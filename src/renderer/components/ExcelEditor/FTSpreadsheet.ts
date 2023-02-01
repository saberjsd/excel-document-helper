
//@ts-nocheck
import tools from '@utils/tool';
import elementResizeDetectorMaker from "element-resize-detector";
import _ from 'lodash';
import Spreadsheet from 'x-data-spreadsheet';
import './sheet_mixin.js';
import './row_mixin.js';
import "x-data-spreadsheet/src/index.less";
// import XLSX from 'xlsx';

let erd = elementResizeDetectorMaker();


export default class FTSpreadsheet extends Spreadsheet {

  targetEl!: HTMLDivElement;
  // datas: [any];
  // sheet: any;

  constructor(container: string | HTMLElement, opts?: Options) {
    super(container, opts);
    this.targetEl = document.querySelector(container);

    erd.listenTo(this.targetEl, element => {
      this.sheet.reload();
    });

    this.hideUnuseContextMenu();

    this.on('cell-edited', (text, ri, ci) => {
      this.editing = true;
    });

    this.on('cell-selected', (text, ri, ci) => {
      if (this.editing) {
        this.editing = false;
        this.recordUndo();
      } else {
        this.recordUndo();
      }
    });
  }



  editing: boolean = false;

  // 隐藏不需要用到的 右键菜单
  hideUnuseContextMenu() {
    let contextMenu = this.sheet.contextMenu.el.el;

    [0, 1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(index => {

      contextMenu.children[index].style.display = 'none';
    });

    contextMenu.children[12].remove();
  }

  // 展示右侧菜单
  showContextMenu({ addRow = true, addCol = true, all = true }) {

    let contextMenu = this.sheet.contextMenu.el.el;

    contextMenu.children[6].style.display = addRow ? 'block' : 'none';
    contextMenu.children[7].style.display = addCol ? 'block' : 'none';

    contextMenu.style.opacity = all ? 1 : 0;
    contextMenu.style.pointerEvents = all ? 'unset' : 'none';
  }

  // 获取数据
  getData() {
    return _.cloneDeep(this.datas[0].getData())
  }

  loadData(excelDatas) {
    super.loadData(excelDatas);
    const { data } = this.sheet;

    data.settings.view = {
      width: () => this.targetEl.clientWidth,
      height: () => this.targetEl.clientHeight + 40
    }

    data.settings.style.align = 'center';
    data.rows.height = 32;
    data.scrollx(0, () => { });
    data.scrolly(0, () => { });
    this.sheet.reload();

    this.sheet.verticalScrollbar.el.el.scrollTop = 0;

    this.sheet.horizontalScrollbar.el.el.scrollLeft = 0;

    this.sheet.trigger('change', this.getData());
  }

  // 裁剪数据
  clipData(row, col) {

    const [DataProxy] = this.datas;

    DataProxy.rows.len = _.clamp(row, 1, 50);
    DataProxy.cols.len = _.clamp(col, 1, 50);

    // 减去多余的行数据
    for (let i in DataProxy.rows._) {
      if (i >= row) {
        delete DataProxy.rows._[i];
      }
    }

    // 减去多余的列数据
    for (let i in DataProxy.rows._) {
      for (let ii in DataProxy.rows._[i]['cells']) {
        if (ii >= col) {
          delete DataProxy.rows._[i]['cells'][ii];
        }
      }
    }

    this.sheet.reload();
    this.reRender();
    this.sheet.trigger('change', this.getData());

    this.recordUndo();
  }

  // 更具当前的数据计算最大非空行数
  getMaxRow() {
    for (let r = 49; r > 0; r--) {
      for (let c = 0; c <= 49; c++) {
        let { text } = this.cell(r, c) || {};
        if (text) {
          return r + 1;
        }
      }
    }

    // 最小保留4行
    return 1;
  }

  // 更具当前的数据计算最大非空列数
  getMaxCol() {

    let rowTatol = this.getMaxRow();

    for (let c = 49; c > 0; c--) {
      for (let r = 0; r <= rowTatol; r++) {
        let { text } = this.cell(r, c) || {};
        if (text) {
          return c + 1;
        }
      }
    }

    // 最小保留4列
    return 1;
  }

  // 获取行
  getRow() {
    const [data] = this.datas;
    return data.rows.len;
  }

  // 设置行
  setRow(rowLength) {
    const [data] = this.datas;
    data.history.add(this.getData());
    this.clipData(rowLength, this.getCol());
    this.recordUndo();

    //如果横向滚动条消失了, sheet就需要滚动到最前面去
    if (this.sheet.verticalScrollbar.el.computedStyle().display === 'none') {
      this.sheet.data.scrolly(0, () => { });
    }
  }

  // 获取行
  getCol() {
    const [data] = this.datas;
    return data.cols.len;
  }

  // 设置列
  setCol(colLength) {
    const [data] = this.datas;
    data.history.add(this.getData());
    this.clipData(this.getRow(), colLength);
    this.recordUndo();

    //如果横向滚动条消失了, sheet就需要滚动到最前面去
    if (this.sheet.horizontalScrollbar.el.computedStyle().display === 'none') {
      this.sheet.data.scrollx(0, () => { });
    }
  }

  // 设置数据
  cellText(ri, ci, text) {
    var sheetIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    let oldText = (this.datas[sheetIndex].getCell(ri, ci) || {}).text;

    if (text !== oldText) {
      this.datas[sheetIndex].setCellText(ri, ci, text, '');
    }

    return this;
  }

  downloadExcel() {

    import('xlsx').then(XLSX=>{
      function xtos(sdata) {
        var out = XLSX.utils.book_new();
        sdata.forEach(function (xws) {
          var aoa = [[]];
          var rowobj = xws.rows;
          for (var ri = 0; ri < rowobj.len; ++ri) {
            var row = rowobj[ri];
            if (!row) continue;
            aoa[ri] = [];
            Object.keys(row.cells).forEach(function (k) {
              var idx = +k;
              if (isNaN(idx)) return;
              aoa[ri][idx] = row.cells[k].text;
            });
          }
          var ws = XLSX.utils.aoa_to_sheet(aoa);
          XLSX.utils.book_append_sheet(out, ws, xws.name);
        });
        return out;
      }

      /* build workbook from the grid data */
      var new_wb = xtos([this.getData()]);

      /* generate download */
      XLSX.writeFile(new_wb, "fotorTable.xlsx");
    });
  }

  async importExcel() {
    import('xlsx').then(async XLSX=>{

    let [file] = await tools.selectFile('.xlsx,.xls,.doc') as Array<File>;

    if (!file) { return };

    let workbook_object = await new Promise((resolve, rejest) => {

      let reader = new FileReader();

      reader.onload = e => {
        var data = e.target.result;
        resolve(XLSX.read(data, { type: 'binary' }));
      };

      reader.onerror = () => {
        rejest(undefined);
      }

      reader.readAsBinaryString(file);
    });

    function stox(wb) {

      var out = [];

      wb.SheetNames.length = 1;

      wb.SheetNames.forEach(function (name) {
        var o = { name: name, rows: {} };
        var ws = wb.Sheets[name];
        var aoa = XLSX.utils.sheet_to_json(ws, { raw: false, header: 1 });
        aoa.forEach(function (r, i) {
          var cells = {};
          r.forEach(function (c, j) { cells[j] = ({ text: c }); });
          o.rows[i] = { cells: cells };
        })
        out.push(o);
      });
      return out;
    }

    // 重新导入数据后保留 历史
    let undoItems = [...this.sheet.data.history.undoItems];

    /* load data */
    this.loadData(stox(workbook_object));

    this.sheet.data.history.undoItems = [...undoItems, ...this.sheet.data.history.undoItems];

    // 裁剪多余的空格
    let row = this.getMaxRow();
    let col = this.getMaxCol();
    this.clipData(row, col);

    })
  }

  // 记录步骤
  recordUndo() {

    const [data] = this.datas;

    let undoItems = data.history.undoItems;

    undoItems.push(JSON.stringify(this.getData()));

    for (let i = 0; i < undoItems.length; i++) {
      while (!!undoItems[i] && !!undoItems[i + 1] && undoItems[i] === undoItems[i + 1]) {
        undoItems.splice(i, 1);
      }
    }

    // while (
    //   undoItems.length > 1 &&
    //   undoItems[undoItems.length - 1] === JSON.stringify(this.getData())
    // ) {
    //   undoItems.pop();
    // }

    data.history.undoItems = undoItems;
  }

}
