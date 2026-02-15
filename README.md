# React Component Library

A small, composable, accessibility-focused React component library.

Currently includes:

- `SelectSearchable` (combobox / select)

Storybook docs:
https://dustinhendricks.com/components

---

## Getting Started

Install dependencies:

```bash
npm install
````

Run Storybook locally:

```bash
npm run storybook
```

Build static Storybook:

```bash
npm run build-storybook
```

---

## SelectSearchable

Composable select/combobox built with:

* React 18
* TypeScript (strict)
* ARIA 1.2 combobox pattern (active-descendant model)
* Portal-safe dropdown rendering
* Minimally styled core (bring your own design system)

Minimal example:

```tsx
<SelectSearchable.Root>
  <SelectSearchable.Label>People</SelectSearchable.Label>

  <SelectSearchable.Trigger>
    <SelectSearchable.TriggerValue />
  </SelectSearchable.Trigger>
  <SelectSearchable.Dropdown>
    <SelectSearchable.Search />
    <SelectSearchable.Option value="1">
      Alice
    </SelectSearchable.Option>
    <SelectSearchable.Option value="2">
      Bob
    </SelectSearchable.Option>
  </SelectSearchable.Dropdown>

  <SelectSearchable.Error></SelectSearchable.Error>
</SelectSearchable.Root>
```

See Storybook for full usage patterns and accessibility behavior.

---

## Development

```bash
npm run dev
npm run storybook
```

---

## License

MIT © 2026 Dustin Hendricks
See `LICENSE` for details.