require('dotenv').config();
const mongoose = require('mongoose');
const {
  User,
  Category,
  Product,
  Review,
  Order,
  Cart,
  Wishlist,
  Coupon
} = require('./models');

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    await Promise.all([
      Review.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Coupon.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({})
    ]);

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'deva@gmail.com',
        password: 'Deva@1201085',
        phone: '9999999999',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: 'User@123',
        phone: '9876543210',
        isVerified: true,
        addresses: [
          {
            name: 'Aarav Sharma',
            phone: '9876543210',
            addressLine1: '221B MG Road',
            addressLine2: 'Near Metro Station',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560001',
            country: 'India',
            isDefault: true
          }
        ]
      },
      {
        name: 'Isha Patel',
        email: 'isha@example.com',
        password: 'User@123',
        phone: '9123456780',
        isVerified: true,
        addresses: [
          {
            name: 'Isha Patel',
            phone: '9123456780',
            addressLine1: '17 Palm Residency',
            addressLine2: 'Sector 14',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India',
            isDefault: true
          }
        ]
      }
    ]);

    const [, customerOne, customerTwo] = users;

    const categories = await Category.create([
      {
        name: 'Skin Care',
        slug: 'skin-care',
        description: 'Daily skin nourishment essentials',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
        order: 1
      },
      {
        name: 'Hair Care',
        slug: 'hair-care',
        description: 'Hair growth and repair collection',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
        order: 2
      },
      {
        name: 'Body Care',
        slug: 'body-care',
        description: 'Body lotions, oils and wash products',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15',
        order: 3
      },
      {
        name: 'Wellness',
        slug: 'wellness',
        description: 'Supplements and wellness boosters',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de',
        order: 4
      },
      {
        name: 'Face Care',
        slug: 'face-care',
        description: 'Face wash, toner and cream essentials',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
        order: 5
      },
      {
        name: 'Sun Care',
        slug: 'sun-care',
        description: 'Daily sunscreen and UV protection range',
        image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504',
        order: 6
      },
      {
        name: 'Oral Care',
        slug: 'oral-care',
        description: 'Toothpaste, mouthwash and dental hygiene products',
        image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2',
        order: 7
      }
    ]);

    const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

    const products = await Product.create([
      {
        name: 'Vitamin C Brightening Serum',
        slug: 'vitamin-c-brightening-serum',
        description: 'Lightweight serum with 15% vitamin C for improved glow and reduced dullness.',
        shortDescription: 'Daily glow booster serum',
        brand: 'DEVCARE',
        category: categoryBySlug['skin-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', isMain: true }],
        price: 799,
        discountPrice: 649,
        stock: 120,
        sku: 'DC-SKIN-001',
        tags: ['vitamin c', 'serum', 'glow'],
        ingredients: 'Vitamin C, Hyaluronic Acid, Aloe Vera',
        benefits: ['Brightens skin', 'Hydrates deeply', 'Evens tone'],
        isFeatured: true,
        isBestSeller: true,
        isActive: true,
        soldCount: 42,
        gst: 18
      },
      {
        name: 'Hydra Barrier Moisturizer',
        slug: 'hydra-barrier-moisturizer',
        description: 'Ceramide-rich moisturizer that strengthens skin barrier and prevents dryness.',
        shortDescription: 'Ceramide daily moisturizer',
        brand: 'DEVCARE',
        category: categoryBySlug['skin-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd', isMain: true }],
        price: 599,
        discountPrice: 499,
        stock: 90,
        sku: 'DC-SKIN-002',
        tags: ['moisturizer', 'ceramide'],
        ingredients: 'Ceramides, Niacinamide, Squalane',
        benefits: ['Locks moisture', 'Repairs barrier'],
        isFeatured: true,
        isActive: true,
        soldCount: 28,
        gst: 18
      },
      {
        name: 'Anti-Dandruff Scalp Shampoo',
        slug: 'anti-dandruff-scalp-shampoo',
        description: 'Scalp-cleansing shampoo with zinc pyrithione for long-lasting dandruff control.',
        shortDescription: 'Dandruff control shampoo',
        brand: 'DEVCARE',
        category: categoryBySlug['hair-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1626011225161-ecf3a6f5f57c', isMain: true }],
        price: 449,
        discountPrice: 399,
        stock: 160,
        sku: 'DC-HAIR-001',
        tags: ['shampoo', 'scalp', 'dandruff'],
        ingredients: 'Zinc Pyrithione, Tea Tree Oil',
        benefits: ['Reduces flakes', 'Soothes itchiness'],
        isBestSeller: true,
        isActive: true,
        soldCount: 63,
        gst: 18
      },
      {
        name: 'Keratin Smooth Conditioner',
        slug: 'keratin-smooth-conditioner',
        description: 'Keratin-infused conditioner for frizz control and silkier hair.',
        shortDescription: 'Frizz control conditioner',
        brand: 'DEVCARE',
        category: categoryBySlug['hair-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388', isMain: true }],
        price: 499,
        discountPrice: 429,
        stock: 110,
        sku: 'DC-HAIR-002',
        tags: ['conditioner', 'keratin'],
        ingredients: 'Hydrolyzed Keratin, Argan Oil',
        benefits: ['Reduces frizz', 'Adds shine'],
        isNewLaunch: true,
        isActive: true,
        soldCount: 19,
        gst: 18
      },
      {
        name: 'Shea Body Butter',
        slug: 'shea-body-butter',
        description: 'Deeply nourishing body butter with shea and cocoa butter for dry skin.',
        shortDescription: 'Deep nourishment body butter',
        brand: 'DEVCARE',
        category: categoryBySlug['body-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b', isMain: true }],
        price: 699,
        discountPrice: 579,
        stock: 75,
        sku: 'DC-BODY-001',
        tags: ['body butter', 'shea'],
        ingredients: 'Shea Butter, Cocoa Butter, Vitamin E',
        benefits: ['Softens skin', 'Long-lasting hydration'],
        isFeatured: true,
        isActive: true,
        soldCount: 22,
        gst: 18
      },
      {
        name: 'Ubtan Exfoliating Body Scrub',
        slug: 'ubtan-exfoliating-body-scrub',
        description: 'Traditional ubtan-inspired scrub to remove tan and dead skin buildup.',
        shortDescription: 'Ubtan tan-removal scrub',
        brand: 'DEVCARE',
        category: categoryBySlug['body-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1617897903246-719242758050', isMain: true }],
        price: 549,
        discountPrice: 469,
        stock: 88,
        sku: 'DC-BODY-002',
        tags: ['scrub', 'ubtan'],
        ingredients: 'Turmeric, Gram Flour, Sandalwood',
        benefits: ['Exfoliates dead skin', 'Improves texture'],
        isActive: true,
        soldCount: 14,
        gst: 18
      },
      {
        name: 'Daily Multivitamin Gummies',
        slug: 'daily-multivitamin-gummies',
        description: 'Tasty daily multivitamin gummies to support immunity and energy.',
        shortDescription: 'Immunity support gummies',
        brand: 'DEVCARE',
        category: categoryBySlug['wellness']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88', isMain: true }],
        price: 899,
        discountPrice: 749,
        stock: 140,
        sku: 'DC-WELL-001',
        tags: ['gummies', 'multivitamin'],
        ingredients: 'Vitamin A, B-Complex, C, D3, Zinc',
        benefits: ['Supports immunity', 'Boosts daily wellness'],
        isNewLaunch: true,
        isActive: true,
        soldCount: 11,
        gst: 12
      },
      {
        name: 'Plant Protein Powder',
        slug: 'plant-protein-powder',
        description: 'Pea and rice protein blend for post-workout recovery and strength goals.',
        shortDescription: 'Vegan protein blend',
        brand: 'DEVCARE',
        category: categoryBySlug['wellness']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1579722821273-0f6c9f7a1f87', isMain: true }],
        price: 1499,
        discountPrice: 1299,
        stock: 55,
        sku: 'DC-WELL-002',
        tags: ['protein', 'fitness', 'vegan'],
        ingredients: 'Pea Protein, Brown Rice Protein, Digestive Enzymes',
        benefits: ['Supports muscle recovery', 'Easy digestion'],
        isFeatured: true,
        isActive: true,
        soldCount: 9,
        gst: 12
      },
      {
        name: 'Neem Purifying Face Wash',
        slug: 'neem-purifying-face-wash',
        description: 'Gentle gel cleanser with neem extracts for acne-prone skin.',
        shortDescription: 'Purifying daily face wash',
        brand: 'DEVCARE',
        category: categoryBySlug['face-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1556228578-dd6e3b9f0cf7', isMain: true }],
        price: 349,
        discountPrice: 299,
        stock: 180,
        sku: 'DC-FACE-001',
        tags: ['face wash', 'neem'],
        ingredients: 'Neem, Salicylic Acid, Aloe Vera',
        benefits: ['Deep cleanses pores', 'Controls excess oil'],
        isBestSeller: true,
        isActive: true,
        soldCount: 67,
        gst: 18
      },
      {
        name: 'Rose Water Hydrating Toner',
        slug: 'rose-water-hydrating-toner',
        description: 'Alcohol-free toner to hydrate and prep skin after cleansing.',
        shortDescription: 'Hydrating alcohol-free toner',
        brand: 'DEVCARE',
        category: categoryBySlug['face-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1570194065650-d99fb4f6d8f4', isMain: true }],
        price: 399,
        discountPrice: 349,
        stock: 130,
        sku: 'DC-FACE-002',
        tags: ['toner', 'rose water'],
        ingredients: 'Rose Water, Glycerin, Niacinamide',
        benefits: ['Balances skin pH', 'Hydrates and refreshes'],
        isActive: true,
        soldCount: 38,
        gst: 18
      },
      {
        name: 'SPF 50 Matte Sunscreen',
        slug: 'spf-50-matte-sunscreen',
        description: 'Broad-spectrum SPF 50 sunscreen with non-greasy matte finish.',
        shortDescription: 'High protection matte sunscreen',
        brand: 'DEVCARE',
        category: categoryBySlug['sun-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137', isMain: true }],
        price: 1,
        discountPrice: 1,
        stock: 145,
        sku: 'DC-SUN-001',
        tags: ['sunscreen', 'spf 50', 'uv'],
        ingredients: 'Zinc Oxide, Titanium Dioxide, Vitamin E',
        benefits: ['Protects from UVA/UVB', 'No white cast'],
        isFeatured: true,
        isActive: true,
        soldCount: 51,
        gst: 18
      },
      {
        name: 'SPF 30 Body Sunscreen Lotion',
        slug: 'spf-30-body-sunscreen-lotion',
        description: 'Lightweight body sunscreen for everyday outdoor protection.',
        shortDescription: 'Daily body UV protection',
        brand: 'DEVCARE',
        category: categoryBySlug['sun-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc', isMain: true }],
        price: 549,
        discountPrice: 479,
        stock: 100,
        sku: 'DC-SUN-002',
        tags: ['body sunscreen', 'spf 30'],
        ingredients: 'Avobenzone, Aloe Vera, Green Tea',
        benefits: ['Prevents tanning', 'Hydrates skin'],
        isActive: true,
        soldCount: 24,
        gst: 18
      },
      {
        name: 'Herbal Whitening Toothpaste',
        slug: 'herbal-whitening-toothpaste',
        description: 'Fluoride toothpaste with herbs for cleaner and brighter teeth.',
        shortDescription: 'Herbal daily toothpaste',
        brand: 'DEVCARE',
        category: categoryBySlug['oral-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1559591935-c6c7f69a1d39', isMain: true }],
        price: 199,
        discountPrice: 169,
        stock: 220,
        sku: 'DC-ORAL-001',
        tags: ['toothpaste', 'oral care'],
        ingredients: 'Fluoride, Clove Oil, Mint',
        benefits: ['Fresh breath', 'Cavity protection'],
        isBestSeller: true,
        isActive: true,
        soldCount: 80,
        gst: 12
      },
      {
        name: 'Fresh Mint Mouthwash',
        slug: 'fresh-mint-mouthwash',
        description: 'Alcohol-free mouthwash that reduces bad breath and plaque.',
        shortDescription: 'Alcohol-free mouthwash',
        brand: 'DEVCARE',
        category: categoryBySlug['oral-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db', isMain: true }],
        price: 249,
        discountPrice: 219,
        stock: 190,
        sku: 'DC-ORAL-002',
        tags: ['mouthwash', 'mint'],
        ingredients: 'Cetylpyridinium Chloride, Mint',
        benefits: ['Long-lasting freshness', 'Plaque control'],
        isActive: true,
        soldCount: 44,
        gst: 12
      },
      {
        name: 'Cica Repair Night Cream',
        slug: 'cica-repair-night-cream',
        description: 'Repairing night cream with cica and peptides for overnight recovery.',
        shortDescription: 'Overnight skin repair cream',
        brand: 'DEVCARE',
        category: categoryBySlug['face-care']._id,
        images: [{ url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9', isMain: true }],
        price: 799,
        discountPrice: 699,
        stock: 95,
        sku: 'DC-FACE-003',
        tags: ['night cream', 'cica'],
        ingredients: 'Centella Asiatica, Peptides, Ceramides',
        benefits: ['Repairs skin barrier', 'Improves texture'],
        isNewLaunch: true,
        isActive: true,
        soldCount: 17,
        gst: 18
      }
    ]);

    const coupons = await Coupon.create([
      {
        code: 'WELCOME10',
        description: '10% off for new customers',
        type: 'percentage',
        value: 10,
        minOrderValue: 499,
        maxDiscount: 250,
        usageLimit: 500,
        userLimit: 1,
        validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'FLAT200',
        description: 'Flat 200 off on orders above 1499',
        type: 'fixed',
        value: 200,
        minOrderValue: 1499,
        usageLimit: 250,
        userLimit: 2,
        validFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ]);

    const reviewDocs = await Review.create([
      {
        user: customerOne._id,
        product: products[0]._id,
        rating: 5,
        title: 'Great glow in 2 weeks',
        comment: 'Skin looks brighter and texture improved. No irritation.',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        user: customerTwo._id,
        product: products[0]._id,
        rating: 4,
        title: 'Works well',
        comment: 'Lightweight and non-sticky. Good for morning routine.',
        isVerifiedPurchase: true,
        isApproved: true
      },
      {
        user: customerTwo._id,
        product: products[2]._id,
        rating: 5,
        title: 'Dandruff reduced',
        comment: 'Visible reduction in flakes after a few washes.',
        isVerifiedPurchase: true,
        isApproved: true
      }
    ]);

    const ratingsMap = {};
    for (const review of reviewDocs) {
      if (!ratingsMap[review.product]) {
        ratingsMap[review.product] = { total: 0, count: 0 };
      }
      ratingsMap[review.product].total += review.rating;
      ratingsMap[review.product].count += 1;
    }

    for (const [productId, data] of Object.entries(ratingsMap)) {
      const avg = Number((data.total / data.count).toFixed(1));
      await Product.findByIdAndUpdate(productId, { ratings: avg, numReviews: data.count });
    }

    await Cart.create({
      user: customerOne._id,
      items: [
        {
          product: products[1]._id,
          quantity: 1,
          variant: 'Default',
          price: products[1].discountPrice || products[1].price
        },
        {
          product: products[5]._id,
          quantity: 2,
          variant: 'Default',
          price: products[5].discountPrice || products[5].price
        }
      ]
    });

    await Wishlist.create({
      user: customerTwo._id,
      products: [products[0]._id, products[4]._id, products[7]._id]
    });

    await Order.create({
      user: customerOne._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          image: products[0].images[0]?.url,
          price: products[0].discountPrice || products[0].price,
          quantity: 1,
          variant: 'Default',
          sku: products[0].sku
        },
        {
          product: products[2]._id,
          name: products[2].name,
          image: products[2].images[0]?.url,
          price: products[2].discountPrice || products[2].price,
          quantity: 2,
          variant: 'Default',
          sku: products[2].sku
        }
      ],
      shippingAddress: customerOne.addresses[0],
      pricing: {
        subtotal: (products[0].discountPrice || products[0].price) + 2 * (products[2].discountPrice || products[2].price),
        discount: 120,
        shipping: 0,
        tax: 243,
        total: 1570
      },
      coupon: { code: coupons[0].code, discount: 120 },
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      paymentDetails: { razorpayOrderId: 'order_test_001', razorpayPaymentId: 'pay_test_001', razorpayStatus: 'paid' },
      orderStatus: 'delivered',
      statusHistory: [
        { status: 'placed', message: 'Order placed successfully' },
        { status: 'confirmed', message: 'Order confirmed by store' },
        { status: 'shipped', message: 'Order shipped' },
        { status: 'delivered', message: 'Delivered to customer' }
      ],
      deliveredAt: new Date(),
      estimatedDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    await Order.create({
      user: customerTwo._id,
      items: [
        {
          product: products[6]._id,
          name: products[6].name,
          image: products[6].images[0]?.url,
          price: products[6].discountPrice || products[6].price,
          quantity: 1,
          variant: 'Default',
          sku: products[6].sku
        }
      ],
      shippingAddress: customerTwo.addresses[0],
      pricing: {
        subtotal: products[6].discountPrice || products[6].price,
        discount: 0,
        shipping: 50,
        tax: 135,
        total: 934
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'placed',
      statusHistory: [{ status: 'placed', message: 'Order placed successfully' }],
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    });

    await Coupon.findOneAndUpdate(
      { code: 'WELCOME10' },
      {
        $set: { usedCount: 1 },
        $push: { usedBy: { user: customerOne._id, usedAt: new Date(), count: 1 } }
      }
    );

    console.log('Dummy data seeded successfully');
    console.log('Admin login: deva@gmail.com / Deva@1201085');
    console.log('User login: aarav@example.com / User@123');
    console.log('User login: isha@example.com / User@123');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seed();



