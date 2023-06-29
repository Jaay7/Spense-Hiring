import { Schema, model } from 'mongoose';

const AddressSchema = new Schema({
  addressLineOne: {
    type: String,
    required: true,
  },
  addressLineTwo: {
    type: String,
  },
  landmark: {
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
  phoneNumber: {
    type: String,
    required: true,
  },
});

const UserSchema = new Schema({
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
    enum: ['admin', 'customer'],
    default: 'customer',
  },
  addresses: {
    type: [AddressSchema],
  },
  createdAt: {
    type: String,
    default: new Date().toLocaleString(),
  },
  savedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  cartProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Orders',
  }],
}, {
  timestamps: false,
});

const User = model('User', UserSchema);

export default User;