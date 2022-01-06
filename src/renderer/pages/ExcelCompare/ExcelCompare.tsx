import { DownloadOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Search from 'antd/lib/input/Search';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import ResultDailog from 'renderer/components/ResultDailog';
import StoreExcelCompare from 'renderer/store/StoreExcelCompare';
import './styles.scss';

export default function Header(props: any) {
  const [search, setSearch] = useState('');
  useEffect(() => {
    StoreExcelCompare.init();
    // const disposer = autorun(() => {});
    // return disposer;
  }, []);

  const importExcel = () => {
    if (StoreExcelCompare.excelInstance) {
      StoreExcelCompare.excelInstance.importExcel();
    }
  };
  const exportExcel = () => {
    if (StoreExcelCompare.excelInstance) {
      StoreExcelCompare.excelInstance.downExcel();
    }
  };
  const setStyles = () => {
    if (StoreExcelCompare.excelInstance) {
      // StoreExcelCompare.excelInstance.datas[0].addStyle({bgcolor: "#ff0000"});
      StoreExcelCompare.excelInstance.setCellStyle(
        2,
        2,
        'bgcolor',
        '#ff0000',
        0
      );
      // StoreExcelCompare.excelInstance.setCellStyle(2,2,"color","#ff0000",0)
      // @ts-ignore
      StoreExcelCompare.excelInstance.reRender();
    }
  };

  const showReultDailog = (value: string) => {
    setSearch(value)
    if(!value) return;
    StoreExcelCompare.toggleDailog(true);
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
          <Button icon={<DownloadOutlined />} onClick={exportExcel}>
            导出表格
          </Button>
          {/* <Button icon={<DownloadOutlined />} onClick={setStyles}>
            设置样式
          </Button> */}
          {/* <Button icon={<DownloadOutlined />} onClick={showReultDailog}>
            查询勾稽结果
          </Button> */}
          <Search
            className='header_search'
            placeholder="请输入筛选“科目名称”"
            allowClear
            enterButton="筛选科目"
            size="middle"
            onSearch={showReultDailog}
          />
        </>
      }
    >
      <div id={StoreExcelCompare.excelId} className="content_excel"></div>

      <ResultDailog params={{search}}></ResultDailog>
    </Layout>
  );
}
