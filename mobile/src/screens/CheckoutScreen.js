import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { placeOrder } from '../api/client';
import { useCart } from '../context/CartContext';

export default function CheckoutScreen({ route, navigation }) {
    const { cartItems, clearCart } = useCart();
    const directProduct = route?.params?.product;
    
    const [selectedPayment, setSelectedPayment] = useState('GCash');
    const [loading, setLoading] = useState(false);

    const itemsToCheckout = directProduct ? [{ ...directProduct, quantity: 1 }] : cartItems;

    const calculateTotal = () => {
        return itemsToCheckout.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    };

    const handleConfirmPayment = async () => {
        if (itemsToCheckout.length === 0) {
            Alert.alert('Notice', 'Your cart is empty.');
            return;
        }

        try {
            setLoading(true);
            const orderPayload = {
                total: calculateTotal(),
                payment_method: selectedPayment,
            };

            const response = await placeOrder(orderPayload);
            
            if (response.status === 201 || response.data?.status === 'success') {
                Alert.alert('Success', 'Order placed successfully!');
                if (!directProduct) clearCart();
                navigation.replace('MainTabs');
            }
        } catch (error) {
            Alert.alert('Checkout Failed', error.response?.data?.message || 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const PaymentOption = ({ id, title, iconName }) => (
        <TouchableOpacity 
            style={[styles.paymentRow, selectedPayment === id && styles.selectedPaymentRow]} 
            activeOpacity={0.8}
            onPress={() => setSelectedPayment(id)}
        >
            <View style={styles.paymentLeft}>
                <MaterialCommunityIcons name={iconName} size={20} color="#a18b69" style={styles.paymentIcon} />
                <Text style={styles.paymentText}>{title}</Text>
            </View>
            <View style={[styles.radioOuter, selectedPayment === id && styles.radioOuterSelected]}>
                {selectedPayment === id && <View style={styles.radioInner} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header pushed down cleanly below the device status bar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Order Summary ({itemsToCheckout.length} Item{itemsToCheckout.length > 1 ? 's' : ''})</Text>
                <View style={styles.itemsCard}>
                    {itemsToCheckout.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
                            </View>
                            <Text style={styles.itemPrice}>₱{(item.price * (item.quantity || 1)).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Payment Method</Text>
                
                <View style={styles.paymentListCard}>
                    <PaymentOption id="GCash" title="GCash" iconName="cellphone-wireless" />
                    <View style={styles.divider} />
                    <PaymentOption id="PayMaya" title="PayMaya" iconName="wallet-outline" />
                    <View style={styles.divider} />
                    <PaymentOption id="Cash on Delivery" title="Cash on Delivery" iconName="truck-delivery-outline" />
                </View>

                <View style={styles.spacer} />
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₱{calculateTotal().toFixed(2)}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleConfirmPayment} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Place Order</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f7f5f0',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 25 : 0 
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 14, 
        paddingHorizontal: 20, 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e0d8', 
        backgroundColor: '#fff' 
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    content: { flexGrow: 1, padding: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 12, color: '#555' },
    itemsCard: { 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        padding: 12, 
        borderWidth: 1, 
        borderColor: '#e5e0d8',
        marginBottom: 12
    },
    itemRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0ece4'
    },
    itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemQty: { fontSize: 12, color: '#777', marginTop: 2 },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#a18b69' },
    paymentListCard: { 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#e5e0d8',
        overflow: 'hidden'
    },
    paymentRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingVertical: 14, 
        paddingHorizontal: 16,
        backgroundColor: '#fff'
    },
    selectedPaymentRow: { backgroundColor: '#fcfbfa' },
    paymentLeft: { flexDirection: 'row', alignItems: 'center' },
    paymentIcon: { marginRight: 12 },
    paymentText: { fontSize: 15, fontWeight: '500', color: '#333' },
    divider: { height: 1, backgroundColor: '#f0ece4', marginHorizontal: 16 },
    radioOuter: { 
        height: 18, 
        width: 18, 
        borderRadius: 9, 
        borderWidth: 1.5, 
        borderColor: '#ccc', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    radioOuterSelected: { borderColor: '#a18b69' },
    radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#a18b69' },
    spacer: { height: 20 },
    footer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: 14, 
        paddingHorizontal: 20,
        backgroundColor: '#fff', 
        borderTopWidth: 1, 
        borderTopColor: '#e5e0d8' 
    },
    totalContainer: { flexDirection: 'row', alignItems: 'baseline' },
    totalLabel: { fontSize: 14, color: '#555', marginRight: 6 },
    totalAmount: { fontSize: 20, fontWeight: '700', color: '#a18b69' },
    button: { backgroundColor: '#a18b69', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 8, alignItems: 'center' },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});