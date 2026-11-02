import React, { useState } from 'react';
import { View, TextInput, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../api/client';

export default function SearchScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim().length > 0) {
            setLoading(true);
            apiClient.get(`/products?q=${text}`)
                .then(res => setProducts(res.data))
                .catch(err => console.log("Search error:", err))
                .finally(() => setLoading(false));
        } else {
            setProducts([]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search Athaliah Collections..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus={true}
                />
            </View>

            {loading && <ActivityIndicator size="small" color="#a18b69" style={{ marginTop: 20 }} />}

            <FlatList 
                data={products}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <ProductCard item={item} onAddToCart={(product) => navigation.navigate('Cart', { product })} />
                )}
                ListEmptyComponent={
                    searchQuery.length > 0 && !loading ? (
                        <Text style={styles.emptyText}>No products found matching "{searchQuery}"</Text>
                    ) : (
                        <Text style={styles.emptyText}>Type above to search products</Text>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', paddingTop: 50, paddingHorizontal: 8 },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 15, height: 45, marginBottom: 10, elevation: 2 },
    searchIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 14, color: '#333' },
    row: { justifyContent: 'space-evenly' },
    emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 14 }
});