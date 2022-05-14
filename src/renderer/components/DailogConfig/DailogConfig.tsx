import { Modal, Select } from 'antd';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import { ISheetConfig } from 'renderer/constants';
import StoreExcel from 'renderer/store/StoreExcel';
import './styles.scss';


export default function DailogConfig(props: any) {

  const handleOk = () => {
    StoreExcel.sheetConfigDailogVisible = false;
    StoreExcel.ganerateCollectionList();
  };
  const handleCancel = () => {
    StoreExcel.sheetConfigDailogVisible = false;
  };

  const selectConfig = (key: keyof ISheetConfig, value) => {
    StoreExcel.setSeetConfig(key, value);
  };

  const Wrap = observer(() => {
    console.log('+++++ Wrap render');
    const sheetOptions = StoreExcel.getSheetList();

    return (
      <Modal
        className={clsx(
          'dailog_config',
          props.className
        )}
        title="工作表配置"
        visible={StoreExcel.sheetConfigDailogVisible}
        centered
        destroyOnClose
        // forceRender
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ className: 'ok_btn' }}
        cancelButtonProps={{ className: 'cancel_btn' }}
        // footer={null}
      >
        <div className="dailog_config_content">
          {/* <div className="wrap_line">
            <div className="wrap_line_label"></div>
            <div className="wrap_line_input"></div>
          </div> */}
          <div className="wrap_line">
            <div className="wrap_line_label">底稿：</div>
            <div className="wrap_line_input">
              <Select
                value={StoreExcel.sheetConfig['collectionBase']}
                onChange={(val) => selectConfig('collectionBase', val)}
                allowClear
                placeholder="选择底稿"
                style={{ width: '100%' }}
              >
                {sheetOptions.map((m, n) => (
                  <Select.Option value={m.cid} key={m.cid}>
                    {m.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="wrap_line">
            <div className="wrap_line_label">底稿封面：</div>
            <div className="wrap_line_input">
              <Select
                value={StoreExcel.sheetConfig['collectionCover']}
                onChange={(val) => selectConfig('collectionCover', val)}
                allowClear
                placeholder="选择底稿封面"
                style={{ width: '100%' }}
              >
                {sheetOptions.map((m, n) => (
                  <Select.Option value={m.cid} key={m.cid}>
                    {m.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="wrap_line">
            <div className="wrap_line_label">辅助帐：</div>
            <div className="wrap_line_input">
              <Select
                value={StoreExcel.sheetConfig['collectionList']}
                onChange={(val) => selectConfig('collectionList', val)}
                allowClear
                placeholder="选择辅助帐"
                style={{ width: '100%' }}
              >
                {sheetOptions.map((m, n) => (
                  <Select.Option value={m.cid} key={m.cid}>
                    {m.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
          <div className="wrap_line">
            <div className="wrap_line_label">辅助账汇总表：</div>
            <div className="wrap_line_input">
              <Select
                value={StoreExcel.sheetConfig['collectionTotal']}
                onChange={(val) => selectConfig('collectionTotal', val)}
                allowClear
                placeholder="选择辅助账汇总表"
                style={{ width: '100%' }}
              >
                {sheetOptions.map((m, n) => (
                  <Select.Option value={m.cid} key={m.cid}>
                    {m.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Modal>
    );
  });

  console.log('+++++DialogConfig render');
  return <Wrap />;
}
