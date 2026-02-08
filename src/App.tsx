import { useMemo } from 'react';
import { SelectSearchable } from './components/SelectSearchable';

type PersonOption = { value: string; label: string };

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function generatePeople(count: number, seed = 12345): PersonOption[] {
  // Keep these lists small-ish; mixing them gives tons of combinations.
  const firstNames = [
    'Alice', 'Benjamin', 'Charlotte', 'Daniel', 'Emily', 'Frederick', 'Grace', 'Henry', 'Isabella', 'James',
    'Katherine', 'Liam', 'Maya', 'Noah', 'Olivia', 'Patrick', 'Quinn', 'Rachel', 'Samuel', 'Tanya',
    'Uma', 'Victor', 'William', 'Xavier', 'Yara', 'Zachary', 'Aiden', 'Bianca', 'Caleb', 'Diana',
    'Ethan', 'Fatima', 'Gavin', 'Hana', 'Ibrahim', 'Jade', 'Kai', 'Leila', 'Mateo', 'Nina',
  ] as const;

  const lastNames = [
    'Johnson', 'Wright', 'Nguyen', 'Alvarez', 'Thompson', 'Moore', 'Kim', 'Patel', 'Rossi', 'Anderson',
    'Lee', 'O’Connor', 'Fernandez', 'Stein', 'Brooks', 'Doyle', 'Matthews', 'Cohen', 'Park', 'Ivanova',
    'Srinivasan', 'Chen', 'Turner', 'Morales', 'Haddad', 'Phillips', 'Foster', 'Silva', 'Young', 'Kowalski',
    'Khan', 'Garcia', 'Martinez', 'Brown', 'Taylor', 'Clark', 'Lopez', 'Walker', 'Hall', 'Rivera',
  ] as const;

  const rng = mulberry32(seed);
  const out: PersonOption[] = [];

  // Ensure uniqueness by suffixing duplicates (rare, but possible).
  const seen = new Map<string, number>();

  for (let i = 0; i < count; i++) {
    const base = `${pick(rng, firstNames)} ${pick(rng, lastNames)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const label = n === 1 ? base : `${base} ${n}`;
    out.push({ value: String(i + 1), label });
  }

  return out;
}

function App() {
  // Generated once per mount (dev note: React StrictMode in CRA will mount twice in dev).
  const options = useMemo(() => generatePeople(500, 42), []);

  return (
    <>
      <h1>Component Library</h1>
      <div>
        <p>SelectSearchable</p>

        <SelectSearchable.Root
          style={{ maxWidth: 200 }}
          onValueChange={(val) => console.log(val)}
          multiple
        >
          <SelectSearchable.Trigger>
            <SelectSearchable.TriggerValue placeholder='Choose…' />

            {/* Custom chevron (no libs) */}
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
          </SelectSearchable.Trigger>

          <SelectSearchable.Dropdown>
            <SelectSearchable.Search placeholder='Search…' />

            <SelectSearchable.OptionList>
              {options.map((o, i) => (
                <SelectSearchable.Option key={i + o.label} value={o.label}>
                  {o.label}
                </SelectSearchable.Option>
              ))}
            </SelectSearchable.OptionList>
          </SelectSearchable.Dropdown>
        </SelectSearchable.Root>
      </div>
    </>
  );
}

export default App;