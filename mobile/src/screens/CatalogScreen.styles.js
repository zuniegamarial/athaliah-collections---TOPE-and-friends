import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f7fa', // Slightly cooler off-white background
        paddingHorizontal: 4,
        paddingTop: 8,
    },
    loader: { 
        flex: 1, 
        justifyContent: 'center' 
    },
    row: {
        flex: 1,
        justifyContent: 'space-evenly', // Evenly spaces the two cards
    }
});