
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { BuyModal } from '@/components/BuyModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, User, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProductDetailsContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles(full_name, mobile_number, college),
          categories(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('http')) return url;
    return `${supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl}`;
  };

  const handleBuyProduct = () => {
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

    setShowBuyModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button onClick={() => navigate('/')}>Go back to marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onShowAuth={() => setShowAuthModal(true)}
        onShowSellForm={() => navigate('/dashboard')}
        onShowProfile={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to marketplace
        </Button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Images Section */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.image_urls?.[selectedImageIndex] 
                    ? getImageUrl(product.image_urls[selectedImageIndex])
                    : '/placeholder.svg'
                  }
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.image_urls && product.image_urls.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.image_urls.map((url: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getImageUrl(url)}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              <div>
                {product.categories && (
                  <Badge className="mb-2">{product.categories.name}</Badge>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
                <p className="text-4xl font-bold text-green-600 mb-4">
                  ₹{product.price.toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{product.profiles?.full_name || 'Unknown'}</span>
                </div>
                {product.profiles?.mobile_number && (
                  <div className="flex items-center space-x-3 mb-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{product.profiles.mobile_number}</span>
                  </div>
                )}
                {product.profiles?.college && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{product.profiles.college}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <Button 
                  onClick={handleBuyProduct}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                Listed on {new Date(product.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <BuyModal 
        isOpen={showBuyModal} 
        onClose={() => setShowBuyModal(false)}
        product={product}
      />
    </div>
  );
};

const ProductDetails = () => {
  return (
    <AuthProvider>
      <ProductDetailsContent />
    </AuthProvider>
  );
};

export default ProductDetails;
