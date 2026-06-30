import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem('reminder_settings');
      if (raw) {
        const s = JSON.parse(raw);
        setEnabled(s.enabled);
        setHour(s.hour);
        setMinute(s.minute);
      }
    } catch (e) {}
  };

  const saveSettings = async (newEnabled: boolean, newHour: number, newMinute: number) => {
    try {
      await AsyncStorage.setItem('reminder_settings', JSON.stringify({
        enabled: newEnabled,
        hour: newHour,
        minute: newMinute,
      }));
    } catch (e) {}
  };

  const scheduleNotification = async (h: number, m: number) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет разрешения', 'Разреши уведомления в настройках телефона');
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Как ты сегодня? 🌿',
        body: 'Не забудь записать своё настроение',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });
    return true;
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      const ok = await scheduleNotification(hour, minute);
      if (!ok) return;
      Alert.alert('Готово', `Напоминание установлено на ${formatTime(hour, minute)}`);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    setEnabled(value);
    saveSettings(value, hour, minute);
  };

  const handleTimeChange = async (newHour: number, newMinute: number) => {
    setHour(newHour);
    setMinute(newMinute);
    saveSettings(enabled, newHour, newMinute);
    if (enabled) {
      await scheduleNotification(newHour, newMinute);
    }
  };

  const formatTime = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Настройки</Text>

      {/* Переключатель */}
      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Напоминание</Text>
            <Text style={styles.rowSub}>Ежедневное уведомление</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#e0e0e0', true: '#4A90E2' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Выбор времени */}
      {enabled && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Время напоминания</Text>
          <Text style={styles.timeDisplay}>{formatTime(hour, minute)}</Text>

          <Text style={styles.pickerLabel}>Часы</Text>
          <View style={styles.pickerRow}>
            {HOURS.map(h => (
              <TouchableOpacity
                key={h}
                onPress={() => handleTimeChange(h, minute)}
                style={[styles.pickerBtn, hour === h && styles.pickerActive]}
              >
                <Text style={[styles.pickerText, hour === h && styles.pickerTextActive]}>
                  {String(h).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.pickerLabel}>Минуты</Text>
          <View style={styles.pickerRow}>
            {MINUTES.map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => handleTimeChange(hour, m)}
                style={[styles.pickerBtn, styles.pickerBtnWide, minute === m && styles.pickerActive]}
              >
                <Text style={[styles.pickerText, minute === m && styles.pickerTextActive]}>
                  {String(m).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:           { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  title:            { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 24, marginBottom: 24 },
  section:          { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:     { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle:         { fontSize: 16, fontWeight: '500', color: '#1a1a1a' },
  rowSub:           { fontSize: 13, color: '#999', marginTop: 2 },
  timeDisplay:      { fontSize: 48, fontWeight: '700', color: '#4A90E2', textAlign: 'center', marginBottom: 24 },
  pickerLabel:      { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  pickerRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  pickerBtn:        { width: 40, height: 36, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  pickerBtnWide:    { width: 60 },
  pickerActive:     { backgroundColor: '#4A90E2' },
  pickerText:       { fontSize: 13, color: '#555' },
  pickerTextActive: { color: '#fff', fontWeight: '600' },
});