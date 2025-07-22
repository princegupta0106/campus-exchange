
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import { Navbar } from '@/components/Navbar';
import { useState } from 'react';
import { AuthModal } from '@/components/AuthModal';
import { SellModal } from '@/components/SellModal';
import { ProfileModal } from '@/components/ProfileModal';
import { Plus } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const [showAuth, setShowAuth] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          onShowAuth={() => setShowAuth(true)}
          onShowSellForm={() => setShowSellForm(true)}
          onShowProfile={() => setShowProfile(true)}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar
          onShowAuth={() => setShowAuth(true)}
          onShowSellForm={() => setShowSellForm(true)}
          onShowProfile={() => setShowProfile(true)}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </div>
        </div>
        
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        <SellModal
          isOpen={showSellForm}
          onClose={() => setShowSellForm(false)}
          onProductAdded={() => {}}
        />
        <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onShowAuth={() => setShowAuth(true)}
        onShowSellForm={() => setShowSellForm(true)}
        onShowProfile={() => setShowProfile(true)}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users and create products</p>
          </div>
          <Button
            onClick={() => setActiveTab('products')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="products">Create Product</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="products">
            <AdminProductForm />
          </TabsContent>
        </Tabs>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <SellModal
        isOpen={showSellForm}
        onClose={() => setShowSellForm(false)}
        onProductAdded={() => {}}
      />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
