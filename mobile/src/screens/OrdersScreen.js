import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../api/client';

export default function OrdersScreen() {
    const [activeTab, setActiveTab] = useState('Pending');
    const [orders, setOrders] = useState([]);

    const fetchOrders = () => {
        apiClient.get('/orders')
            .then(res => setOrders(res.data))
            .catch(err => console.log("Fetch orders error:", err));
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [])
    );

    const handleCancelOrder = async (orderId) => {
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Yes, Cancel", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiClient.put(`/orders/${orderId}/status`, { status: "Cancelled" });
                            Alert.alert("Success", "Order cancelled successfully.");
                            fetchOrders();
                        } catch (error) {
                            console.log("Cancel error:", error.response || error);
                            Alert.alert("Error", "Could not cancel order. Please check connection.");
                        }
                    }
                }
            ]
        );
    };

    const filteredOrders = orders.filter(item => {
        const status = item.order_status || 'Pending';
        const isCancelled = status === 'Refunded' || status === 'Returns' || status === 'Cancelled';
        
        if (activeTab === 'Cancelled') return isCancelled;
        if (activeTab === 'Pending') return status.toLowerCase() === 'pending';
        return status.toLowerCase() === activeTab.toLowerCase();
    });

    const tabs = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>My Orders</Text>

            <View style={styles.tabContainer}>
                {tabs.map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const status = item.order_status || 'Pending';
                    const isPending = status.toLowerCase() === 'pending';

                    return (
                        <View style={styles.orderCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.shopName}>{item.order_number || `ATH-${item.id}`}</Text>
                                <Text style={styles.statusText}>{status}</Text>
                            </View>
                            
                            {/* Product Row displaying unique database product name and image */}
                            <View style={styles.productRow}>
                                <Image 
                                    source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' }} 
                                    style={styles.productImage} 
                                />
                                <View style={styles.productInfo}>
                                    <Text style={styles.itemDescription} numberOfLines={1}>
                                        {item.product_name || item.items || 'Athaliah Collection Item'}
                                    </Text>
                                    <Text style={styles.totalText}>Total: ₱{item.total}</Text>
                                    <Text style={styles.dateText}>Ordered on: {item.order_date || 'Oct 29, 2026'}</Text>
                                </View>
                            </View>

                            {/* Cancel Order Button only on Pending */}
                            {isPending && (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.id)}>
                                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={50} color="#ccc" />
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f6f0', paddingTop: 45, paddingHorizontal: 12 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    tabContainer: { flexDirection: 'row', backgroundColor: '#e1e4e8', borderRadius: 8, padding: 3, marginBottom: 15 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    activeTab: { backgroundColor: '#fff', elevation: 1 },
    tabText: { fontSize: 12, color: '#666', fontWeight: '600' },
    activeTabText: { color: '#a18b69', fontWeight: 'bold' },
    orderCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 6 },
    shopName: { fontWeight: 'bold', fontSize: 13, color: '#333' },
    statusText: { color: '#a18b69', fontWeight: 'bold', fontSize: 12 },
    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    productImage: { width: 65, height: 65, borderRadius: 8, backgroundColor: '#eee', marginRight: 12 },
    productInfo: { flex: 1 },
    itemDescription: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 4 },
    totalText: { fontSize: 13, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 },
    dateText: { fontSize: 11, color: '#888' },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8, marginTop: 4 },
    cancelButton: { borderWidth: 1, borderColor: '#333', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center' },
    cancelButtonText: { color: '#333', fontSize: 12, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#888', fontSize: 14, marginTop: 8 }
});