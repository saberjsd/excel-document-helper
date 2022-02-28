import { isEmpty } from 'lodash';
import moment from 'moment';

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
  return (str || '').replaceAll(/\\|\/|\?|\*|\[|\]/g, '_');
};
