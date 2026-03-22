const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const auth = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '', status = '' } = req.query;
    const merchantId = req.merchant._id;

    const query = { merchantId };
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    if (status !== '') {
      query.status = parseInt(status);
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [list, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json(success({
      list: list.map(item => ({
        id: item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        stock: item.stock,
        status: item.status,
        description: item.description,
        category: item.category,
        sales: item.sales
      })),
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }));
  } catch (err) {
    console.error('获取商品列表错误:', err);
    res.json(error('获取商品列表失败'));
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const merchantId = req.merchant._id;

    const product = await Product.findOneAndUpdate(
      { _id: id, merchantId },
      { status: parseInt(status), updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.json(error('商品不存在', 404));
    }

    res.json(success({
      id: product._id,
      status: product.status
    }, '状态更新成功'));
  } catch (err) {
    console.error('更新商品状态错误:', err);
    res.json(error('更新状态失败'));
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, image, price, stock, description, category } = req.body;
    const merchantId = req.merchant._id;

    if (!name || !image || price === undefined) {
      return res.json(error('请填写完整商品信息', 400));
    }

    const product = new Product({
      merchantId,
      name,
      image,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description: description || '',
      category: category || ''
    });

    await product.save();

    res.json(success({
      id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
      status: product.status
    }, '商品添加成功'));
  } catch (err) {
    console.error('添加商品错误:', err);
    res.json(error('添加商品失败'));
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, price, stock, description, category, status } = req.body;
    const merchantId = req.merchant._id;

    const updateData = {
      updatedAt: new Date()
    };
    if (name) updateData.name = name;
    if (image) updateData.image = image;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = parseInt(status);

    const product = await Product.findOneAndUpdate(
      { _id: id, merchantId },
      updateData,
      { new: true }
    );

    if (!product) {
      return res.json(error('商品不存在', 404));
    }

    res.json(success({
      id: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
      status: product.status
    }, '商品更新成功'));
  } catch (err) {
    console.error('更新商品错误:', err);
    res.json(error('更新商品失败'));
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.merchant._id;

    const product = await Product.findOneAndDelete({ _id: id, merchantId });

    if (!product) {
      return res.json(error('商品不存在', 404));
    }

    res.json(success(null, '商品删除成功'));
  } catch (err) {
    console.error('删除商品错误:', err);
    res.json(error('删除商品失败'));
  }
});

module.exports = router;
