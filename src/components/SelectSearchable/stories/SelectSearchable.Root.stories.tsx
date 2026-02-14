import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectSearchable, type SelectSearchableValue } from '..';
import { generatePeople } from '../../../storybook/utils/generatePeople';

const peopleOptions = generatePeople(50);

/* Helper components */

function Chevron() {
  return (
    <span
      aria-hidden='true'
      style={{
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '6px solid currentColor',
        opacity: 0.85,
        flex: '0 0 auto',
      }}
    />
  );
}

function UpDownChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden='true'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        borderRadius: 6,
        flex: '0 0 auto',
        transition: 'transform 140ms ease, opacity 140ms ease',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        opacity: 0.85,
      }}
    >
      <span
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '7px solid currentColor',
        }}
      />
    </span>
  );
}

/* Meta */

const meta = {
  title: 'Components/SelectSearchable',
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

const PlaygroundComponent = (args: any) => {
  const [touched, setTouched] = useState(false);
  const [value, setValue] = useState<SelectSearchableValue>();

  const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
  const error = touched && !hasValue ? 'Please select a person.' : undefined;

  return (
    <SelectSearchable.Root
      {...args}
      aria-invalid={!!error}
      onValueChange={(val: SelectSearchableValue) => {
        setValue(val);
        console.log(val);
      }}
      onBlur={() => {
        setTouched(true);
      }}
    >
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>

      <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
        <SelectSearchable.TriggerValue placeholder="Choose…" />
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

      <SelectSearchable.Error hideWhenValid>{error}</SelectSearchable.Error>
    </SelectSearchable.Root>
  );
};

export const Playground: Story = {
  parameters: {
    docsOnly: true,
    controls: { disable: false },
    docs: {
      source: {
        code: `
import { useState } from 'react';
import { SelectSearchable, type SelectSearchableValue } from './SelectSearchable';
import { Chevron } from './Chevron'; // Not included
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options, multiple }: MySelectSearchableProps) => {
  const [touched, setTouched] = useState(false);
  const [value, setValue] = useState<SelectSearchableValue>();

  const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
  const error = touched && !hasValue ? 'Please select a person.' : undefined;

  <SelectSearchable.Root
    multiple={multiple}
    aria-invalid={!!error}
    onValueChange={(val: SelectSearchableValue) => {
      setValue(val);
      console.log(val);
    }}
    onBlur={() => {
      setTouched(true);
    }}
  >
    <SelectSearchable.Label>Select Person</SelectSearchable.Label>
    <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
      <SelectSearchable.TriggerValue placeholder='Choose…' />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder='Search…' />
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>

    <SelectSearchable.Error hideWhenValid>{error}</SelectSearchable.Error>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  tags: ['!dev'],
  argTypes: {
    // native select props
    name: {
      control: false,
      description:
        'The name of the form control, used to identify the field and its value when the form data is submitted to a server.',
      table: { type: { summary: 'text' } },
    },
    form: {
      control: false,
      description:
        'Associates the control with a form element by `id`, allowing it to submit with that form even if rendered outside the `<form>`.',
      table: { type: { summary: 'text' } },
    },
    multiple: {
      control: 'boolean',
      description: 'Allow selecting multiple values.',
      table: { type: { summary: 'boolean' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the control.',
      table: { type: { summary: 'boolean' } },
    },
    required: {
      control: false,
      description:
        'Specifies that the select field must be filled out before the form can be submitted.',
      table: { type: { summary: 'boolean' } },
    },
    value: {
      control: false,
      description: 'Value for controlled usage. Type depends on `multiple` (string | string[]).',
      table: { type: { summary: 'string | string[]' } },
    },
    defaultValue: {
      control: false,
      description: 'Initial value for uncontrolled usage. Type depends on `multiple` (string | string[]).',
      table: { type: { summary: 'string | string[]' } },
    },
    onChange: {
      control: false,
      description: 'Native change handler from the underlying (hidden) `<select>`. Useful for form libraries.',
      table: { type: { summary: '(e: React.ChangeEvent<HTMLSelectElement>) => void' } },
    },
    onInvalid: {
      control: false,
      description: 'Native invalid handler from the underlying (hidden) `<select>`, fired during form validation.',
      table: { type: { summary: '(e: React.InvalidEvent<HTMLSelectElement>) => void' } },
    },
    onValueChange: {
      control: false,
      description: 'Convenience handler for receiving the committed value. Signature depends on `multiple`.',
      table: {
        type: { summary: '(value: string | undefined) => void | (value: string[] | undefined) => void' },
      },
    },

    // composite props
    id: {
      control: false,
      description: '`id` is forwarded to the Trigger, as well as used to derive sub-component `id`s to be used for accessibility. If none is provided, one will be generated.',
      table: { type: { summary: 'text' } },
    },
    onFocus: {
      control: false,
      description:
        'Fires when focus enters the composite control (Trigger/Search). Event is proxied to behave like a native select focus event.',
      table: { type: { summary: '(e: FocusLikeEvent) => void' } },
    },
    onBlur: {
      control: false,
      description:
        'Fires when focus leaves the composite control. Event is proxied to behave like a native select blur event.',
      table: { type: { summary: '(e: FocusLikeEvent) => void' } },
    },

    // aria props
    'aria-label': {
      control: false,
      description:
        'Accessible name for the control when no visible label or aria-labelledby is provided. Forwarded to internal focusable elements.',
      table: { type: { summary: 'string' } },
    },
    'aria-labelledby': {
      control: false,
      description:
        'Space-separated id reference(s) of element(s) that label the control. Forwarded to internal focusable elements. Prefer when using a visible `<label>`.',
      table: { type: { summary: 'string' } },
    },
    'aria-description': {
      control: false,
      description:
        'Additional accessible description text. Forwarded to internal focusable elements. Screen reader support varies.',
      table: { type: { summary: 'string' } },
    },
    'aria-describedby': {
      control: false,
      description:
        'Space-separated id reference(s) of element(s) that describe the control (e.g., help or error text). Forwarded to internal focusable elements.',
      table: { type: { summary: 'string' } },
    },
    'aria-invalid': {
      control: false,
      description:
        'Marks the control as invalid. Applied to the combobox element (Search when present, otherwise Trigger).',
      table: { type: { summary: 'boolean | "true" | "false" | "grammar" | "spelling"' } },
    },
    'aria-errormessage': {
      control: false,
      description:
        'Id reference of the element containing the error message. When aria-invalid is true, the id is merged into aria-describedby and applied to internal focusable elements.',
      table: { type: { summary: 'string' } },
    },

    // root props
    children: {
      control: false,
      description: 'Subcomponents composing the select (Label, Trigger, Dropdown, Search, OptionList, Option, etc.).',
      table: { type: { summary: 'React.ReactNode' } },
    },
  },
  render: (args) => <PlaygroundComponent {...args} />,
};

export const SingleSelection: Story = {
  parameters: {
    docs: {
      source: {
        code: `
import { SelectSearchable } from './SelectSearchable';
import { Chevron } from './Chevron';
import type { MySelectSearchableProps } from './types';

export const MySelectSearchable = ({ options, onValueChange, error }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    onValueChange={onValueChange}
    aria-invalid={!!error}
  >
    <SelectSearchable.Label>Select Person</SelectSearchable.Label>
    <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
      <SelectSearchable.TriggerValue placeholder='Choose…' />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder='Search…' />
      <SelectSearchable.OptionList>
        {options.map((option) => (
          <SelectSearchable.Option key={option.id} value={option.value}>
            {option.label}
          </SelectSearchable.Option>
        ))}
      </SelectSearchable.OptionList>
    </SelectSearchable.Dropdown>

    <SelectSearchable.Error hideWhenValid>{error}</SelectSearchable.Error>
  </SelectSearchable.Root>
};
        `.trim(),
      },
    },
  },
  render: () => (
    <SelectSearchable.Root onValueChange={(val) => console.log(val)}>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>
      <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
        <SelectSearchable.TriggerValue placeholder='Choose…' />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder='Search…' />
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

export const MySelectSearchable = ({ options, onValueChange, error }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    multiple
    onValueChange={onValueChange}
    aria-invalid={!!error}
  >
    <SelectSearchable.Label>Select Person</SelectSearchable.Label>
    <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
      <SelectSearchable.TriggerValue placeholder='Choose…' />
      <Chevron />
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder='Search…' />
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
      onValueChange={(val) => console.log(val)}
    >
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>
      <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
        <SelectSearchable.TriggerValue placeholder='Choose…' />
        <Chevron />
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder='Search…' />
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

export const MySelectSearchable = ({ options, error }: MySelectSearchableProps) => {
  <SelectSearchable.Root aria-invalid={!!error}>
    <SelectSearchable.Label>Select Person</SelectSearchable.Label>
    <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
      <SelectSearchable.TriggerValue placeholder='Choose…' />
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
    <SelectSearchable.Root>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>
      <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
        <SelectSearchable.TriggerValue placeholder='Choose…' />
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

export const MySelectSearchable = ({ options, error }: MySelectSearchableProps) => {
  <SelectSearchable.Root
    multiple
    aria-invalid={!!error}
  >
    <SelectSearchable.Label>Select Person</SelectSearchable.Label>
    <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
      {({ values, isOpen }) => {
        // You should use value or values, depending on whether multiple is true
        const display = values.join(', ');

        return (
          <>
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                opacity: display ? 1 : 0.7,
              }}
            >
              {display || 'Choose…'}
            </div>

            <UpDownChevron isOpen={isOpen} />
          </>
        );
      }}
    </SelectSearchable.Trigger>

    <SelectSearchable.Dropdown>
      <SelectSearchable.Search placeholder='Search…' />
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
    <SelectSearchable.Root>
      <SelectSearchable.Label>Select Person</SelectSearchable.Label>
      <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
        {({ values, isOpen }) => {
          const display = values.join(', ');

          return (
            <>
              <div
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  opacity: display ? 1 : 0.7,
                }}
              >
                {display || 'Choose…'}
              </div>

              <UpDownChevron isOpen={isOpen} />
            </>
          );
        }}
      </SelectSearchable.Trigger>

      <SelectSearchable.Dropdown>
        <SelectSearchable.Search placeholder='Search…' />
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

export const MySelectSearchable = ({ options, error }: MySelectSearchableProps) => {
  <>
    <style>
      {\`
        /* Styling Trigger with className */
        .demoSelect {
          max-width: 240px;
        }

        /* Styling with 'part' styling hooks */
        [data-part='trigger'] {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.25);
        }

        /* Styling with combinations of class and styling hooks */
        .demoSelectContainer [data-part='label'] {
          font-family: Arial, Helvetica, sans-serif;
        }

        /* Styling with 'state' styling hooks */
        .demoSelect[data-state='closed'] {
          background: rgba(0,0,0,0.02);
        }
        .demoSelect[data-state='open'] {
          background: rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.5);
        }

        /* Styling within the portalled dropdown using styling hooks */
        /* Due to portalling, these will not be children of the Root element */
        .demoSelectDropdown [data-part='option'] {
          cursor: crosshair;
        }

        .demoSelectDropdown [data-part='option'][data-active] {
          outline: 2px solid rgba(0,0,0,0.35);
          background: rgba(0,0,255,0.06);
        }

        .demoSelectDropdown [data-part='option'][data-selected] {
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

    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} class='demoSelectContainer'>
      <SelectSearchable.Root aria-invalid={!!error}>
        <SelectSearchable.Label>Select Person</SelectSearchable.Label>
        <SelectSearchable.Trigger className='demoSelect'>
          <SelectSearchable.TriggerValue
            // Inline styling of a sub component
            style={{ fontFamily: '"Courier New", monospace' }}
            placeholder='Choose…'
          />
          <Chevron />
        </SelectSearchable.Trigger>

        <SelectSearchable.Dropdown className='demoSelectDropdown'>
          <SelectSearchable.Search
            className='demoSelectSearchInput'
            placeholder='Search…'
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
    </div>
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
          /* Styling Trigger with className */
          .demoSelect {
            max-width: 240px;
          }

          /* Styling with 'part' styling hooks */
          [data-part='trigger'] {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid rgba(0,0,0,0.25);
          }

          /* Styling with combinations of class and styling hooks */
          .demoSelectContainer [data-part='label'] {
            font-family: Arial, Helvetica, sans-serif;
          }

          /* Styling with 'state' styling hooks */
          .demoSelect[data-state='closed'] {
            background: rgba(0,0,0,0.02);
          }
          .demoSelect[data-state='open'] {
            background: rgba(0,0,0,0.06);
            border-color: rgba(0,0,0,0.5);
          }

          /* Styling within the portalled dropdown using styling hooks */
          /* Due to portalling, these will not be children of the Root element */
          .demoSelectDropdown [data-part='option'] {
            cursor: crosshair;
          }

          .demoSelectDropdown [data-part='option'][data-active] {
            outline: 2px solid rgba(0,0,0,0.35);
            background: rgba(0,0,255,0.06);
          }

          .demoSelectDropdown [data-part='option'][data-selected] {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className='demoSelectContainer'>
        <SelectSearchable.Root>
          <SelectSearchable.Label>Select Person</SelectSearchable.Label>
          <SelectSearchable.Trigger className='demoSelect'>
            <SelectSearchable.TriggerValue
              // Inline styling of a sub component
              style={{ fontFamily: '"Courier New", monospace' }}
              placeholder='Choose…'
            />
            <Chevron />
          </SelectSearchable.Trigger>

          <SelectSearchable.Dropdown className='demoSelectDropdown'>
            <SelectSearchable.Search className='demoSelectSearchInput' placeholder='Search…' />
            <SelectSearchable.OptionList>
              {peopleOptions.map((o, i) => (
                <SelectSearchable.Option key={`${o.label}-${i}`} value={o.label}>
                  {o.label}
                </SelectSearchable.Option>
              ))}
            </SelectSearchable.OptionList>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>
      </div>
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

export const MySelectSearchable = ({ options, error }: MySelectSearchableProps) => {
  return (
    <>
      <style>
        {\`
          /*
            Override default visibility-based hiding and
            animate opacity using state hooks.
          */

          [data-part='dropdown'] {
            visibility: visible;
            transition: opacity 200ms ease;
          }

          [data-part='dropdown'][data-state='closed'] {
            opacity: 0;
          }

          [data-part='dropdown'][data-state='open'] {
            opacity: 1;
          }
        \`}
      </style>

      <SelectSearchable.Root aria-invalid={!!error}>
        <SelectSearchable.Label>Select Person</SelectSearchable.Label>
        <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
          <SelectSearchable.TriggerValue placeholder='Choose…' />
          <Chevron />
        </SelectSearchable.Trigger>

        <SelectSearchable.Dropdown>
          <SelectSearchable.Search placeholder='Search…' />
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
        [data-part='dropdown'] {
          visibility: visible;
          transition: opacity 200ms ease;
        }

        [data-part='dropdown'][data-state='closed'] {
          opacity: 0;
        }

        [data-part='dropdown'][data-state='open'] {
          opacity: 1;
        }
      `}</style>

      <SelectSearchable.Root>
        <SelectSearchable.Label>Select Person</SelectSearchable.Label>
        <SelectSearchable.Trigger style={{ maxWidth: 240 }}>
          <SelectSearchable.TriggerValue placeholder='Choose…' />
          <Chevron />
        </SelectSearchable.Trigger>

        <SelectSearchable.Dropdown>
          <SelectSearchable.Search placeholder='Search…' />
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