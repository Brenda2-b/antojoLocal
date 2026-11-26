export const seedSellers = [
  {
    id: "seller-lupita",
    name: "Lupita Hernández",
    identity: "lupita@antojolocal.mx",
    password: "antojo123",
    phone: "+525512345678",
    role: "seller",
    zone: "Centro",
    latitude: 19.4326,
    longitude: -99.1332,
    available: true
  },
  {
    id: "seller-marco",
    name: "Marco Ruiz",
    identity: "marco@antojolocal.mx",
    password: "antojo123",
    phone: "+525598765432",
    role: "seller",
    zone: "San Mateo",
    latitude: 19.4065,
    longitude: -99.1627,
    available: true
  },
  {
    id: "seller-ana",
    name: "Ana Salgado",
    identity: "ana@antojolocal.mx",
    password: "antojo123",
    phone: "+525555501234",
    role: "seller",
    zone: "Las Vegas",
    latitude: 19.4471,
    longitude: -99.1077,
    available: true
  }
];

export const seedProducts = [
  {
    id: "product-esquites",
    sellerId: "seller-lupita",
    name: "Esquites de la Lupita",
    category: "Antojitos",
    price: 45,
    description: "Elotito tierno con epazote, limón y chilito del que sí pica. Preparados al momento con mucho queso.",
    delivery: "both",
    address: "Calle de la Palma 18, a media cuadra del kiosco",
    zone: "Centro",
    latitude: 19.4332,
    longitude: -99.1325,
    emoji: "🌽",
    imageTone: "image-yellow",
    menu: [
      { name: "Esquite clásico", price: 45 },
      { name: "Con tuétano", price: 70 },
      { name: "Elote entero", price: 40 }
    ]
  },
  {
    id: "product-fresas",
    sellerId: "seller-lupita",
    name: "Fresas con crema",
    category: "Postres",
    price: 60,
    description: "Fresas frescas de temporada con crema batida, un toque de vainilla y granola crujiente.",
    delivery: "delivery",
    address: "",
    zone: "Centro",
    latitude: 19.435,
    longitude: -99.135,
    emoji: "🍓",
    imageTone: "image-pink",
    menu: [
      { name: "Vasito chico", price: 60 },
      { name: "Vasito grande", price: 85 },
      { name: "Con extra de granola", price: 95 }
    ]
  },
  {
    id: "product-gomitas",
    sellerId: "seller-marco",
    name: "Gomitas enchiladas",
    category: "Botanas",
    price: 35,
    description: "Mezcla de gomitas aciditas con nuestra salsa de chamoy casera y chilito en polvo.",
    delivery: "local",
    address: "Av. San Mateo 204, junto a la papelería azul",
    zone: "San Mateo",
    latitude: 19.4071,
    longitude: -99.1634,
    emoji: "🍬",
    imageTone: "image-purple",
    menu: [
      { name: "Bolsa chica", price: 35 },
      { name: "Bolsa para compartir", price: 65 }
    ]
  },
  {
    id: "product-aguas",
    sellerId: "seller-marco",
    name: "Aguas frescas naturales",
    category: "Bebidas",
    price: 30,
    description: "Agüita hecha en casa con fruta fresca y sin conservadores. Bien fría para el calorcito.",
    delivery: "both",
    address: "Av. San Mateo 204, junto a la papelería azul",
    zone: "San Mateo",
    latitude: 19.4058,
    longitude: -99.1618,
    emoji: "🥤",
    imageTone: "image-green",
    menu: [
      { name: "Horchata 500 ml", price: 30 },
      { name: "Jamaica 500 ml", price: 30 },
      { name: "Agua de limón con chía 1 L", price: 55 }
    ]
  },
  {
    id: "product-pay",
    sellerId: "seller-ana",
    name: "Pay de limón casero",
    category: "Postres",
    price: 55,
    description: "Base de galleta doradita y relleno cremoso de limón. Hecho hoy, rebanada por rebanada.",
    delivery: "delivery",
    address: "",
    zone: "Las Vegas",
    latitude: 19.4478,
    longitude: -99.1085,
    emoji: "🥧",
    imageTone: "image-orange",
    menu: [
      { name: "Rebanada", price: 55 },
      { name: "Pay completo (8 porciones)", price: 360 }
    ]
  },
  {
    id: "product-tostilocos",
    sellerId: "seller-ana",
    name: "Tostilocos bien preparados",
    category: "Botanas",
    price: 68,
    description: "Con cueritos, pepino, jícama, cacahuate, chamoy y limón. Tú eliges cuánto chilito.",
    delivery: "local",
    address: "Calle del Carmen 31, frente al parque",
    zone: "El Carmen",
    latitude: 19.4237,
    longitude: -99.1214,
    emoji: "🌶️",
    imageTone: "image-blue",
    menu: [
      { name: "Preparados clásicos", price: 68 },
      { name: "Con extra cueritos", price: 78 }
    ]
  }
];

export const seedZones = {
  "Centro": { latitude: 19.4326, longitude: -99.1332 },
  "San Mateo": { latitude: 19.4065, longitude: -99.1627 },
  "Las Vegas": { latitude: 19.4471, longitude: -99.1077 },
  "El Carmen": { latitude: 19.4237, longitude: -99.1214 }
};

export const categories = ["Botanas", "Postres", "Bebidas", "Antojitos", "Otros"];

export const deliveryLabels = {
  local: "Solo en local",
  delivery: "Solo a domicilio",
  both: "Local y a domicilio"
};
