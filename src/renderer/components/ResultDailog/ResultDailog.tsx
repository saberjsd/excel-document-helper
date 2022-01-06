import { Modal } from 'antd';
import clsx from 'clsx';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreExcelCompare from 'renderer/store/StoreExcelCompare';
import './styles.scss';

export default function ResultDailog(props: any) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const disposer = autorun(() => {
      const { resultDialogVisible } = StoreExcelCompare;
      setVisible(resultDialogVisible);
    });

    // StoreExcelCompare.showFilterResult(props.params)

    return disposer;
  }, []);

  const handleOk = () => {
    StoreExcelCompare.toggleDailog(false);
  };
  const handleCancel = () => {
    StoreExcelCompare.toggleDailog(false);
  };

  return (
    <div className={clsx('result_dailog', props.className)}>
      <Modal
        className={clsx('result_dailog_modal')}
        title="查询结果"
        visible={visible}
        centered
        destroyOnClose
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{className: "ok_btn"}}
        cancelButtonProps={{className: "cancel_btn"}}
      >
        <DailogExcel params={props.params}/>
      </Modal>
    </div>
  );
}

function DailogExcel(props:any) {
  useEffect(() => {
    // console.log(66666)
    StoreExcelCompare.showFilterResult(props.params)
  }, []);
  return <div id={StoreExcelCompare.resultExcelId} className='dailog_excel'></div>;
}
