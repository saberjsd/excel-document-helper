import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  VerticalAlignTopOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import { useEffect } from 'react';
import './styles.scss';

export default function Sidebar(props: any) {
  useEffect(() => {}, []);

  return (
    <Sider
      className="sidebar_page"
      // breakpoint="lg"
      // collapsedWidth="0"
      onBreakpoint={(broken) => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
    >
      <Menu
        className="sidebar_menu"
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['4']}
      >
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
  );
}
