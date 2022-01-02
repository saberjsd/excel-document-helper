import { DownloadOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import StoreExcelCompare from 'renderer/store/StoreExcelCompare';
import './styles.scss';

export default function Header(props: any) {
  const [userName, setUserName] = useState('');
  useEffect(() => {
    StoreExcelCompare.init();
    const disposer = autorun(() => {});

    return disposer;
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

  return (
    <Layout
      className="excel_compare_page"
      header={
        <div>
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
        </div>
      }
    >
      <div id={StoreExcelCompare.excelId} className="content_excel"></div>
    </Layout>
  );
}
