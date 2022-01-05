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
        defaultSelectedKeys={['2']}
      >
        <Menu.Item key="1" icon={<UserOutlined />}>
          三表勾稽
        </Menu.Item>
        <Menu.Item key="2" icon={<VideoCameraOutlined />}>
          科目筛选
        </Menu.Item>
        <Menu.Item key="3" icon={<UploadOutlined />}>
          风险提示
        </Menu.Item>
        <Menu.Item key="4" icon={<UserOutlined />}>
          word模板导出
        </Menu.Item>
        <Menu.Item key="5" icon={<UserOutlined />}>
          汇总导出
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
