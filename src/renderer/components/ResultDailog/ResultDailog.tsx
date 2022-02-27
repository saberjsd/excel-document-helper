import { Button, Dropdown, Input, Menu, Modal, Select } from 'antd';
import clsx from 'clsx';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreExcel from 'renderer/store/StoreExcel';

import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import './styles.scss';
import EventBus, { EVENT_CONSTANT } from 'renderer/utils/EventBus';
import { FeatureType } from 'renderer/constants';
import { mapCol } from 'renderer/utils/utils';

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
      StoreExcel.resultExcelInstance.exportExcel();
    }
  };
  const exportCurrentExcel = () => {
    if (StoreExcel.resultExcelInstance) {
      StoreExcel.resultExcelInstance.exportSheet();
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

  const handleMenuClick = () => {};

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
                同步结果到序时账
              </Button>
            )}
            {featureType === FeatureType.FILTER_EXCEL && (
              <>
                <Button
                  type="primary"
                  danger
                  icon={<SyncOutlined />}
                  onClick={saveFilterData}
                  loading={filterLoading}
                >
                  同步结果到序时账和余额表
                </Button>
              </>
            )}

            {/* <Input.Group compact>
              <Input style={{ width: '120px' }} placeholder="科目名称" />
              <Select placeholder="金额列次">
                {mapCol.map((m) => (
                  <Select.Option value={m} key={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Button type="primary">排序</Button>
            </Input.Group> */}

            <Dropdown.Button
              type="primary"
              onClick={exportExcel}
              overlay={
                <Menu onClick={exportCurrentExcel}>
                  <Menu.Item key="1">导出当前sheet</Menu.Item>
                </Menu>
              }
            >
              导出表格
            </Dropdown.Button>

            {/* <Button
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
            </Button> */}
          </div>
        </>
      }
      visible={visible}
      centered
      destroyOnClose
      // forceRender
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
    requestAnimationFrame(() => {
      EventBus.emit(EVENT_CONSTANT.DAILOG_RENDERED, true);
    });
  }, []);
  return <div id={StoreExcel.resultExcelId} className="dailog_excel"></div>;
}
