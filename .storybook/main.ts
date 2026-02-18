import type { StorybookConfig } from '@storybook/react-vite';
import checker from 'vite-plugin-checker';

const config: StorybookConfig = {
  'stories': [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  'addons': [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  'framework': '@storybook/react-vite',
  async viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(
      checker({
        typescript: { tsconfigPath: './tsconfig.app.json' }
      }),
    );
    return viteConfig;
  },
};
export default config;