//基础表单
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
    const id = mathmanage.getParam("id");
    const copyId = mathmanage.getParam("copyId");
    this.state = {
      detailData: {
        brandLogo: "http://fuluapiosstest2018.oss-cn-hangzhou.aliyuncs.com/c688180d97ef4294aef1b83052f0811f.png",
        processStartDay: "1",
      },
      id,
      copyId,
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
    const { id, copyId } = this.state;
    if (id || copyId) {
      //请求商品详情
      this.props
        .dispatch({
          type: "example/detail",
          payload: { id: id || copyId },
        })
        .then((res) => {
          const { code, data } = res;
          if (code === "0" || code === "1000") {
            data.timeArr = [moment(data.startActiveTime, "YYYY-MM-DD HH:mm:ss"), moment(data.endActiveTime, "YYYY-MM-DD HH:mm:ss")];
            data.startCouponTime = moment(data.startCouponTime, "YYYY-MM-DD HH:mm:ss");
            data.endCouponTime = moment(data.endCouponTime, "YYYY-MM-DD HH:mm:ss");
            console.log(data, "data");
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

        if (values.startCouponTime) {
          values.startCouponTime = moment(values.startCouponTime).format("YYYY-MM-DD HH:mm:ss");
        }
        if (values.endCouponTime) {
          values.endCouponTime = moment(values.endCouponTime).format("YYYY-MM-DD HH:mm:ss");
        }
        console.log(values, "values");
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
                message.success(res.message);
              }else{
                message.error(res.message);
              }
             
            });
      }
    });
  };

  //取消按钮
  handleCancel = () => {
    this.props.history.push("/example");
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
      <div>
        <TopNav />
        <div className="common-page-content coupons-list-add clearfix">
          <Spin spinning={!!this.props.loading.models.couponsList}>
            <div className="left-content">
              <Form>
                <PageHeader title="基本信息" />
                <Row>
                  <Col span={2} offset={2}>
                    <div className="form-label">
                      <span>*</span>一排2个下拉框:&nbsp;
                    </div>
                  </Col>
                  <Col style={{ display: "flex" }} span={16}>
                    <FormItem>
                      {getFieldDecorator("processStartDay", {
                        rules: [{ required: true, message: "请输入自定义文案" }],
                        initialValue: detailData.processStartDay,
                      })(
                        <Select disabled={detailData.id} placeholder="请选择立减金类型" style={{ width: "200px" }}>
                          <Option key={1} value={1}>
                            微信常规立减金
                          </Option>
                          <Option key={2} value={2}>
                            微信指定商家券
                          </Option>
                        </Select>
                      )}
                    </FormItem>
                    <FormItem>
                      &nbsp;
                      {getFieldDecorator("processEndDay", {
                        rules: [{ required: true, message: "请输入自定义文案" }],
                        initialValue: detailData.processEndDay,
                      })(
                        <Select disabled={detailData.id} placeholder="请选择立减金类型" style={{ width: "200px" }}>
                          <Option key={1} value={1}>
                            微信常规立减金
                          </Option>
                          <Option key={2} value={2}>
                            微信指定商家券
                          </Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <FormItem {...formItemLayout} label="单个下拉框" placeholder="请选择">
                  {getFieldDecorator("type", {
                    rules: [{ required: true, message: "请选择!" }],
                  })(
                    <Select disabled={id ? true : false} showSearch filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                      <Option key={1} value={1}>
                        商品满减券
                      </Option>
                      <Option key={2} value={2}>
                        商品折扣券
                      </Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="输入框">
                  {getFieldDecorator("name", {
                    rules: [{ required: true, message: "请输入" }],
                  })(<Input placeholder="最多20个字符" maxLength={20} onChange={(e) => this.changeInput(e.target.value, "name")} />)}
                </FormItem>
                <FormItem {...formItemLayout} label="长时间组件">
                  {getFieldDecorator("timeArr", {
                    rules: [{ required: true, message: "请选择长时间组件" }],
                    initialValue: detailData.timeArr,
                  })(<RangeDatePicker showTime />)}
                </FormItem>



                
<FormItem {...formItemLayout3} label={<Fragment><span className="required-label"></span>短时间控件</Fragment>} style={{ marginBottom: 0 }}>
  <FormItem
    style={{
      display: "inline-block",
    }}
  >
    {getFieldDecorator("startCouponTime", {
      rules: [{ required: true, message: "请选择开始时间" }],
    })(
      <DatePicker
        disabled={!!id}
        disabledDate={(val) => {
          let endVal = this.props.form.getFieldValue("endCouponTime");
          if (!val || !endVal) {
            return false;
          }
          return val.valueOf() > endVal.valueOf();
        }}
        showTime
        format="YYYY-MM-DD HH:mm:ss"
      />
    )}
  </FormItem>
  <span
    style={{
      display: "inline-block",
      width: "24px",
      textAlign: "center",
    }}
  >
    -
  </span>
  <FormItem
    style={{
      display: "inline-block",
    }}
  >
    {getFieldDecorator("endCouponTime", {
      rules: [{ required: true, message: "请选择结束时间" }],
    })(
      <DatePicker
        disabledDate={(val) => {
          let startVal = this.props.form.getFieldValue("startCouponTime");
          if (!val || !startVal) {
            return false;
          }
          return val.valueOf() <= startVal.valueOf();
        }}
        showTime
        format="YYYY-MM-DD HH:mm:ss"
      />
    )}
  </FormItem>
</FormItem>
                <FormItem {...formItemLayout2} label="自定义文案">
                  {getFieldDecorator("delayDay", {
                    rules: [{ required: true, message: "请输入文本" }],
                  })(<InputNumber min={1} max={12} placeholder="1~12" precision={0} />)}
                  <span> 自定义文案</span>
                </FormItem>

                {/* 带ICON提示的Tooltip */}
                <FormItem
                  {...formItemLayout2}
                  label={
                    <span>
                      自定义文案&nbsp;
                      <Tooltip title="提示">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator("delayDay", {
                    rules: [{ required: true, message: "请输入自定义文案" }],
                  })(<InputNumber min={1} max={12} placeholder="1~12" precision={0} />)}
                  <span> 自定义文案</span>
                </FormItem>

                {/* 基础复选框 */}
                <FormItem {...formItemLayout2} label="复选框">
                  {getFieldDecorator("limitRule", {
                    valuePropName: "checked",
                  })(<Checkbox></Checkbox>)}
                </FormItem>

                <FormItem {...formItemLayout2} label="复选框-动态交互">
                  {getFieldDecorator("limitRule", {
                    valuePropName: "checked",
                  })(<Checkbox></Checkbox>)}
                </FormItem>
                {this.props.form.getFieldValue("limitRule") && (
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
                )}

                {/* 开关 */}
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

                <FormItem {...formItemLayout2} label="自定义文案">
                  {/* 单选后在单选项下面出现新的动态元素场景 */}
                  {getFieldDecorator("couponCollectionScene", {
                    rules: [{ required: true, message: "请选择自定义文案" }],
                  })(
                    <RadioGroup>
                      <Radio className="radio-style" value={1}>
                        动态交互 <span className="form-tip-text">自定义文案</span>
                      </Radio>
                      {this.props.form.getFieldValue("couponCollectionScene") === 1 && (
                        <FormItem>
                          <div className="from-scene-bg">
                            {getFieldDecorator("viewType", {
                              valuePropName: "checked", // 设置 checked 的关联字段名
                            })(<Checkbox>自定义文案</Checkbox>)}
                            <Tooltip
                              overlayClassName="coupon-list-detail-example"
                              title={
                                <div className="class-content">
                                  <div className="class-content-img"></div>
                                </div>
                              }
                            >
                              <Icon type="question-circle-o" />
                            </Tooltip>
                            <span className="form-tip-text">自定义文案</span>
                          </div>
                        </FormItem>
                      )}
                      <Radio className="radio-style" value={2}>
                        自定义文案 <span className="form-tip-text">(即用户通过参与营销活动能获得的优惠券，例如：抽奖、签到、开卡有礼等)</span>
                      </Radio>

                      <Radio className="radio-style" value={3}>
                        自定义文案
                      </Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                {/* 单选框带交互型，带label */}
                <FormItem {...formItemLayout} label="自定义文案">
                  {getFieldDecorator("jumpType", {
                    rules: [{ required: true, message: "请选择单选框" }],
                  })(
                    <RadioGroup>
                      <Radio value={1}>一行多个不带label</Radio>
                      <Radio value={2}>多个商品场景</Radio>
                      <Radio value={3}>商品详情页</Radio>
                      <Radio value={4}>无效果</Radio>
                    </RadioGroup>
                  )}
                </FormItem>

                {this.props.form.getFieldValue("jumpType") === 1 && (
                  <Row>
                    {/*适用于一行内多个组件情况 selectDate 1~30号*/}

                    <Col offset={4} style={{ display: "flex" }}>
                      <FormItem>
                        <span>自定义文案 </span>
                        {getFieldDecorator("delayDay", {
                          rules: [{ required: true, message: "请输入自定义文案" }],
                        })(<InputNumber min={1} max={12} placeholder="1~12" precision={0} />)}
                        <span> 自定义文案</span>
                      </FormItem>

                      <FormItem>
                        {getFieldDecorator("processStartDay", {
                          rules: [{ required: true, message: "请输入自定义文案" }],
                          initialValue: detailData.processStartDay,
                        })(<SelectDate type="day" />)}
                      </FormItem>

                      <FormItem>
                        <span>至</span>
                        {getFieldDecorator("processEndDay", {
                          rules: [{ required: true, message: "请输入自定义文案" }],
                          initialValue: detailData.processEndDay,
                        })(<SelectDate type="day" />)}
                        <span>有效</span>
                      </FormItem>
                    </Col>
                    <Col offset={4}>
                      <p>tips:自定义文案</p>
                    </Col>
                  </Row>
                )}

                {this.props.form.getFieldValue("jumpType") === 2 && (
                  <Row>
                    <Col offset={4}>
                      <FormItem>
                        {/* 需要手动引入 import PickProductModal from "../ProductModal"; 组件  */}
                        {getFieldDecorator("productInfo", {
                          initialValue: detailData.productInfo,
                        })(<ProductModal />)}
                      </FormItem>
                    </Col>
                  </Row>
                )}

                {this.props.form.getFieldValue("jumpType") === 3 && (
                  <FormItem {...formItemLayout2} label="选择商品">
                    {/* 需要手动引入 import PickProductModal from "../PickProductModal"; 组件  */}
                    {getFieldDecorator("productId", {
                      initialValue: detailData.productId,
                    })(
                      <PickProductModal
                      // productCheckList={detailData.productInfo}
                      />
                    )}
                  </FormItem>
                )}

                <FormItem {...formItemLayout2} label="文本域">
                  {getFieldDecorator("instructions", {
                    rules: [{ required: true, message: "请输入文本域" }],
                  })(<Input.TextArea rows={4} />)}
                </FormItem>

                <FormItem {...formItemLayout2} label="背景颜色">
                  {getFieldDecorator("cardColor", {
                    rules: [{ required: true, message: "请输入背景颜色" }],
                    initialValue: detailData.cardColor,
                  })(<ChromePickerFun />)}
                </FormItem>

                <FormItem {...formItemLayout2} label="上传组件" extra="图片建议尺寸：606像素*202像素，大小不超过2M。">
                  {getFieldDecorator("brandLogo", {
                    rules: [{ required: true, message: "请上传图片" }],
                    initialValue: detailData.brandLogo,
                  })(<UploadImage imgSize={10000} />)}
                </FormItem>

                <FormItem {...formTailLayout}>
                  {getFieldDecorator("control", {
                    rules: [],
                    initialValue: "",
                  })(
                    <Fragment>
                      <Button className="mar-right-width" type="primary" onClick={this.btnOk}>
                        保存
                      </Button>
                      <Button onClick={this.handleCancel}>取消</Button>
                    </Fragment>
                  )}
                </FormItem>
              </Form>
            </div>
          </Spin>
        </div>
      </div>
    );
  }
}
export default connect((state) => ({ ...state }))(Form.create()(templateForm));
