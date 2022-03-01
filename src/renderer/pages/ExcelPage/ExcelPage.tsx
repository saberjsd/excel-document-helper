import { Button, Drawer, Input, Select, Space } from 'antd';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import StoreExcel from 'renderer/store/StoreExcel';
import './styles.scss';
import {
  HistoryOutlined,
  SearchOutlined,
  PlusOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
} from '@ant-design/icons';
import { mapCol } from 'renderer/utils/utils';
import cuid from 'cuid';
import SearchSelect from 'renderer/components/SearchSelect';
const { Option } = Select;

interface ItemProps {
  label: string;
  value: string;
}

export default function ExcelPage(props: any) {
  const [showDrawer, setShowDrawer] = useState(false);
  const [filterKeys, setFilterKeys] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<ItemProps[]>([]);
  const [filterColConfig, setFilterColConfig] = useState<any[]>([]);
  const [headColOptions, setHeadColOptions] = useState<any[]>([]);

  useEffect(() => {
    StoreExcel.init();
    const disposer = autorun(() => {
      const {
        showDrawer,
        filterOptions,
        filterKeys,
        filterColConfig,
        headColOptions,
      } = StoreExcel;
      setShowDrawer(showDrawer);
      setFilterOptions(filterOptions);
      setFilterKeys(filterKeys);
      setFilterColConfig(filterColConfig);
      setHeadColOptions(headColOptions);
    });

    return disposer;
  }, []);

  const onClose = () => {
    StoreExcel.showDrawer = false;
  };
  const onResize = () => {
    StoreExcel.showDrawer = !StoreExcel.showDrawer;
  };

  const showFilter = (filterKeys: string[]) => {
    StoreExcel.filterExcel(filterKeys);
    // if (filterKeys && filterKeys.length) {
    // } else {
    //   StoreExcel.showResultSheet();
    // }
    // StoreExcel.toggleDailog(true);
  };

  const addFilterConfig = () => {
    StoreExcel.addFilterConfig();
  };
  const deleteFilterConfig = (key: string) => {
    StoreExcel.deleteFilterConfig(key);
  };
  const changeFilterConfig = (prams: any) => {
    StoreExcel.changeFilterConfig(prams);
  };

  return (
    <>
      <div
        hidden={props.hidden}
        id={StoreExcel.excelId}
        className="content_excel"
      ></div>

      {/* <Button
        className="mini_drawer_btn"
        type="primary"
        icon={showDrawer ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
        onClick={() => onResize()}
      >
        {showDrawer ? '点击收起' : '点击展开'}
      </Button> */}

      <Drawer
        title={'筛选条件设置'}
        width="50%"
        placement="right"
        size="large"
        onClose={onClose}
        visible={showDrawer}
        extra={
          <Space>
            {/* <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onClose}>
              OK
            </Button> */}
            {/* <Button
              type="primary"
              icon={<HistoryOutlined />}
              onClick={() => showFilter([])}
              style={{ marginRight: 16 }}
            >
              查看历史结果
            </Button> */}
            <Button
              type="primary"
              danger
              icon={<SearchOutlined />}
              onClick={() => showFilter(StoreExcel.filterKeys)}
            >
              点击筛选
            </Button>
          </Space>
        }
      >
        <div className="filter_wrap">
          <div className="filter_wrap_line">
            <span className="btn_label">科目名称：</span>
            <SearchSelect
              className="filter_select_key"
              mode="multiple"
              value={filterKeys}
              options={filterOptions}
              onChange={(newValue: string[]) => {
                // setFilterKeys(newValue);
                StoreExcel.filterKeys = newValue;
              }}
              placeholder="输入或者选择筛选条件"
              // maxTagCount="responsive"
              // getPopupContainer={(triggerNode: any) =>
              //   triggerNode && triggerNode.parentNode
              // }
            />
          </div>
          <div className="filter_wrap_line">
            <Input.Group compact>
              <span className="btn_label">排序方式：</span>
              <Select
                onChange={(val) => (StoreExcel.filterSortCol = val)}
                allowClear
                placeholder="请选择金额列次"
                style={{ width: '160px' }}
                // getPopupContainer={(triggerNode) =>
                //   triggerNode && triggerNode.parentNode
                // }
              >
                {headColOptions.map((m) => (
                  <Select.Option value={m.value} key={m.value}>
                    {m.label}
                  </Select.Option>
                ))}
              </Select>
            </Input.Group>
          </div>
          {/* ----------------- */}
          {filterColConfig.map((j, k) => (
            <div className="filter_wrap_line" key={j.key}>
              <Input.Group compact>
                <Select
                  value={j.col}
                  onChange={(val) =>
                    changeFilterConfig({
                      key: j.key,
                      findKey: 'col',
                      value: val,
                    })
                  }
                  allowClear
                  placeholder="筛选列次"
                  style={{ width: '160px' }}
                  // getPopupContainer={(triggerNode) =>
                  //   triggerNode && triggerNode.parentNode
                  // }
                >
                  {headColOptions.map((m) => (
                    <Select.Option value={m.value} key={m.value}>
                      {m.label}
                    </Select.Option>
                  ))}
                </Select>
                <span className="btn_gap">包含</span>
                <Input
                  value={j.value}
                  onChange={(e) =>
                    changeFilterConfig({
                      key: j.key,
                      findKey: 'value',
                      value: e.target?.value,
                    })
                  }
                  allowClear
                  style={{ width: '160px' }}
                  placeholder="关键词"
                />
                <Button
                  danger
                  onClick={() => deleteFilterConfig(j.key)}
                  style={{ marginLeft: '8px' }}
                >
                  删除
                </Button>
              </Input.Group>
            </div>
          ))}
          <div className="filter_wrap_line">
            <Button
              onClick={addFilterConfig}
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
            >
              增加筛选条件
            </Button>
          </div>
          <div className="filter_wrap_line"></div>
          <div className="filter_wrap_line"></div>
          <div className="filter_wrap_line"></div>
        </div>
      </Drawer>
    </>
  );
}
