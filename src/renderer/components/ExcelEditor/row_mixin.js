/*
 * @Author: 肖思汗 
 * @Date: 2021-01-27 10:42:56 
 * @Last Modified by: 肖思汗
 * @Last Modified time: 2021-03-11 15:58:24
 */

import { Rows } from 'x-data-spreadsheet/src/core/row.js';

Object.assign(Rows.prototype, {
  
  // 插件的剪切 bug 已修复 后期观察 没有问题后可删除
  // cutPaste(srcCellRange, dstCellRange) {
  //   const ncellmm = {};
  //   this.each((ri) => {
  //     this.eachCells(ri, (ci) => {
  //       let nri = parseInt(ri, 10);
  //       let nci = parseInt(ci, 10);
  //       if (srcCellRange.includes(ri, ci)) {
  //         nri = dstCellRange.sri + (nri - srcCellRange.sri);
  //         nci = dstCellRange.sci + (nci - srcCellRange.sci);
  //       }
  //       ncellmm[nri] = ncellmm[nri] || { cells: {} };

  //       if (!ncellmm[nri].cells[nci]) {
  //         ncellmm[nri].cells[nci] = this._[ri].cells[ci];
  //       }

  //     });
  //   });
  //   this._ = ncellmm;
  // }

});

