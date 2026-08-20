import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CustomizeBurgerScreen } from './components/CustomizeBurgerScreen';
import { CustomOrderScreen } from './components/CustomOrderScreen';
import { CartScreen } from './components/CartScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { OrderHistoryScreen } from './components/OrderHistoryScreen';
import { UserProfileScreen } from './components/UserProfileScreen';
import { CustomerSupportScreen } from './components/CustomerSupportScreen';
import { PaymentMethodsScreen } from './components/PaymentMethodsScreen';
import { EditProfileScreen } from './components/EditProfileScreen';
import { SplashScreen } from './components/SplashScreen';
import { BottomNavigation } from './components/BottomNavigation';

function AppContent() {
  const { currentScreen, setCurrentScreen } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const showBottomNav =
    currentScreen === 'home' ||
    currentScreen === 'cart' ||
    currentScreen === 'orders' ||
    currentScreen === 'profile' ||
    currentScreen === 'support';

  return (
    <div className="min-h-screen bg-[#1F191D] flex justify-center selection:bg-[#EF2A39] selection:text-white font-sans antialiased text-[#322A2E]">
      <main className="w-full max-w-[430px] min-h-screen bg-[#FDFDFD] shadow-2xl relative flex flex-col overflow-x-hidden pb-safe">
        <div className="flex-1 flex flex-col">
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'detail' && <ProductDetailScreen />}
          {currentScreen === 'customize' && <CustomizeBurgerScreen />}
          {currentScreen === 'custom-order' && <CustomOrderScreen />}
          {currentScreen === 'cart' && <CartScreen />}
          {currentScreen === 'payment' && <PaymentScreen />}
          {currentScreen === 'orders' && <OrderHistoryScreen />}
          {currentScreen === 'profile' && <UserProfileScreen />}
          {currentScreen === 'support' && <CustomerSupportScreen />}
          {currentScreen === 'payment-methods' && <PaymentMethodsScreen />}
          {currentScreen === 'edit-profile' && <EditProfileScreen />}
        </div>

        {showBottomNav && (
          <div className="sticky bottom-0 z-40 bg-[#FDFDFD] border-t border-black/5">
            <BottomNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
          </div>
        )}
      </main>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

