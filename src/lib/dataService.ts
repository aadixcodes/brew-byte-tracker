
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { 
  initializeMockData, 
  itemsList, 
  menuItems, 
  calculateSummary, 
  generateMonthlyData, 
  generateTopItems 
} from './mockData';

// Initialize data
const { purchases: initialPurchases, sales: initialSales } = initializeMockData();
let purchases = [...initialPurchases];
let sales = [...initialSales];

// Get all purchases
export const getPurchases = () => {
  // Sort by date descending
  return [...purchases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Add a new purchase
export const addPurchase = (purchase: any) => {
  const newPurchase = {
    ...purchase,
    id: purchases.length + 1,
    total: parseFloat((purchase.quantity * purchase.price_per_item).toFixed(2)),
    created_at: new Date().toISOString()
  };
  
  purchases = [...purchases, newPurchase];
  localStorage.setItem('cafe-purchases', JSON.stringify(purchases));
  toast({
    title: "Purchase added",
    description: `Added ${purchase.quantity} units of ${purchase.item_name}`,
  });
  
  return newPurchase;
};

// Edit a purchase
export const editPurchase = (id: number, updatedPurchase: any) => {
  const index = purchases.findIndex(p => p.id === id);
  
  if (index !== -1) {
    const updatedTotal = parseFloat(
      (updatedPurchase.quantity * updatedPurchase.price_per_item).toFixed(2)
    );
    
    purchases[index] = {
      ...purchases[index],
      ...updatedPurchase,
      total: updatedTotal
    };
    
    localStorage.setItem('cafe-purchases', JSON.stringify(purchases));
    toast({
      title: "Purchase updated",
      description: `Updated purchase of ${updatedPurchase.item_name}`,
    });
    
    return purchases[index];
  }
  
  toast({
    title: "Error",
    description: "Purchase not found",
    variant: "destructive",
  });
  
  return null;
};

// Delete a purchase
export const deletePurchase = (id: number) => {
  const index = purchases.findIndex(p => p.id === id);
  
  if (index !== -1) {
    const deletedPurchase = purchases[index];
    purchases = purchases.filter(p => p.id !== id);
    localStorage.setItem('cafe-purchases', JSON.stringify(purchases));
    
    toast({
      title: "Purchase deleted",
      description: `Deleted purchase of ${deletedPurchase.item_name}`,
    });
    
    return true;
  }
  
  toast({
    title: "Error",
    description: "Purchase not found",
    variant: "destructive",
  });
  
  return false;
};

// Get all sales
export const getSales = () => {
  // Sort by date descending
  return [...sales].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Add a new sale
export const addSale = (sale: any) => {
  const totalSale = parseFloat((sale.quantity * sale.sale_price_per_item).toFixed(2));
  const profit = parseFloat((totalSale - (sale.quantity * sale.cost_price)).toFixed(2));
  
  const newSale = {
    ...sale,
    id: sales.length + 1,
    total_sale: totalSale,
    profit: profit,
    created_at: new Date().toISOString()
  };
  
  sales = [...sales, newSale];
  localStorage.setItem('cafe-sales', JSON.stringify(sales));
  
  toast({
    title: "Sale added",
    description: `Added sale of ${sale.quantity} ${sale.item_name}`,
  });
  
  return newSale;
};

// Edit a sale
export const editSale = (id: number, updatedSale: any) => {
  const index = sales.findIndex(s => s.id === id);
  
  if (index !== -1) {
    const totalSale = parseFloat(
      (updatedSale.quantity * updatedSale.sale_price_per_item).toFixed(2)
    );
    
    const profit = parseFloat(
      (totalSale - (updatedSale.quantity * updatedSale.cost_price)).toFixed(2)
    );
    
    sales[index] = {
      ...sales[index],
      ...updatedSale,
      total_sale: totalSale,
      profit: profit
    };
    
    localStorage.setItem('cafe-sales', JSON.stringify(sales));
    
    toast({
      title: "Sale updated",
      description: `Updated sale of ${updatedSale.item_name}`,
    });
    
    return sales[index];
  }
  
  toast({
    title: "Error",
    description: "Sale not found",
    variant: "destructive",
  });
  
  return null;
};

// Delete a sale
export const deleteSale = (id: number) => {
  const index = sales.findIndex(s => s.id === id);
  
  if (index !== -1) {
    const deletedSale = sales[index];
    sales = sales.filter(s => s.id !== id);
    localStorage.setItem('cafe-sales', JSON.stringify(sales));
    
    toast({
      title: "Sale deleted",
      description: `Deleted sale of ${deletedSale.item_name}`,
    });
    
    return true;
  }
  
  toast({
    title: "Error",
    description: "Sale not found",
    variant: "destructive",
  });
  
  return false;
};

// Get items for dropdowns
export const getInventoryItems = () => itemsList;
export const getMenuItems = () => menuItems;

// Get dashboard summary data
export const getDashboardSummary = () => {
  const summary = calculateSummary(purchases, sales);
  const monthlyData = generateMonthlyData();
  const { purchasedItems, soldItems } = generateTopItems();
  
  // Get 5 most recent purchases
  const recentPurchases = [...purchases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  // Get 5 most recent sales
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  return {
    summary,
    monthlyData,
    topPurchasedItems: purchasedItems,
    topSoldItems: soldItems,
    recentPurchases,
    recentSales
  };
};

// Filter purchases by date range
export const filterPurchasesByDate = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate && !endDate) {
    return getPurchases();
  }
  
  return getPurchases().filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    
    if (startDate && endDate) {
      return purchaseDate >= startDate && purchaseDate <= endDate;
    }
    
    if (startDate) {
      return purchaseDate >= startDate;
    }
    
    if (endDate) {
      return purchaseDate <= endDate;
    }
    
    return true;
  });
};

// Filter sales by date range
export const filterSalesByDate = (startDate: Date | null, endDate: Date | null) => {
  if (!startDate && !endDate) {
    return getSales();
  }
  
  return getSales().filter(sale => {
    const saleDate = new Date(sale.date);
    
    if (startDate && endDate) {
      return saleDate >= startDate && saleDate <= endDate;
    }
    
    if (startDate) {
      return saleDate >= startDate;
    }
    
    if (endDate) {
      return saleDate <= endDate;
    }
    
    return true;
  });
};

// Filter purchases by item name
export const filterPurchasesByItem = (itemName: string) => {
  if (!itemName) {
    return getPurchases();
  }
  
  return getPurchases().filter(purchase => 
    purchase.item_name.toLowerCase().includes(itemName.toLowerCase())
  );
};

// Filter sales by item name
export const filterSalesByItem = (itemName: string) => {
  if (!itemName) {
    return getSales();
  }
  
  return getSales().filter(sale => 
    sale.item_name.toLowerCase().includes(itemName.toLowerCase())
  );
};
