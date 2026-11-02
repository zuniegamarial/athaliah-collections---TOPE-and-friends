import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { loginUser } from '../api/client';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

    useEffect(() => {
        // Check if device supports biometrics (fingerprint/face id)
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricSupported(compatible);
        })();
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter your username and password');
            return;
        }

        try {
            setLoading(true);
            const response = await loginUser({ username, password });
            if (response.data.success) {
                Alert.alert('Success', `Welcome back, ${response.data.user.username}!`);
                navigation.replace('MainTabs'); 
            }
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const biometricAuth = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login to Athaliah Collections',
                fallbackLabel: 'Use Passcode',
            });

            if (biometricAuth.success) {
                Alert.alert('Success', 'Biometric authentication successful!');
                navigation.replace('MainTabs');
            } else {
                Alert.alert('Cancelled', 'Biometric authentication was cancelled or failed.');
            }
        } catch (error) {
            Alert.alert('Error', 'Biometric login failed.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Athaliah Collections</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Username or Email"
                placeholderTextColor="#888"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            {isBiometricSupported && (
                <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
                    <Text style={styles.biometricText}>🔒 Login with Biometrics</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>Don't have an account? Register here</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f7f5f0' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#a18b69', textAlign: 'center', marginBottom: 32 },
    input: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
    button: { backgroundColor: '#a18b69', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    biometricButton: { backgroundColor: '#fff', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#a18b69' },
    biometricText: { color: '#a18b69', fontSize: 14, fontWeight: '600' },
    registerButton: { marginTop: 20, alignItems: 'center' },
    registerText: { color: '#a18b69', fontSize: 14, fontWeight: '600' }
});