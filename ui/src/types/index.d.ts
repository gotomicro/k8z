export {};

declare global {
  interface Window {
    electron: {
      baseUrl?: () => Promise<string>;
      downloading?: (path: string) => void;
      getMessage?: (callback: (event: any, message: any) => void) => void;
      openInBrowser?: (url: string) => void;
    };
  }
}
