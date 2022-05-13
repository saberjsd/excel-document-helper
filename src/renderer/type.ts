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
  findGuideKeys?: string[];
  // 借贷方向，默认是忽略这个值
  direction?: 'debit' | 'credit';
  children: FilterItem[];
  // 当前条件是否有匹配的行次
  isMatch?: boolean;
};

export type HistoryItem = {
  id: string;
  fileName: string;
  filePath: string;
  lastModify: string;
  size: number;
};
