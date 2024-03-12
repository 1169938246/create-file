import * as example from "../services/example";

export default {
    namespace: "example",
    state: {
        merchantInfoList: [],
    },
    effects: {
        *list({ payload, callback }, { call, put }) {
            const testRes = yield call(example.list, payload);
            yield put({
                type: "success",
                payload: {
                    listResult: testRes,
                },
            });
            callback && callback(testRes);
            return testRes;
        },
        *detail({ payload, callback }, { call, put }) {
            const testRes = yield call(example.detail, payload);
            yield put({
                type: "success",
                payload: {
                    detailResult: testRes,
                },
            });
            callback && callback(testRes);
            return testRes;
        },
        *save({ payload, callback }, { call, put }) {
            const testRes = yield call(example.save, payload);
            yield put({
                type: "success",
                payload: {
                    saveResult: testRes,
                },
            });
            callback && callback(testRes);
            return testRes;
        },
        *del({ payload, callback }, { call, put }) {
            const testRes = yield call(example.del, payload);
            yield put({
                type: "success",
                payload: {
                    delResult: testRes,
                },
            });
            callback && callback(testRes);
            return testRes;
        },
        *edit({ payload, callback }, { call, put }) {
            const testRes = yield call(example.edit, payload);
            yield put({
                type: "success",
                payload: {
                    editResult: testRes,
                },
            });
            callback && callback(testRes);
            return testRes;
        },
    },
    reducers: {
        success(state, { payload }) {
            return {
                ...state,
                ...payload,
            };
        },
    },
};
