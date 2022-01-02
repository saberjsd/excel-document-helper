import { useEffect, useState } from 'react';
import './styles.scss';
// import FTSpreadsheet from '@/components/ExcelEditor/Spreadsheet';
// import FTSpreadsheet from '@components/ExcelEditor/Spreadsheet';
// import { Button, Layout, Menu } from 'antd';
// import {
//   UploadOutlined,
//   UserOutlined,
//   VideoCameraOutlined,
//   VerticalAlignTopOutlined,
//   DownloadOutlined,
// } from '@ant-design/icons';
// import { Content, Footer, Header } from 'antd/lib/layout/layout';
// import Sider from 'antd/lib/layout/Sider';
import FTSpreadsheet from 'renderer/components/ExcelEditor/Spreadsheet';
import Layout from 'renderer/components/Layout';

export default function Home(props: any) {
  // const [excelInstance, setExcelInstance] = useState<any>();

  // useEffect(() => {
  //   if (!excelInstance) {
  //     const instance = new FTSpreadsheet(`#rootExcel`, {
  //       // showToolbar: false,
  //       // showGrid: true,
  //       // showContextmenu: true,
  //     });
  //     setExcelInstance(instance);
  //   }
  // }, []);

  // const importExcel = ()=>{
  //   if(excelInstance){
  //     excelInstance.importExcel()
  //   }
  // }

  return <Layout header={<div>15315</div>}></Layout>;
}
