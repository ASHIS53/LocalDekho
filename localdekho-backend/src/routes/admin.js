const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { auth, roleCheck } = require('../middleware/auth');

// GET /stats - Get overall stats for Admin Dashboard
router.get('/stats', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const usersCount = (await db.collection('users').get()).size;
    const shopsCount = (await db.collection('shops').get()).size;
    const productsCount = (await db.collection('products').get()).size;
    const pendingShopsCount = (await db.collection('shops').where('isApproved', '==', false).get()).size;

    res.json({
      totalUsers: usersCount,
      totalShops: shopsCount,
      totalProducts: productsCount,
      pendingApprovals: pendingShopsCount
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /pending-shops - Get shops awaiting approval
router.get('/pending-shops', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('shops').where('isApproved', '==', false).get();
    const shops = [];
    snapshot.forEach(doc => shops.push({ id: doc.id, ...doc.data() }));
    res.json(shops);
  } catch (error) {
    console.error('Error fetching pending shops:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /all-shops - Get all shops
router.get('/all-shops', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const snapshot = await db.collection('shops').get();
    const shops = [];
    snapshot.forEach(doc => shops.push({ id: doc.id, ...doc.data() }));
    res.json(shops);
  } catch (error) {
    console.error('Error fetching all shops:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /shops/:id/approve - Approve a shop
router.put('/shops/:id/approve', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await db.collection('shops').doc(req.params.id).update({ isApproved: true });
    res.json({ message: 'Shop approved successfully' });
  } catch (error) {
    console.error('Error approving shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /shops/:id/reject - Reject a shop (could just delete or mark rejected)
router.put('/shops/:id/reject', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await db.collection('shops').doc(req.params.id).update({ isApproved: false, isRejected: true });
    res.json({ message: 'Shop rejected successfully' });
  } catch (error) {
    console.error('Error rejecting shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /shops/:id - Delete a shop
router.delete('/shops/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await db.collection('shops').doc(req.params.id).delete();
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /reported-products - Basic stub for reported products
router.get('/reported-products', auth, roleCheck(['admin']), async (req, res) => {
  res.json({ message: 'Reported products feature coming soon', products: [] });
});

module.exports = router;
