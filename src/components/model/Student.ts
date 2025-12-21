export interface Student {
    registration_number: string;
    picture: string;
    lastname: string;
    firstname: string;
    birth_date: string;
    place_of_birth: string;
    cin: string;
    place_of_cin: string;
    date_of_cin: string;
    contact: string[];
    email: string;
    address: string;

    // // Ajout : Relations (optionnelles pour l'instant)
    // // Cela permettra de lier un étudiant à son niveau/groupe
    // level?: Level;
    // course?: Course;
    // group?: Group;
}