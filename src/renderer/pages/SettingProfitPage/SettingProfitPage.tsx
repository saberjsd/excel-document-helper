import {
  DownloadOutlined,
  VerticalAlignTopOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { Button, List, message } from 'antd';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreExcel from 'renderer/store/StoreExcel';
import { writeExcel } from 'renderer/utils/excelHelper';
import './styles.scss';

export default function SettingProfitPage(props: any) {
  const [compareConfig, setCompareConfig] = useState<any>({});

  useEffect(() => {
    const disposer = autorun(() => {
      const { compareConfig } = StoreExcel;
      setCompareConfig(compareConfig);
    });

    StoreExcel.getCompareConfigList();

    return disposer;
  }, []);

  const uploadConfig = () => {
    StoreExcel.importCompareConfigList().then(() => {
      message.success('三表勾稽 - 利润表取数展示配置已导入');
    });
  };

  const exportConfig = () => {
    writeExcel(StoreExcel.compareConfigSheets)
  };

  return (
    <div className="setting_profit_page" hidden={props.hidden}>
      <div className="profit_head">
        <h3>三表勾稽 - 利润表取数展示配置</h3>
        <div className='profit_head_right'>
          <Button
            type="primary"
            danger
            icon={<VerticalAlignTopOutlined />}
            onClick={uploadConfig}
          >
            导入并更新利润表配置
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportConfig}
          >
            导出利润表配置
          </Button>
        </div>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={[compareConfig]}
        bordered
        renderItem={(item) => (
          <List.Item
            actions={
              [
              ]
            }
          >
            <List.Item.Meta
              avatar={<FileExcelOutlined />}
              title={item.name}
              description={
                <>
                  <span className="mes_show">
                    表头行数：{item.headRowNumber}
                  </span>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
