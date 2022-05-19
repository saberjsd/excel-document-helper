import { isEmpty } from 'lodash';
import moment from 'moment';
const Numeral = require('numeral');

export const mapCol = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];

/** index number 2 letters
 * @example stringAt(26) ==> 'AA'
 * @date 2019-10-10
 * @export
 * @param {number} index
 * @returns {string}
 */
export function stringAt(index) {
  let str = '';
  let cindex = index;
  while (cindex >= mapCol.length) {
    cindex /= mapCol.length;
    cindex -= 1;
    str += mapCol[parseInt(cindex, 10) % mapCol.length];
  }
  const last = index % mapCol.length;
  str += mapCol[last];
  return str;
}

/** translate letter in A1-tag to number
 * @date 2019-10-10
 * @export
 * @param {string} str "AA" in A1-tag "AA1"
 * @returns {number}
 */
export function indexAt(str) {
  if (!str) return 0;
  let ret = 0;
  for (let i = 0; i !== str.length; ++i)
    ret = 26 * ret + str.charCodeAt(i) - 64;
  return ret - 1;
}

/**
 * 选取电脑上的文件
 * @param {string} [accept='.jpg,.jpeg,.png,.svg']
 */
export const selectFile = (accept = '.jpg,.jpeg,.png,.svg') =>
  new Promise<any>((resolve, reject) => {
    let input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = accept;
    input.multiple = true;
    document.body.append(input);
    input.onchange = (e) => {
      if (e.target) {
        // @ts-ignore
        resolve(Array.from(e.target['files']));
      } else {
        resolve([]);
      }
      input.remove();
    };
    input.click();
  });

export const getColByLetter = (letter: any) => {
  return mapCol.findIndex((m) => m === letter);
};

export const getLetterByCol = (col: any) => {
  try {
    return mapCol[Number(col)];
  } catch (error) {
    return '';
  }
};

export const addStyles = (styles: any[], value: any) => {
  styles = styles || [];
  return styles.push(value) - 1;
};

export const isEmptyText = (value: any) => {
  if (typeof value === 'string') {
    value = value.trim();
  }
  return isEmpty(value);
};

export const getMonthFromString = (str: string) => {
  let out = '';
  if (!str) return out;
  out += moment(str).month();
  return out;
};

/**
 * 字符串转正则，添加转义
 * @param str
 * @returns
 */
export const string2RegExp = (str: string) => {
  if (!str || !str.trim()) return null;
  // TODO: 其他符号转义
  const needRepalce = /(\[|\\|\^|\$|\.|\||\?|\*|\+|\(|\))/;
  return new RegExp(str.replaceAll('\\', '\\\\'));
};

/**
 * 替换字符串中的转义符
 * @param str
 * @returns
 */
export const safeString = (str: string) => {
  return (str || '').replaceAll(/\\|\/|\?|\*|\[|\]/g, '_').slice(0, 20);
};

/**
 * 从行对象中获取指定列的值，并格式化
 * @param row
 * @param col
 * @param type
 * @returns
 */
export const getFormRow = (
  row,
  col: string,
  type: 'string' | 'number' = 'string'
): any => {
  // 兼容实例和数据
  row = row.cells || row;
  const text = row[indexAt(col)]?.text;
  let out = '';
  if (!text || isNaN(text)) {
    return out;
  }
  if (type === 'number') {
    const num: number = Numeral(text).value() || 0;
    // out = Numeral(num).value().format('0,0.00');
    return num;
  }
  return out;
};
