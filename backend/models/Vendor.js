import { Schema, model } from 'mongoose';

const VendorSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  userType: {
    type: String,
    default: 'vendor',
  },
  addressLineOne: {
    type: String,
    required: true,
  },
  addressLineTwo: {
    type: String,
  },
  pinCode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    default: new Date().toLocaleString(),
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  receivedOrders: [{
    type: Schema.Types.ObjectId,
    ref: 'Orders',
  }],
}, {
  timestamps: false,
});

const Vendor = model('Vendor', VendorSchema);

export default Vendor;