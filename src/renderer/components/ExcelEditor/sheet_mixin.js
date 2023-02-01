
import Sheet from 'x-data-spreadsheet/src/component/sheet.js';


Object.assign(Sheet.prototype, {

  onChange(changeCall) {
    this.changeCall = changeCall;
  },

  changeCall(data) { },

  newUndo() {
    this.data.undo();
    sheetReset.call(this);
    if (this.changeCall) {
      this.changeCall();
    }
  },

  undo() { },

  newRedo() {
    this.data.redo();
    sheetReset.call(this);
    if (this.changeCall) {
      this.changeCall();
    }
  },

  redo() { }
});

function verticalScrollbarSet() {
  const { data, verticalScrollbar } = this;
  const { height } = this.getTableOffset();
  const erth = data.exceptRowTotalHeight(0, -1);
  // console.log('erth:', erth);
  verticalScrollbar.set(height, data.rows.totalHeight() - erth);
}

function horizontalScrollbarSet() {
  const { data, horizontalScrollbar } = this;
  const { width } = this.getTableOffset();
  if (data) {
    horizontalScrollbar.set(width, data.cols.totalWidth());
  }
}

function sheetFreeze() {
  const {
    selector, data, editor,
  } = this;
  const [ri, ci] = data.freeze;
  if (ri > 0 || ci > 0) {
    const fwidth = data.freezeTotalWidth();
    const fheight = data.freezeTotalHeight();
    editor.setFreezeLengths(fwidth, fheight);
  }
  selector.resetAreaOffset();
}

function sheetReset() {
  const {
    tableEl,
    overlayerEl,
    overlayerCEl,
    table,
    toolbar,
    selector,
    el,
  } = this;
  const tOffset = this.getTableOffset();
  const vRect = this.getRect();
  tableEl.attr(vRect);
  overlayerEl.offset(vRect);
  overlayerCEl.offset(tOffset);
  el.css('width', `${vRect.width}px`);
  verticalScrollbarSet.call(this);
  horizontalScrollbarSet.call(this);
  sheetFreeze.call(this);
  table.render();
  toolbar.reset();
  selector.reset();
}


