import { DownloadOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import Search from 'antd/lib/input/Search';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import ResultDailog from 'renderer/components/ResultDailog';
import StoreExcelCompare from 'renderer/store/StoreExcelCompare';
import StoreRoot from 'renderer/store/StoreRoot';
import './styles.scss';

export default function LuckySheet(props: any) {
  const [search, setSearch] = useState('');
  useEffect(() => {
    StoreRoot.init()
  }, []);

  const importExcel = () => {
    StoreRoot.excelInstance.importExcel()
  };
  const exportExcel = () => {
    StoreRoot.excelInstance.exportExcel()
  };

  const showReultDailog = (value: string) => {
    setSearch(value)
    if(!value) return;
    // StoreExcelCompare.toggleDailog(true);
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
      <div id={StoreRoot.excelId} className="content_excel"></div>

      <ResultDailog params={{search}}></ResultDailog>
    </Layout>
  );
}
