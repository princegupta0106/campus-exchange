
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  price: number;
  seller_id: string;
  profiles: {
    full_name: string;
    mobile_number: string;
    college?: string;
  };
}

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const BuyModal = ({ isOpen, onClose, product }: BuyModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserProfile();
    }
  }, [user, isOpen]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || !userProfile) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const deliveryAddress = formData.get('address') as string;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          total_amount: product.price,
          delivery_address: deliveryAddress,
        });

      if (error) throw error;

      // Update product status to sold
      await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', product.id);

      toast({
        title: "Order Placed!",
        description: `Your order for "${product.title}" has been placed. The seller will contact you soon.`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!product || !userProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase {product.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</p>
            <p className="text-sm text-gray-600">
              Seller: {product.profiles?.full_name} ({product.profiles?.mobile_number})
            </p>
            {product.profiles?.college && (
              <p className="text-sm text-gray-600">
                College: {product.profiles.college}
              </p>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Your Information</h4>
            <p><strong>Name:</strong> {userProfile.full_name}</p>
            <p><strong>Mobile:</strong> {userProfile.mobile_number}</p>
            {userProfile.college && (
              <p><strong>College:</strong> {userProfile.college}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your delivery address"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Placing Order..." : `Pay ₹${product.price.toLocaleString()}`}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
