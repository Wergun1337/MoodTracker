import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      <View style={styles.center}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/entry')}>
          <Text style={styles.btnText}>Записать настроение</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  date:     { fontSize: 13, color: '#999', textTransform: 'capitalize', marginTop: 12 },
  center:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btn:      { backgroundColor: '#4A90E2', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  btnText:  { color: '#fff', fontSize: 18, fontWeight: '600' },
});