import type { ReactNode } from "react"; 
import { useState /*, useEffect*/ } from "react";
import { StudentContext } from "../StudentContext";
import type { Student } from "@/components/model/Student";
import { MOCK_STUDENTS } from "@/data/mockData";

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  //const [students, setStudents] = useState<Student[]>([]);
  const [students] = useState<Student[]>(MOCK_STUDENTS);


//   useEffect(() => {
//     const dataStudents = Student.listStudents();
//     setStudents(dataStudents);
//   }, []);

  // // Fonction pour ajouter un étudiant
  // const addStudent = (newStudent: Student) => {
  //   setStudents((prev) => [...prev, newStudent]);
  // };

  // // Fonction pour modifier un étudiant existant
  // const updateStudent = (updatedStudent: Student) => {
  //   setStudents((prev) =>
  //     prev.map((student) =>
  //       student.registration_number === updatedStudent.registration_number
  //         ? updatedStudent
  //         : student
  //     )
  //   );
  // };

  // // Fonction pour supprimer un étudiant
  // const deleteStudent = (registrationNumber: string) => {
  //   setStudents((prev) => 
  //     prev.filter((student) => student.registration_number !== registrationNumber)
  //   );
  // };



  return (
    <StudentContext.Provider value={{ 
      students    }}>
      {children}
    </StudentContext.Provider>
  );
};