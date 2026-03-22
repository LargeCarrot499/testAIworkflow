require('dotenv').config();
const connectDB = require('./config/database');
const { Merchant, Product, Order, User } = require('./models');
const generateOrderNo = require('./utils/generateOrderNo');

const seedData = async () => {
  try {
    await connectDB();

    await Merchant.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});

    console.log('已清空旧数据');

    const merchant = await Merchant.create({
      phone: '13800138000',
      password: '123456',
      shopName: '抵食私房菜',
      shopAddress: '广州市天河区天河路123号',
      contactName: '张老板'
    });
    console.log('创建商家:', merchant.shopName);

    const products = await Product.insertMany([
      {
        merchantId: merchant._id,
        name: '宫保鸡丁',
        image: 'https://via.placeholder.com/150/ff6b35/ffffff?text=宫保鸡丁',
        price: 38,
        stock: 100,
        status: 1,
        description: '经典川菜，鸡肉鲜嫩，花生香脆',
        category: '热菜'
      },
      {
        merchantId: merchant._id,
        name: '麻婆豆腐',
        image: 'https://via.placeholder.com/150/ff6b35/ffffff?text=麻婆豆腐',
        price: 28,
        stock: 80,
        status: 1,
        description: '麻辣鲜香，豆腐嫩滑',
        category: '热菜'
      },
      {
        merchantId: merchant._id,
        name: '糖醋里脊',
        image: 'https://via.placeholder.com/150/ff6b35/ffffff?text=糖醋里脊',
        price: 42,
        stock: 60,
        status: 1,
        description: '酸甜可口，外酥里嫩',
        category: '热菜'
      },
      {
        merchantId: merchant._id,
        name: '清蒸鲈鱼',
        image: 'https://via.placeholder.com/150/ff6b35/ffffff?text=清蒸鲈鱼',
        price: 68,
        stock: 30,
        status: 1,
        description: '新鲜鲈鱼，清蒸保持原味',
        category: '海鲜'
      },
      {
        merchantId: merchant._id,
        name: '红烧排骨',
        image: 'https://via.placeholder.com/150/ff6b35/ffffff?text=红烧排骨',
        price: 48,
        stock: 50,
        status: 0,
        description: '酱香浓郁，肉质软烂',
        category: '热菜'
      }
    ]);
    console.log(`创建 ${products.length} 个商品`);

    const user = await User.create({
      phone: '13900139000',
      nickname: '美食家',
      address: '广州市天河区珠江新城456号'
    });
    console.log('创建用户:', user.nickname);

    const orders = await Order.insertMany([
      {
        orderNo: generateOrderNo(),
        merchantId: merchant._id,
        userId: user._id,
        userName: '美食家',
        userPhone: '13900139000',
        userAddress: '广州市天河区珠江新城456号',
        items: [
          {
            productId: products[0]._id,
            name: '宫保鸡丁',
            image: products[0].image,
            spec: '中辣',
            price: 38,
            count: 1
          },
          {
            productId: products[1]._id,
            name: '麻婆豆腐',
            image: products[1].image,
            spec: '标准',
            price: 28,
            count: 1
          }
        ],
        totalAmount: 66,
        status: 'pending',
        remark: '请少放辣'
      },
      {
        orderNo: generateOrderNo(),
        merchantId: merchant._id,
        userId: user._id,
        userName: '美食家',
        userPhone: '13900139000',
        userAddress: '广州市天河区珠江新城456号',
        items: [
          {
            productId: products[2]._id,
            name: '糖醋里脊',
            image: products[2].image,
            spec: '标准',
            price: 42,
            count: 2
          }
        ],
        totalAmount: 84,
        status: 'processing',
        deliveryStatus: 'preparing',
        remark: ''
      },
      {
        orderNo: generateOrderNo(),
        merchantId: merchant._id,
        userId: user._id,
        userName: '美食家',
        userPhone: '13900139000',
        userAddress: '广州市天河区珠江新城456号',
        items: [
          {
            productId: products[3]._id,
            name: '清蒸鲈鱼',
            image: products[3].image,
            spec: '标准',
            price: 68,
            count: 1
          }
        ],
        totalAmount: 68,
        status: 'processing',
        deliveryStatus: 'delivering',
        remark: '请尽快送达'
      },
      {
        orderNo: generateOrderNo(),
        merchantId: merchant._id,
        userId: user._id,
        userName: '美食家',
        userPhone: '13900139000',
        userAddress: '广州市天河区珠江新城456号',
        items: [
          {
            productId: products[0]._id,
            name: '宫保鸡丁',
            image: products[0].image,
            spec: '标准',
            price: 38,
            count: 1
          },
          {
            productId: products[2]._id,
            name: '糖醋里脊',
            image: products[2].image,
            spec: '标准',
            price: 42,
            count: 1
          }
        ],
        totalAmount: 80,
        status: 'completed',
        deliveryStatus: 'completed',
        remark: ''
      }
    ]);
    console.log(`创建 ${orders.length} 个订单`);

    console.log('\n✅ 种子数据创建成功！');
    console.log('\n测试账号:');
    console.log('  手机号: 13800138000');
    console.log('  密码: 123456');
    console.log('\n可以使用以上账号登录测试');

    process.exit(0);
  } catch (error) {
    console.error('种子数据创建失败:', error);
    process.exit(1);
  }
};

seedData();
