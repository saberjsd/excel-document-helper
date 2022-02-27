import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import './App.scss';
import Home from './pages/Home';
import zhCN from 'antd/lib/locale/zh_CN';
import { ConfigProvider, Input, message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import JsonStorage from './store/JsonStorage';
import { JSON_PATH } from './constants';

const md5 = require('md5');
const getPass = ()=>{
  let now = moment().format('YYYY-MM')
  return md5(`${now}-email:1779144713@qq.com`)
}
const password = getPass()
// @ts-ignore
window["getPass"] = getPass;
let permissionCode = '';

export default function App() {
  const [permissioned, setPermissioned] = useState(false);

  const onChange = (e: any) => {
    permissionCode = e.target?.value;
  };
  const onOk = (close: any) => {
    // f4ec9eae0338bf494ba6d18ed461ca20
    // ba4301eab14cbe8acafe58f1950f57d7
    if (permissionCode === password) {
      message.success('验证通过！');
      savePermissionCode(password);
      close();
    } else {
      message.error('验证码不正确或者过期，请联系管理员获取！');
    }
  };
  const onCancel = (close: any) => {
    return false;
  };

  const getPermissionCode = () => {
    return JsonStorage.get(JSON_PATH.PASSWORD_STASH).then((data) => {
      permissionCode = data.password;
    });
  };
  const savePermissionCode = (code: any) => {
    return JsonStorage.set(JSON_PATH.PASSWORD_STASH, {
      password: code,
    }).catch(() => {});
  };
  const showConfirm = () => {
    Modal.confirm({
      title: '请输入正确验证码方可进入程序',
      content: (
        <>
          <Input placeholder="验证码" onChange={onChange} />
        </>
      ),
      keyboard: false,
      centered: true,
      className: "enter_confirm",
      // cancelText: '退出',
      onOk,
      onCancel,
    });
  };

  useEffect(() => {
    getPermissionCode()
      .then(() => {
        if (permissionCode === password) {
        } else {
          showConfirm();
        }
      })
      .catch(() => {
        showConfirm();
      });
  }, []);

  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
