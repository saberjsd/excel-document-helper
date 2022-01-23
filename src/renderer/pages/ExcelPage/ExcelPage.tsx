import {
  DownloadOutlined,
  VerticalAlignTopOutlined,
  SearchOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import Search from 'antd/lib/input/Search';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import ResultDailog from 'renderer/components/ResultDailog';
import StoreExcel from 'renderer/store/StoreExcel';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import './styles.scss';

export default function Header(props: any) {
  useEffect(() => {
    StoreExcel.init();
    // const disposer = autorun(() => {});
    // return disposer;
  }, []);

  const importExcel = () => {
    if (StoreExcel.excelInstance) {
      StoreExcel.excelInstance.importExcel();
    }
  };
  const exportExcel = () => {
    if (StoreExcel.excelInstance) {
      StoreExcel.excelInstance.downloadExcel();
    }
  };
  const setStyles = () => {
    if (StoreExcel.excelInstance) {
      // StoreExcel.excelInstance.datas[0].addStyle({bgcolor: "#ff0000"});
      StoreExcel.excelInstance.setCellStyle(2, 2, 'bgcolor', '#ff0000', 0);
      // StoreExcel.excelInstance.setCellStyle(2,2,"color","#ff0000",0)
      // @ts-ignore
      StoreExcel.excelInstance.reRender();
    }
  };

  const showCompare = () => {
    StoreExcel.toggleDailog(true);
    StoreExcel.compareSheet()
  };
  const checkRisk = () => {
    StoreExcel.checkRisk()
    StoreExcel.toggleDailog(true);
  };

  const showReultDailog = (value: string) => {
    if (value){
      StoreExcel.getGroupExcel(value)
    }
    StoreExcel.toggleDailog(true);
  };

  return (
    <Layout
      className="excel_compare_page"
      header={
        <>
          <Button
            type="primary"
            icon={<VerticalAlignTopOutlined />}
            onClick={importExcel}
          >
            导入表格
          </Button>
          <Button danger type="primary" icon={<DownloadOutlined />} onClick={exportExcel}>
            导出表格
          </Button>
          <Button icon={<SearchOutlined />} onClick={showCompare}>
            查询勾稽结果
          </Button>
          <Button icon={<AlertOutlined />} onClick={checkRisk}>
            风险点排查
          </Button>
          <Search
            className="header_search"
            placeholder="请输入筛选“科目名称”"
            allowClear
            enterButton="筛选科目"
            size="middle"
            onSearch={showReultDailog}
          />
        </>
      }
    >
      <div id={StoreExcel.excelId} className="content_excel"></div>

      <ResultDailog />
    </Layout>
  );
}
