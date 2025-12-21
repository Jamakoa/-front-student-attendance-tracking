import { useContext } from "react";
import { StudentContext } from "../contexts/StudentContext";

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent doit être utilisé à l’intérieur de StudentProvider");
  }
  return context;
};