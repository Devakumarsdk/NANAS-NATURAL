const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const mongoose = require('mongoose');
const { Product, Category, Cart, Wishlist, Review } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const isPlaceholderCloudinaryValue = (value) => {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return [
    'your_cloud_name',
    'your_api_key',
    'your_api_secret',
    'replace_me',
    'changeme',
  ].includes(normalized);
};

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const cloudinaryConfigured = Object.values(cloudinaryConfig).every(
  (value) => !isPlaceholderCloudinaryValue(value)
);

if (cloudinaryConfigured) {
  cloudinary.config(cloudinaryConfig);
}

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return undefined;
};

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeProductPayload = (body) => {
  const payload = {
    ...body,
    price: toNumber(body.price),
    discountPrice: toNumber(body.discountPrice),
    stock: toNumber(body.stock),
    ratings: toNumber(body.ratings),
    numReviews: toNumber(body.numReviews),
    weight: toNumber(body.weight),
    gst: toNumber(body.gst),
  };

  const isFeatured = toBoolean(body.isFeatured);
  const isNewLaunch = toBoolean(body.isNewLaunch);
  const isBestSeller = toBoolean(body.isBestSeller);
  const isActive = toBoolean(body.isActive);

  if (isFeatured !== undefined) payload.isFeatured = isFeatured;
  if (isNewLaunch !== undefined) payload.isNewLaunch = isNewLaunch;
  if (isBestSeller !== undefined) payload.isBestSeller = isBestSeller;
  if (isActive !== undefined) payload.isActive = isActive;

  if (!payload.discountPrice) {
    delete payload.discountPrice;
  }
  if (payload.ratings !== undefined) {
    payload.ratings = Math.max(0, Math.min(5, Number(payload.ratings.toFixed(1))));
  }
  if (payload.numReviews !== undefined) {
    payload.numReviews = Math.max(0, Math.floor(payload.numReviews));
  }

  return payload;
};

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
    stream.end(buffer);
  });
};

const buildLocalImageDocs = (files, productName) => {
  return files.map((file, index) => ({
    url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    public_id: `local-${Date.now()}-${index}`,
    isMain: index === 0,
    alt: productName || 'Product image',
  }));
};

const buildImageDocs = async (files, productName) => {
  if (!files || files.length === 0) return [];

  if (cloudinaryConfigured) {
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadToCloudinary(files[i].buffer, 'devcare/products');
        uploaded.push({ url: result.secure_url, public_id: result.public_id, isMain: i === 0 });
      }
      return uploaded;
    } catch (error) {
      console.warn('Cloudinary upload failed. Falling back to local inline images for testing:', error.message);
      return buildLocalImageDocs(files, productName);
    }
  }

  return buildLocalImageDocs(files, productName);
};

router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 12, sort = '-createdAt',
      category, brand, minPrice, maxPrice,
      search, featured, newLaunch, bestSeller, inStock
    } = req.query;

    const query = { isActive: true };
    const minPriceNumber = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : undefined;
    const maxPriceNumber = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : undefined;

    if (category) {
      const rawCategory = String(category).trim();
      if (mongoose.Types.ObjectId.isValid(rawCategory)) {
        query.category = rawCategory;
      } else {
        const escaped = rawCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matchedCategory = await Category.findOne({
          isActive: true,
          $or: [
            { slug: new RegExp(`^${escaped}$`, 'i') },
            { name: new RegExp(`^${escaped}$`, 'i') },
          ],
        }).select('_id');

        if (matchedCategory?._id) {
          query.category = matchedCategory._id;
        } else {
          query.category = null;
        }
      }
    }
    if (brand) query.brand = new RegExp(brand, 'i');
    if (featured === 'true') query.isFeatured = true;
    if (newLaunch === 'true') query.isNewLaunch = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (
      (minPriceNumber !== undefined && !Number.isNaN(minPriceNumber)) ||
      (maxPriceNumber !== undefined && !Number.isNaN(maxPriceNumber))
    ) {
      const effectiveMin = minPriceNumber !== undefined && !Number.isNaN(minPriceNumber) ? minPriceNumber : undefined;
      const effectiveMax = maxPriceNumber !== undefined && !Number.isNaN(maxPriceNumber) ? maxPriceNumber : undefined;
      const lowerBound = effectiveMin !== undefined && effectiveMax !== undefined ? Math.min(effectiveMin, effectiveMax) : effectiveMin;
      const upperBound = effectiveMin !== undefined && effectiveMax !== undefined ? Math.max(effectiveMin, effectiveMax) : effectiveMax;

      // Filter by customer-facing price (discountPrice when present, otherwise price).
      query.$expr = {
        $and: [
          ...(lowerBound !== undefined ? [{ $gte: [{ $ifNull: ['$discountPrice', '$price'] }, lowerBound] }] : []),
          ...(upperBound !== undefined ? [{ $lte: [{ $ifNull: ['$discountPrice', '$price'] }, upperBound] }] : []),
        ],
      };
    }
    if (search) {
      const matchingCategories = await Category.find(
        {
          isActive: true,
          $or: [
            { name: new RegExp(search, 'i') },
            { slug: new RegExp(search, 'i') },
          ],
        },
        '_id'
      );
      const matchingCategoryIds = matchingCategories.map((cat) => cat._id);

      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { shortDescription: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
        ...(matchingCategoryIds.length > 0 ? [{ category: { $in: matchingCategoryIds } }] : []),
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);

    if (!payload.name || !payload.brand || !payload.description || !payload.category) {
      return res.status(400).json({ success: false, message: 'name, brand, description and category are required' });
    }
    if (payload.price === undefined || payload.stock === undefined) {
      return res.status(400).json({ success: false, message: 'price and stock are required and must be valid numbers' });
    }

    const categoryExists = await Category.exists({ _id: payload.category, isActive: true });
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Selected category is invalid or inactive' });
    }

    const images = await buildImageDocs(req.files, payload.name);

    const slug = `${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const sku = `DC${Date.now().toString().slice(-8)}`;

    const product = await Product.create({ ...payload, images, slug, sku });
    res.status(201).json({ success: true, product });
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const payload = normalizeProductPayload(req.body);

    if (payload.category) {
      const categoryExists = await Category.exists({ _id: payload.category, isActive: true });
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Selected category is invalid or inactive' });
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = await buildImageDocs(req.files, payload.name || product.name);
      payload.images = [...(product.images || []), ...newImages];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json({ success: true, product: updated });
  } catch (err) {
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await Promise.all([
      Cart.updateMany(
        { 'items.product': product._id },
        { $pull: { items: { product: product._id } } }
      ),
      Wishlist.updateMany(
        { products: product._id },
        { $pull: { products: product._id } }
      ),
      Review.deleteMany({ product: product._id }),
    ]);

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


