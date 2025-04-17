
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
  getPurchases,
  addPurchase,
  editPurchase,
  deletePurchase,
  getInventoryItems,
  filterPurchasesByDate,
  filterPurchasesByItem,
} from '@/lib/dataService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Plus, Edit, Trash2, FilterX } from 'lucide-react';

const formSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  price_per_item: z.coerce.number().positive("Price must be positive"),
  date: z.string().min(1, "Date is required"),
});

type PurchaseFormValues = z.infer<typeof formSchema>;

const PurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [inventoryItems, setInventoryItems] = useState<string[]>([]);
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

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: '',
      quantity: 0,
      price_per_item: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const editForm = useForm<PurchaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: '',
      quantity: 0,
      price_per_item: 0,
      date: '',
    },
  });

  // Fetch purchases
  useEffect(() => {
    const fetchPurchases = () => {
      const data = getPurchases();
      setPurchases(data);
      
      const items = getInventoryItems();
      setInventoryItems(items);
    };
    
    fetchPurchases();
  }, []);

  // Handle add purchase
  const onSubmit = (data: PurchaseFormValues) => {
    addPurchase(data);
    setPurchases(getPurchases());
    form.reset();
    setIsAddDialogOpen(false);
  };

  // Handle edit purchase
  const onEditSubmit = (data: PurchaseFormValues) => {
    if (selectedPurchase) {
      editPurchase(selectedPurchase.id, data);
      setPurchases(getPurchases());
      editForm.reset();
      setIsEditDialogOpen(false);
      setSelectedPurchase(null);
    }
  };

  // Handle delete purchase
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      deletePurchase(id);
      setPurchases(getPurchases());
    }
  };

  // Handle edit dialog open
  const handleEditClick = (purchase: any) => {
    setSelectedPurchase(purchase);
    editForm.reset({
      item_name: purchase.item_name,
      quantity: purchase.quantity,
      price_per_item: purchase.price_per_item,
      date: purchase.date,
    });
    setIsEditDialogOpen(true);
  };

  // Handle filters
  const applyFilters = () => {
    let filteredData = getPurchases();
    
    if (dateRange.from || dateRange.to) {
      filteredData = filterPurchasesByDate(dateRange.from || null, dateRange.to || null);
    }
    
    if (itemFilter) {
      filteredData = filteredData.filter(purchase => 
        purchase.item_name === itemFilter
      );
    }
    
    if (searchTerm) {
      filteredData = filterPurchasesByItem(searchTerm);
    }
    
    setPurchases(filteredData);
    setIsFiltering(true);
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setItemFilter("");
    setSearchTerm("");
    setPurchases(getPurchases());
    setIsFiltering(false);
  };

  // Calculate total amount
  const totalAmount = purchases.reduce((acc, purchase) => acc + purchase.total, 0);

  // Handler for date range selection
  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Purchase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Purchase</DialogTitle>
                <DialogDescription>
                  Add a new inventory purchase to track expenses
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="item_name">Item Name</Label>
                    <Select 
                      onValueChange={(value) => form.setValue("item_name", value)}
                      defaultValue={form.getValues("item_name")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.item_name && (
                      <p className="text-sm text-destructive">{form.formState.errors.item_name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="price_per_item">Price Per Item ($)</Label>
                      <Input
                        id="price_per_item"
                        type="number"
                        step="0.01"
                        {...form.register("price_per_item")}
                      />
                      {form.formState.errors.price_per_item && (
                        <p className="text-sm text-destructive">{form.formState.errors.price_per_item.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Purchase Date</Label>
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
                  <Button type="submit">Add Purchase</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter purchases by date range, item, or search term</CardDescription>
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
                    {inventoryItems.map((item) => (
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
        
        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Records</CardTitle>
            <CardDescription>
              Showing {purchases.length} purchases with a total value of ${totalAmount.toFixed(2)}
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
                    <th className="text-right font-medium p-2">Price/Item</th>
                    <th className="text-right font-medium p-2">Total</th>
                    <th className="text-center font-medium p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase, index) => (
                    <tr key={purchase.id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{purchase.date}</td>
                      <td className="p-2">{purchase.item_name}</td>
                      <td className="text-right p-2">{purchase.quantity}</td>
                      <td className="text-right p-2">${purchase.price_per_item.toFixed(2)}</td>
                      <td className="text-right p-2">${purchase.total.toFixed(2)}</td>
                      <td className="p-2">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(purchase)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(purchase.id)}
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
            <DialogTitle>Edit Purchase</DialogTitle>
            <DialogDescription>
              Update the purchase details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_item_name">Item Name</Label>
                <Select 
                  onValueChange={(value) => editForm.setValue("item_name", value)}
                  defaultValue={editForm.getValues("item_name")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.item_name && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.item_name.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="edit_price_per_item">Price Per Item ($)</Label>
                  <Input
                    id="edit_price_per_item"
                    type="number"
                    step="0.01"
                    {...editForm.register("price_per_item")}
                  />
                  {editForm.formState.errors.price_per_item && (
                    <p className="text-sm text-destructive">{editForm.formState.errors.price_per_item.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_date">Purchase Date</Label>
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

export default PurchasesPage;
