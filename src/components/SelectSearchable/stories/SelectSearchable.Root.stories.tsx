import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectSearchable } from "..";
import { generatePeople } from "../../../storybook/utils/generatePeople";

const peopleOptions = generatePeople(50);

/* Helper components */

function Chevron() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "6px solid currentColor",
        opacity: 0.85,
        flex: "0 0 auto",
      }}
    />
  );
}

function UpDownChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: 6,
        flex: "0 0 auto",
        transition: "transform 140ms ease, opacity 140ms ease",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        opacity: 0.85,
      }}
    >
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "7px solid currentColor",
        }}
      />
    </span>
  );
}

/* Meta */

const meta = {
  title: "Components/SelectSearchable",
  component: SelectSearchable.Root,
  parameters: {
    controls: { disable: true },
    actions: { disable: true },
    interactions: { disable: true },
    chromatic: { disable: true },
  },
} satisfies Meta<typeof SelectSearchable.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

/* Stories */

export const Playground: Story = {
  parameters: {
    docsOnly: true,
    controls: { disable: false },
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron'; // Not included
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options, multiple }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    multiple={multiple}
    style={{ maxWidth: 240 }}
    aria-label="Select Person" // You can use a <label> instead
  >
    <SelectSearchable.Trigger>
      <SelectSearchable.TriggerValue placeholder="Choose..." />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder="Search…" />
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  tags: ['!dev'],
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow selecting multiple values.',
      table: {
        type: {
          summary: 'boolean',
        },
      },
    },
    onValueChange: {
      control: false,
      description: 'Convenience handler for getting the set value. Allowed type signature depends on value of `multiple`.',
      table: {
        type: {
          summary: '(value: string) => void | (value: string[]) => void',
        },
      },
    }
  },
  render: (args) => (
    <SelectSearchable.Root {...args} style={{ maxWidth: 240 }} aria-label="Select Person">
      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue placeholder="Choose..." />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          {peopleOptions.map((o, i) => (
            <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
              {o.label}
            </SelectSearchable.Option>
          ))}
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>
  ),
};

export const SingleSelection: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options, onValueChange }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    style={{ maxWidth: 240 }}
    onValueChange={onValueChange}
    aria-label="Select Person" // You can use a <label> instead
  >
    <SelectSearchable.Trigger>
      <SelectSearchable.TriggerValue placeholder="Choose..." />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder="Search…" />
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  render: () => (
    <SelectSearchable.Root
      style={{ maxWidth: 240 }}
      onValueChange={(val) => console.log(val)}
      aria-label="Select Person"
    >
      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue placeholder="Choose..." />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          {peopleOptions.map((o, i) => (
            <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
              {o.label}
            </SelectSearchable.Option>
          ))}
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>
  ),
};

export const MultipleSelection: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options, onValueChange }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    multiple
    style={{ maxWidth: 240 }}
    onValueChange={onValueChange}
    aria-label="Select Person" // You can use a <label> instead
  >
    <SelectSearchable.Trigger>
      <SelectSearchable.TriggerValue placeholder="Choose..." />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder="Search…" />
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  render: () => (
    <SelectSearchable.Root
      multiple
      style={{ maxWidth: 240 }}
      onValueChange={(val) => console.log(val)}
      aria-label="Select Person"
    >
      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue placeholder="Choose..." />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          {peopleOptions.map((o, i) => (
            <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
              {o.label}
            </SelectSearchable.Option>
          ))}
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>
  ),
};

export const WithoutSearch: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    style={{ maxWidth: 240 }}
    aria-label="Select Person" // You can use a <label> instead
  >
    <SelectSearchable.Trigger>
      <SelectSearchable.TriggerValue placeholder="Choose..." />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  render: () => (
    <SelectSearchable.Root
      style={{ maxWidth: 240 }}
      aria-label="Select Person"
    >
      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue placeholder="Choose..." />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.OptionList>
          {peopleOptions.map((o, i) => (
            <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
              {o.label}
            </SelectSearchable.Option>
          ))}
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>
  ),
};

