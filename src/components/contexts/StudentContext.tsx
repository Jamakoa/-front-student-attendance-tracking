import { createContext } from "react";
import type { Student } from "@/components/model/Student";


interface StudentContextType {
  students: Student[];
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);