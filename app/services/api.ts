import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = 'http://127.0.0.1:8078';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define the BloodPressureReading interface
export interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;  // Changed from heartRate to heart_rate to match API
  timestamp: string;   // Changed from number to string to match API
  note?: string;
}

// Define the interface for creating a reading (matches API expectations)
export interface CreateReadingDto {
  systolic: number;
  diastolic: number;
  heart_rate: number;
  timestamp: string;
  note?: string;
}

// API functions for blood pressure readings
export const readingsApi = {
  // Get all readings
  getAll: async (): Promise<BloodPressureReading[]> => {
    try {
      const response = await api.get('/readings/');
      // The API returns an object with a "readings" property that contains the array
      if (response.data && response.data.readings && Array.isArray(response.data.readings)) {
        return response.data.readings;
      }
      return [];
    } catch (error) {
      console.error('Error fetching readings:', error);
      throw error;
    }
  },

  // Get a specific reading by ID
  getById: async (id: string): Promise<BloodPressureReading> => {
    try {
      const response = await api.get(`/readings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reading with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new reading
  create: async (reading: CreateReadingDto): Promise<BloodPressureReading> => {
    try {
      const response = await api.post('/readings/', reading);
      return response.data;
    } catch (error) {
      console.error('Error creating reading:', error);
      throw error;
    }
  },

  // Update an existing reading
  update: async (id: string, reading: Partial<CreateReadingDto>): Promise<BloodPressureReading> => {
    try {
      const response = await api.put(`/readings/${id}`, reading);
      return response.data;
    } catch (error) {
      console.error(`Error updating reading with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a reading
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/readings/${id}`);
    } catch (error) {
      console.error(`Error deleting reading with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete all readings
  deleteAll: async (): Promise<void> => {
    try {
      await api.delete('/readings/');
    } catch (error) {
      console.error('Error deleting all readings:', error);
      throw error;
    }
  }
};

export default api;
