import { useEffect, useState } from "react";
import axios from "axios";
// import dayjs from "dayjs";
import { Table, Button, Tooltip } from "antd";

import pLimit from "p-limit";

import exportExcel from "@src/tools/exportToExcel";

// import { mapLimit } from "async";

import OperateBox from "../OperateBox";
import "antd/dist/reset.css";
// import wechat from "@assets/img/wechat.jpg";

function resolveAfter2Seconds() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, 2000);
  });
}

const getUserMsg = async ({ cid, begin, end }) => {
  // await resolveAfter2Seconds();
  try {
    // console.log("!!!!!!!!!!!!");
    const req = axios.create();
    const res = await req.get(
      `/HealthManagePC/Person/GetPagedList?SourceType=-1&page=1&limit=20&sortColumn=F_CreatorTime&sortType=desc&F_DetectResult=&F_ReceiveTime=&F_DetectTime=&F_RegisterTime=${begin.format(
        "YYYY.MM.DD"
      )} 00:00:00 - ${end.format(
        "YYYY.MM.DD"
      )} 23:59:59&F_SampleCode=&F_Name=&F_Phone=&F_IDNumber=${cid}&F_Status=&sCydName=&cyrName=&F_DetectOrgName=&jsrName=&jcrName=&F_ShiZiType=&sAreaName=&PersonType=请选择&F_BoxCode=&F_MaxCount=&BoxStatus=&F_PIds=`
    );
    const {
      data: { data, count },
    } = res;
    if (count == 0) {
      return [
        {
          F_IDNumber: cid,
          F_Name: 0,
          count: 0,
        },
      ];
    }
    return data.map(
      ({
        F_IDNumber,
        F_Name,
        F_Phone,
        F_RegisterTime,
        DetectResultName,
        F_SamplePointName,
        F_AreaName,
      }) => ({
        F_IDNumber,
        F_Name,
        F_Phone,
        count,
        F_RegisterTime,
        DetectResultName,
        F_SamplePointName,
        F_AreaName,
      })
    );
  } catch (error) {
    return [
      {
        F_IDNumber: cid,
        F_Name: "出错啦",
      },
    ];
  }
};

export default function App() {
  const [active, setActive] = useState(false);
  const [resultDom, setResultDom] = useState(<></>);
  const [loadingtip, setLoadingtip] = useState("正在提交...");
  const columns = [
    {
      title: "身份证号",
      dataIndex: "F_IDNumber",
      key: "F_IDNumber",
    },
    {
      title: "姓名",
      dataIndex: "F_Name",
      key: "F_Name",
    },
    {
      title: "手机号码",
      dataIndex: "F_Phone",
      key: "F_Phone",
    },
    {
      title: "时间段时采样次数",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "采样时间",
      dataIndex: "F_RegisterTime",
      key: "F_RegisterTime",
    },
    {
      title: "采样结果",
      dataIndex: "DetectResultName",
      key: "DetectResultName",
    },
    {
      title: "采样地点",
      dataIndex: "F_SamplePointName",
      key: "F_SamplePointName",
    },
    {
      title: "地区",
      dataIndex: "F_AreaName",
      key: "F_AreaName",
    },
  ];
  const transform = async (values) => {
    const valuesArr = values.text
      .trim()
      .split("\n")
      .map((item) => item.trim());
    const [begin, end] = values.dates;
    // console.log(begin.format("YYYYMMDD"), end.format("YYYYMMDD"));
    // console.log("valuesArr", valuesArr);

    const total = valuesArr.length;
    let count = 0;

    const limit = pLimit(50);
    const input = valuesArr.map(
      (cid) =>
        limit(async () => {
          const u = await getUserMsg({ cid, begin, end });
          count++;
          setLoadingtip(`正在提交...${count}/${total}`);
          return u;
        })
      // limit(async () => {
      //   // const u = await getUserMsg({ cid, begin, end });
      //   await resolveAfter2Seconds();
      //   count++;
      //   setLoadingtip(`正在提交...${count}/${total}`);
      //   return { F_IDNumber: cid };
      // })
    );
    const result = await Promise.all(input);

    // console.log("result", result);
    // while (valuesArr.length) {
    //   // 100 at a time
    //   await Promise.all(valuesArr.splice(0, 100).map((f) => f()));
    // }

    setResultDom(
      <div>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={() =>
              exportExcel({
                saveValues: result.flat(),
                aoa: columns.map(({ title }) => title),
              })
            }
          >
            导出
          </Button>
        </div>
        <Table
          pagination={{ pageSize: 50 }}
          dataSource={result.flat()}
          columns={columns}
        />
      </div>
    );
  };
  // useEffect(() => {
  //   console.log("content view loaded~~~~~~~");
  // }, []);

  return (
    <>
      <div
        className="minibar"
        style={{ display: active ? "none" : "block" }}
        onClick={() => setActive(true)}
      >
        +
      </div>
      <div
        className="contentBox"
        style={{ display: active ? "block" : "none" }}
      >
        <button className="close_btn" onClick={() => setActive(false)}>
          关闭
        </button>
        <OperateBox
          transform={transform}
          resultDom={resultDom}
          loadingtip={loadingtip}
        />
        <div className="concatMe">
          <Tooltip
            placement="top"
            title={
              <img
                className="wechat_img"
                src="https://h5.51chifeng.cn/wechat.jpg"
              />
            }
          >
            联系作者
          </Tooltip>
        </div>
      </div>
    </>
  );
}
