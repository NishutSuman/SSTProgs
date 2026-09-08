// Dummy SST program team, per the assignment's org structure. Used for ticket/grievance
// ownership and as the default alert recipients. (Placeholder names/emails for the demo.)

export interface Staff {
  role: string;
  name: string;
  email: string;
  batch?: string; // for batch interns (L1 ticket owner)
  level: "L1" | "L2" | "L3";
}

export const STAFF: Staff[] = [
  { role: "Director - Academics", name: "Meera Iyer", email: "meera.iyer@sst.demo", level: "L3" },
  { role: "Program Manager", name: "Aarav Mehta", email: "aarav.mehta@sst.demo", level: "L3" },
  { role: "Junior PM", name: "Priya Nair", email: "priya.nair@sst.demo", level: "L2" },
  { role: "Intern - Batch A", name: "Rohan Das", email: "rohan.das@sst.demo", batch: "A", level: "L1" },
  { role: "Intern - Batch B", name: "Sneha Rao", email: "sneha.rao@sst.demo", batch: "B", level: "L1" },
  { role: "Intern - Batch C", name: "Karan Singh", email: "karan.singh@sst.demo", batch: "C", level: "L1" },
];

/** L1 owner for a batch's tickets is that batch's intern. */
export function ownerForBatch(batch: string): Staff | undefined {
  return STAFF.find((s) => s.batch === batch);
}

export const PROGRAM_MANAGER = STAFF.find((s) => s.role === "Program Manager")!;
export const JUNIOR_PM = STAFF.find((s) => s.role === "Junior PM")!;
