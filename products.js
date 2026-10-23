// =========================================================
// products.js: the list of sneakers sold in the shop.
// To add a new sneaker, copy one object and change its values.
// "colors" are used to draw the sneaker picture: [upper, sole, accent]
// =========================================================

const PRODUCTS = [
  {
    id: "mc-01", name: "Street Runner Low", brand: "Nike-Style", price: 3499,
    sizes: [7, 8, 9, 10, 11], stock: 12,
    colors: ["#f4f4f5", "#18181b", "#ef4444"],
    description: "Everyday low-top runner with a cushioned sole. Perfect for school and casual wear."
  },
  {
    id: "mc-02", name: "Court Classic", brand: "Adidas-Style", price: 2999,
    sizes: [6, 7, 8, 9, 10], stock: 8,
    colors: ["#ffffff", "#e4e4e7", "#16a34a"],
    description: "Clean white court sneaker that matches any outfit."
  },
  {
    id: "mc-03", name: "Jeepney Retro High", brand: "MC Original", price: 4299,
    sizes: [8, 9, 10, 11, 12], stock: 5,
    colors: ["#facc15", "#1f2937", "#2563eb"],
    description: "High-top inspired by the colors of the Filipino jeepney. Limited stock."
  },
  {
    id: "mc-04", name: "Midnight Trainer", brand: "Nike-Style", price: 3899,
    sizes: [7, 8, 9, 10], stock: 10,
    colors: ["#18181b", "#3f3f46", "#a1a1aa"],
    description: "All-black trainer for the gym and the streets."
  },
  {
    id: "mc-05", name: "Eskinita Skate", brand: "MC Original", price: 2599,
    sizes: [6, 7, 8, 9, 10, 11], stock: 15,
    colors: ["#7c2d12", "#fef3c7", "#f97316"],
    description: "Durable skate shoe with a flat grippy sole."
  },
  {
    id: "mc-06", name: "Cloud Walk", brand: "New Balance-Style", price: 4599,
    sizes: [7, 8, 9, 10, 11], stock: 6,
    colors: ["#cbd5e1", "#f8fafc", "#0ea5e9"],
    description: "Extra-soft chunky sole for all-day comfort."
  },
  {
    id: "mc-07", name: "Sunset Basketball", brand: "Adidas-Style", price: 5199,
    sizes: [8, 9, 10, 11, 12], stock: 4,
    colors: ["#f43f5e", "#111827", "#fde047"],
    description: "Supportive high-top made for the court."
  },
  {
    id: "mc-08", name: "Kanto Slip-On", brand: "MC Original", price: 1899,
    sizes: [6, 7, 8, 9, 10], stock: 20,
    colors: ["#334155", "#f1f5f9", "#94a3b8"],
    description: "Easy slip-on canvas sneaker for quick errands."
  }
];

// Cities where the shop delivers, and the shipping fee for each
const SHIPPING_FEES = {
  "Parañaque City": 80,
  "Las Piñas City": 80,
  "Pasay City": 100,
  "Muntinlupa City": 100,
  "Makati City": 120,
  "Taguig City": 120,
  "Manila": 150,
  "Quezon City": 180
};