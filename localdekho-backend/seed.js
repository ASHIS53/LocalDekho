const { db } = require('./src/config/firebase');

const DUMMY_SHOPS = [
  {
    name: 'Apex Tech Hub',
    address: 'Block A, Digital Enclave, New Delhi',
    category: 'Technology',
    lat: 28.6139,
    lng: 77.2090,
    isApproved: true,
    isGlobal: true,
    isOpen: true,
    timings: '10:00 AM - 10:00 PM',
    rating: 4.9,
    totalReviews: 120,
    coverImage: 'https://images.unsplash.com/photo-1531297172868-5f40126b8def?w=800',
    ownerId: 'dummy_owner_1'
  },
  {
    name: 'Urban Threads',
    address: 'High Street, Fashion Square, Mumbai',
    category: 'Fashion',
    lat: 19.0760,
    lng: 72.8777,
    isApproved: true,
    isGlobal: true,
    isOpen: true,
    timings: '11:00 AM - 9:00 PM',
    rating: 4.7,
    totalReviews: 85,
    coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    ownerId: 'dummy_owner_2'
  },
  {
    name: 'FreshMart Premium',
    address: 'Sector 4, Green Park, Bangalore',
    category: 'Grocery',
    lat: 12.9716,
    lng: 77.5946,
    isApproved: true,
    isGlobal: true,
    isOpen: false,
    timings: '07:00 AM - 11:00 PM',
    rating: 4.5,
    totalReviews: 230,
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    ownerId: 'dummy_owner_3'
  }
];

const DUMMY_PRODUCTS = [
  // Tech Shop Products
  {
    name: 'Quantum Noise-Cancelling Headphones',
    price: 14999,
    offer: '20% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
  },
  {
    name: 'Apex Mechanical Keyboard V2',
    price: 8999,
    offer: 'NEW ARRIVAL',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500'
  },
  {
    name: 'Stealth Wireless Mouse',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
  },
  // Fashion Shop Products
  {
    name: 'Midnight Denim Jacket',
    price: 3499,
    offer: '15% OFF',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500'
  },
  {
    name: 'Urban Comfort Sneakers',
    price: 5999,
    offer: 'SALE',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
  },
  {
    name: 'Minimalist Leather Tote',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500'
  },
  // Grocery Shop Products
  {
    name: 'Organic Avocados (Pack of 4)',
    price: 450,
    offer: 'BUY 1 GET 1',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500'
  },
  {
    name: 'Artisan Sourdough Loaf',
    price: 220,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050eb046?w=500'
  },
  {
    name: 'Premium Espresso Beans 500g',
    price: 850,
    offer: '10% OFF',
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Seeding Dummy Data...');
    
    // First, clear existing global shops (optional, to avoid duplicates)
    const existingShops = await db.collection('shops').where('isGlobal', '==', true).get();
    const batch = db.batch();
    existingShops.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('Cleared existing global shops.');

    // Add Shops and their Products
    for (let i = 0; i < DUMMY_SHOPS.length; i++) {
      const shopData = DUMMY_SHOPS[i];
      const newShopRef = await db.collection('shops').add(shopData);
      console.log(`Added shop: ${shopData.name} (${newShopRef.id})`);

      // Add 3 products for this shop
      const shopProducts = DUMMY_PRODUCTS.slice(i * 3, i * 3 + 3);
      for (const prod of shopProducts) {
        await db.collection('products').add({
          ...prod,
          shopId: newShopRef.id,
          createdAt: new Date().toISOString()
        });
        console.log(`  - Added product: ${prod.name}`);
      }
    }

    console.log('Seeding Complete! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
