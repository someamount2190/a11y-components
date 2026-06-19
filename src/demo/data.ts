import type { ComboboxOption } from "../lib/components/Combobox";

export const FRAMEWORKS: ComboboxOption[] = [
  { value: "react", label: "React", description: "A JavaScript library for UIs" },
  { value: "vue", label: "Vue", description: "The progressive framework" },
  { value: "svelte", label: "Svelte", description: "Cybernetically enhanced apps" },
  { value: "solid", label: "SolidJS", description: "Fine-grained reactivity" },
  { value: "angular", label: "Angular", description: "Platform for web apps" },
  { value: "qwik", label: "Qwik", description: "Resumable, O(1) loading" },
  { value: "preact", label: "Preact", description: "Fast 3kB React alternative" },
  { value: "lit", label: "Lit", description: "Simple web components" },
  { value: "ember", label: "Ember", description: "Batteries-included", disabled: true },
];

export interface Employee {
  id: string;
  name: string;
  role: string;
  team: string;
  startDate: Date;
  salary: number;
}

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Ada Lovelace", role: "Staff Engineer", team: "Platform", startDate: new Date(2019, 2, 11), salary: 198000 },
  { id: "e2", name: "Grace Hopper", role: "Principal Engineer", team: "Compilers", startDate: new Date(2017, 6, 1), salary: 221000 },
  { id: "e3", name: "Alan Turing", role: "Researcher", team: "Cryptography", startDate: new Date(2021, 0, 18), salary: 176500 },
  { id: "e4", name: "Katherine Johnson", role: "Senior Engineer", team: "Trajectory", startDate: new Date(2020, 9, 5), salary: 165000 },
  { id: "e5", name: "Margaret Hamilton", role: "Engineering Lead", team: "Flight Software", startDate: new Date(2018, 3, 23), salary: 205000 },
  { id: "e6", name: "Dennis Ritchie", role: "Staff Engineer", team: "Systems", startDate: new Date(2016, 11, 9), salary: 199500 },
];

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
export const formatSalary = (n: number) => currency.format(n);

const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
export const formatDate = (d: Date) => dateFmt.format(d);
