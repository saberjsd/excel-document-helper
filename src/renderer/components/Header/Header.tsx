import {
  AlertOutlined,
  DownloadOutlined,
  SearchOutlined,
  VerticalAlignTopOutlined,
  HistoryOutlined,
  FilterOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { Button, Input, message, Select } from 'antd';
import Search from 'antd/lib/input/Search';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import { MENU } from 'renderer/constants';
import StoreExcel from 'renderer/store/StoreExcel';
import StoreRoot from 'renderer/store/StoreRoot';
import './styles.scss';
const { Option } = Select;

interface ItemProps {
  label: string;
  value: string;
}

export default function Header(props: any) {
  const [currentMenu, setCurrentMenu] = useState('');
  const [compareIsSum, setCompareIsSum] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const disposer = autorun(() => {
      const { currentMenu } = StoreRoot;
      const { compareIsSum, showDrawer } = StoreExcel;
      setCurrentMenu(currentMenu);
      setCompareIsSum(compareIsSum);
      setShowDrawer(showDrawer);
    });

    return disposer;
  }, []);

  const importExcel = () => {
    if (StoreExcel.excelInstance) {
      StoreExcel.excelInstance.importExcel();
    }
  };
  const exportExcel = () => {
    if (StoreExcel.excelInstance) {
      StoreExcel.excelInstance.exportExcel();
    }
  };

  // const setStyles = () => {
  //   if (StoreExcel.excelInstance) {
  //     // StoreExcel.excelInstance.datas[0].addStyle({bgcolor: "#ff0000"});
  //     StoreExcel.excelInstance.setCellStyle(2, 2, 'bgcolor', '#ff0000', 0);
  //     // StoreExcel.excelInstance.setCellStyle(2,2,"color","#ff0000",0)
  //     // @ts-ignore
  //     StoreExcel.excelInstance.reRender();
  //   }
  // };
  const sumChange = (item: any) => {
    // console.log(item);
    StoreExcel.compareIsSum = item;
  };

  const showCompare = () => {
    // StoreExcel.toggleDailog(true);
    StoreExcel.compareSheet();
    message.success('三表勾稽结果已经写入利润表');
  };

  const checkRisk = () => {
    StoreExcel.checkRisk();
    // StoreExcel.toggleDailog(true);
  };

  const showFilter = () => {
    StoreExcel.showResultSheet();
  };

  const openDrawer = () => {
    if (StoreExcel.excelInstance.getSheetByName('序时账')) {
      StoreExcel.showDrawer = true;
      StoreExcel.getFliterOptions();
      StoreExcel.updateHeadColOptions();
    } else {
      message.error('请先导入序时账表格数据！');
    }
  };
  const toggleDrawer = () => {
    if (StoreExcel.showDrawer) {
      StoreExcel.showDrawer = false;
    } else {
      openDrawer();
    }
  };

  const addOppositeSubject = () => {
    StoreExcel.addOppositeSubject();
    message.success('对方科目已生成在序时账“L”列！');
  };

  return (
    <header className="header_page">
      <div className="heder_left"></div>
      <div className="heder_right">
        {currentMenu === MENU.EXCEL_BOARD && (
          <>
            <Button
              type="primary"
              icon={<VerticalAlignTopOutlined />}
              onClick={importExcel}
            >
              导入表格
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportExcel}
            >
              导出表格
            </Button>

            <Select
              value={compareIsSum}
              // style={{ width: 128 }}
              onChange={sumChange}
            >
              <Option value={0}>序时账-未汇总</Option>
              <Option value={1}>序时账-已汇总</Option>
            </Select>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={showCompare}
            >
              三表勾稽
            </Button>

            <Button type="primary" icon={<AlertOutlined />} onClick={checkRisk}>
              风险点排查
            </Button>

            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={openDrawer}
            >
              科目筛选
            </Button>
            <Button
              type="primary"
              icon={<SwitcherOutlined />}
              onClick={addOppositeSubject}
            >
              生成对方科目
            </Button>

            <Button
              // type="primary"
              icon={<HistoryOutlined />}
              onClick={() => showFilter()}
              // style={{ marginRight: 16 }}
            >
              查看历史
            </Button>

            {/* <Search
              className="header_search"
              placeholder="请输入筛选“科目名称”"
              allowClear
              enterButton="筛选科目"
              size="middle"
              onSearch={(val)=>showFilter([val])}
            /> */}
          </>
        )}
      </div>
      <Button
        className="mini_drawer_btn"
        type="primary"
        icon={showDrawer ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
        onClick={toggleDrawer}
      >
        {/* {showDrawer ? '点击收起' : '点击展开'} */}
      </Button>
    </header>
  );
}
