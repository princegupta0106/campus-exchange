
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, User, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  onShowAuth: () => void;
  onShowSellForm: () => void;
  onShowProfile: () => void;
}

export const Navbar = ({ onShowAuth, onShowSellForm, onShowProfile }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      await signOut();
      console.log('Sign out successful');
      navigate('/');
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-gray-900 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              Campus Exchange
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Package className="w-4 h-4 mr-2" />
                  My Products
                </Button>
                
                {isAdmin && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border shadow-lg z-50" align="end">
                    <DropdownMenuItem onClick={onShowProfile} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={onShowAuth} className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
