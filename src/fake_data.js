const mongoose = require('mongoose');
const faker = require('faker');
const User = require('./userModel');
const User = require('./models/User'); // Import the User model

// Assuming your model is defined in userModel.js

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/test3', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the User schema
// const userSchema = new mongoose.Schema({
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: 8,
//     validate(value) {
//       if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
//         throw new Error('Password must contain at least one letter and one number');
//       }
//     },
//   },
//   username: {
//     type: String,
//     unique: true,
//   },
//   role: {
//     type: String,
//     enum: ['user', 'admin', 'seller', 'paymentManager', 'manager'],
//     default: 'user',
//   },
//   isAdmin: { type: Boolean, default: false },
//   companyName: { type: String },
//   phone: { type: String, default: null },
//   verificationCode: { type: String },
//   isVerified: { type: Boolean, default: false },
//   welcome: { type: Boolean, default: false },
//   profileImage: { type: String },
//   discountCode: { type: String },
//   email: { type: String, default: null },
//   favouritsProductst: [
//     {
//       productId: { type: String },
//     },
//   ],
//   adresse: {
//     latitude: { type: Number },
//     longitude: { type: Number },
//     countryCode: { type: String },
//     country: { type: String },
//     city: { type: String },
//     postalCode: { type: String },
//     locality: { type: String },
//     apartmentNumber: { type: String },
//     streetName: { type: String },
//     region: { type: String },
//     fullAddress: { type: String },
//   },
//   policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
//   shippingAdress: {
//     countryCode: { type: String },
//     country: { type: String },
//     city: { type: String },
//     postalCode: { type: String },
//     locality: { type: String },
//     apartmentNumber: { type: String },
//     streetName: { type: String },
//     region: { type: String },
//     fullAddress: { type: String },
//   },
//   proximityRange: { type: Number, default: 20 },
//   storeCategorieIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StoreCategory' }],
//   productCategorieIds: [
//     {
//       categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//       subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category.subCategories' }],
//     },
//   ],
//   tags: [
//     {
//       name: { type: String, required: true },
//     },
//   ],
//   notification: {
//     orderNotifications: { type: Boolean, default: null },
//     offerNotification: { type: Boolean, default: null },
//     mail: { type: Boolean, default: null },
//     sms: { type: Boolean, default: null },
//     platforme: { type: Boolean, default: null },
//     popup: { type: Boolean, default: null },
//     vibration: { type: Boolean, default: null },
//     ringing: { type: Boolean, default: null },
//   },
//   pickupPersons: [
//     {
//       type: {
//         name: { type: String, required: true },
//       },
//     },
//   ],
//   addresses: [
//     {
//       type: {
//         deliveryLocation: {
//           type: { type: String, enum: ['Point'] },
//           coordinates: [{ type: Number }, { type: Number }],
//         },
//         deliveryAddresse: {
//           city: { type: String },
//           streetName: { type: String },
//           postalCode: { type: String },
//           country: { type: String },
//           fullAdress: { type: String },
//           region: { type: String },
//           countryCode: { type: String },
//           phone: { type: String },
//         },
//       },
//     },
//   ],
//   cards: [
//     {
//       type: {
//         cardNumber: { type: String, default: null },
//         ccv: { type: String, default: null },
//         expdate: { type: String, default: null },
//         name: { type: String, required: true },
//         phone: { type: String, required: true },
//         postalCode: { type: String, required: true },
//         address_city: { type: String, required: true },
//         address_line1: { type: String, required: true },
//         address_line2: { type: String, default: '' },
//       },
//     },
//   ],
// }, { timestamps: true });

// Create the User model
// const User = mongoose.model('User', userSchema);

// Function to generate fake users
const generateFakeUser = () => {
  return {
    password: faker.internet.password(),
    username: faker.internet.userName(),
    role: faker.random.arrayElement(['user', 'admin', 'seller', 'paymentManager', 'manager']),
    isAdmin: faker.datatype.boolean(),
    companyName: faker.company.companyName(),
    phone: faker.phone.phoneNumber(),
    verificationCode: faker.random.alphaNumeric(6),
    isVerified: faker.datatype.boolean(),
    welcome: faker.datatype.boolean(),
    profileImage: faker.image.avatar(),
    discountCode: faker.random.alphaNumeric(8),
    email: faker.internet.email(),
    favouritsProductst: Array.from({ length: faker.datatype.number({ min: 0, max: 10 }) }, () => ({ productId: faker.datatype.uuid() })),
    adresse: {
      latitude: faker.address.latitude(),
      longitude: faker.address.longitude(),
      countryCode: faker.address.countryCode(),
      country: faker.address.country(),
      city: faker.address.city(),
      postalCode: faker.address.zipCode(),
      locality: faker.address.county(),
      apartmentNumber: faker.address.secondaryAddress(),
      streetName: faker.address.streetName(),
      region: faker.address.state(),
      fullAddress: faker.address.streetAddress(),
    },
    policy: mongoose.Types.ObjectId(), // Assuming you have a policy document in your collection
    shippingAdress: {
      countryCode: faker.address.countryCode(),
      country: faker.address.country(),
      city: faker.address.city(),
      postalCode: faker.address.zipCode(),
      locality: faker.address.county(),
      apartmentNumber: faker.address.secondaryAddress(),
      streetName: faker.address.streetName(),
      region: faker.address.state(),
      fullAddress: faker.address.streetAddress(),
    },
    proximityRange: faker.datatype.number({ min: 1, max: 100 }),
    storeCategorieIds: Array.from({ length: faker.datatype.number({ min: 0, max: 10 }) }, () => mongoose.Types.ObjectId()),
    productCategorieIds: Array.from({ length: faker.datatype.number({ min: 0, max: 10 }) }, () => ({
      categoryId: mongoose.Types.ObjectId(),
      subCategories: Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => mongoose.Types.ObjectId()),
    })),
    tags: Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => ({ name: faker.random.word() })),
    notification: {
      orderNotifications: faker.datatype.boolean(),
      offerNotification: faker.datatype.boolean(),
      mail: faker.datatype.boolean(),
      sms: faker.datatype.boolean(),
      platforme: faker.datatype.boolean(),
      popup: faker.datatype.boolean(),
      vibration: faker.datatype.boolean(),
      ringing: faker.datatype.boolean(),
    },
    pickupPersons: Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => ({ name: faker.name.findName() })),
    addresses: Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => ({
      deliveryLocation: {
        type: 'Point',
        coordinates: [parseFloat(faker.address.longitude()), parseFloat(faker.address.latitude())],
      },
      deliveryAddresse: {
        city: faker.address.city(),
        streetName: faker.address.streetName(),
        postalCode: faker.address.zipCode(),
        country: faker.address.country(),
        fullAdress: faker.address.streetAddress(),
        region: faker.address.state(),
        countryCode: faker.address.countryCode(),
        phone: faker.phone.phoneNumber(),
      },
    })),
    cards: Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, () => ({
      cardNumber: faker.finance.creditCardNumber(),
      ccv: faker.finance.creditCardCVV(),
      expdate: faker.finance.creditCardExpirationDate(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      postalCode: faker.address.zipCode(),
      address_city: faker.address.city(),
      address_line1: faker.address.streetAddress(),
      address_line2: faker.address.secondaryAddress(),
    })),
  };
};

// Populate database with fake users
const populateDatabase = async () => {
  try {
    // Generate 100 fake users
    const fakeUsers = Array.from({ length: 100 }, generateFakeUser);
    // Insert fake users into the database
    await User.insertMany(fakeUsers);
    console.log('Database populated with fake users');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
  }
};

// Call the function to populate the database
populateDatabase();
