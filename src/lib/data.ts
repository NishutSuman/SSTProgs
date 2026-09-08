import studentsJson from "../data/students.json";
import grievancesJson from "../data/grievances.json";
import type { RawStudent } from "../engine/types";

export interface Grievance {
  studentId: string;
  classNo: string;
  subject: string;
  comment: string;
}

export const STUDENTS = studentsJson as unknown as RawStudent[];
export const GRIEVANCES = grievancesJson as unknown as Grievance[];
