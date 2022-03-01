import { Select } from 'antd';
import { cloneDeep, debounce } from 'lodash';
import React from 'react';
import './styles.scss';

export default function SearchSelect({ options, ...props }: any) {
  const [newOptions, setOptions] = React.useState<any[]>(cloneDeep(options));
  const debounceFetcher = debounce((value) => {
    console.log(value);
    const out = options.filter((m: any) => {
      if (!value) return true;
      return (m.label || '').indexOf(value) > -1;
    });
    setOptions(out);
  }, 200);

  return (
    <Select
      // labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      // notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={newOptions}
    />
  );
}
