import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectSearchable } from '../';

const meta = {
  title: 'Components/SelectSearchable/Option',
  component: SelectSearchable.Option,
  parameters: {
    docsOnly: true,
  },
  tags: ['!dev'],
  argTypes: {
    value: {
      control: false,
      description:
        'Value committed when selected. The first option with a value wins within an OptionList; later duplicates are ignored with a development warning. Duplicate labels with distinct values are allowed.',
      table: { type: { summary: 'string' } },
      type: { name: 'string', required: true },
    },
    disabled: {
      control: false,
      description:
        'Disables the option (prevents selection and applies aria-disabled).',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
  },
  decorators: [
    (Story) => (
      <SelectSearchable.Root>
        <Story />
      </SelectSearchable.Root>
    ),
  ],
} satisfies Meta<typeof SelectSearchable.Option>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 'example',
  },
  render: (args) => <SelectSearchable.Option {...args} />,
};
