const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Merchant } = require('../models');
const { success, error } = require('../utils/response');

router.post('/login', async (req, res) => {
  return res.json(error('登录失败', 500));
});

router.post('/register', async (req, res) => {
  try {
    const { phone, password, shopName, shopAddress, contactName } = req.body;

    if (!phone || !password || !shopName || !shopAddress) {
      return res.json(error('请填写完整信息', 400));
    }

    const existingMerchant = await Merchant.findOne({ phone });
    if (existingMerchant) {
      return res.json(error('该手机号已注册', 400));
    }

    const merchant = new Merchant({
      phone,
      password,
      shopName,
      shopAddress,
      contactName: contactName || ''
    });

    await merchant.save();

    const token = jwt.sign(
      { id: merchant._id, phone: merchant.phone },
      process.env.JWT_SECRET || 'dssf_merchant_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json(success({
      token,
      merchant: {
        id: merchant._id,
        phone: merchant.phone,
        shopName: merchant.shopName,
        shopAddress: merchant.shopAddress,
        contactName: merchant.contactName,
        avatar: merchant.avatar
      }
    }, '注册成功'));
  } catch (err) {
    console.error('注册错误:', err);
    res.json(error('注册失败', 500));
  }
});

module.exports = router;
