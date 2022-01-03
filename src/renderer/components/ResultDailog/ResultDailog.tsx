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
    return disposer;
  }, []);

  const handleOk = () => {
    StoreExcelCompare.toggleDailog(false);
  };
  const handleCancel = () => {
    StoreExcelCompare.toggleDailog(false);
  };

  return (
    <div className={clsx('dailog_result', props.className)}>
      <Modal
        title="查询结果"
        visible={visible}
        centered
        className={clsx('el_dailog')}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <DailogExcel />
      </Modal>
    </div>
  );
}

function DailogExcel() {
  useEffect(() => {
    StoreExcelCompare.showResult();
  }, []);
  return <div id={StoreExcelCompare.resultExcelId} className='dailog_excel'></div>;
}
