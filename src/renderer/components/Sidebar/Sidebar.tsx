import {
  LeftOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  TableOutlined,
  SettingOutlined,
  SnippetsOutlined,
  ToolOutlined,
  FilterOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import Sider from 'antd/lib/layout/Sider';
import clsx from 'clsx';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import { FeatureType, MENU } from 'renderer/constants';
import StoreExcel from 'renderer/store/StoreExcel';
import StoreRoot from 'renderer/store/StoreRoot';
import './styles.scss';

export default function Sidebar(props: any) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('');

  useEffect(() => {
    const disposer = autorun(() => {
      const { currentMenu } = StoreRoot;
      setCurrentMenu(currentMenu);
    });
    return disposer;
  }, []);

  const resize = () => {
    setTimeout(() => {
      if (StoreRoot.currentMenu === MENU.EXCEL_BOARD) {
        StoreExcel.excelInstance.resize();
      }
    }, 200);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    resize();
  };
  const selectMenu = ({ key }: any) => {
    StoreRoot.currentMenu = key;
    resize();
    // if(key === MENU.EXCEL_FILTER){
    //   StoreExcel.getFliterOptions()
    // }
  };

  return (
    <Sider
      className="sidebar_page"
      trigger={null}
      collapsible
      collapsedWidth={0}
      collapsed={collapsed}
    >
      <div
        className={clsx('collapse_btn', collapsed && 'collapsed')}
        onClick={toggleCollapse}
      >
        <LeftOutlined />
      </div>

      <Menu
        className="sidebar_menu"
        theme="dark"
        mode="inline"
        selectedKeys={[currentMenu]}
        // defaultOpenKeys={['excel', 'word', 'settings']}
        // defaultSelectedKeys={['2']}
        onClick={selectMenu}
      >
        {/* <Menu.SubMenu key="excel" icon={<AppstoreOutlined />} title="表格操作"> */}
        <Menu.Item key={MENU.EXCEL_BOARD} icon={<TableOutlined />}>
          表格操作
        </Menu.Item>
        <Menu.Item key={MENU.FILE_HISTORY} icon={<HistoryOutlined />}>
          文件记录
        </Menu.Item>
        {/* <Menu.Item key={MENU.EXCEL_FILTER} icon={<FilterOutlined />}>
          科目筛选
        </Menu.Item> */}
        {/* <Menu.Item key="excel_1" icon={<UserOutlined />}>
          三表勾稽
        </Menu.Item>
        <Menu.Item key="excel_2" icon={<VideoCameraOutlined />}>
          科目筛选
        </Menu.Item>
        <Menu.Item key="excel_3" icon={<UploadOutlined />}>
          风险提示
        </Menu.Item>
        <Menu.Item key="excel_4" icon={<UserOutlined />}>
          汇总导出
        </Menu.Item> */}
        {/* </Menu.SubMenu> */}

        {/* <Menu.SubMenu key="word" icon={<AppstoreOutlined />} title="word操作"> */}

        {/* </Menu.SubMenu> */}

        {/* <Menu.SubMenu key="settings" icon={<AppstoreOutlined />} title="设置"> */}
        <Menu.Item key={MENU.SETTINGS_PROFIT} icon={<SettingOutlined />}>
          利润表设置
        </Menu.Item>
        <Menu.Item key={MENU.SETTINGS_RISK} icon={<ToolOutlined />}>
          风险点设置
        </Menu.Item>
        <Menu.Item key={MENU.WORD_EXPORT} icon={<SnippetsOutlined />}>
          word模板导出
        </Menu.Item>
        {/* </Menu.SubMenu> */}
      </Menu>
    </Sider>
  );
}
