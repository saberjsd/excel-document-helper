export type FilterItem = {
  // id
  key: string;
  // 要匹配的列次，A-Z
  col?: string;
  // 匹配正则字符串
  value: any;
  // 匹配的模式，默认是'includes'
  filterType?: 'includes' | 'equal' | 'notEmpty';
  // 与其他条件的关系，默认是'and'
  relation?: 'and' | 'or';
  // 借贷方向，默认是忽略这个值
  direction?: 'debit' | 'credit';
};

export type FilterList = {
  groupId: string;
  // 与其他条件的关系，默认是'and'
  relation?: 'and' | 'or';
  filterKeys?: string[];
  filterSubjectIdKeys?: string[];
  children: FilterItem[];
};
