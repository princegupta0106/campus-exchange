
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SearchableSelect } from './SearchableSelect';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface College {
  id: string;
  name: string;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    mobileNumber: '',
  });

  useEffect(() => {
    if (isOpen && isSignUp) {
      fetchColleges();
    }
  }, [isOpen, isSignUp]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addNewCollege = async (collegeName: string) => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .insert({ name: collegeName })
        .select()
        .single();

      if (error) throw error;
      
      const newCollegeData = { id: data.id, name: data.name };
      setColleges(prev => [...prev, newCollegeData]);
      setSelectedCollege(data.id);
      setNewCollege('');
      
      return data.name;
    } catch (error: any) {
      console.error('Error adding college:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add college",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && (!formData.fullName || !formData.mobileNumber)) {
      toast({
        title: "Error",
        description: "Please provide your full name and mobile number",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !selectedCollege && !newCollege) {
      toast({
        title: "Error",
        description: "Please select or enter your college",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      if (isSignUp) {
        let collegeToUse = '';
        
        // If new college is provided, add it to the database first
        if (newCollege) {
          const addedCollegeName = await addNewCollege(newCollege);
          if (addedCollegeName) {
            collegeToUse = addedCollegeName;
          } else {
            return; // Exit if college creation failed
          }
        } else if (selectedCollege) {
          // Get the selected college name
          const selectedCollegeData = colleges.find(c => c.id === selectedCollege);
          collegeToUse = selectedCollegeData?.name || '';
        }

        // Sign up with the college name in metadata
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              mobile_number: formData.mobileNumber,
              college: collegeToUse,
            }
          }
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Account created successfully! You are now logged in.",
          });
          onClose();
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Signed in successfully!",
          });
          onClose();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isSignUp ? 'Join Campus Exchange' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? 'Create your account to start buying and selling' 
              : 'Sign in to your account'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  required
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
            </>
          )}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">
              {isSignUp ? 'Create Password' : 'Enter Password'}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isSignUp ? 'Create your password' : 'Enter your password'}
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading 
              ? (isSignUp ? "Creating Account..." : "Signing In...") 
              : (isSignUp ? "Create Account" : "Sign In")
            }
          </Button>
        </form>

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

