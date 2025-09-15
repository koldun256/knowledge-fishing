export const Assets = {
    images: {},
    loadImage(key, src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { this.images[key] = img; resolve(img); };
        img.onerror = reject;
        img.src = src;
      });
    },
    get(key) { return this.images[key]; }
  };