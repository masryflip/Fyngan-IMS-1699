const companyConfig = {
  name: "Fyngan IMS",
  shortName: "FI",
  logo: "/logo.png",
  
  email: "admin@fyngan.com",
  phone: "+20 (10) 123-4567",
  website: "https://fyngan.com",
  
  address: {
    street: "123 Business Street",
    city: "Cairo",
    state: "Cairo Governorate",
    zip: "12345",
    country: "Egypt"
  },
  
  currency: "EGP",
  currencySymbol: "ج.م",
  timezone: "Africa/Cairo",
  dateFormat: "dd/MM/yyyy",
  
  defaultLowStockThreshold: 5,
  defaultMaxStock: 100,
  
  features: {
    multiLocation: true,
    userManagement: true,
    reporting: true,
    notifications: true,
    transfers: true,
    orders: true
  },
  
  defaultCategories: [
    "Coffee Beans",
    "Dairy", 
    "Sweeteners",
    "Supplies",
    "Syrups"
  ],
  
  defaultSuppliers: [
    "Premium Coffee Co.",
    "Local Bean Supply",
    "Fresh Dairy Farm",
    "Sweet Supply Co.",
    "Eco Pack Solutions",
    "Flavor Masters"
  ]
};

export { companyConfig };