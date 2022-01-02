import clsx from 'clsx';
import { useEffect } from 'react';
import './styles.scss';

export default function Content(props: any) {
  useEffect(() => {}, []);

  return (
    <div className={clsx('page_content', props.className)}>
      <div className="page_content_inner">
        {props.children}
        {/* <div id="rootExcel"></div> */}
      </div>
    </div>
  );
}
