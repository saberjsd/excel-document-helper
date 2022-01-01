/**
 * 选取电脑上的文件
 * @param {string} [accept='.jpg,.jpeg,.png,.svg']
 */
export const selectFile = (accept = '.jpg,.jpeg,.png,.svg') => new Promise((resolve, reject) => {
 let input = document.createElement("input");
 input.type = "file";
 input.style.display = 'none';
 input.accept = accept;
 input.multiple = true;
 document.body.append(input);
 input.onchange = e => {
   if (e.target) {
     // @ts-ignore
     resolve(Array.from(e.target["files"]));
   } else {
     resolve([]);
   }
   input.remove();
 }
 input.click();
});
