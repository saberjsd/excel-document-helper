import { Spin } from 'antd';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreRoot from 'renderer/store/StoreRoot';
import Content from '../Content';
import DailogConfig from '../DailogConfig';
import Header from '../Header';
import ResultDailog from '../ResultDailog';
import Sidebar from '../Sidebar';
import './styles.scss';

export default function Layout(props: any) {
  const [rootLoading, setRootLoading] = useState(false);

  useEffect(() => {
    const disposer = autorun(() => {
      const { rootLoading } = StoreRoot;
      setRootLoading(rootLoading);
    });

    return disposer;
  }, []);

  return (
    <Spin className="" spinning={rootLoading}>
      <div className="layout_page">
        <Header></Header>
        <div className="layout_main">
          <Sidebar></Sidebar>
          <Content></Content>
        </div>

        <ResultDailog />
        <DailogConfig />
      </div>
    </Spin>
  );
}
