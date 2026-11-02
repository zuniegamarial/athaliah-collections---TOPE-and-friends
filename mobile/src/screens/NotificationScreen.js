import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationScreen() {
    const notifications = [
        { id: '1', title: 'Welcome to Athaliah Collections!', desc: 'Enjoy exploring our exclusive line of perfumes, footwear, and accessories.', time: '2m ago' },
        { id: '2', title: 'Flash Sale Alert!', desc: 'Get up to 20% off on all signature fragrances today.', time: '1h ago' }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.iconBox}>
                            <Ionicons name="notifications-outline" size={20} color="#a18b69" />
                        </View>
                        <View style={styles.contentBox}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.desc}>{item.desc}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', paddingTop: 50, paddingHorizontal: 12 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, marginLeft: 4 },
    card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, alignItems: 'center', elevation: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3eef7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    contentBox: { flex: 1 },
    title: { fontWeight: 'bold', fontSize: 13, color: '#333', marginBottom: 2 },
    desc: { fontSize: 12, color: '#666' }
});