import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Cart</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={clearCart}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Your cart is empty.</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.cartItem}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>₱{item.price} x {item.quantity || 1}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                    <Text style={styles.removeText}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalAmount}>₱{calculateTotal().toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.checkoutButton} 
                            onPress={() => navigation.navigate('Checkout')}
                        >
                            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f5f0', paddingTop: 45 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e0d8' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    clearText: { color: '#a18b69', fontWeight: '600' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#888' },
    cartItem: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e0d8' },
    itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
    itemPrice: { fontSize: 14, color: '#666', marginTop: 4 },
    removeText: { color: '#d9534f', fontWeight: '600' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e0d8' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    totalLabel: { fontSize: 18, fontWeight: '600', color: '#333' },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#a18b69' },
    checkoutButton: { backgroundColor: '#a18b69', padding: 16, borderRadius: 8, alignItems: 'center' },
    checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});