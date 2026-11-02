import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './ProductCard.styles';

export default function ProductCard({ item, onAddToCart, onBuyNow }) {
    return (
        <View style={styles.card}>
            <Image 
                source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
                style={styles.image} 
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>₱{item.price}</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cartButton} onPress={() => onAddToCart(item)}>
                        <Text style={styles.cartButtonText}>+ Cart</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buyButton} onPress={() => onBuyNow(item)}>
                        <Text style={styles.buyButtonText}>Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}