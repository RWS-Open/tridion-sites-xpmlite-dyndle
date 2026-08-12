import { configureStore } from "@reduxjs/toolkit";
import publishSlice from "./slices/publishSlice";
import pageInfoSlice from "./slices/pageInfoSlice";
import pageSlice from "./slices/pageSlice";
import pageBuilderSlice from "./slices/pageBuilderSlice";

export const store = configureStore({
    reducer: {
        pageReducer: pageSlice,
        publishReducer: publishSlice,
        pageInfoReducer: pageInfoSlice,
        pageBuilderReducer: pageBuilderSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;