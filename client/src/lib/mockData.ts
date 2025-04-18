
import { addDays, subDays, format } from 'date-fns';

// Generate random dates within the last 90 days
const getRandomDate = () => {
  const daysAgo = Math.floor(Math.random() * 90);
  return subDays(new Date(), daysAgo);
};

// Generate random price between min and max
const getRandomPrice = (min: number, max: number) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// Generate random quantity between min and max
const getRandomQuantity = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// List of coffee items
export const itemsList = [
  'Arabica Coffee Beans',
  'Robusta Coffee Beans',
  'Colombian Coffee Beans',
  'Ethiopian Coffee Beans',
  'Milk',
  'Sugar',
  'Cups (Small)',
  'Cups (Medium)',
  'Cups (Large)',
  'Lids',
  'Napkins',
  'Stirrers',
  'Cocoa Powder',
  'Vanilla Syrup',
  'Caramel Syrup',
  'Hazelnut Syrup',
  'Whipped Cream',
  'Chocolate Syrup',
  'Tea Bags (Assorted)',
  'Honey',
];

// List of menu items
export const menuItems = [
  'Espresso',
  'Americano',
  'Cappuccino',
  'Latte',
  'Mocha',
  'Flat White',
  'Cold Brew',
  'Iced Coffee',
  'Macchiato',
  'Affogato',
  'Chai Latte',
  'Hot Chocolate',
  'Caramel Frappuccino',
  'Vanilla Frappuccino',
  'Green Tea',
  'Black Tea',
  'Herbal Tea',
  'Croissant',
  'Blueberry Muffin',
  'Chocolate Chip Cookie',
];

// Generate mock purchase data
export const generatePurchases = (count: number) => {
  const purchases = [];
  
  for (let i = 0; i < count; i++) {
    const item = itemsList[Math.floor(Math.random() * itemsList.length)];
    const date = getRandomDate();
    const quantity = getRandomQuantity(10, 100);
    const pricePerItem = getRandomPrice(1, 20);
    const total = parseFloat((quantity * pricePerItem).toFixed(2));
    
    purchases.push({
      id: i + 1,
      item_name: item,
      quantity,
      price_per_item: pricePerItem,
      total,
      date: format(date, 'yyyy-MM-dd'),
      created_at: date.toISOString(),
    });
  }
  
  return purchases;
};

// Generate mock sales data
export const generateSales = (count: number) => {
  const sales = [];
  
  for (let i = 0; i < count; i++) {
    const item = menuItems[Math.floor(Math.random() * menuItems.length)];
    const date = getRandomDate();
    const quantity = getRandomQuantity(1, 50);
    const costPrice = getRandomPrice(1, 3);
    const salePrice = costPrice * getRandomPrice(2, 3); // Markup
    const totalSale = parseFloat((quantity * salePrice).toFixed(2));
    const profit = parseFloat((totalSale - (quantity * costPrice)).toFixed(2));
    
    sales.push({
      id: i + 1,
      item_name: item,
      quantity,
      sale_price_per_item: salePrice,
      cost_price: costPrice,
      total_sale: totalSale,
      profit,
      date: format(date, 'yyyy-MM-dd'),
      created_at: date.toISOString(),
    });
  }
  
  return sales;
};

// Generate monthly data for charts
export const generateMonthlyData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map(month => {
    const expenses = getRandomPrice(3000, 8000);
    const earnings = getRandomPrice(5000, 12000);
    
    return {
      name: month,
      expenses,
      earnings,
      profit: parseFloat((earnings - expenses).toFixed(2))
    };
  });
};

// Generate top items data
export const generateTopItems = () => {
  const purchasedItems = itemsList
    .slice(0, 5)
    .map(item => ({
      name: item,
      value: parseFloat(getRandomPrice(300, 1500).toFixed(2))
    }));
    
  const soldItems = menuItems
    .slice(0, 5)
    .map(item => ({
      name: item,
      value: parseFloat(getRandomPrice(500, 2500).toFixed(2))
    }));
    
  return { purchasedItems, soldItems };
};

// Calculate summary statistics
export const calculateSummary = (purchases: any[], sales: any[]) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const thisMonthPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
  });
  
  const thisMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  
  const totalExpenses = thisMonthPurchases.reduce((acc, purchase) => acc + purchase.total, 0);
  const totalEarnings = thisMonthSales.reduce((acc, sale) => acc + sale.total_sale, 0);
  const netProfit = totalEarnings - totalExpenses;
  
  return {
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    netProfit: parseFloat(netProfit.toFixed(2))
  };
};

// Initialize mock data
export const initializeMockData = () => {
  const storedPurchases = localStorage.getItem('cafe-purchases');
  const storedSales = localStorage.getItem('cafe-sales');
  
  let purchases, sales;
  
  if (!storedPurchases) {
    purchases = generatePurchases(50);
    localStorage.setItem('cafe-purchases', JSON.stringify(purchases));
  } else {
    purchases = JSON.parse(storedPurchases);
  }
  
  if (!storedSales) {
    sales = generateSales(100);
    localStorage.setItem('cafe-sales', JSON.stringify(sales));
  } else {
    sales = JSON.parse(storedSales);
  }
  
  return { purchases, sales };
};
