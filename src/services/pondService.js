import { mockPonds } from '../data/mockData';

export const pondService = {
  getAllPonds: () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPonds), 500);
    });
  },
  getPondById: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPonds.find(pond => pond.id === parseInt(id))), 500);
    });
  }
};