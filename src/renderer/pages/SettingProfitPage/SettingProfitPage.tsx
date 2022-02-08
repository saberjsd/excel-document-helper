import {
  DownloadOutlined,
  VerticalAlignTopOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { Button, List } from 'antd';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import JsonStorage from 'renderer/store/JsonStorage';
import StoreExcel from 'renderer/store/StoreExcel';
import './styles.scss';

export default function SettingProfitPage(props: any) {
  const [compareConfig, setCompareConfig] = useState<any[]>([]);

  useEffect(() => {
    const disposer = autorun(() => {
      const { compareConfig } = StoreExcel;
      setCompareConfig(compareConfig);
    });

    StoreExcel.getCompareConfigList();

    return disposer;
  }, []);

  const uploadConfig = () => {
    JsonStorage.set('userConfig', { name: 'aaaaaaaabbbb' }).then(() => {
      JsonStorage.get('userConfig').then((res) => {
        console.log('==== read res', res);
      }).catch(error=>{
        console.log('==== read error', error);
      })
    });
  };

  return (
    <div className="setting_profit_page" hidden={props.hidden}>
      <div className="profit_head">
        <h3>三表勾稽 - 利润表取数展示配置</h3>

        <Button
          type="primary"
          icon={<VerticalAlignTopOutlined />}
          onClick={uploadConfig}
        >
          导入利润表配置
        </Button>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={compareConfig}
        bordered
        renderItem={(item) => (
          <List.Item
            actions={[
              <a key="list-loadmore-edit">查看</a>,
              <a key="list-loadmore-more">删除</a>,
            ]}
          >
            <List.Item.Meta
              avatar={<FileExcelOutlined />}
              title={item.name}
              description={
                <>
                  <span className="mes_show">
                    表头行数：{item.headRowNumber}
                  </span>
                  <span className="mes_show">
                    内容行数：{item.bodyRows.length}
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
