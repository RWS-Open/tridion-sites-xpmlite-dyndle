import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import pageSlice from "./store/slices/pageSlice";
import pageBuilderSlice from "./store/slices/pageBuilderSlice";
import pageInfoSlice from "./store/slices/pageInfoSlice";
import publishSlice from "./store/slices/publishSlice";

const defaultPageInfoState = {
  isLoading: false,
  toggleModalTreeView: false,
  componentPresentation: [],
  selectedKeys: { title: null, key: null, type: null },
  expandkeys: [],
  selectedComponentRowKeys: [],
  selectedComponentTemplate: [],
  pageInfoData: null,
  componentTemplates: [],
  updatedComponentTemplate: { label: null, value: null },
  errorLoading: null,
};

const defaultPublishState = {
  parentPublication: { key: "", name: "", Id: "" },
  childPublications: [],
  selectedChildPublications: [],
  selectedPublishingTarget: [],
  publishingSchedule: 1,
  publishPriority: "Normal",
  publishToCurrentPublication: true,
  publishDate: null,
  additionalSettings: {
    linkedItems: 1,
    itemsInProgress: 1,
    overridePriority: 1,
  },
  targetTypes: [],
  isLoading: false,
  errorMessage: null,
  ispublishRequested: false,
};

const defaultPageBuilderState = {
  isLoading: false,
  pageTypes: [],
  structureGroupIds: { home: null, pageTypes: null },
  pageTypeList: [],
  pageTypeId: null,
  selectedPageSchema: { label: null, value: null },
  selectedPageTemplate: { label: null, value: null },
  selectedPageType: { label: null, value: null },
  formData: { pagename: "New Page", filename: null },
  errorMessage: null,
};

const defaultPageState = {
  pageId: null,
  showPageInfo: false,
  showPageBuilder: false,
};

export function createTestStore(preloadedState?: any) {
  const mergedState = {
    pageReducer: { ...defaultPageState, ...preloadedState?.pageReducer },
    pageBuilderReducer: { ...defaultPageBuilderState, ...preloadedState?.pageBuilderReducer },
    pageInfoReducer: { ...defaultPageInfoState, ...preloadedState?.pageInfoReducer },
    publishReducer: { ...defaultPublishState, ...preloadedState?.publishReducer },
  };

  return configureStore({
    reducer: {
      pageReducer: pageSlice,
      pageBuilderReducer: pageBuilderSlice,
      pageInfoReducer: pageInfoSlice,
      publishReducer: publishSlice,
    },
    preloadedState: mergedState,
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
