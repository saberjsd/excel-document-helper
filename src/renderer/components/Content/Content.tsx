import { useEffect } from 'react';
import Header from '../Header';
import './styles.scss';

export default function Content(props: any) {
  useEffect(() => {}, []);

  return (
    <div className="page_content">
      <div className="page_content_inner">
        <div id="rootExcel"></div>
      </div>
    </div>
  );
}
