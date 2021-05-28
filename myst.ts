import { MystDemo } from './src/myst-demo';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    MystDemo: typeof MystDemo;
  }
}

window.MystDemo = MystDemo;
