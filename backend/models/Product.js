import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  productVendor: { 
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  inStock: {
    type: Boolean,
    required: true,
    default: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
  },
  offers: {
    type: [String],
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review',
  }],
  savedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  cartBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: String,
    default: new Date().toLocaleString(),
  },
},{timestamps: false});

const Product = model('Product', ProductSchema);

export default Product;