export const CustomRenderedTrigger: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { UpDownChevron } from './UpDownChevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    multiple
    style={{ maxWidth: 240 }}
    aria-label="Select Person" // You can use a <label> instead
  >
    <SelectSearchable.Trigger>
      {({ values, isOpen }) => {
        // You should use value or values, depending on whether multiple is true
        const display = values.join(", ");

        return (
          <>
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                opacity: display ? 1 : 0.7,
              }}
            >
              {display || "Choose…"}
            </div>

            <UpDownChevron isOpen={isOpen} />
          </>
        );
      }}
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder="Search…" />
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  render: () => (
    <SelectSearchable.Root
      multiple
      style={{ maxWidth: 240 }}
    >
      <SelectSearchable.Trigger>
        {({ values, isOpen }) => {
          const display = values.join(", ");

          return (
            <>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  opacity: display ? 1 : 0.7,
                }}
              >
                {display || "Choose…"}
              </div>

              <UpDownChevron isOpen={isOpen} />
            </>
          );
        }}
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder="Search…" />
        <SelectSearchable.OptionList>
          {peopleOptions.map((o, i) => (
            <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
              {o.label}
            </SelectSearchable.Option>
          ))}
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>
  ),
};

export const StylingExamples: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options }: MySelectSearchableProps) => {
  <>
    <style>
      {\`
        /* Styling Root with className */
        .demoSelect {
          max-width: 240px;
        }

        /* Styling with part styling hooks */
        .demoSelect [data-part="trigger"] {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.25);
        }

        /* Styling with state styling hooks */
        .demoSelect [data-part="trigger"][data-state="closed"] {
          background: rgba(0,0,0,0.02);
        }
        .demoSelect [data-part="trigger"][data-state="open"] {
          background: rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.5);
        }

        /* Styling within the portalled dropdown using styling hooks */
        /* Due to portalling, these will not be children of the Root element */
        .demoSelectDropdown [data-part="option"] {
          cursor: crosshair;
        }

        .demoSelectDropdown [data-part="option"][data-active] {
          outline: 2px solid rgba(0,0,0,0.35);
          background: rgba(0,0,255,0.06);
        }

        .demoSelectDropdown [data-part="option"][data-selected] {
          background: rgba(0,0,255,0.08);
        }

        /* Styling a sub component using className only */
        .demoSelectSearchInput {
          width: calc(100% - 16px);
          padding: 8px 10px;
          border: 1px solid rgba(0,0,0,0.2);
          border-radius: 8px;
          margin: 8px;
        }
        .demoSelectSearchInput:focus {
          outline: 2px solid rgba(0,0,0,0.5);
          outline-offset: 2px;
        }
      \`}
    </style>

    <SelectSearchable.Root
      className="demoSelect"
      aria-label="Select Person" // You can use a <label> instead
    >
      <SelectSearchable.Trigger>
        <SelectSearchable.TriggerValue
          // Inline styling of a sub component
          style={{ fontFamily: '"Courier New", monospace' }}
          placeholder="Choose..."
        />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown className="demoSelectDropdown">
        <SelectSearchable.Search
          className="demoSelectSearchInput"
          placeholder="Search…"
        />
        <SelectSearchable.OptionList>
          {options.map((option) => (
            <SelectSearchable.Option key={option.id} value={option.value}>
              {option.label}
            </SelectSearchable.Option>
          ))}
        </SelectSearchable.OptionList>
      </SelectSearchable.Dropdown>
    </SelectSearchable.Root>
  </>
};
        `.trim(),
      },
    },
  },
  render: () => (
    <>
      <style>
        {`
          /* Styling Root with className */
          .demoSelect {
            max-width: 240px;
          }

          /* Styling with part styling hooks */
          .demoSelect [data-part="trigger"] {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid rgba(0,0,0,0.25);
          }

          /* Styling with state styling hooks */
          .demoSelect [data-part="trigger"][data-state="closed"] {
            background: rgba(0,0,0,0.02);
          }
          .demoSelect [data-part="trigger"][data-state="open"] {
            background: rgba(0,0,0,0.06);
            border-color: rgba(0,0,0,0.5);
          }

          /* Styling within the portalled dropdown using styling hooks */
          /* Due to portalling, these will not be children of the Root element */
          .demoSelectDropdown [data-part="option"] {
            cursor: crosshair;
          }

          .demoSelectDropdown [data-part="option"][data-active] {
            outline: 2px solid rgba(0,0,0,0.35);
            background: rgba(0,0,255,0.06);
          }

          .demoSelectDropdown [data-part="option"][data-selected] {
            background: rgba(0,0,255,0.08);
          }

          /* Styling a sub component using className only */
          .demoSelectSearchInput {
            width: calc(100% - 16px);
            padding: 8px 10px;
            border: 1px solid rgba(0,0,0,0.2);
            border-radius: 8px;
            margin: 8px;
          }
          .demoSelectSearchInput:focus {
            outline: 2px solid rgba(0,0,0,0.5);
            outline-offset: 2px;
          }
        `}
      </style>
      <SelectSearchable.Root
        className="demoSelect"
        aria-label="Select Person"
      >
        <SelectSearchable.Trigger>
          <SelectSearchable.TriggerValue
            // Inline styling of a sub component
            style={{ fontFamily: '"Courier New", monospace' }}
            placeholder="Choose..."
          />
          <Chevron />
        </SelectSearchable.Trigger>

        <SelectSearchable.Dropdown className="demoSelectDropdown">
          <SelectSearchable.Search className="demoSelectSearchInput" placeholder="Search…" />
          <SelectSearchable.OptionList>
            {peopleOptions.map((o, i) => (
              <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
                {o.label}
              </SelectSearchable.Option>
            ))}
          </SelectSearchable.OptionList>
        </SelectSearchable.Dropdown>
      </SelectSearchable.Root>
    </>
  ),
};

