const express = require('express');
const router = express.Router();
const { Order } = require('../models');
const auth = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status = '' } = req.query;
    const merchantId = req.merchant._id;

    const query = {
      merchantId,
      status: 'processing',
      deliveryStatus: { $in: ['preparing', 'delivering', 'completed'] }
    };

    if (status) {
      query.deliveryStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [list, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json(success({
      list: list.map(item => ({
        id: item._id,
        orderNo: item.orderNo,
        status: item.deliveryStatus,
        shopName: req.merchant.shopName,
        shopAddress: req.merchant.shopAddress,
        userName: item.userName,
        userPhone: item.userPhone,
        userAddress: item.userAddress,
        goods: item.items.map(g => ({
          name: g.name,
          count: g.count
        })),
        remark: item.remark,
        deliveryTime: item.deliveryTime ? item.deliveryTime.toLocaleString('zh-CN') : ''
      })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }));
  } catch (err) {
    console.error('获取配送列表错误:', err);
    res.json(error('获取配送列表失败'));
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const merchantId = req.merchant._id;

    const validStatuses = ['preparing', 'delivering', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.json(error('无效的配送状态', 400));
    }

    const updateData = {
      deliveryStatus: status,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updateData.status = 'completed';
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, merchantId, status: 'processing' },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.json(error('订单不存在或状态不正确', 404));
    }

    res.json(success({
      id: order._id,
      status: order.deliveryStatus
    }, '配送状态更新成功'));
  } catch (err) {
    console.error('更新配送状态错误:', err);
    res.json(error('更新配送状态失败'));
  }
});

module.exports = router;
