import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectSearchable } from "../";

const meta = {
  title: "Components/SelectSearchable/Trigger",
  component: SelectSearchable.Trigger,
  parameters: {
    docsOnly: true,
  },
  tags: ['!dev'],
  argTypes: {
    children: {
      control: false,
      description: 'Child node of the trigger element.',
      table: {
        type: {
          summary: 'React.ReactNode | (args: { value: string; values: string[]; isOpen: boolean; multiple: boolean; }) => React.ReactNode',
        },
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
} satisfies Meta<typeof SelectSearchable.Trigger>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Children' },
  render: (args) => (
    <SelectSearchable.Trigger>
      { args.children }
    </SelectSearchable.Trigger>
  ),
};