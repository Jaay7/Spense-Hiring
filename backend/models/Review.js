import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rating: {
    type: Number,
  },
  review: {
    type: String,
  },
});

const Review = model('Review', ReviewSchema);

export default Review;