const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { auth, roleCheck } = require('../middleware/auth');
const { calculateDistance } = require('../utils/haversine');

// GET /nearby - Find nearby approved shops
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // default 5km radius
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius);

    const shopsSnapshot = await db.collection('shops').where('isApproved', '==', true).get();
    
    const nearbyShops = [];
    shopsSnapshot.forEach(doc => {
      const shop = doc.data();
      if (shop.lat && shop.lng) {
        const distance = calculateDistance(userLat, userLng, shop.lat, shop.lng);
        if (distance <= searchRadius || shop.isGlobal) {
          nearbyShops.push({ ...shop, id: doc.id, distance: shop.isGlobal ? '0.0' : distance.toFixed(1) });
        }
      }
    });

    // Sort by nearest
    nearbyShops.sort((a, b) => a.distance - b.distance);

    res.json(nearbyShops);
  } catch (error) {
    console.error('Error fetching nearby shops:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /owner/:ownerId - Get owner's shop
router.get('/owner/:ownerId', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // An owner can only view their own shop, unless they are an admin
    if (req.user.role === 'owner' && req.user.uid !== ownerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const shopsSnapshot = await db.collection('shops').where('ownerId', '==', ownerId).limit(1).get();
    
    if (shopsSnapshot.empty) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({ id: shopsSnapshot.docs[0].id, ...shopsSnapshot.docs[0].data() });
  } catch (error) {
    console.error('Error fetching owner shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /:shopId - Get specific shop details
router.get('/:shopId', async (req, res) => {
  try {
    const shopDoc = await db.collection('shops').doc(req.params.shopId).get();
    if (!shopDoc.exists) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json({ id: shopDoc.id, ...shopDoc.data() });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /register - Register a new shop
router.post('/register', auth, roleCheck(['owner']), async (req, res) => {
  try {
    const shopData = {
      ...req.body,
      ownerId: req.user.uid,
      isApproved: true, // Set to true temporarily for testing/development
      isOpen: true, // Also set isOpen to true by default so it shows as open

      rating: 0,
      totalReviews: 0,
      createdAt: new Date().toISOString()
    };

    const newShopRef = await db.collection('shops').add(shopData);
    res.status(201).json({ id: newShopRef.id, ...shopData });
  } catch (error) {
    console.error('Error registering shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /:shopId - Update shop details
router.put('/:shopId', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const shopRef = db.collection('shops').doc(req.params.shopId);
    const shopDoc = await shopRef.get();

    if (!shopDoc.exists) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (req.user.role === 'owner' && shopDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Do not allow overriding certain fields directly
    const updateData = { ...req.body };
    delete updateData.isApproved;
    delete updateData.ownerId;
    delete updateData.rating;

    await shopRef.update(updateData);
    res.json({ message: 'Shop updated successfully' });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /:shopId/toggle - Toggle Open/Close status
router.put('/:shopId/toggle', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const shopRef = db.collection('shops').doc(req.params.shopId);
    const shopDoc = await shopRef.get();

    if (!shopDoc.exists) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (req.user.role === 'owner' && shopDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentStatus = shopDoc.data().isOpen;
    await shopRef.update({ isOpen: !currentStatus });
    
    res.json({ message: 'Shop status toggled', isOpen: !currentStatus });
  } catch (error) {
    console.error('Error toggling shop status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
