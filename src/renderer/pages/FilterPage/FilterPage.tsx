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

export default function FilterPage(props: any) {
  const [compareConfig, setCompareConfig] = useState<any[]>([]);

  useEffect(() => {
    const disposer = autorun(() => {
      // const { compareConfig } = StoreExcel;
      // setCompareConfig(compareConfig);
    });

    // StoreExcel.getCompareConfigList();

    return disposer;
  }, []);

  const uploadConfig = () => {
    // StoreExcel.importCompareConfigList().then(() => {
    //   message.success('三表勾稽 - 利润表取数展示配置已导入');
    // });
  };

  const exportConfig = () => {
    // writeExcel(StoreExcel.compareConfigSheets)
  };

  return (
    <div className="filter_page" hidden={props.hidden}>
      <div className="filter_head">
        <h3>科目筛选 - 配置</h3>
        <div className='filter_head_right'>
          <Button
            type="primary"
            danger
            icon={<VerticalAlignTopOutlined />}
            onClick={uploadConfig}
          >
            导入并更新配置
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportConfig}
          >
            导出配置
          </Button>
        </div>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={compareConfig}
        bordered
        renderItem={(item) => (
          <List.Item
            actions={
              [
                // <a key="list-loadmore-edit">查看</a>,
                // <a key="list-loadmore-more">删除</a>,
              ]
            }
          >
            <List.Item.Meta
              avatar={<FileExcelOutlined />}
              title={item.name}
              description={
                <>
                  <span className="mes_show">
                    {/* 表头行数：{item.headRowNumber} */}
                  </span>
                  {/* <span className="mes_show">
                    内容行数：{item.bodyRows.length}
                  </span> */}
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
