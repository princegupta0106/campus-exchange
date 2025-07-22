
import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { SellModal } from '@/components/SellModal';
import { BuyModal } from '@/components/BuyModal';
import { ProfileModal } from '@/components/ProfileModal';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MarketplaceContent = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      if (showAuthModal) {
        setShowAuthModal(false);
      }
    }
  }, [user]);

  useEffect(() => {
    // Set default college filter to user's college
    if (userProfile?.college && selectedCollege === 'all') {
      setSelectedCollege(userProfile.college);
    }
  }, [userProfile, selectedCollege]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles(full_name, mobile_number, college),
          categories(name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  const handleBuyProduct = (product: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (product.seller_id === user.id) {
      toast({
        title: "Cannot Buy",
        description: "You cannot buy your own product",
        variant: "destructive",
      });
      return;
    }

    setSelectedProduct(product);
    setShowBuyModal(true);
  };

  const handleSellProduct = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowSellModal(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesCollege = selectedCollege === 'all' || product.profiles?.college === selectedCollege;
    return matchesSearch && matchesCategory && matchesCollege;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Campus Exchange...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onShowAuth={() => setShowAuthModal(true)}
        onShowSellForm={handleSellProduct}
        onShowProfile={() => setShowProfileModal(true)}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Campus Exchange</h1>
          <p className="text-xl mb-8">Buy and sell with your campus community</p>
          
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedCollege={selectedCollege}
            onCollegeChange={setSelectedCollege}
            categories={categories}
            colleges={colleges}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={handleBuyProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SellModal 
        isOpen={showSellModal} 
        onClose={() => setShowSellModal(false)}
        onProductAdded={fetchProducts}
      />
      <BuyModal 
        isOpen={showBuyModal} 
        onClose={() => setShowBuyModal(false)}
        product={selectedProduct}
      />
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <MarketplaceContent />
    </AuthProvider>
  );
};

export default Index;
