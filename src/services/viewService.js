const View = require('../models/View');
const Store = require('../models/Store');
const Product = require('../models/Product');



// Function to get the total number of views
exports.getViews = async (req) => {
  try {
    const sellerId = req.params.id;
    const timePeriod = req.query.timePeriod; // Possible values: "day", "week", "month"

    // If no time period is specified, retrieve all views for the given seller without grouping
    if (!timePeriod) {
      const allViews = await View.find({ sellerId });
      const totalViews = allViews.length;
      
      console.log(allViews);
      
      return totalViews;
    }

    // If a time period is specified, calculate the total views for the specified time period
    const views = await View.find({ sellerId });

    // Filter the views based on the specified time period
    const filteredViews = views.filter((view) => {
      const viewDate = new Date(view.date); // Replace 'date' with the actual field name representing the view date

      switch (timePeriod) {
        case 'day':
          return viewDate.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
        case 'week':
          const currentWeekStart = new Date();
          currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
          return viewDate >= currentWeekStart;
        case 'month':
          return (
            viewDate.getFullYear() === new Date().getFullYear() &&
            viewDate.getMonth() === new Date().getMonth()
          );
        default:
          throw new Error('Invalid timePeriod. Use "day", "week", or "month".');
      }
    });

    const totalViews = filteredViews.length;

    console.log(filteredViews);

    return totalViews;
  } catch (error) {
    //console.log(error);
    throw error;
  }
};
/*
exports.getStoreViews = async (req) => {
  try {
    console.log('Request Parameters:', req.params);

    const viewsByStore = await View.aggregate([
      {
        $match: { sellerId: req.params.id },
      },
      {
        $group: {
          _id: '$storeId',
          numberOfViews: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'storeId',
          foreignField: '_id',
          as: 'storeData',
        },
      },
      {
        $unwind: '$storeData',
      },
      {
        $project: {
          storeName: '$storeData.name',
          numberOfViews: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Aggregation Result:', viewsByStore);

    return viewsByStore;
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
};
*/// Import the necessary models and dependencies


// Import the necessary models and dependencies


