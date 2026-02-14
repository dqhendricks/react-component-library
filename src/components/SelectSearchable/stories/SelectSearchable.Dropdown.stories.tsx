import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectSearchable } from '../';

const meta = {
  title: 'Components/SelectSearchable/Dropdown',
  component: SelectSearchable.Dropdown,
  parameters: {
    docsOnly: true,
  },
  tags: ['!dev'],
  argTypes: {
    maxHeightWithClamp: {
      control: false,
      description:
        'Maximum dropdown height in pixels. Clamped to available viewport space.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '280' },
      },
    },
    gap: {
      control: false,
      description:
        'Spacing in pixels between the Trigger and the Dropdown.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '6' },
      },
    },
  },
  decorators: [
    (Story) => (
      <SelectSearchable.Root>
        <Story />
      </SelectSearchable.Root>
    ),
  ],
} satisfies Meta<typeof SelectSearchable.Dropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <SelectSearchable.Dropdown {...args} />
  ),
};
