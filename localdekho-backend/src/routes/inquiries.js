const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { auth, roleCheck } = require('../middleware/auth');

// POST /create - Create a new inquiry (Customer)
router.post('/create', auth, roleCheck(['customer']), async (req, res) => {
  try {
    const { shopId, productId, message } = req.body;

    if (!shopId || !message) {
      return res.status(400).json({ message: 'shopId and message are required' });
    }

    const inquiryData = {
      customerId: req.user.uid,
      customerPhone: req.user.phone,
      shopId,
      productId: productId || null,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const inquiryRef = await db.collection('inquiries').add(inquiryData);
    
    // Optional: Log an analytics event for the shop
    
    res.status(201).json({ id: inquiryRef.id, ...inquiryData });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /shop/:shopId - Get inquiries for a shop (Owner)
router.get('/shop/:shopId', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const { shopId } = req.params;

    // Verify owner
    if (req.user.role === 'owner') {
      const shopDoc = await db.collection('shops').doc(shopId).get();
      if (!shopDoc.exists || shopDoc.data().ownerId !== req.user.uid) {
        return res.status(403).json({ message: 'Access denied: not shop owner' });
      }
    }

    const inquiriesSnapshot = await db.collection('inquiries')
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc')
      .get();
      
    const inquiries = [];
    let unreadCount = 0;

    inquiriesSnapshot.forEach(doc => {
      const inquiry = doc.data();
      inquiries.push({ id: doc.id, ...inquiry });
      if (!inquiry.isRead) unreadCount++;
    });

    res.json({ inquiries, unreadCount });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /:id/read - Mark inquiry as read (Owner)
router.put('/:id/read', auth, roleCheck(['owner', 'admin']), async (req, res) => {
  try {
    const inquiryRef = db.collection('inquiries').doc(req.params.id);
    const inquiryDoc = await inquiryRef.get();

    if (!inquiryDoc.exists) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    const inquiry = inquiryDoc.data();

    // Verify owner
    if (req.user.role === 'owner') {
      const shopDoc = await db.collection('shops').doc(inquiry.shopId).get();
      if (!shopDoc.exists || shopDoc.data().ownerId !== req.user.uid) {
        return res.status(403).json({ message: 'Access denied: not shop owner' });
      }
    }

    await inquiryRef.update({ isRead: true });
    res.json({ message: 'Inquiry marked as read' });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