export const ShowHideAnimation: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options, onValueChange }: MySelectSearchableProps) => {
  return (
    <>
      <style>
        {\`
          /*
            Override default visibility-based hiding and
            animate opacity using state hooks.
          */

          [data-part="dropdown"] {
            visibility: visible;
            transition: opacity 200ms ease;
          }

          [data-part="dropdown"][data-state="closed"] {
            opacity: 0;
          }

          [data-part="dropdown"][data-state="open"] {
            opacity: 1;
          }
        \`}
      </style>

      <SelectSearchable.Root
        style={{ maxWidth: 240 }}
        onValueChange={onValueChange}
        aria-label="Select Person" // You can use a <label> instead
      >
        <SelectSearchable.Trigger>
          <SelectSearchable.TriggerValue placeholder="Choose..." />
          <Chevron />
        </SelectSearchable.Trigger>

        <SelectSearchable.Dropdown>
          <SelectSearchable.Search placeholder="Search…" />
          <SelectSearchable.OptionList>
            {options.map((option) => (
              <SelectSearchable.Option key={option.id} value={option.value}>
                {option.label}
              </SelectSearchable.Option>
            ))}
          </SelectSearchable.OptionList>
        </SelectSearchable.Dropdown>
      </SelectSearchable.Root>
    </>
  );
};
        `.trim(),
      },
    },
  },
  render: () => (
    <>
      <style>{`
        [data-part="dropdown"] {
          visibility: visible;
          transition: opacity 200ms ease;
        }

        [data-part="dropdown"][data-state="closed"] {
          opacity: 0;
        }

        [data-part="dropdown"][data-state="open"] {
          opacity: 1;
        }
      `}</style>

      <SelectSearchable.Root
        style={{ maxWidth: 240 }}
        onValueChange={(val) => console.log(val)}
        aria-label="Select Person"
      >
        <SelectSearchable.Trigger>
          <SelectSearchable.TriggerValue placeholder="Choose..." />
          <Chevron />
        </SelectSearchable.Trigger>

        <SelectSearchable.Dropdown>
          <SelectSearchable.Search placeholder="Search…" />
          <SelectSearchable.OptionList>
            {peopleOptions.map((o, i) => (
              <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
                {o.label}
              </SelectSearchable.Option>
            ))}
          </SelectSearchable.OptionList>
        </SelectSearchable.Dropdown>
      </SelectSearchable.Root>
    </>
  ),
};