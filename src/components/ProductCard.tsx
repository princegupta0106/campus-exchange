
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  seller_id: string;
  category_id: string;
  profiles: {
    full_name: string;
    mobile_number: string;
  };
  categories: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

export const ProductCard = ({ product, onBuy }: ProductCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('http')) return url;
    return `${supabase.storage.from('product-images').getPublicUrl(url).data.publicUrl}`;
  };

  const displayImage = product.image_urls?.[0] && !imageError 
    ? getImageUrl(product.image_urls[0])
    : '/placeholder.svg';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={displayImage}
            alt={product.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
          {product.categories && (
            <Badge className="absolute top-2 left-2 bg-white/90 text-gray-900">
              {product.categories.name}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">
              ₹{product.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              by {product.profiles?.full_name || 'Unknown'}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
