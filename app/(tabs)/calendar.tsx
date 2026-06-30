import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useCallback } from 'react';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';

type Entry = {
  date: string;
  mood: { emoji: string; label: string };
  feelings: string[];
  thoughts: string[];
  note: string;
  energy: number;
};

type MarkedDates = Record<string, { selected: boolean; selectedColor: string }>;

const MOOD_COLORS: Record<string, string> = {
  '😄': '#4CAF50',
  '🙂': '#8BC34A',
  '😐': '#FFC107',
  '😔': '#FF9800',
  '😢': '#F44336',
};

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const loadAllEntries = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const moodKeys = keys.filter(k => k.startsWith('mood_'));
      const entries = await AsyncStorage.multiGet(moodKeys);

      const marks: MarkedDates = {};
      entries.forEach(([key, value]) => {
        if (value) {
          const entry: Entry = JSON.parse(value);
          const color = MOOD_COLORS[entry.mood.emoji] ?? '#4A90E2';
          marks[entry.date] = { selected: true, selectedColor: color };
        }
      });
      setMarkedDates(marks);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAllEntries();
      setSelectedEntry(null);
      setSelectedDate('');
    }, [])
  );

  const handleDayPress = async (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    try {
      const raw = await AsyncStorage.getItem(`mood_${day.dateString}`);
      setSelectedEntry(raw ? JSON.parse(raw) : null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Календарь</Text>

        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            ...(selectedDate && {
              [selectedDate]: {
                ...markedDates[selectedDate],
                selected: true,
                selectedColor: markedDates[selectedDate]?.selectedColor ?? '#4A90E2',
              }
            })
          }}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            selectedDayBackgroundColor: '#4A90E2',
            todayTextColor: '#4A90E2',
            arrowColor: '#4A90E2',
            textDayFontSize: 15,
            textMonthFontSize: 16,
            textMonthFontWeight: '600',
          }}
          style={styles.calendar}
        />

        {selectedDate && (
          <View style={styles.section}>
            {selectedEntry ? (
              <>
                <Text style={styles.entryDate}>{selectedDate}</Text>

                <View style={styles.row}>
                  <Text style={styles.entryEmoji}>{selectedEntry.mood.emoji}</Text>
                  <Text style={styles.entryMood}>{selectedEntry.mood.label}</Text>
                </View>

                {selectedEntry.energy && (
                    <View style={styles.block}>
                        <Text style={styles.blockTitle}>Энергия</Text>
                        <Text style={styles.energyText}>{selectedEntry.energy} / 10</Text>
                    </View>
                )}

                {selectedEntry.feelings.length > 0 && (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Чувства</Text>
                    <View style={styles.tagsList}>
                      {selectedEntry.feelings.map(f => (
                        <View key={f} style={styles.tag}>
                          <Text style={styles.tagText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {selectedEntry.thoughts.length > 0 && (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Мысли и состояния</Text>
                    <View style={styles.tagsList}>
                      {selectedEntry.thoughts.map(t => (
                        <View key={t} style={styles.tag}>
                          <Text style={styles.tagText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {selectedEntry.note ? (
                  <View style={styles.block}>
                    <Text style={styles.blockTitle}>Заметка</Text>
                    <Text style={styles.noteText}>{selectedEntry.note}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push({ pathname: '/entry', params: { date: selectedDate } })}
                >
                  <Text style={styles.editBtnText}>Редактировать</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.emptyText}>Записи за этот день нет</Text>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push({ pathname: '/entry', params: { date: selectedDate } })}
                >
                  <Text style={styles.editBtnText}>Добавить запись</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  title:       { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 24, marginBottom: 16 },
  calendar:    { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  section:     { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  entryDate:   { fontSize: 13, color: '#999', marginBottom: 12 },
  row:         { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  entryEmoji:  { fontSize: 36, marginRight: 12 },
  entryMood:   { fontSize: 22, fontWeight: '600', color: '#1a1a1a' },
  block:       { marginBottom: 16 },
  blockTitle:  { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  tagsList:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:         { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#EFF6FF' },
  tagText:     { fontSize: 13, color: '#4A90E2', fontWeight: '500' },
  noteText:    { fontSize: 15, color: '#333', lineHeight: 22 },
  emptyText:   { fontSize: 15, color: '#999', textAlign: 'center', paddingVertical: 20 },
  editBtn:     { backgroundColor: '#EFF6FF', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  editBtnText: { color: '#4A90E2', fontSize: 15, fontWeight: '600' },
  energyText: { fontSize: 18, fontWeight: '600', color: '#4A90E2' },
});