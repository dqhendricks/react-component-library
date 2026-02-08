export type PersonOption = { value: string; label: string };

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

const firstNames = [
  'Alice','Benjamin','Charlotte','Daniel','Emily','Frederick','Grace','Henry','Isabella','James',
  'Katherine','Liam','Maya','Noah','Olivia','Patrick','Quinn','Rachel','Samuel','Tanya',
  'Uma','Victor','William','Xavier','Yara','Zachary','Aiden','Bianca','Caleb','Diana',
  'Ethan','Fatima','Gavin','Hana','Ibrahim','Jade','Kai','Leila','Mateo','Nina',
] as const;

const lastNames = [
  'Johnson','Wright','Nguyen','Alvarez','Thompson','Moore','Kim','Patel','Rossi','Anderson',
  'Lee','O’Connor','Fernandez','Stein','Brooks','Doyle','Matthews','Cohen','Park','Ivanova',
  'Srinivasan','Chen','Turner','Morales','Haddad','Phillips','Foster','Silva','Young','Kowalski',
  'Khan','Garcia','Martinez','Brown','Taylor','Clark','Lopez','Walker','Hall','Rivera',
] as const;

export function generatePeople(count: number, seed = 42): PersonOption[] {
  const rng = mulberry32(seed);
  const out: PersonOption[] = [];
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