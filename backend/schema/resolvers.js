import bcrypt from 'bcryptjs';
import { getAuthUser, issueToken } from '../utils/auth.js';
import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import Orders from '../models/Orders.js';
import User from '../models/User.js';

const resolvers = {
  Query: {
    products: async () => {
      return await Product.find();
    },
    productsByCategory: async (parent, args) => {
      return await Product.find({ category: args.category });
    },
    product: async (parent, args) => {
      return await Product.findById(args.id);
    },
    searchProducts: async (parent, args) => {
      return await Product.find({ $text: { $search: args.search } });
    },
    myProfile: async(parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      return authUser;
    },
    vendor: async (parent, args) => {
      return await Vendor.findById(args.id);
    },
    vendors: async () => {
      return await Vendor.find();
    },
    searchVendors: async (parent, args) => {
      return await Vendor.find({ $text: { $search: args.search } });
    },
    productsInMyCart: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      return authUser.cartProducts;
    },
    savedProducts: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      return authUser.savedProducts;
    },
    orders: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      if (authUser.userType === 'admin') {
        return await Orders.find();
      } else if (authUser.userType === 'vendor') {
        return await Orders.find({ orderProducts: {
          $elemMatch: {
            vendor: authUser.id,
          },
        } });
      } else {
        return Orders.find({ orderBy: authUser.id });
      }
    },
    order: async (parent, args) => {
      return await Orders.findById(args.id);
    }
  },
  Mutation: {
    createVendor: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'admin') {
          args.password = await bcrypt.hash(args.password, 10);
          const vendor = await Vendor.create(args);
          return "Vendor created successfully";
        } else {
          return "You are not authorized to create a vendor";
        }
      } catch (error) {
        return error;
      }
    },
    updateVendorByAdmin: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'admin') {
          await Vendor.findByIdAndUpdate(args.id, args);
          return "Vendor updated successfully";
        } else {
          return "You are not authorized to update vendor details";
        }
      } catch (error) {
        return error;
      }
    },
    deleteVendor: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'customer') {
          return "You are not authorized to delete vendor";
        } else {
          await Vendor.findByIdAndDelete(args.id);
          return "Vendor deleted successfully";
        }
      } catch (error) {
        return error;
      }
    },
    createProduct: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'admin') {
          const product = new Product(args);
          await product.save();
          const vendor = await Vendor.findById(args.productVendor);
          console.log("vendor is", vendor);
          vendor.products.push(product.id);
          await vendor.save();
          return "Product created successfully";
        } else {
          return "You are not authorized to create a product";
        }
      } catch (error) {
        return error;
      }
    },
    updateProduct: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'admin') {
          await Product.findByIdAndUpdate(args.id, args);
          return "Product updated successfully";
        } else {
          return "You are not authorized to update product";
        }
      } catch (error) {
        return error;
      }
    },
    deleteProduct: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'admin') {
          await Product.findByIdAndDelete(args.id);
          return "Product deleted successfully";
        } else {
          return "You are not authorized to delete this product";
        }
      } catch (error) {
        return error;
      }
    },
    createUser: async (parent, args) => {
      console.log("email is", args.email);
      const user = await User.findOne({ email: args.email });
      if (user) {
        return {
          message: "Email already in use",
          token: "",
          refreshToken: "",
        };
      } else {
        args.password = await bcrypt.hash(args.password, 10);
        const newUser = await User.create(args);
        console.log("new user is", newUser);
        const tokens = await issueToken(newUser);
        return {
          message: "User created successfully",
          ...tokens
        };
      }
    },
    login: async (parent, args) => {
      if (args.userType === "customer") {
        const user = await User.findOne({ email: args.email });
        if (!user) {
          return {
            message: "User not found",
            token: "",
            refreshToken: "",
          };
        } else {
          const isPasswordValid = await bcrypt.compare(args.password, user.password);
          if (!isPasswordValid) {
            return {
              message: "Invalid password",
              token: "",
              refreshToken: "",
            };
          } else {
            const tokens = await issueToken(user);
            return {
              message: "Login successful",
              ...tokens
            };
          }
        }
      } else {
        const vendor = await Vendor.findOne({ email: args.email });
        if (!vendor) {
          return {
            message: "Vendor not found",
            token: "",
            refreshToken: "",
          };
        } else {
          const isPasswordValid = await bcrypt.compare(args.password, vendor.password);
          if (!isPasswordValid) {
            return {
              message: "Invalid password",
              token: "",
              refreshToken: "",
            };
          } else {
            const tokens = await issueToken(vendor);
            return {
              message: "Login successful",
              ...tokens
            };
          }
        }
      }
    },
    changePassword: async (parent, args, { token }) => {
      try {
        const authUser = await getAuthUser(token, true);
        if (authUser.userType === 'vendor') {
          const vendor = Vendor.findById(authUser.id);
          const isPasswordValid = await bcrypt.compare(args.oldPassword, vendor.password);
          if (!isPasswordValid) {
            return "Invalid old password";
          } else {
            await Vendor.findByIdAndUpdate(authUser.id, {
              password: args.newPassword,
            });
            return "Password changed successfully";
          }
        } else {
          const user = await User.findById(authUser.id)
          const isPasswordValid = await bcrypt.compare(args.oldPassword, user.password);
          if (!isPasswordValid) {
            return "Invalid old password";
          } else {
            await User.findByIdAndUpdate(authUser.id, {
              password: args.newPassword,
            });
            return "Password changed successfully";
          }
        }
      } catch (error) {
        return error;
      }
    },
    updateUser: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      await User.findByIdAndUpdate(authUser.id, args, { new: true });
      return "User updated successfully";
    },
    deleteUser: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      await User.findByIdAndDelete(authUser.id);
      return "User deleted successfully";
    },
    addToCart: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      const product = await Product.findById(args.productId);
      if (!product) {
        return "Product not found";
      } else {
        if (!authUser.cartProducts.includes(product.id)) {
          authUser.cartProducts.push(product.id);
          await authUser.save();
          product.cartBy.push(authUser.id);
          await product.save();
          return `${product.name} added to cart`;
        } else {
          return `${product.name} already in cart`;
        }
      }
    },
    removeFromCart: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      const product = await Product.findById(args.productId);
      if (!product) {
        return "Product not found";
      } else {
        if (authUser.cartProducts.includes(product.id)) {
          authUser.cartProducts.splice(authUser.cartProducts.indexOf(product.id), 1);
          await authUser.save();
          product.cartBy.splice(product.cartBy.indexOf(authUser.id), 1);
          await product.save();
          return `${product.name} removed from cart`;
        } else {
          return `${product.name} not in cart`;
        }
      }
    },
    addToSavedProducts: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      const product = await Product.findById(args.productId);
      if (!product) {
        return "Product not found";
      } else {
        if (!authUser.savedProducts.includes(product.id)) {
          authUser.savedProducts.push(product.id);
          await authUser.save();
          product.savedBy.push(authUser.id);
          await product.save();
          return `${product.name} added to saved products`;
        } else {
          return `${product.name} already in saved products`;
        }
      }
    },
    removeFromSavedProducts: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      const product = await Product.findById(args.productId);
      if (!product) {
        return "Product not found";
      } else {
        if (authUser.savedProducts.includes(product.id)) {
          authUser.savedProducts.splice(authUser.savedProducts.indexOf(product.id), 1);
          await authUser.save();
          product.savedBy.splice(product.savedBy.indexOf(authUser.id), 1);
          await product.save();
          return `${product.name} removed from saved products`;
        } else {
          return `${product.name} not in saved products`;
        }
      }
    },
    createOrder: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      try {
        const order = await Orders.create({
          orderBy: authUser.id,
          ...args,
        });
        authUser.orders.push(order.id);
        await authUser.save();
        // decrease the quantity of the products
        for (let i = 0; i < order.orderProducts.length; i++) {
          const product = await Product.findById(order.orderProducts[i].product);
          product.quantity -= order.orderProducts[i].quantity;
          await product.save();
          const vendor = await Vendor.findById(product.productVendor);
          vendor.receivedOrders.push(order.id);
          await vendor.save();
          if (product.quantity <= 0) {
            product.inStock = false;
            await product.save();
          }
        }
        return "Order created successfully";
      } catch (error) {
        return error;
      }
    },
    updateOrderStatus: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      try {
        if (authUser.userType === "admin") {
          const order = await Orders.findById(args.id);
          if (!order) {
            return "Order not found";
          } else {
            if (order.status === "delivered") {
              return "Order already delivered";
            } else {
              order.status = args.status;
              order.expectedDate = args.expectedDate;
              await order.save();
              return "Order status updated successfully";
            }
          }
        } else {
          return "You are not authorized to perform this action";
        }
      } catch (error) {
        return error;
      }
    },
    updateOrderDeliveryStatus: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      try {
        if (authUser.userType === "admin") {
          const order = await Orders.findById(args.id);
          if (!order) {
            return "Order not found";
          } else {
            if (order.status === "delivered") {
              return "Order already delivered";
            } else {
              order.status = args.status;
              order.orderDeliveredOn = args.orderDeliveredOn;
              await order.save();
              return "Order delivery status updated successfully";
            }
          }
        } else {
          return "You are not authorized to perform this action";
        }
      } catch (error) {
        return error;
      }
    },
    cancelOrder: async (parent, args, { token }) => {
      const authUser = await getAuthUser(token, true);
      try {
        const order = await Orders.findById(args.id);
        if (!order) {
          return "Order not found";
        } else {
          if (order.status === "cancelled") {
            return "Order already cancelled";
          } else {
            order.status = "cancelled";
            await order.save();
            for (let i = 0; i < order.orderProducts.length; i++) {
              const product = await Product.findById(order.orderProducts[i].product);
              product.quantity += order.orderProducts[i].quantity;
              if (product.quantity > 0) {
                product.inStock = true;
              }
              await product.save();
            }
            return "Order cancelled successfully";
          }
        }
      } catch (error) {
        return error;
      }
    }
  },
  User: {
    savedProducts: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Product.find({ savedBy: parent.id })
    },
    cartProducts: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Product.find({ cartBy: parent.id })
    },
    orders: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Orders.find({ orderBy: parent.id })
    }
  },
  Product: {
    productVendor: async(parent, args, { token }) => {
      return Vendor.findById(parent.productVendor)
    },
    savedBy: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return User.find({ savedProducts: parent.id })
    },
    cartBy: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return User.find({ cartProducts: parent.id })
    }
  },
  Vendor: {
    products: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Product.find({ productVendor: parent.id })
    },
    receivedOrders: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Orders.find({ orderProducts: {
        $elemMatch: {
          vendor: parent.id
        }
      } })
    }
  },
  Orders: {
    orderBy: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return User.findById(parent.orderBy)
    }
  },
  OrderProducts: {
    product: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Product.findById(parent.product)
    },
    vendor: async(parent, args, { token }) => {
      await getAuthUser(token, true);
      return Vendor.findById(parent.vendor)
    }
  }
};

export default resolvers;