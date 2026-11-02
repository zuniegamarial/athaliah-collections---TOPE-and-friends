import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../api/client';
import { useCart } from '../context/CartContext'; // Use the custom hook safely

export default function CatalogScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart(); // Safe context hook call

    useEffect(() => {
        apiClient.get('/products')
            .then(res => setProducts(res.data))
            .catch(() => setProducts([
                { id: 1, name: "Classic Sneakers", price: 1299.00 },
                { id: 2, name: "Athaliah Signature Perfume", price: 450.00 }
            ]))
            .finally(() => setLoading(false));
    }, []);

    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`Added ${product.name} to Cart!`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Athaliah Collections</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#a18b69" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item }) => (
                        <ProductCard 
                            item={item} 
                            onAddToCart={handleAddToCart} 
                            onBuyNow={(prod) => navigation.navigate('Checkout', { product: prod })} 
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f6f0', paddingTop: 45, paddingHorizontal: 8 },
    header: { paddingVertical: 12, paddingHorizontal: 4, marginBottom: 5 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    row: { justifyContent: 'space-evenly' }
});