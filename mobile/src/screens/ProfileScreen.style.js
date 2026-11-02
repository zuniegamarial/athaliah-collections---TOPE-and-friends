import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f7fa', 
        paddingTop: 60,
        alignItems: 'center',
        paddingHorizontal: 20
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#CDB4DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    email: {
        fontSize: 13,
        color: '#777',
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        elevation: 1,
    },
    menuText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    }
});