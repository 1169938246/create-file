import axios from '../utils/axios';
import Api from '../configs/api';
//列表
export function list(params) {
    return axios.get(configs.host.test + Api.exampleList, { params });
}
//详情
export function detail(params) {
    return axios.get(configs.host.test + Api.exampleDetail, { params });
}
// 保存
export function save(params) {
    return axios.post(configs.host.test + Api.exampleSave, params);
}

// 删除
export function del(params) {
    return axios.get(configs.host.test + Api.exampleDel, { params });
}

// 编辑
export function edit(params) {
    return axios.post(configs.host.test + Api.exampleEdit, params);
}
