import { mockFishes } from '../data/mockData';

export const fishService = {
  getFishesByPondId: (pondId) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockFishes.filter(fish => fish.pond_id === parseInt(pondId))), 500);
    });
  },
  updateFishDepth: (fishId, newDepthLevel) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fishIndex = mockFishes.findIndex(fish => fish.id === fishId);
        if (fishIndex !== -1) {
          mockFishes[fishIndex].depth_level = newDepthLevel;
          if (newDepthLevel === 3) {
            mockFishes[fishIndex].status = "mastered";
          } else if (newDepthLevel === 2) {
            mockFishes[fishIndex].status = "reviewing";
          } else {
            mockFishes[fishIndex].status = "new";
          }
        }
        resolve(mockFishes[fishIndex]);
      }, 300);
    });
  }
};