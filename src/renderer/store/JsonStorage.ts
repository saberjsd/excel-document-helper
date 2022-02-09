import { isEmpty } from "lodash";

// set json storage
class JsonStorage {
  set(key: string, value: any) {
    return new Promise<void>((resolve, reject) => {
      // @ts-ignore
      window.electron.ipcRenderer.once('SET_JSON_STORAGE', (res) => {
        // console.log('====render res', res);
        if (!res.error) {
          resolve();
        } else {
          reject();
        }
      });
      // @ts-ignore
      window.electron.ipcRenderer.emit('SET_JSON_STORAGE', { key, value });
    });
  }

  get(key: string) {
    return new Promise<any>((resolve, reject) => {
      // @ts-ignore
      window.electron.ipcRenderer.once('GET_JSON_STORAGE', (res) => {
        if (!res.error && !isEmpty(res.data)) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
      // @ts-ignore
      window.electron.ipcRenderer.emit('GET_JSON_STORAGE', { key });
    });
  }
}

export default new JsonStorage();
