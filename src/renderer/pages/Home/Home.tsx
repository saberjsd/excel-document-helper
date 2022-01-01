import clsx from "clsx"
import { useEffect, useState } from "react"
import "./styles.scss"
// import FTSpreadsheet from "@/components/ExcelEditor/Spreadsheet"
import FTSpreadsheet from "@components/ExcelEditor/Spreadsheet"
import { Button } from "antd"

export default function Home(props){
  const [test, setTest] = useState()

  useEffect(()=>{
    new FTSpreadsheet(`#rootExcel`, { showToolbar: false, showGrid: true, showContextmenu: true });
  })

  return <div className={clsx("home_page")}>
    <Button >sdfasdf</Button>
    <div id="rootExcel"></div>
  </div>
}
