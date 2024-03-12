import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { connect } from "dva"; 
import {
   Form,
   message,
   Button,
   Spin,
   Divider,
   Tabs,
   Popconfirm,
} from "antd";
import moment from "moment";
import { getScrollWidth } from "../../utils/common";
import TopNav from "../TopNav";
import { SearchForm, Table } from "fl-pro";
import AddFormModal from './AddFormModal'
// import "./index.less";
@Form.create()
class Template extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         searchConfig: [
            {
               label: "输入框",
               type: "Input",
               name: "name",
               placeholder: "请输入",
            },
            {
               label: '下拉框',
               type: 'Select',
               name: 'Type',
               initialValue: '',
               items: [
                  { name: '全部', value: '' },
               ]
            },
            {
               label: '时间',
               type: 'RangePicker',
               name: 'DefaultTime',
               //现默认时间-日
               //initialValue: [moment(moment().format('YYYY-MM-DD 00:00:00')), moment(moment().format('YYYY-MM-DD 23:59:59'))], 
               //默认时间-周
               // initialValue: [moment(moment().subtract(7, 'day').format('YYYY-MM-DD 00:00:00')),moment(moment().format('YYYY-MM-DD 23:59:59'))],
               timeFormat: 'YYYY-MM-DD HH:mm:ss',
               formControl: true,
               responseFiled: {
                  beginTime: 'startTime',
                  endTime: 'endTime',
               },
               allowClear: true,
            },
         ],
         postData: {
            MerId: localStorage.getItem("MerchantId"),
            pageIndex: 1,
            pageSize: 10,
         },
         btnArr: window.getAuthButtons(),
         showWxAuthModal: false,
         showShieldCouponsModal: false,
         showAddCardModal: false,
         isShowShieldCouponsBtn: false,
         addFormModal:false,
         rowInfo:{}
      };
   }
   componentWillMount() { }

   //基础列表请求
   getData = () => {
      const { postData } = this.state;
      this.props
         .dispatch({
            type: "example/list",
            payload: { ...postData },
         })
         .then((res) => {
            const { code, data } = res;
            if (code === "0" || code === "1000") {
               return this.setState({
                  tableData: data.list,
                  total: data.total,
               });
            }else{
               message.error(res.message);
            }
          
         });
   };

   //查询列表
   search = (err, value) => {
      const { postData } = this.state;
      postData.startTime = value.startTime;
      postData.endTime = value.endTime;
      postData.pageIndex = 1;
      this.setState(
         {
            postData: { ...postData, ...value },
         },
         () => {
            this.getData();
         }
      );
   };

   //新增跳转
   addEquityTask = () => {
      this.props.history.push("/example/exampleAdd");
   };

   // 删除
   deleteLine = (record) => {
   this.props.dispatch({
      type: 'example/del', payload: { id: record.id },
      callback: ({ code, data, message: info }) => {
         if (code === '0' || code === "1000") {
            message.success(info);
         } else {
            message.error(info);
         }
         this.getData();
      }
   });
}

   //模态框显示隐藏
   showModal = (field, flag, rowInfo) => {
      this.setState({
         [field]: flag,
         rowInfo,
      });
   };

   //帮助文档跳转地址
   toHelpDoc = () => {
      window.open(
         "https://alidocs.dingtalk.com/i/nodes/MNDoBb60VLrOb2dDfQRZQqgx8lemrZQ3?utm_scene=team_space"
      );
   };

  
   render() {
      const { searchConfig, btnArr, total, postData, tableData,addFormModal,rowInfo } = this.state;
      const tableColums = [
         {
            title: "序号",
            width: 80,
            key: "index",
            dataIndex: "index",
            fixed: "left",
            render(text, record, index) {
               return index + 1;
            },
         },
         {
            title: "活动名称",
            key: "name",
            dataIndex: "name",
            width: 200,
         },
         {
            title: '类型数据', key: 'exchangeForm', dataIndex: 'exchangeForm', width: 150, render: (text) => {
               //couponType[text] 
            }
         },
         {
            title: "周期类型",
            key: "periodType",
            dataIndex: "periodType",
            width: 150,
            render(text) {
               return  text&&text.toLowerCase() === "day" ? "天" : "月";
            },
         },
         {
            title: "活动状态",
            width: 150,
            key: "status",
            dataIndex: "status",
            render(text) {
               const arr = ["停用", "启用"];
               return arr[text];
            },
         },
         {
            title: "操作",
            width: 230,
            key: "control",
            fixed: "right",
            render: (text, record) => {
               return (
                  <div>
                     {btnArr.find((v) => v.enCode === "lr-edit") && (
                        <Fragment>
                           <a
                              onClick={() => {
                                 this.props.history.push(
                                    `/example/exampleAdd?id=${record.id}`
                                 );
                              }}
                           >
                              编辑1
                           </a>
                           <Divider type="vertical" />
                           <a
                              onClick={() => {
                                 this.showModal('addFormModal',true,record)
                              }}
                           >
                              编辑2
                           </a>
                        </Fragment>
                        
                     )}
                      <Divider type="vertical" />
                      <Popconfirm
                        title={`确定要删除此项数据吗?`}
                        onConfirm={() => this.deleteLine(record)}
                        okText="确定"
                        cancelText="取消"
                     >
                        <a>删除</a>
                     </Popconfirm>
                  </div>
               );
            },
         },
      ];
      const pagination = {
         total,
         showQuickJumper: true,
         pageSize: postData.pageSize,
         current: postData.pageIndex,
         pageSizeOptions: ["10", "30", "50", "100"],
         onShowSizeChange: (current, pageSize) => {
            this.setState(
               { postData: { ...postData, pageIndex: current, pageSize: pageSize } },
               () => {
                  this.getData();
               }
            );
         },
         onChange: (current, pageSize) => {
            this.setState(
               { postData: { ...postData, pageIndex: current, pageSize: pageSize } },
               () => {
                  this.getData();
               }
            );
         },
      };
      return (
         <div>
            <TopNav isMarketingManage />
            <Spin spinning={!!this.props.loading.models.example}>
               <div className="common-page-content couponsList-content">
                  <div className="top-content">
                     <div className="clearfix">
                        <div className="float-left">
                           <h3 className="mar-right-20 inline-block">标题</h3>
                           <a onClick={this.toHelpDoc}>帮助文档</a>
                        </div>
                     </div>
                     <div className="bottom-content">
                        内容
                     </div>
                  </div>
                  <SearchForm
                     onRef={(r) => (this.child = r)}
                     searchConfig={searchConfig}
                     search={this.search}
                     key={10}
                  />
                  {btnArr.find((v) => v.enCode === "lr-add") && (
                     <div className="table-control-bar">
                        <Button onClick={this.addEquityTask} type="primary">
                           新建-打开新页面
                        </Button>
                     </div>
                  )}
                  {btnArr.find((v) => v.enCode === "lr-add") && (
                  <div className="table-control-bar">
                     <Button onClick={()=>{
                        this.setState({
                           addFormModal:true 
                        })
                     }} type="primary">
                        新建-打开模态框
                     </Button>
                  </div>
                   )}
                  <Table
                     className="bannertable"
                     pagination={pagination}
                     rowKey="id"
                     columns={tableColums}
                     scroll={{ x: getScrollWidth(tableColums) }}
                     dataSource={tableData}
                  />
               </div>
            </Spin>
           {addFormModal && <AddFormModal  getData={this.getData} showModal={this.showModal} rowInfo={rowInfo} />} 
         </div>
      );
   }
}

const mapStateToProps = (state) => {
   return {
      ...state,
   };
};
export default connect(mapStateToProps)(Template);
