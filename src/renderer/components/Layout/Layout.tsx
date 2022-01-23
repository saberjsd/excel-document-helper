import { Spin } from 'antd';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreRoot from 'renderer/store/StoreRoot';
import Content from '../Content';
import Header from '../Header';
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
        <Header>{props.header}</Header>
        <div className="layout_main">
          <Sidebar></Sidebar>
          <Content className={props.className}>{props.children}</Content>
        </div>
      </div>
    </Spin>
  );
}
