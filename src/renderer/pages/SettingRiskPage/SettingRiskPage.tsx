import {
  DownloadOutlined,
  VerticalAlignTopOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { Button, List, message, Table } from 'antd';
import cuid from 'cuid';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreExcel from 'renderer/store/StoreExcel';
import { writeExcel } from 'renderer/utils/excelHelper';
import './styles.scss';

export default function SettingRiskPage(props: any) {
  const [riskConfig, setRiskConfig] = useState<any[]>([]);

  useEffect(() => {
    const disposer = autorun(() => {
      const { riskConfig } = StoreExcel;
      setRiskConfig(riskConfig);
    });

    StoreExcel.getRiskConfigList();

    return disposer;
  }, []);

  const uploadConfig = () => {
    StoreExcel.importRiskConfigList().then(() => {
      message.success('风险点配置配置已导入');
    });
  };

  const exportConfig = () => {
    writeExcel(StoreExcel.riskConfigSheets);
  };

  const columns = [
    {
      title: '科目关键字',
      dataIndex: 'findSubjectReg',
      key: 'findSubjectReg',
      render: (text: any) => <a>{text}</a>,
    },
    {
      title: '摘要关键字',
      dataIndex: 'findSummaryReg',
      key: 'findSummaryReg',
    },
    {
      title: '风险点',
      dataIndex: 'outText',
      key: 'outText',
    },
    // {
    //   title: 'Tags',
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   render: (tags:any) => (
    //     <>
    //       {tags.map((tag:any) => {
    //         let color = tag.length > 5 ? 'geekblue' : 'green';
    //         if (tag === 'loser') {
    //           color = 'volcano';
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {tag.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   ),
    // },
    // {
    //   title: 'Action',
    //   key: 'action',
    //   render: (text, record) => (
    //     <Space size="middle">
    //       <a>Invite {record.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
  ];

  const data = riskConfig.map((m) => {
    return {
      key: cuid(),
      ...m,
    };
  });

  return (
    <div className="setting_risk_page" hidden={props.hidden}>
      <div className="risk_head">
        <h3>风险点配置</h3>
        <div className="risk_head_right">
          <Button
            type="primary"
            danger
            icon={<VerticalAlignTopOutlined />}
            onClick={uploadConfig}
          >
            导入并更新风险点配置
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportConfig}
          >
            导出风险点配置
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={{
          position: ['bottomCenter'],
          showSizeChanger: true,
        }}
      />

      {/* <List
        itemLayout="horizontal"
        dataSource={riskConfig}
        bordered
        size="small"
        renderItem={(item) => (
          <List.Item
            actions={
              [
              ]
            }
          >
            <span className="mes_show">表头行数：{item.headRowNumber}</span>
            <span className="mes_show">内容行数：{item.bodyRows.length}</span>
          </List.Item>
        )}
      /> */}
    </div>
  );
}
