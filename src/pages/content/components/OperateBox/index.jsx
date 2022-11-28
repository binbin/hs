import React, { useState } from "react";
import { Form, Input, Button, Tabs, Spin, DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import locale from "antd/es/date-picker/locale/zh_CN";

import { idCardNoUtil } from "@src/tools/idCard";

const { TabPane } = Tabs;
const { checkIdCardNo } = idCardNoUtil;
const { TextArea } = Input;

const { RangePicker } = DatePicker;

const disabledDate = (current) => {
  // Can not select days before today and today
  return current > dayjs().endOf("day");
};

function OperateBox({
  loadingtip = "正在提交",
  validator = (_, value = "") => {
    let errorLines = value
      .trim()
      .split("\n")
      .reduce(
        (prev, item, index) =>
          checkIdCardNo(item.trim()) || item.trim() == ""
            ? prev
            : [...prev, index],
        []
      );
    return errorLines.length == 0
      ? Promise.resolve()
      : Promise.reject(
          new Error(
            `请检查输入，第${errorLines.map((item) => item + 1).join("、")}行`
          )
        );
  },
  label = "请在每一行中输入身份证号码",
  placeholder = "身份证号码",
  transform = async (values) => (
    <>
      <p>Content of Tab Pane 2</p>
      <p>Content of Tab Pane 2</p>
      <p>Content of Tab Pane 2</p>
    </>
  ),
  resultDom = <></>,
}) {
  const [init, setInit] = useState(true);
  const [loading, setLoading] = useState(false);

  // const [result, setResult] = useState(<></>);

  const [activeKey, setActiveKey] = useState("1");

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const r = await transform(values);
      // console.log("Success:", values);
      // setResult(r);
      setActiveKey("2");
      setInit(false);
      form.setFieldsValue({ text: "" });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [form] = Form.useForm();
  return (
    <Spin tip={loadingtip} spinning={loading} delay={500}>
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={(k) => {
          setActiveKey(k);
        }}
      >
        <TabPane tab="提交内容" key="1">
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
              dates: [dayjs().subtract(2, "day"), dayjs()],
            }}
          >
            <Form.Item
              label="请选择日期"
              name="dates"
              rules={[{ required: true, message: "请选择日期" }]}
            >
              <RangePicker disabledDate={disabledDate} locale={locale} />
            </Form.Item>
            <Form.Item
              label={label}
              name="text"
              rules={[
                {
                  validator,
                },
                { required: true, message: "请输入内容" },
              ]}
            >
              <TextArea
                // value={value}
                // onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                autoSize={{ minRows: 5, maxRows: 10 }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="查看结果" disabled={init} key="2">
          {resultDom}
        </TabPane>
      </Tabs>
    </Spin>
  );
}

export default OperateBox;
