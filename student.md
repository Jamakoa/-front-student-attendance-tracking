import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import type { Student } from "@/components/model/index";
import { StudentContext } from "../StudentContext";
import { studentService } from "@/services/studentService";
// import { toast } from "react-hot-toast"; // Si vous voulez les notifs

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        // studentService.getAll() utilise Axios maintenant !
        const data = await studentService.getAll();
        
        // Attention : TypeScript peut se plaindre si l'intercepteur n'est pas typé "strict"
        // mais au runtime, data sera bien votre tableau.
        setStudents(data as unknown as Student[]); 
      } catch (error) {
        console.error("Erreur de chargement", error);
        // toast.error("Impossible de charger les étudiants");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. Ajouter
  const addStudent = async (newStudent: Student) => {
    try {
      const createdStudent = await studentService.create(newStudent);
      setStudents(prev => [...prev, createdStudent as unknown as Student]);
      // toast.success("Étudiant ajouté !");
    } catch (error) {
      console.error(error);
    }
  };

  // ... (updateStudent et deleteStudent suivent la même logique)

  return (
    <StudentContext.Provider value={{ 
        students, 
        addStudent, 
        updateStudent: async () => {}, // À compléter
        deleteStudent: async () => {}  // À compléter
    }}>
      {children}
    </StudentContext.Provider>
  );
};