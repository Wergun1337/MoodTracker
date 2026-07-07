import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { CalendarList } from 'react-native-calendars';
import { exportPdf } from '../../utils/exportPdf';

const PERIODS = [
  { label: '7 дней',  days: 7 },
  { label: '14 дней', days: 14 },
  { label: '30 дней', days: 30 },
  { label: '90 дней', days: 90 },
];

const getDateRange = (days: number) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    from: from.toISOString().split('T')[0],
    to:   to.toISOString().split('T')[0],
  };
};

const today = new Date().toISOString().split('T')[0];

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [step, setStep] = useState<'quick' | 'custom'>('quick');

  const resetModal = () => {
    setModalVisible(false);
    setFromDate(null);
    setToDate(null);
    setStep('quick');
  };

  const handleExport = async (from: string, to: string) => {
    setLoading(true);
    const result = await exportPdf(from, to);
    setLoading(false);
    resetModal();
    if (!result.success) {
      Alert.alert('Внимание', result.message ?? 'Что-то пошло не так');
    }
  };

  const handleQuickPeriod = async (days: number) => {
    const { from, to } = getDateRange(days);
    await handleExport(from, to);
  };

  const handleDayPress = (day: { dateString: string }) => {
    if (!fromDate || (fromDate && toDate)) {
      setFromDate(day.dateString);
      setToDate(null);
    } else {
      if (day.dateString < fromDate) {
        setFromDate(day.dateString);
        setToDate(null);
      } else {
        setToDate(day.dateString);
      }
    }
  };

  const getMarkedDates = () => {
    if (!fromDate) return {};
    if (!toDate) return { [fromDate]: { selected: true, selectedColor: '#4A90E2' } };

    const marked: Record<string, any> = {};
    const current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {
      const key = current.toISOString().split('T')[0];
      if (key === fromDate) {
        marked[key] = { startingDay: true, color: '#4A90E2', textColor: '#fff' };
      } else if (key === toDate) {
        marked[key] = { endingDay: true, color: '#4A90E2', textColor: '#fff' };
      } else {
        marked[key] = { color: '#EFF6FF', textColor: '#4A90E2' };
      }
      current.setDate(current.getDate() + 1);
    }
    return marked;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      <View style={styles.center}>
        <TouchableOpacity style={styles.mainBtn} onPress={() => router.push('/entry')}>
          <Text style={styles.mainBtnText}>Записать настроение</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.reportBtnText}>Создать отчёт</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={resetModal}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>

            {loading ? (
              <Text style={styles.loadingText}>Создаём PDF...</Text>
            ) : step === 'quick' ? (
              <>
                <Text style={styles.sheetTitle}>Выбери период</Text>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.days}
                    style={styles.periodBtn}
                    onPress={() => handleQuickPeriod(p.days)}
                  >
                    <Text style={styles.periodBtnText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.periodBtn, { borderWidth: 1, borderColor: '#4A90E2', backgroundColor: '#EFF6FF' }]}
                  onPress={() => setStep('custom')}
                >
                  <Text style={[styles.periodBtnText, { color: '#4A90E2' }]}>Выбрать даты вручную</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetModal}>
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>
                  {!fromDate
                    ? 'Выбери начало периода'
                    : !toDate
                    ? 'Выбери конец периода'
                    : `${fromDate} — ${toDate}`}
                </Text>
                <CalendarList
                  onDayPress={handleDayPress}
                  maxDate={today}
                  markingType="period"
                  markedDates={getMarkedDates()}
                  pastScrollRange={12}
                  futureScrollRange={0}
                  scrollEnabled
                  showScrollIndicator
                  style={styles.calendarList}
                  theme={{
                    todayTextColor: '#4A90E2',
                    arrowColor: '#4A90E2',
                    textDayFontSize: 14,
                    textMonthFontSize: 15,
                    textMonthFontWeight: '600',
                  }}
                />
                {fromDate && toDate && (
                  <TouchableOpacity
                    style={styles.mainBtn}
                    onPress={() => handleExport(fromDate, toDate)}
                  >
                    <Text style={styles.mainBtnText}>Создать PDF</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('quick')}>
                  <Text style={styles.cancelBtnText}>← Назад</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  date:          { fontSize: 13, color: '#999', textTransform: 'capitalize', marginTop: 12 },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },

  mainBtn:       { backgroundColor: '#4A90E2', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 24 },
  mainBtnText:   { color: '#fff', fontSize: 18, fontWeight: '600' },

  reportBtn:     { backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 24, borderWidth: 1, borderColor: '#4A90E2' },
  reportBtnText: { color: '#4A90E2', fontSize: 16, fontWeight: '600' },

  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  sheetTitle:    { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 20, textAlign: 'center' },

  periodBtn:     { backgroundColor: '#f8f8f8', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  periodBtnText: { fontSize: 16, fontWeight: '500', color: '#1a1a1a' },

  cancelBtn:     { marginTop: 6, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 16, color: '#999' },

  loadingText:   { fontSize: 15, color: '#999', textAlign: 'center', paddingVertical: 24 },
  calendarList:  { height: 350 },
});