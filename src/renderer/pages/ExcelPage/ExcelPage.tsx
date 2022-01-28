import {
  DownloadOutlined,
  VerticalAlignTopOutlined,
  SearchOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { Button, message, Select } from 'antd';
import Search from 'antd/lib/input/Search';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import ResultDailog from 'renderer/components/ResultDailog';
import StoreExcel from 'renderer/store/StoreExcel';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import './styles.scss';
const { Option } = Select;

export default function ExcelPage(props: any) {
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

  const compareChange = (item:any) => {
    console.log(item);
  };
  const showCompare = () => {
    // StoreExcel.toggleDailog(true);
    StoreExcel.compareSheet();
    message.success('三表勾稽结果已经写入利润表');
  };

  const checkRisk = () => {
    StoreExcel.checkRisk();
    StoreExcel.toggleDailog(true);
  };

  const showReultDailog = (value: string) => {
    if (value) {
      StoreExcel.getGroupExcel(value);
    } else {
      // 没有输入不处理
      return;
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
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportExcel}
          >
            导出表格
          </Button>

          <Select
            defaultValue="jack"
            style={{ width: 258 }}
            onChange={compareChange}
          >
            <Option value="jack">利润表-适用于已执行新金融准则</Option>
            <Option value="lucy">利润表-适用于未执行新金融准则等</Option>
          </Select>
          <Select
            defaultValue="notSum"
            // style={{ width: 128 }}
            onChange={compareChange}
          >
            <Option value="notSum">序时账-未汇总</Option>
            <Option value="isSum">序时账-已汇总</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={showCompare}>
            三表勾稽
          </Button>

          <Button type="primary" icon={<AlertOutlined />} onClick={checkRisk}>
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
