const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Merchant } = require('../models');
const { success, error } = require('../utils/response');

// 修改1111

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.json(error('手机号和密码不能为空', 400));
    }

    const merchant = await Merchant.findOne({ phone });
    if (!merchant) {
      return res.json(error('商家不存在', 404));
    }

    const isMatch = await merchant.comparePassword(password);
    if (!isMatch) {
      return res.json(error('密码错误', 400));
    }

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
    }, '登录成功'));
  } catch (err) {
    console.error('登录错误:', err);
    res.json(error('登录失败', 500));
  }
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
