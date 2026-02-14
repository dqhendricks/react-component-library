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
        'Value committed to the control when this option is selected.',
      table: { type: { summary: 'string' } },
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