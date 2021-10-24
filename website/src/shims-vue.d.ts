// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

declare module '*.md' {
  const content: string;
  export = content;
}
