const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { auth, roleCheck } = require('../middleware/auth');

// Helper to check if user owns the shop
const checkShopOwnership = async (shopId, userId, role) => {
  if (role === 'admin') return true;
  const shopDoc = await db.collection('shops').doc(shopId).get();
  if (!shopDoc.exists) return false;
  return shopDoc.data().ownerId === userId;
};

// GET /shop/:shopId - Get all products for a shop
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { category, gender } = req.query;
    let query = db.collection('products').where('shopId', '==', req.params.shopId);

    if (category) {
      query = query.where('category', '==', category);
    }
    if (gender) {
      query = query.where('gender', '==', gender);
    }

    const productsSnapshot = await query.get();
    const products = [];
    
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /add - Add new product
router.post('/add', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const { shopId } = req.body;
    
    if (!shopId) {
      return res.status(400).json({ message: 'shopId is required' });
    }

    const isOwner = await checkShopOwnership(shopId, req.user.uid, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied: not shop owner' });
    }

    const productData = {
      ...req.body,
      isAvailable: true,
      createdAt: new Date().toISOString()
    };

    const newProductRef = await db.collection('products').add(productData);
    res.status(201).json({ id: newProductRef.id, ...productData });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /:productId - Update product
router.put('/:productId', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productDoc.data();
    const isOwner = await checkShopOwnership(product.shopId, req.user.uid, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied: not shop owner' });
    }

    await productRef.update(req.body);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /:productId - Delete product
router.delete('/:productId', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productDoc.data();
    const isOwner = await checkShopOwnership(product.shopId, req.user.uid, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied: not shop owner' });
    }

    await productRef.delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /:productId/toggle - Toggle availability
router.put('/:productId/toggle', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const productRef = db.collection('products').doc(req.params.productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productDoc.data();
    const isOwner = await checkShopOwnership(product.shopId, req.user.uid, req.user.role);
    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied: not shop owner' });
    }

    await productRef.update({ isAvailable: !product.isAvailable });
    res.json({ message: 'Product availability toggled', isAvailable: !product.isAvailable });
  } catch (error) {
    console.error('Error toggling product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
