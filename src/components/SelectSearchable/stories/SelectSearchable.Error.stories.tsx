import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectSearchable } from '../';

const meta = {
  title: 'Components/SelectSearchable/Error',
  component: SelectSearchable.Error,
  parameters: { docsOnly: true },
  tags: ['!dev'],
  argTypes: {
    hideWhenValid: {
      control: false,
      description: 'If true, the error is not rendered unless the Root is marked as invalid using `aria-invalid`.',
      table: { type: { summary: 'boolean' } },
    },
  },
  decorators: [
    (Story) => (
      <SelectSearchable.Root>
        <Story />
      </SelectSearchable.Root>
    ),
  ],
} satisfies Meta<typeof SelectSearchable.Error>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { hideWhenValid: false },
  render: (args) => <SelectSearchable.Error {...args} />,
};