import { isEmpty } from "lodash";

const mapCol = [
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
  new Promise((resolve, reject) => {
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

export const getLetterByCol = (col: number) => {
  try {
    return mapCol[Number(col)];
  } catch (error) {
    return '';
  }
};

export const addStyles = (styles: any[], value: any) => {
  styles = styles || []
  return styles.push(value) - 1
};

export const isEmptyText = (value:any) => {
  if(typeof value === "string"){
    value = value.trim()
  }
  return isEmpty(value)
}
