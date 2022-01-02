import { DownloadOutlined, VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect } from 'react';
import './styles.scss';

export default function Header(props: any) {
  return (
    <header className="header_page">
      <div className="heder_left"></div>
      <div className="heder_right">{props.children}</div>
    </header>
  );
}
