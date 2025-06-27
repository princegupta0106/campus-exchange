
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SearchableSelect } from '../SearchableSelect';

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
  college: string | null;
}

export const AdminProductForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, college')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addNewCategory = async (categoryName: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: categoryName })
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      setSelectedCategory(data.id);
      setNewCategory('');
      
      toast({
        title: "Success",
        description: "Category added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const uploadImages = async (files: FileList): Promise<string[]> => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedUser}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      return fileName;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select or add a category",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      let imageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles);
      }

      const { error } = await supabase
        .from('products')
        .insert({
          title,
          description,
          price,
          category_id: selectedCategory,
          seller_id: selectedUser,
          image_urls: imageUrls,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product created successfully!",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
      setSelectedCategory('');
      setSelectedUser('');
      setNewCategory('');
      setImageFiles(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Product for User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableSelect
            items={users.map(user => ({
              id: user.id,
              name: `${user.full_name || user.email}${user.college ? ` (${user.college})` : ''}`
            }))}
            value={selectedUser}
            onValueChange={setSelectedUser}
            placeholder="Select a user"
            searchPlaceholder="Search users..."
            label="Select User"
            newItemValue=""
            onNewItemValueChange={() => {}}
          />

          <div>
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter product title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the product"
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter price"
              required
            />
          </div>

          <SearchableSelect
            items={categories}
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            placeholder="Select a category"
            searchPlaceholder="Search categories..."
            label="Category"
            onAddNew={addNewCategory}
            addNewLabel="Enter new category name"
            newItemValue={newCategory}
            onNewItemValueChange={setNewCategory}
          />

          <div>
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(e.target.files)}
            />
          </div>

          <Button type="submit" disabled={isLoading || !selectedUser} className="w-full">
            {isLoading ? "Creating Product..." : "Create Product"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
