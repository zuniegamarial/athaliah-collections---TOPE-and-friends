import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import SearchScreen from './src/screens/SearchScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import { CartProvider } from './src/context/CartContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
                    else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
                    else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
                    else if (route.name === 'Notification') iconName = focused ? 'notifications' : 'notifications-outline';
                    else if (route.name === 'Me') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={20} color={color} />;
                },
                tabBarActiveTintColor: '#a18b69',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: { height: 58, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#eee' }
            })}
        >
            <Tab.Screen name="Home" component={CatalogScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Cart" component={CartScreen} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Notification" component={NotificationScreen} />
            <Tab.Screen name="Me" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <CartProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen name="Checkout" component={CheckoutScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </CartProvider>
    );
}