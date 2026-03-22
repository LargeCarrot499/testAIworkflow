const express = require('express');
const router = express.Router();
const { Order } = require('../models');
const auth = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status = '' } = req.query;
    const merchantId = req.merchant._id;

    const query = { merchantId };
    if (status) {
      query.status = status;
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

    const stat = await Order.aggregate([
      { $match: { merchantId: merchantId } },
      {
        $group: {
          _id: null,
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processing: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const statData = stat.length > 0 ? stat[0] : { pending: 0, processing: 0, completed: 0 };

    res.json(success({
      list: list.map(item => ({
        id: item._id,
        orderNo: item.orderNo,
        status: item.status,
        items: item.items,
        totalAmount: item.totalAmount,
        createTime: item.createdAt.toLocaleString('zh-CN'),
        userName: item.userName,
        userPhone: item.userPhone,
        userAddress: item.userAddress,
        remark: item.remark
      })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      stat: {
        pending: statData.pending,
        processing: statData.processing,
        completed: statData.completed
      }
    }));
  } catch (err) {
    console.error('获取订单列表错误:', err);
    res.json(error('获取订单列表失败'));
  }
});

router.post('/:id/accept', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchant._id;

    const order = await Order.findOneAndUpdate(
      { _id: id, merchantId, status: 'pending' },
      {
        status: 'processing',
        deliveryStatus: 'preparing',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.json(error('订单不存在或状态不正确', 404));
    }

    res.json(success({
      id: order._id,
      status: order.status,
      deliveryStatus: order.deliveryStatus
    }, '接单成功'));
  } catch (err) {
    console.error('接单错误:', err);
    res.json(error('接单失败'));
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const merchantId = req.merchant._id;

    const order = await Order.findOneAndUpdate(
      { _id: id, merchantId, status: 'pending' },
      {
        status: 'cancelled',
        remark: reason || '商家拒单',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.json(error('订单不存在或状态不正确', 404));
    }

    res.json(success({
      id: order._id,
      status: order.status
    }, '已拒绝订单'));
  } catch (err) {
    console.error('拒单错误:', err);
    res.json(error('拒单失败'));
  }
});

module.exports = router;
