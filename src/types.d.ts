declare interface Window {
  // rsr [micro-app]
  __RSR_MICRO_APP_PARENT_CONTEXT__: any;
  __RSR_MICRO_APP_PARENT_MANAGER__: any;
  // micro-app
  __MICRO_APP_ENVIRONMENT__: boolean | undefined;
  __MICRO_APP_NAME__: string | undefined;
  __MICRO_APP_PUBLIC_PATH__: string | undefined;
  __MICRO_APP_BASE_ROUTE__: string | undefined;
  __MICRO_APP_BASE_APPLICATION__: boolean | undefined;
  rawWindow: Window | undefined;
  rawDocument: Document | undefined;
  mount: () => void;
  unmount: () => void;
}
declare namespace JSX {
  interface IntrinsicElements {
    'micro-app': any;
  }
}
