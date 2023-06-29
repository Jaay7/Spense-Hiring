import { Schema, model } from 'mongoose';

const OrdersSchema = new Schema({
  orderBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  orderProducts: [{
    _id: false,
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: Number,
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
    },
  }],
  totalPrice: {
    type: Number,
  },
  appliedOffers: {
    type: [String],
  },
  status: {
    type: String,
    enum: ['order placed', 'shipped', 'out for delivery', 'delivered', 'cancelled', 'return requested', 'returned'],
    default: 'order placed',
  },
  orderPlacedOn: {
    type: String,
    default: new Date().toLocaleString(),
  },
  expectedDate: {
    type: String,
  },
  orderDeliveredOn: {
    type: String,
  },
},{timestamps: false});

const Orders = new model('Orders', OrdersSchema);

export default Orders;