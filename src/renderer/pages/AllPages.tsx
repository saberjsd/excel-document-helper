import { autorun } from "mobx";
import { useEffect, useState } from "react"
import StoreRoot from "renderer/store/StoreRoot";
import ExcelPage from "./ExcelPage";

export default function AllPages(props: any) {
  const [currentMenu, setCurrentMenu] = useState("")

  useEffect(() => {
    const disposer = autorun(() => {
      const { currentMenu } = StoreRoot;
      setCurrentMenu(currentMenu);
    });

    return disposer;
  }, []);

  return <>
    <ExcelPage ></ExcelPage>
  </>
}
