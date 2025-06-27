import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

interface College {
  id: string;
  name: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [newCollege, setNewCollege] = useState('');

  useEffect(() => {
    if (user) {
      fetchColleges();
    }
  }, [user]);

  useEffect(() => {
    if (user && colleges.length > 0) {
      fetchProfile();
      fetchMyProducts();
      fetchMyOrders();
    }
  }, [user, colleges]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      
      // Find the college ID that matches the college name in profile
      if (data?.college) {
        const matchingCollege = colleges.find(c => c.name === data.college);
        setSelectedCollege(matchingCollege?.id || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const addNewCollege = async (collegeName: string) => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .insert({ name: collegeName })
        .select()
        .single();

      if (error) throw error;
      
      setColleges(prev => [...prev, data]);
      setSelectedCollege(data.id);
      setNewCollege('');
      
      toast({
        title: "Success",
        description: "College added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add college",
        variant: "destructive",
      });
    }
  };

  const fetchMyProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          profiles(full_name, mobile_number)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchMyOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products(title, price, image_urls),
          profiles!orders_seller_id_fkey(full_name, mobile_number)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get('full_name') as string;
    const mobileNumber = formData.get('mobile_number') as string;

    try {
      setIsLoading(true);

      // Get the selected college name
      const selectedCollegeName = colleges.find(c => c.id === selectedCollege)?.name || '';

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          mobile_number: mobileNumber,
          college: selectedCollegeName,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        defaultValue={profile?.full_name || ''}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="mobile_number">Mobile Number</Label>
                      <Input
                        id="mobile_number"
                        name="mobile_number"
                        defaultValue={profile?.mobile_number || ''}
                        placeholder="Enter your mobile number"
                      />
                    </div>

                    <SearchableSelect
                      items={colleges}
                      value={selectedCollege}
                      onValueChange={setSelectedCollege}
                      placeholder="Select your college"
                      searchPlaceholder="Search colleges..."
                      label="College"
                      onAddNew={addNewCollege}
                      addNewLabel="Enter new college name"
                      newItemValue={newCollege}
                      onNewItemValueChange={setNewCollege}
                    />

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myProducts.length === 0 ? (
                      <p className="text-gray-500 col-span-full text-center py-8">
                        You haven't listed any products yet.
                      </p>
                    ) : (
                      myProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onBuy={() => {}}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myOrders.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        You haven't placed any orders yet.
                      </p>
                    ) : (
                      myOrders.map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{order.products?.title}</h3>
                              <p className="text-sm text-gray-600">
                                Seller: {order.profiles?.full_name}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                ₹{order.total_amount.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                {order.status}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
