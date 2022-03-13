import { Button, Card, Drawer, Input, Select, Space, Switch } from 'antd';
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
  DeleteOutlined,
} from '@ant-design/icons';
import { mapCol } from 'renderer/utils/utils';
import cuid from 'cuid';
import SearchSelect from 'renderer/components/SearchSelect';
import { FilterItem, FilterList } from 'renderer/type';
import { SORT_DIRECTION } from 'renderer/constants';
const { Option } = Select;

interface ItemProps {
  label: string;
  value: string;
}

const filterSortOptions = [
  {
    label: '降序',
    value: SORT_DIRECTION.DESC,
  },
  {
    label: '升序',
    value: SORT_DIRECTION.ASC,
  },
];

const filterTypeOptions = [
  {
    label: '包含',
    value: 'includes',
  },
  {
    label: '全字匹配',
    value: 'equal',
  },
  {
    label: '非空',
    value: 'notEmpty',
  },
];

const filterRelationOptions = [
  {
    label: '并且',
    value: 'and',
  },
  {
    label: '或者',
    value: 'or',
  },
];

const filterDirectionOptions = [
  {
    label: '借方',
    value: 'debit',
  },
  {
    label: '贷方',
    value: 'credit',
  },
];

export default function ExcelPage(props: any) {
  const [showDrawer, setShowDrawer] = useState(false);
  // const [filterKeys, setFilterKeys] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<ItemProps[]>([]);
  // const [filterSubjectIdKeys, setFilterSubjectIdKeys] = useState<any[]>([]);
  const [filterSubjectIdOptions, setFilterSubjectIdOptions] = useState<
    ItemProps[]
  >([]);
  const [filterColConfig, setFilterColConfig] = useState<FilterList[]>([]);
  const [headColOptions, setHeadColOptions] = useState<any[]>([]);
  const [filterCompare, setfilterCompare] = useState(true);
  const [filterSortDirection, setFilterSortDirection] = useState(
    SORT_DIRECTION.DESC
  );

  useEffect(() => {
    StoreExcel.init();
    const disposer = autorun(() => {
      const {
        showDrawer,
        filterOptions,
        // filterKeys,
        filterColConfig,
        // filterSubjectIdKeys,
        filterSubjectIdOptions,
        headColOptions,
        filterCompare,
        filterSortDirection,
      } = StoreExcel;
      setShowDrawer(showDrawer);
      setFilterOptions(filterOptions);
      // setFilterKeys(filterKeys);
      setFilterSubjectIdOptions(filterSubjectIdOptions);
      // setFilterSubjectIdKeys(filterSubjectIdKeys);
      setFilterColConfig(filterColConfig);
      setHeadColOptions(headColOptions);
      setfilterCompare(filterCompare);
      setFilterSortDirection(filterSortDirection);
    });

    return disposer;
  }, []);

  const onClose = () => {
    StoreExcel.showDrawer = false;
  };
  const onResize = () => {
    StoreExcel.showDrawer = !StoreExcel.showDrawer;
  };

  const showFilter = () => {
    StoreExcel.filterExcel();
    // StoreExcel.toggleDailog(true);
  };

  const addFilterGroup = () => {
    StoreExcel.addFilterGroup();
  };
  const addFilterConfig = (groupId: string) => {
    StoreExcel.addFilterConfig(groupId);
  };
  const deleteFilterGroup = (groupId: string) => {
    StoreExcel.deleteFilterGroup(groupId);
  };
  const deleteFilterConfig = (groupId: string, key: string) => {
    StoreExcel.deleteFilterConfig(groupId, key);
  };
  const changeFilterGroup = (prams: any) => {
    StoreExcel.changeFilterGroup(prams);
  };
  const changeFilterConfig = (prams: any) => {
    StoreExcel.changeFilterConfig(prams);
  };
  const onSwitchChange = (val: any) => {
    StoreExcel.filterCompare = val;
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
            <Button
              type="primary"
              danger
              icon={<SearchOutlined />}
              onClick={() => showFilter()}
            >
              点击筛选
            </Button>
          </Space>
        }
      >
        <div className="filter_wrap">
          <div className="filter_wrap_line">
            <span className="btn_label">是否对比高亮异常的借贷金额：</span>
            <Switch
              checked={filterCompare}
              checkedChildren="是"
              unCheckedChildren="否"
              onChange={onSwitchChange}
            />
          </div>
          {/* <div className="filter_wrap_line">
            <span className="btn_label">是否去掉金额为空的组：</span>
            <Switch
              checked={filterCompare}
              checkedChildren="是"
              unCheckedChildren="否"
              onChange={onSwitchChange}
            />
          </div> */}
          <div className="filter_wrap_line">
            <Input.Group compact>
              <span className="btn_label">排序方式：</span>
              <Select
                onChange={(val) => (StoreExcel.filterSortCol = val)}
                allowClear
                placeholder="请选择金额列次"
                style={{ width: '160px' }}
              >
                {headColOptions.map((m) => (
                  <Select.Option value={m.value} key={m.value}>
                    {m.label}
                  </Select.Option>
                ))}
              </Select>
              <Select
                placeholder="排序方向"
                value={filterSortDirection}
                onChange={(val) => (StoreExcel.filterSortDirection = val)}
              >
                {filterSortOptions.map((m) => (
                  <Select.Option value={m.value} key={m.value}>
                    {m.label}
                  </Select.Option>
                ))}
              </Select>
            </Input.Group>
          </div>
          <div className="filter_wrap_line">
            <span className="btn_label">组内筛选条件：</span>
          </div>
          {filterColConfig.map((item) => (
            <Card
              key={item.groupId}
              size="small"
              className="filter_card"
              title={
                <>
                  {/* <Select
                      placeholder="条件"
                      defaultValue="or"
                      onChange={(val) =>
                        changeFilterGroup({
                          findKey: 'relation',
                          value: val,
                          groupId: item.groupId,
                        })
                      }
                    >
                      {filterRelationOptions.map((m) => (
                        <Select.Option value={m.value} key={m.value}>
                          {m.label}
                        </Select.Option>
                      ))}
                    </Select> */}
                  <span>行内筛选条件</span>
                </>
              }
              extra={
                <>
                  <Button
                    onClick={() => addFilterConfig(item.groupId)}
                    type="primary"
                    icon={<PlusOutlined />}
                  >
                    增加行内筛选条件
                  </Button>
                  <Button
                    style={{ marginLeft: 12 }}
                    onClick={() => deleteFilterGroup(item.groupId)}
                    danger
                    icon={<DeleteOutlined />}
                  >
                    删除当前所有行内筛选条件
                  </Button>
                </>
              }
            >
              <div className="filter_wrap_line">
                <span className="btn_label">科目代码：</span>
                <SearchSelect
                  className="filter_select_key"
                  mode="multiple"
                  value={item.filterSubjectIdKeys}
                  options={filterSubjectIdOptions}
                  onChange={(newValue: string[]) => {
                    changeFilterGroup({
                      findKey: 'filterSubjectIdKeys',
                      value: newValue,
                      groupId: item.groupId,
                    });
                  }}
                  placeholder="输入或者选择筛选条件"
                />
              </div>
              <div className="filter_wrap_line">
                <span className="btn_label">科目名称：</span>
                <SearchSelect
                  className="filter_select_key"
                  mode="multiple"
                  value={item.filterKeys}
                  options={filterOptions}
                  onChange={(newValue: string[]) => {
                    changeFilterGroup({
                      findKey: 'filterKeys',
                      value: newValue,
                      groupId: item.groupId,
                    });
                  }}
                  placeholder="输入或者选择筛选条件"
                />
              </div>
              {/* ----------------- */}
              {item.children.length > 0 &&
                item.children.map((j, k) => (
                  <div className="filter_wrap_line" key={j.key}>
                    <Input.Group compact>
                      {/* 条件关系 */}
                      <Select
                        placeholder="条件"
                        defaultValue="and"
                        onChange={(val) =>
                          changeFilterConfig({
                            key: j.key,
                            findKey: 'relation',
                            value: val,
                            groupId: item.groupId,
                          })
                        }
                      >
                        {filterRelationOptions.map((m) => (
                          <Select.Option value={m.value} key={m.value}>
                            {m.label}
                          </Select.Option>
                        ))}
                      </Select>
                      {/* 借贷方向 */}
                      <Select
                        // defaultValue="debit"
                        onChange={(val) =>
                          changeFilterConfig({
                            key: j.key,
                            findKey: 'direction',
                            value: val,
                            groupId: item.groupId,
                          })
                        }
                        allowClear
                        placeholder="方向"
                      >
                        {filterDirectionOptions.map((m) => (
                          <Select.Option value={m.value} key={m.value}>
                            {m.label}
                          </Select.Option>
                        ))}
                      </Select>
                      {/* 筛选列次 */}
                      <Select
                        value={j.col}
                        onChange={(val) =>
                          changeFilterConfig({
                            key: j.key,
                            findKey: 'col',
                            value: val,
                            groupId: item.groupId,
                          })
                        }
                        allowClear
                        placeholder="筛选列次"
                        style={{ width: 130 }}
                      >
                        {headColOptions.map((m) => (
                          <Select.Option value={m.value} key={m.value}>
                            {m.label}
                          </Select.Option>
                        ))}
                      </Select>
                      {/* <span className="btn_gap">包含</span> */}
                      <Select
                        defaultValue="includes"
                        value={j.filterType}
                        style={{ width: 100 }}
                        onChange={(val) =>
                          changeFilterConfig({
                            key: j.key,
                            findKey: 'filterType',
                            value: val,
                            groupId: item.groupId,
                          })
                        }
                      >
                        {filterTypeOptions.map((m) => (
                          <Select.Option value={m.value} key={m.value}>
                            {m.label}
                          </Select.Option>
                        ))}
                      </Select>
                      <Input
                        value={j.value}
                        onChange={(e) =>
                          changeFilterConfig({
                            key: j.key,
                            findKey: 'value',
                            value: e.target?.value,
                            groupId: item.groupId,
                          })
                        }
                        allowClear
                        style={{ width: '160px' }}
                        placeholder="关键词"
                      />
                      <Button
                        danger
                        onClick={() => deleteFilterConfig(item.groupId, j.key)}
                        style={{ marginLeft: '12px' }}
                      >
                        删除
                      </Button>
                    </Input.Group>
                  </div>
                ))}
            </Card>
          ))}

          <div className="filter_wrap_line">
            <Button
              onClick={addFilterGroup}
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
            >
              增加组内筛选条件
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
