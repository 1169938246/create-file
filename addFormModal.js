import React, { Component, Fragment } from "react";
import { connect } from "dva";
import PropTypes from "prop-types";
import { Form, Spin, Modal, Button, message, Input, Radio, Select, Checkbox, Switch, PageHeader, Icon, Tooltip, Row, Col, DatePicker, InputNumber } from "antd";

import TopNav from "../TopNav";
import moment from "moment";
import UploadImage from "../../assembly/UploadImage";
import RangeDatePicker from "../../assembly/RangeDatePicker";
import RangeDatePickerShort from "../../assembly/RangeDatePickerShort";
import PickProductModal from "../../assembly/PickProductModal";
import ProductModal from "../../assembly/ProductModal";
import SelectDate from "../SelectDate";
import mathmanage from "../../utils/mathmanage";
import ChromePickerFun from "../../assembly/ChromePickerFun";
import EditorElemItem from "../../assembly/EditorElemItem";
import CouponsModal from "../../assembly/CouponsModal"
import "./index.less";
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;
class templateForm extends Component {
  static propTypes = {
    prop: PropTypes,
  };
  constructor(props) {
    super(props);
    const id = this.props.rowInfo && this.props.rowInfo.id;
    this.state = {
      detailData: {
        brandLogo:
          "http://fuluapiosstest2018.oss-cn-hangzhou.aliyuncs.com/c688180d97ef4294aef1b83052f0811f.png",
        processStartDay: "1",
      },
      id,
    };
  }
  componentDidMount() {
    const { id, detailData } = this.state;
    if (id) {
      this.getDetail();
    } else {
      this.props.form.setFieldsValue(detailData);
    }
  }

  //编辑的时候获取详情
  getDetail = () => {
    const { id } = this.state;
    if (id) {
      //请求商品详情
      this.props
        .dispatch({
          type: "example/detail",
          payload: { id: id },
        })
        .then((res) => {
          const { code, data } = res;
          if (code === "0" || code === "1000") {
            data.timeArr = [data.startTime, data.endTime];
            this.props.form.setFieldsValue(data);
            return this.setState({
              detailData: data,
            });
          }else{
            message.error(res.message);
          }
         
        });
    }
  };

  changeInput = (value, field) => {
    const { detailData } = this.state;
    detailData[field] = value;
    this.setState({
      detailData,
    });
  };

  //确定按钮
  btnOk = () => {
    const { id } = this.state;
    this.props.form.validateFieldsAndScroll({ scroll: { offsetBottom: 25, offsetTop: 50 } }, (err, values) => {
      if (!err) {
        let method = "example/save";
        if (id) {
          method = "example/edit";
          values.id = id;
        }
        if (values.timeArr) {
          values.startTime = values.timeArr[0]
          values.endTime = values.timeArr[1]
        }
          return this.props
            .dispatch({
              type: method,
              payload: {
                ...values,
                id,
              },
            })
            .then((res) => {
              const { code, data } = res;
              if (code === "0" || code === "1000") {
                this.props.getData();
                this.props.showModal("addFormModal", false);
                message.success(res.message);
              }else{
                message.error(res.message);
              }
            });
        }
      }
    );
  };

  //取消按钮
  handleCancel = () => {
    this.props.showModal("addFormModal", false);
  };

  disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().subtract("days", 1);
  };

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 12 },
    };
    const formItemLayout2 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };
    const formItemLayout3 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const formItemLayout4 = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16, offset: 4 },
    };
    const formItemLayout5 = {
      wrapperCol: { span: 8 },
    };
    const formTailLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20, offset: 4 },
    };
    const { getFieldDecorator } = this.props.form;
    const { detailData, id } = this.state;

    return (
      <Modal
        title={`${id ? "编辑" : "新增"}`}
        visible={true}
        onOk={this.btnOk}
        onCancel={this.handleCancel}
        width={800}
        destroyOnClose={true}
        maskClosable={false}
        okText="确定"
        cancelText="取消"
      >
        <div className="common-page-content coupons-list-add clearfix">
          <Spin spinning={!!this.props.loading.models.example}>
            <div className="content">
              <Form>

                {/* 下拉框 组件  --- 开始  */}
                <FormItem
                  {...formItemLayout}
                  label="下拉框"
                  placeholder="请选择"
                >
                  {getFieldDecorator("type", {
                    rules: [{ required: true, message: "请选择!" }],
                  })(
                    <Select
                      disabled={id ? true : false}
                      showSearch
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      <Option key={1} value={1}>
                        商品满减券
                      </Option>
                      <Option key={2} value={2}>
                        商品折扣券
                      </Option>
                    </Select>
                  )}
                </FormItem>
                
                {/* 下拉框组件 ---结尾  */}

                {/* 输入框组件 ---开始 */}
                <FormItem {...formItemLayout} label="输入框">
                  {getFieldDecorator("name", {
                    rules: [{ required: true, message: "请输入" }],
                  })(
                    <Input
                      placeholder="最多20个字符"
                      maxLength={20}
                      onChange={(e) => this.changeInput(e.target.value, "name")}
                    />
                  )}
                </FormItem>
                {/* 输入框组件 ---结尾 */}

                {/* 时间组件-长时间组件 ---开始 */}
                <FormItem {...formItemLayout} label="长时间组件">
                  {getFieldDecorator("timeArr", {
                    rules: [{ required: true, message: "请选择长时间组件" }],
                    initialValue: detailData.timeArr,
                  })(<RangeDatePicker showTime />)}
                </FormItem>
                {/* 时间组件-长时间组件 ---结尾 */}

                {/* 时间组件-短时间组件 ---开始 */}
                <RangeDatePickerShort
                  form={this.props.form}
                  startFieldName="startTime"
                  endFieldName="endTime"
                  detailData={detailData}
                  label={<span><span  style={{color:"red",marginRight:"4px",fontFamily:"SimSun,sans-serif"}}>*</span>短时间控件</span>}
                />
                {/* 时间组件-短时间组件 ---结尾 */}

                {/* 数字输入框 ---开始 */}
                <FormItem {...formItemLayout2} label="自定义文案">
                  {getFieldDecorator("delayDay", {
                    rules: [{ required: true, message: "请输入文本" }],
                  })(
                    <InputNumber
                      min={1}
                      max={12}
                      placeholder="1~12"
                      precision={0}
                    />
                  )}
                  <span> 自定义文案</span>
                </FormItem>
                {/* 数字输入框 ---结尾 */}

                {/* 基础复选框  ---开始 */}
                <FormItem {...formItemLayout2} label="复选框">
                  {getFieldDecorator("limitRule", {
                    valuePropName: "checked",
                  })(<Checkbox></Checkbox>)}
                </FormItem>
                {/* 基础复选框  ---结束 */}

                {/* 基础单选 ---开始 */}
                <FormItem {...formItemLayout} label="单选框">
                  {getFieldDecorator("XX2", {
                    rules: [{ required: true, message: "请选择单选框" }],
                  })(
                    <RadioGroup>
                      <Radio value={true}>是</Radio>
                      <Radio value={false}>否</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                {/* 基础单选 ---结束 */}

                {/* 开关 --开始*/}
                <FormItem
                  {...formItemLayout}
                  label={
                    <span>
                      开关
                      <Tooltip title="111">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator("isCanUseTimeVaild", {
                    valuePropName: "checked",
                  })(<Switch checkedChildren="是" unCheckedChildren="否" />)}
                </FormItem>
                {/* 开关 --结束*/}

                {/* 文本域 ---开始 */}
                <FormItem {...formItemLayout2} label="文本域">
                  {getFieldDecorator("instructions", {
                    rules: [{ required: true, message: "请输入文本域" }],
                  })(<Input.TextArea rows={4} />)}
                </FormItem>
                {/* 文本域 ---结束 */}

                {/* 背景颜色 ---开始 */}
                <FormItem {...formItemLayout2} label="背景颜色">
                  {getFieldDecorator("cardColor", {
                    rules: [{ required: true, message: "请输入背景颜色" }],
                    initialValue: detailData.cardColor,
                  })(<ChromePickerFun />)}
                </FormItem>
                {/* 背景颜色 ---结束 */}

                {/* 上传组件 ---开始 */}
                <FormItem
                  {...formItemLayout2}
                  label="上传组件"
                  extra="图片建议尺寸：606像素*202像素，大小不超过2M。"
                >
                  {getFieldDecorator("brandLogo", {
                    rules: [{ required: true, message: "请上传图片" }],
                    initialValue: detailData.brandLogo,
                  })(<UploadImage imgSize={10000} />)}
                </FormItem>
                {/* 上传组件 ---结束 */}

                  {/* 编辑器组件 ---开始 */}
                  <FormItem
                  {...formItemLayout2}
                  label="编辑器组件"
                >
                  {getFieldDecorator("editorValue", {
                    rules: [{ required: true, message: "请填写内容" }],
                    initialValue: detailData.editorValue,
                  })(<EditorElemItem  />)}
                </FormItem>
                {/* 编辑器组件 ---结束 */}

              </Form>
            </div>
          </Spin>
        </div>
      </Modal>
    );
  }
}
export default connect((state) => ({ ...state }))(Form.create()(templateForm));