// Function to get store views
exports.getStoreViews = async (req) => {
  try {
    const sellerId = req.params.id;
    const timePeriod = req.query.timePeriod; // Possible values: "day", "week", "month"

    // If no time period is specified, retrieve all views for the given seller without grouping
    if (!timePeriod) {
      const allViews = await View.find({ sellerId });

      // Create a map to store the number of views for each store
      const storeViewsMap = new Map();

      // Calculate the number of views for each store
      allViews.forEach((view) => {
        const storeId = view.storeId.toString();
        if (storeViewsMap.has(storeId)) {
          storeViewsMap.set(storeId, storeViewsMap.get(storeId) + 1);
        } else {
          storeViewsMap.set(storeId, 1);
        }
      });

      // Fetch store data for each store with views
      const storeIdsWithViews = Array.from(storeViewsMap.keys());
      const storesWithViews = await Store.find({ _id: { $in: storeIdsWithViews } });

      // Prepare the final result with store name and number of views
      const result = storesWithViews.map((store) => ({
        storeName: store.name,
        numberOfViews: storeViewsMap.get(store._id.toString()) || 0,
      }));

      return result;
    }

    // If a time period is specified, calculate the store views for the specified time period
    const views = await View.find({ sellerId });

    // Filter the views based on the specified time period
    const filteredViews = views.filter((view) => {
      const viewDate = new Date(view.date); // Replace 'date' with the actual field name representing the view date

      switch (timePeriod) {
        case 'day':
          return viewDate.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
        case 'week':
          const currentWeekStart = new Date();
          currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
          return viewDate >= currentWeekStart;
        case 'month':
          return (
            viewDate.getFullYear() === new Date().getFullYear() &&
            viewDate.getMonth() === new Date().getMonth()
          );
        default:
          throw new Error('Invalid timePeriod. Use "day", "week", or "month".');
      }
    });

    // Create a map to store the number of views for each store in the filtered views
    const storeViewsMap = new Map();
    filteredViews.forEach((view) => {
      const storeId = view.storeId.toString();
      if (storeViewsMap.has(storeId)) {
        storeViewsMap.set(storeId, storeViewsMap.get(storeId) + 1);
      } else {
        storeViewsMap.set(storeId, 1);
      }
    });

    // Fetch store data for each store with views
    const storeIdsWithViews = Array.from(storeViewsMap.keys());
    const storesWithViews = await Store.find({ _id: { $in: storeIdsWithViews } });

    // Prepare the final result with store name and number of views for the time period
    const result = storesWithViews.map((store) => ({
      storeName: store.name,
      numberOfViews: storeViewsMap.get(store._id.toString()) || 0,
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Function to get product views
exports.getProductViews = async (req) => {
  try {
    const sellerId = req.params.id;
    const timePeriod = req.query.timePeriod; // Possible values: "day", "week", "month"

    // If no time period is specified, retrieve all views for the given seller without grouping
    if (!timePeriod) {
      const allViews = await View.find({ sellerId });

      // Create a map to store the number of views for each product
      const productViewsMap = new Map();

      // Calculate the number of views for each product
      allViews.forEach((view) => {
        const productId = view.productId.toString();
        if (productViewsMap.has(productId)) {
          productViewsMap.set(productId, productViewsMap.get(productId) + 1);
        } else {
          productViewsMap.set(productId, 1);
        }
      });

      // Fetch product data for each product with views
      const productIdsWithViews = Array.from(productViewsMap.keys());
      const productsWithViews = await Product.find({ _id: { $in: productIdsWithViews } });

      // Prepare the final result with product name and number of views
      const result = productsWithViews.map((product) => ({
        productName: product.name,
        numberOfViews: productViewsMap.get(product._id.toString()) || 0,
      }));

      return result;
    }

    // If a time period is specified, calculate the product views for the specified time period
    const views = await View.find({ sellerId });

    // Filter the views based on the specified time period
    const filteredViews = views.filter((view) => {
      const viewDate = new Date(view.date); // Replace 'date' with the actual field name representing the view date

      switch (timePeriod) {
        case 'day':
          return viewDate.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
        case 'week':
          const currentWeekStart = new Date();
          currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
          return viewDate >= currentWeekStart;
        case 'month':
          return (
            viewDate.getFullYear() === new Date().getFullYear() &&
            viewDate.getMonth() === new Date().getMonth()
          );
        default:
          throw new Error('Invalid timePeriod. Use "day", "week", or "month".');
      }
    });

    // Create a map to store the number of views for each product in the filtered views
    const productViewsMap = new Map();
    filteredViews.forEach((view) => {
      const productId = view.productId.toString();
      if (productViewsMap.has(productId)) {
        productViewsMap.set(productId, productViewsMap.get(productId) + 1);
      } else {
        productViewsMap.set(productId, 1);
      }
    });

    // Fetch product data for each product with views
    const productIdsWithViews = Array.from(productViewsMap.keys());
    const productsWithViews = await Product.find({ _id: { $in: productIdsWithViews } });

    // Prepare the final result with product name and number of views for the time period
    const result = productsWithViews.map((product) => ({
      productName: product.name,
      numberOfViews: productViewsMap.get(product._id.toString()) || 0,
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


// Function to get region views
exports.getRegionViews = async (req) => {
  try {
    const sellerId = req.params.id;
    const timePeriod = req.query.timePeriod; // Possible values: "day", "week", "month"

    // If no time period is specified, retrieve all views for the given seller without grouping
    if (!timePeriod) {
      const allViews = await View.find({ sellerId });

      // Create a map to store the number of views for each region
      const regionViewsMap = new Map();

      // Calculate the number of views for each region
      allViews.forEach((view) => {
        const region = view.region;
        if (regionViewsMap.has(region)) {
          regionViewsMap.set(region, regionViewsMap.get(region) + 1);
        } else {
          regionViewsMap.set(region, 1);
        }
      });

      // Prepare the final result with region and number of views
      const result = Array.from(regionViewsMap.keys()).map((region) => ({
        region: region,
        numberOfViews: regionViewsMap.get(region),
      }));

      return result;
    }

    // If a time period is specified, calculate the views by region for the specified time period
    const views = await View.find({ sellerId });

    // Filter the views based on the specified time period
    const filteredViews = views.filter((view) => {
      const viewDate = new Date(view.date); // Replace 'date' with the actual field name representing the view date

      switch (timePeriod) {
        case 'day':
          return viewDate.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
        case 'week':
          const currentWeekStart = new Date();
          currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
          return viewDate >= currentWeekStart;
        case 'month':
          return (
            viewDate.getFullYear() === new Date().getFullYear() &&
            viewDate.getMonth() === new Date().getMonth()
          );
        default:
          throw new Error('Invalid timePeriod. Use "day", "week", or "month".');
      }
    });

    // Create a map to store the number of views for each region
    const regionViewsMap = new Map();

    // Calculate the number of views for each region in the filtered views
    filteredViews.forEach((view) => {
      const region = view.region;
      if (regionViewsMap.has(region)) {
        regionViewsMap.set(region, regionViewsMap.get(region) + 1);
      } else {
        regionViewsMap.set(region, 1);
      }
    });

    // Prepare the final result with region and number of views
    const result = Array.from(regionViewsMap.keys()).map((region) => ({
      region: region,
      numberOfViews: regionViewsMap.get(region),
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};









//////////////
/*
// Function to get views by region
exports.getRegionViews = async (req) => {
  try {
    const sellerId = req.params.id;

    // Find all views for the given seller
    const views = await View.find({ sellerId });

    // Create a map to store the number of views for each region
    const regionViewsMap = new Map();

    // Calculate the number of views for each region
    views.forEach((view) => {
      const region = view.region;
      if (regionViewsMap.has(region)) {
        regionViewsMap.set(region, regionViewsMap.get(region) + 1);
      } else {
        regionViewsMap.set(region, 1);
      }
    });

    // Prepare the final result with region and number of views
    const result = Array.from(regionViewsMap.keys()).map((region) => ({
      region: region,
      numberOfViews: regionViewsMap.get(region),
    }));

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
*/