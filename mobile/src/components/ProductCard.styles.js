import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '47%',
        marginBottom: 15,
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    image: {
        width: '100%',
        height: 130,
        borderRadius: 8,
        backgroundColor: '#e1e4e8',
    },
    infoContainer: {
        marginTop: 8,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    price: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
    },
    cartButton: {
        flex: 1,
        backgroundColor: '#f3eef7',
        paddingVertical: 6,
        borderRadius: 15,
        alignItems: 'center',
    },
    cartButtonText: {
        color: '#a18b69',
        fontSize: 11,
        fontWeight: 'bold',
    },
    buyButton: {
        flex: 1,
        backgroundColor: '#a18b69',
        paddingVertical: 6,
        borderRadius: 15,
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    }
});