import clsx from 'clsx';
import { useEffect, useState } from 'react';
import './styles.scss';
import FTSpreadsheet from '@/components/ExcelEditor/Spreadsheet';
// import FTSpreadsheet from '@components/ExcelEditor/Spreadsheet';
import { Button, Layout, Menu } from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Content, Footer, Header } from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';

export default function Home(props) {
  const [excelInstance, setExcelInstance] = useState();

  useEffect(() => {
    if (!excelInstance) {
      const instance = new FTSpreadsheet(`#rootExcel`, {
        // showToolbar: false,
        // showGrid: true,
        // showContextmenu: true,
      });
      setExcelInstance(instance);
    }
  }, []);

  return (
    <Layout className="home_page">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="logo" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            nav 1
          </Menu.Item>
          <Menu.Item key="2" icon={<VideoCameraOutlined />}>
            nav 2
          </Menu.Item>
          <Menu.Item key="3" icon={<UploadOutlined />}>
            nav 3
          </Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>
            nav 4
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="page_right">
        <Header
          className="site-layout-sub-header-background"
          style={{ padding: 0 }}
        >
          <Button type="primary" icon={<DownloadOutlined />} />
          <Button type="primary" shape="circle" icon={<DownloadOutlined />} />
          <Button type="primary" shape="round" icon={<DownloadOutlined />} />
          <Button type="primary" shape="round" icon={<DownloadOutlined />}>
            Download
          </Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            Download
          </Button>
        </Header>
        <Content className="page_content">
          <div className="page_content_inner">
            <div id="rootExcel"></div>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}
