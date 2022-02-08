import { ipcMain } from "electron";

const MyPromise = require('bluebird');
const JsonStorage = MyPromise.promisifyAll(require('electron-json-storage'));
// const JsonStorage = require('electron-json-storage');
// console.log("getDefaultDataPath",JsonStorage.getDefaultDataPath())

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('SET_JSON_STORAGE', async (event, arg) => {
  console.log("====mian arg", arg)
  // JsonStorage.setSync("")
  await new Promise((resolve)=>setTimeout(resolve,1000))
  event.reply('SET_JSON_STORAGE', arg);
});
