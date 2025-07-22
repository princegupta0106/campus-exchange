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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [colleges, setColleges] = useState<any[]>([]);
  const [showCustomCollege, setShowCustomCollege] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    mobileNumber: '',
    college: '',
    customCollege: ''
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

  const handleCollegeChange = (value: string) => {
    if (value === 'not-listed') {
      setShowCustomCollege(true);
      setFormData({ ...formData, college: '' });
    } else {
      setShowCustomCollege(false);
      setFormData({ ...formData, college: value, customCollege: '' });
    }
  };

  const addNewCollege = async (collegeName: string) => {
    try {
      const { error } = await supabase
        .from('colleges')
        .insert({ name: collegeName });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding college:', error);
      return false;
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

    if (isSignUp && !formData.college && !formData.customCollege) {
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
        let collegeToUse = formData.college;
        
        // If custom college is provided, add it to the database first
        if (formData.customCollege) {
          const added = await addNewCollege(formData.customCollege);
          if (added) {
            collegeToUse = formData.customCollege;
          }
        }

        // Sign up and automatically sign in
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
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
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
              <div>
                <Label htmlFor="college">College</Label>
                <Select onValueChange={handleCollegeChange}>
                  <SelectTrigger className="max-h-10">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.name}>
                        {college.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="not-listed">My college is not listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {showCustomCollege && (
                <div>
                  <Label htmlFor="customCollege">College Name</Label>
                  <Input
                    id="customCollege"
                    name="customCollege"
                    value={formData.customCollege}
                    onChange={handleInputChange}
                    placeholder="Enter your college name"
                    required
                  />
                </div>
              )}
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
