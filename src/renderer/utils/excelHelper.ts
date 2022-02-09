// @ts-ignore
import { selectFile } from '@/utils';
import cuid from 'cuid';
import StoreRoot from 'renderer/store/StoreRoot';

/**
 * 读取Excel
 * @returns
 */
export const readExcel = async () => {
  let [file] = await selectFile('.xlsx,.xls,.doc');

  if (!file) {
    return;
  }
  StoreRoot.rootLoading = true;

  let workbook_object = await new Promise((resolve, rejest) => {
    let reader = new FileReader();

    reader.onload = (e) => {
      var data = e.target!.result;
      // @ts-ignore
      resolve(XLSX.read(data, { type: 'binary', cellStyles: true }));
    };

    reader.onerror = () => {
      rejest(undefined);
    };

    reader.readAsBinaryString(file);
  });

  // function stox(wb: any) {
  //   var out: any[] = [];

  //   wb.SheetNames.forEach(function (name: string) {
  //     var o = { name: name, rows: {} };
  //     var ws = wb.Sheets[name];
  //     var aoa: any[] = XLSX.utils.sheet_to_json(ws, {
  //       raw: false,
  //       header: 1,
  //     });
  //     aoa.forEach(function (r, i) {
  //       var cells: any = {};
  //       r.forEach(function (c: any, j: string) {
  //         cells[j] = { text: c };
  //       });
  //       // @ts-ignore
  //       o.rows[i] = { cells: cells };
  //     });
  //     // @ts-ignore  根据数据行数显示多少行
  //     o.rows.len = aoa.length;
  //     out.push(o);
  //   });
  //   console.log('to x-spreadsheet:', out);
  //   return out;
  // }

  // @ts-ignore
  const sheets = XLSXspread.stox(workbook_object);

  // 导入的数据都加上主键，方便后面查找修改
  console.time('insert id');
  sheets.forEach((m: any) => {
    if (m.rows) {
      Object.entries<any>(m.rows).forEach(([ri, row]) => {
        if (typeof row === 'object') {
          row.rowId = cuid();
        }
      });
    }
  });
  console.timeEnd('insert id');

  StoreRoot.rootLoading = false;
  return sheets;
};

/**
 * 写入Excel
 * @param sheets
 */
export const writeExcel = (sheets: any[]) => {
  // @ts-ignore
  var new_wb = XLSXspread.xtos(sheets);
  /* write file and trigger a download */
  // @ts-ignore
  XLSX.writeFile(new_wb, `表格导出-${new Date().toLocaleString()}.xlsx`, {
    cellStyles: true,
  });
};
