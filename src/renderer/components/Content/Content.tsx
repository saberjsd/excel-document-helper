import clsx from 'clsx';
import { autorun } from 'mobx';
import { useEffect, useState } from 'react';
import { MENU } from 'renderer/constants';
import ExcelPage from 'renderer/pages/ExcelPage';
import FilterPage from 'renderer/pages/FilterPage';
import HistoryPage from 'renderer/pages/HistoryPage';
import SettingProfitPage from 'renderer/pages/SettingProfitPage';
import SettingRiskPage from 'renderer/pages/SettingRiskPage';
import StoreRoot from 'renderer/store/StoreRoot';
import './styles.scss';

export default function Content(props: any) {
  const [currentMenu, setCurrentMenu] = useState(MENU.EXCEL_BOARD);

  useEffect(() => {
    const disposer = autorun(() => {
      const { currentMenu } = StoreRoot;
      setCurrentMenu(currentMenu);
    });

    return disposer;
  }, []);

  return (
    <div className={clsx('page_content', props.className)}>
      <div className="page_content_inner">
        <ExcelPage hidden={currentMenu !== MENU.EXCEL_BOARD} />
        {/* <FilterPage hidden={currentMenu !== MENU.EXCEL_FILTER} /> */}
        <HistoryPage hidden={currentMenu !== MENU.FILE_HISTORY} />
        <SettingProfitPage hidden={currentMenu !== MENU.SETTINGS_PROFIT} />
        <SettingRiskPage hidden={currentMenu !== MENU.SETTINGS_RISK} />
      </div>
    </div>
  );
}
