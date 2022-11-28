import FileSaver from "file-saver";
import * as XLSX from "xlsx";

export default ({ saveValues, aoa = [], filename = "检测数据" }) => {
  // console.log("sss", saveValues);
  let wb = XLSX.utils.book_new();
  let ws = XLSX.utils.json_to_sheet(saveValues.flat());

  XLSX.utils.sheet_add_aoa(ws, [aoa], { origin: "A1" });

  wb.SheetNames.push("检测结果");
  wb.Sheets["检测结果"] = ws;

  const defaultCellStyle = {
    font: { name: "Verdana", sz: 13, color: "FF00FF88" },
    fill: { fgColor: { rgb: "FFFFAA00" } },
  }; //设置表格的样式
  let wopts = {
    bookType: "xlsx",
    bookSST: false,
    type: "binary",
    cellStyles: true,
    defaultCellStyle: defaultCellStyle,
    showGridLines: false,
  }; //写入的样式
  let wbout = XLSX.write(wb, wopts);
  let blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  FileSaver.saveAs(blob, filename + ".xlsx");
};

const s2ab = (s) => {
  if (typeof ArrayBuffer !== "undefined") {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  } else {
    var buf = new Array(s.length);
    for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
};
