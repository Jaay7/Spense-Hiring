
const typeDefs = `
  type Query {
    products: [Product]
    productsByCategory(category: String): [Product]
    product(id: ID!): Product
    searchProducts(search: String): [Product]
    myProfile: User
    vendor: Vendor
    vendors: [Vendor]
    searchVendors(search: String): [Vendor]
    productsInMyCart: [Product]
    savedProducts: [Product]
    orders: [Orders]
    order(id: ID!): Orders
  }

  input AddressInput {
    addressLineOne: String!
    addressLineTwo: String
    landmark: String
    pinCode: String!
    city: String!
    state: String!
    country: String!
    phoneNumber: String!
  }

  type Address {
    addressLineOne: String!
    addressLineTwo: String
    landmark: String
    pinCode: String!
    city: String!
    state: String!
    country: String!
    phoneNumber: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    phoneNumber: String
    password: String!
    userType: String!
    addresses: [Address]
    createdAt: String
    savedProducts: [Product!]!
    cartProducts: [Product!]!
    orders: [Orders!]!
  }

  type Vendor {
    id: ID!
    name: String!
    email: String!
    phoneNumber: String
    password: String!
    userType: String!
    addressLineOne: String!
    addressLineTwo: String
    pinCode: String!
    city: String!
    state: String!
    country: String!
    createdAt: String
    products: [Product!]!
    receivedOrders: [Orders!]!
  }

  type Auth {
    message: String
    token: String!
    refreshToken: String!
  }

  scalar Number

  type Review {
    id: ID!
    product: Product
    user: User
    rating: Number!
    review: String
  }

  type Product {
    id: ID!
    productVendor: Vendor
    name: String!
    quantity: Int
    inStock: Boolean
    price: Number!
    description: String
    image: [String]!
    category: String
    offers: [String]
    reviews: [Review]
    savedBy: [User!]!
    cartBy: [User!]!
    createdAt: String
  }

  input OrderProductsInput {
    product: ID
    quantity: Int
    vendor: ID
  }

  type OrderProducts {
    product: Product
    quantity: Int
    vendor: Vendor
  }

  type Orders {
    id: ID
    orderBy: User
    orderProducts: [OrderProducts]
    totalPrice: Int
    appliedOffers: [String]
    status: String
    orderPlacedOn: String
    expectedDate: String
    orderDeliveredOn: String
  }

  type Mutation {
    createVendor(
      name: String!
      email: String!
      password: String!
      userType: String
      addressLineOne: String!
      addressLineTwo: String
      pinCode: String!
      city: String!
      state: String!
      country: String!
    ): String
    updateVendorByAdmin(
      name: String!
      email: String!
      addressLineOne: String!
      addressLineTwo: String
      pinCode: String!
      city: String!
      state: String!
      country: String!
    ): String
    deleteVendor(id: ID!): String
    createProduct(
      productVendor: ID!
      name: String!
      quantity: Int!
      inStock: Boolean
      price: Number!
      description: String
      image: [String]!
      category: String
      offers: [String]
      createdAt: String
    ): String
    updateProduct(
      id: ID!
      name: String!
      quantity: Int!
      inStock: Boolean
      price: Number!
      description: String
      image: [String]!
      category: String
      offers: [String]
    ): String
    deleteProduct(id: ID!): String
    createUser(
      name: String!
      email: String!
      phoneNumber: String
      password: String!
      userType: String
      addresses: [AddressInput]
    ): Auth
    login(
      email: String!
      password: String!
      userType: String!
    ): Auth
    changePassword(
      oldPassword: String!
      newPassword: String!
    ): String
    updateUser(
      username: String!
      email: String!
      addressess: [AddressInput]
    ): String!
    deleteUser(id: ID!): String
    addToCart(productId: ID!): String
    removeFromCart(productId: ID!): String
    addToSavedProducts(productId: ID!): String
    removeFromSavedProducts(productId: ID!): String
    createOrder(
      orderBy: ID
      orderProducts: [OrderProductsInput]
      totalPrice: Int
      appliedOffers: [String]
      orderPlacedOn: String
    ): String
    updateOrderStatus(
      id: ID!
      status: String
      expectedDate: String
    ): String
    updateOrderDeliveryStatus(
      id: ID!
      status: String
      orderDeliveredOn: String
    ): String
    cancelOrder(id: ID!): String
  }
`;

export default typeDefs;