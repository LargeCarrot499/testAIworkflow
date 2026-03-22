const jwt = require('jsonwebtoken');
const { Merchant } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dssf_merchant_secret_key_2024');
    const merchant = await Merchant.findById(decoded.id);
    
    if (!merchant) {
      return res.status(401).json({
        code: 401,
        message: '商家不存在'
      });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证失败'
    });
  }
};

module.exports = auth;
