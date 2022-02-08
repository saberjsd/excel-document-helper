import { ipcMain } from 'electron';
const storage = require('electron-json-storage');
// 设置json存储目录
storage.setDataPath(`${process.cwd()}/storage`);

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('SET_JSON_STORAGE', async (event, arg) => {
  // console.log('====mian arg', arg);
  storage.set(arg.key, arg.value, function (error: any) {
    // event.reply('SET_JSON_STORAGE', `${storage.getDefaultDataPath()} && ${storage.getDataPath()}`);
    event.reply('SET_JSON_STORAGE', { error });
  });
});

ipcMain.on('GET_JSON_STORAGE', async (event, arg) => {
  storage.get(arg.key, function (error: any, data: any) {
    // console.log("==== get json", error, data)
    event.reply('GET_JSON_STORAGE', { error, data });
  });
});

// console.log("getDefaultDataPath", storage.getDefaultDataPath(), storage.getDataPath())
// const os = require('os');
// console.log("===", path)

// const setData = (key: string, data: any, options?: any) => {
//   return new Promise<any>((resolve, reject) => {
//     storage.set(key, data, options, function (error: any) {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };

// const getData = (key: string, options?: any) => {
//   return new Promise<any>((resolve, reject) => {
//     storage.get(key, options, function (error: any, data: any) {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };
