import { Button, Modal } from 'antd';
import clsx from 'clsx';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreExcel from 'renderer/store/StoreExcel';

import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import './styles.scss';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import { FeatureType } from 'renderer/constants';

export default function ResultDailog(props: any) {
  const [visible, setVisible] = useState(false);
  const [fullScreen, setFullScreen] = useState(true);
  // 当前弹窗的类型
  const [featureType, setFeatureType] = useState<FeatureType>();
  // 风险同步按钮的loading
  const [riskLoading, setRiskLoading] = useState(false);
  // 筛选同步按钮的loading
  const [filterLoading, setFilterLoading] = useState(false);

  useEffect(() => {
    const disposer = autorun(() => {
      const { resultDialogVisible, resultType } = StoreExcel;
      setVisible(resultDialogVisible);
      setFeatureType(resultType);
    });

    return disposer;
  }, []);

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
    if (!fullScreen) {
      setTimeout(() => {
        StoreExcel.resultExcelInstance.resize();
      }, 200);
    }
  };
  const handleOk = () => {
    StoreExcel.toggleDailog(false);
  };
  const handleCancel = () => {
    StoreExcel.toggleDailog(false);
  };

  const exportExcel = () => {
    if (StoreExcel.resultExcelInstance) {
      StoreExcel.resultExcelInstance.downloadExcel();
    }
  };
  const exportCurrentExcel = () => {
    if (StoreExcel.resultExcelInstance) {
      StoreExcel.resultExcelInstance.downloadSheet();
    }
  };

  const saveRiskData = () => {
    setRiskLoading(true);
    setTimeout(() => {
      StoreExcel.saveRisk();
      setRiskLoading(false);
    });
  };

  const saveFilterData = () => {
    setFilterLoading(true);
    setTimeout(() => {
      StoreExcel.saveFilter();
      setFilterLoading(false);
    });
  };

  return (
    // <div className={clsx('result_dailog', props.className)}>
    <Modal
      className={clsx(
        'result_dailog_modal',
        props.className,
        fullScreen && 'full_screen'
      )}
      title={
        <>
          <div className="title_left">
            <span>查询结果</span>
          </div>
          <div className="title_right">
            {/* {fullScreen ? (
              <ShrinkOutlined onClick={toggleFullScreen} />
            ) : (
              <ArrowsAltOutlined onClick={toggleFullScreen} />
            )} */}

            {featureType === FeatureType.CHECK_RICK && (
              <Button
                type="primary"
                danger
                icon={<SyncOutlined />}
                onClick={saveRiskData}
                loading={riskLoading}
              >
                同步最新风险结果到序时账
              </Button>
            )}
            {featureType === FeatureType.FILTER_EXCEL && (
              <Button
                type="primary"
                danger
                icon={<DownloadOutlined />}
                onClick={saveFilterData}
                loading={filterLoading}
              >
                同步最新筛选结果到序时账
              </Button>
            )}

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportExcel}
            >
              导出整个表格
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportCurrentExcel}
            >
              导出当前sheet
            </Button>
          </div>
        </>
      }
      visible={visible}
      centered
      // destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ className: 'ok_btn' }}
      cancelButtonProps={{ className: 'cancel_btn' }}
      footer={null}
    >
      <DailogExcel />
    </Modal>
    // </div>
  );
}

function DailogExcel(props: any) {
  useEffect(() => {
    console.log(66666);
    EventBus.emit(EVENT_CONSTANT.DAILOG_RENDERED, true);
    StoreExcel.resultDialogRendered = true;
  }, []);
  return <div id={StoreExcel.resultExcelId} className="dailog_excel"></div>;
}
