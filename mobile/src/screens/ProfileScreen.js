import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Ionicons name="person" size={40} color="#fff" />
            </View>
            <Text style={styles.name}>Valued Customer</Text>
            <Text style={styles.email}>customer@athaliah.com</Text>

            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="location-outline" size={20} color="#a18b69" />
                <Text style={styles.menuText}>Shipping Addresses</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="settings-outline" size={20} color="#a18b69" />
                <Text style={styles.menuText}>App Settings</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="help-circle-outline" size={20} color="#a18b69" />
                <Text style={styles.menuText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', paddingTop: 60, alignItems: 'center', paddingHorizontal: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#CDB4DB', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    email: { fontSize: 13, color: '#777', marginBottom: 30 },
    menuItem: { flexDirection: 'row', width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, elevation: 1 },
    menuText: { flex: 1, marginLeft: 15, fontSize: 14, color: '#333', fontWeight: '500' }
});