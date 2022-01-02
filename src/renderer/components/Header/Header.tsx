import { DownloadOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect } from 'react';
import './styles.scss';

export default function Header(props: any) {
  useEffect(() => {}, []);

  const importExcel = () => {
    // if(excelInstance){
    //   excelInstance.importExcel()
    // }
  };

  return (
    <header className="header_page">
      <div className="heder_left"></div>
      <div className="heder_right">
        <Button
          type="primary"
          shape="round"
          icon={<VerticalAlignTopOutlined />}
          onClick={importExcel}
        >
          Import Excel
        </Button>
        <Button type="primary" icon={<DownloadOutlined />}>
          Export Excel
        </Button>
        {props.children}
      </div>
    </header>
  );
}
