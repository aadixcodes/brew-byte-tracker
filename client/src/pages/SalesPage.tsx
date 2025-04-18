
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  getSales,
  addSale,
  editSale,
  deleteSale,
  getMenuItems,
  filterSalesByDate,
  filterSalesByItem,
} from '@/lib/dataService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Plus, Edit, Trash2, FilterX, DollarSign } from 'lucide-react';

const formSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  sale_price_per_item: z.coerce.number().positive("Sale price must be positive"),
  cost_price: z.coerce.number().positive("Cost price must be positive"),
  date: z.string().min(1, "Date is required"),
});

type SaleFormValues = z.infer<typeof formSchema>;

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: '',
      quantity: 0,
      sale_price_per_item: 0,
      cost_price: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const editForm = useForm<SaleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: '',
      quantity: 0,
      sale_price_per_item: 0,
      cost_price: 0,
      date: '',
    },
  });

  // Fetch sales
  useEffect(() => {
    const fetchSales = () => {
      const data = getSales();
      setSales(data);
      
      const items = getMenuItems();
      setMenuItems(items);
    };
    
    fetchSales();
  }, []);

  // Handle add sale
  const onSubmit = (data: SaleFormValues) => {
    addSale(data);
    setSales(getSales());
    
    // Update menu items list to include the new item if it doesn't exist
    if (!menuItems.includes(data.item_name)) {
      setMenuItems(prev => [...prev, data.item_name]);
    }
    
    form.reset();
    setIsAddDialogOpen(false);
  };

  // Handle edit sale
  const onEditSubmit = (data: SaleFormValues) => {
    if (selectedSale) {
      editSale(selectedSale.id, data);
      setSales(getSales());
      
      // Update menu items list to include the edited item if it doesn't exist
      if (!menuItems.includes(data.item_name)) {
        setMenuItems(prev => [...prev, data.item_name]);
      }
      
      editForm.reset();
      setIsEditDialogOpen(false);
      setSelectedSale(null);
    }
  };

  // Handle delete sale
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      deleteSale(id);
      setSales(getSales());
    }
  };

  // Handle edit dialog open
  const handleEditClick = (sale: any) => {
    setSelectedSale(sale);
    editForm.reset({
      item_name: sale.item_name,
      quantity: sale.quantity,
      sale_price_per_item: sale.sale_price_per_item,
      cost_price: sale.cost_price,
      date: sale.date,
    });
    setIsEditDialogOpen(true);
  };

  // Handle filters
  const applyFilters = () => {
    let filteredData = getSales();
    
    if (dateRange.from || dateRange.to) {
      filteredData = filterSalesByDate(dateRange.from || null, dateRange.to || null);
    }
    
    if (itemFilter && itemFilter !== "all") {
      filteredData = filteredData.filter(sale => 
        sale.item_name === itemFilter
      );
    }
    
    if (searchTerm) {
      filteredData = filterSalesByItem(searchTerm);
    }
    
    setSales(filteredData);
    setIsFiltering(true);
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setItemFilter("");
    setSearchTerm("");
    setSales(getSales());
    setIsFiltering(false);
  };

  // Calculate total amounts
  const totalSales = sales.reduce((acc, sale) => acc + sale.total_sale, 0);
  const totalProfit = sales.reduce((acc, sale) => acc + sale.profit, 0);

  // Handler for date range selection
  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sale</DialogTitle>
                <DialogDescription>
                  Add a new sale to track revenue and profit
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="item_name">Item Name</Label>
                    <Input
                      id="item_name"
                      placeholder="Enter item name"
                      {...form.register("item_name")}
                    />
                    {form.formState.errors.item_name && (
                      <p className="text-sm text-destructive">{form.formState.errors.item_name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...form.register("quantity")}
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sale_price_per_item">Sale Price Per Item (₹)</Label>
                      <Input
                        id="sale_price_per_item"
                        type="number"
                        step="0.01"
                        {...form.register("sale_price_per_item")}
                      />
                      {form.formState.errors.sale_price_per_item && (
                        <p className="text-sm text-destructive">{form.formState.errors.sale_price_per_item.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cost_price">Cost Price Per Item (₹)</Label>
                      <Input
                        id="cost_price"
                        type="number"
                        step="0.01"
                        {...form.register("cost_price")}
                      />
                      {form.formState.errors.cost_price && (
                        <p className="text-sm text-destructive">{form.formState.errors.cost_price.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Sale Date</Label>
                    <Input
                      id="date"
                      type="date"
                      {...form.register("date")}
                    />
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit">Add Sale</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {sales.length} sales
              </p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">₹{totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Profit margin: {(totalSales > 0 ? (totalProfit / totalSales) * 100 : 0).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter sales by date range, item, or search term</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !dateRange.from && !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={new Date()}
                      selected={dateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>Item</Label>
                <Select 
                  onValueChange={setItemFilter}
                  value={itemFilter}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Filter by item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all-items" value="all">All Items</SelectItem>
                    {menuItems.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Search</Label>
                <div className="flex items-center mt-1">
                  <Input
                    placeholder="Search by item name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  <Search className="mr-2 h-4 w-4" />
                  Apply Filters
                </Button>
                
                {isFiltering && (
                  <Button variant="outline" onClick={resetFilters}>
                    <FilterX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Records</CardTitle>
            <CardDescription>
              Showing {sales.length} sales with a total value of ₹{totalSales.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">S.No</th>
                    <th className="text-left font-medium p-2">Date</th>
                    <th className="text-left font-medium p-2">Item Name</th>
                    <th className="text-right font-medium p-2">Quantity</th>
                    <th className="text-right font-medium p-2">Sale Price</th>
                    <th className="text-right font-medium p-2">Cost Price</th>
                    <th className="text-right font-medium p-2">Total Sale</th>
                    <th className="text-right font-medium p-2">Profit</th>
                    <th className="text-center font-medium p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={sale.id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{sale.date}</td>
                      <td className="p-2">{sale.item_name}</td>
                      <td className="text-right p-2">{sale.quantity}</td>
                      <td className="text-right p-2">₹{sale.sale_price_per_item.toFixed(2)}</td>
                      <td className="text-right p-2">₹{sale.cost_price.toFixed(2)}</td>
                      <td className="text-right p-2">₹{sale.total_sale.toFixed(2)}</td>
                      <td className="text-right p-2 text-emerald-500">₹{sale.profit.toFixed(2)}</td>
                      <td className="p-2">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(sale)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sale</DialogTitle>
            <DialogDescription>
              Update the sale details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_item_name">Item Name</Label>
                <Input
                  id="edit_item_name"
                  placeholder="Enter item name"
                  {...editForm.register("item_name")}
                />
                {editForm.formState.errors.item_name && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.item_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_quantity">Quantity</Label>
                <Input
                  id="edit_quantity"
                  type="number"
                  {...editForm.register("quantity")}
                />
                {editForm.formState.errors.quantity && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.quantity.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_sale_price_per_item">Sale Price Per Item (₹)</Label>
                  <Input
                    id="edit_sale_price_per_item"
                    type="number"
                    step="0.01"
                    {...editForm.register("sale_price_per_item")}
                  />
                  {editForm.formState.errors.sale_price_per_item && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.sale_price_per_item.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_cost_price">Cost Price Per Item (₹)</Label>
                  <Input
                    id="edit_cost_price"
                    type="number"
                    step="0.01"
                    {...editForm.register("cost_price")}
                  />
                  {editForm.formState.errors.cost_price && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.cost_price.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_date">Sale Date</Label>
                <Input
                  id="edit_date"
                  type="date"
                  {...editForm.register("date")}
                />
                {editForm.formState.errors.date && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.date.message}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SalesPage;
