const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Usually, sending OTP is done directly on the frontend using Firebase Client SDK.
// We keep this route for compatibility if needed.
router.post('/send-otp', (req, res) => {
  res.json({ message: 'Please use Firebase Client SDK on frontend to send OTP.' });
});

// Verify Firebase token sent from frontend and generate JWT
router.post('/verify-otp', async (req, res) => {
  const { idToken, role = 'customer' } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'idToken is required' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number } = decodedToken;

    // Check if user exists in Firestore
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    let userData;

    if (!doc.exists) {
      // Create new user
      userData = {
        uid,
        phone: phone_number,
        role: role, // customer, owner, or admin
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await userRef.set(userData);
    } else {
      userData = doc.data();
      // For testing purposes, update the role if a different one is selected during login
      if (role && userData.role !== role) {
        await userRef.update({ role: role });
        userData.role = role;
      }
    }

    // Generate our own JWT token
    const payload = {
      uid: userData.uid,
      role: userData.role,
      phone: userData.phone
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        uid: userData.uid,
        phone: userData.phone,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Error verifying OTP/Token:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

module.exports = router;
