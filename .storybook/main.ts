import type { StorybookConfig } from '@storybook/react-vite'
import preset from '@qijenchen/storybook-config/preset'

const config: StorybookConfig = {
  ...preset,
  stories: [
    '../apps/**/*.stories.@(tsx|mdx)',
    '../packages/**/*.stories.@(tsx|mdx)',
  ],
}

export default config
