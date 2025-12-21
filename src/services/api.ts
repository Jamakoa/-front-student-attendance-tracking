import axios from 'axios';

// On récupère l'URL depuis le .env ou on met une valeur par défaut
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // Optionnel : annule la requête après 10s
});

// --- INTERCEPTEURS (La force d'Axios) ---

// 1. Intercepteur de Réponse : On nettoie les données reçues
api.interceptors.response.use(
  (response) => {
    // On retourne directement la "data" pour ne pas avoir à faire .data.data partout
    return response.data;
  },
  (error) => {
    // Gestion globale des erreurs
    const message = error.response?.data?.message || "Une erreur est survenue";
    
    console.error("Erreur API:", message);
    
    // Astuce : Si erreur 401 (Non autorisé), on pourrait rediriger vers le login ici
    // if (error.response?.status === 401) { window.location.href = '/login'; }

    return Promise.reject(new Error(message));
  }
);