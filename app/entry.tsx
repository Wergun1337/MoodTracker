import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

const MOODS = [
    { emoji: '😢', label: 'Ужасно' },
    { emoji: '😔', label: 'Плохо' },
    { emoji: '😐', label: 'Нормально' },
    { emoji: '🙂', label: 'Хорошо' },
    { emoji: '😄', label: 'Отлично' },
];

const FEELINGS = [
    { 
        category: 'Гнев',     
        items: ['Бешенство', 'Ярость', 'Ненависть', 'Истерия', 'Злость','Раздражение','Презрение','Негодование','Обида','Ревность','Уязвлённость','Досада','Зависть','Неприязнь','Возмущение','Отвращение'] 
    },
    { 
        category: 'Страх',     
        items: ['Ужас', 'Отчаяние', 'Испуг', 'Оцепенение', 'Подозрение','Тревога','Ошарашенность','Беспокойство','Боязнь','Унижение','Замешательство','Растерянность','Вина','Стыд','Сомнение','Застенчивость','Опасение','Смущение','Сломленность','Подвох','Надменность','Ошеломлённость'] 
    },
    { 
        category: 'Грусть',     
        items: ['Горечь', 'Тоска', 'Скорбь', 'Лень', 'Жалость','Отрешенность','Отчаяние','Беспомощность','Душевная боль','Безнадёжность','Отчуждённость','Разочарование','Потрясение','Сожаление','Скука','Безысходность','Печаль','Загнанность'] 
    },
    { 
        category: 'Радость',     
        items: ['Счастье', 'Восторг', 'Ликование', 'Приподнятость', 'Оживление','Умиротворённость','Увлечение','Интерес','Забота','Ожидание','Возбуждение','Предвкушение','Надежда','Любопытство','Освобождение','Принятие','Нетерпение','Вера','Изумление'] 
    },
    { 
        category: 'Любовь',     
        items: ['Нежность', 'Теплота', 'Сочувствие', 'Блаженство', 'Доверие','Безопасность','Благостность','Спокойствие','Симпатия','Идентичность','Гордость','Восхищение','Уважение','Самоценность','Влюбленность','Любовь к себе','Очарованность','Смирение','Искренность','Дружелюбие','Доброта','Взаимовыручка'] 
    },
];

const THOUGHTS = [
  {
    category: 'Гнев',
    items: ['Нервозность', 'Пренебрежение', 'Недовольство', 'Вредность', 'Огорчение', 'Нетерпимость', 'Вседозволенность'],
  },
  {
    category: 'Страх',
    items: ['Раскаяние', 'Безысходность', 'Превосходство', 'Высокомерие', 'Неполноценность', 'Неудобство', 'Неловкость', 'Апатия', 'Безразличие', 'Неуверенность'],
  },
  {
    category: 'Грусть',
    items: ['Тупик', 'Усталость', 'Принуждение', 'Одиночество', 'Отверженность', 'Подавленность', 'Холодность', 'Безучастность', 'Равнодушие'],
  },
  {
    category: 'Радость',
    items: ['Удовлетворение', 'Уверенность', 'Довольство', 'Окрылённость', 'Торжественность', 'Жизнерадостность', 'Облегчение', 'Ободрённость', 'Удивление'],
  },
  {
    category: 'Любовь',
    items: ['Сопереживание', 'Сопричастность', 'Уравновешенность', 'Смирение', 'Естественность', 'Жизнелюбие', 'Вдохновение', 'Воодушевление'],
  },
];

type Mood = typeof MOODS[0];

const getTodayKey = () => new Date().toISOString().split('T')[0];

export default function EntryScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const targetDate = date ?? getTodayKey();

  const [mood, setMood] = useState<Mood | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeThoughtCategory, setActiveThoughtCategory] = useState<string | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [selectedThoughts, setSelectedThoughts] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        const raw = await AsyncStorage.getItem(`mood_${targetDate}`);
        if (raw) {
          const entry = JSON.parse(raw);
          setMood(entry.mood);
          setSelectedFeelings(entry.feelings);
          setSelectedThoughts(entry.thoughts);
          setNote(entry.note);
          setEnergy(entry.energy ?? 5);
          setStress(entry.stress ?? 5);
        }
      } catch (e) {}
    };
    loadExisting();
  }, [targetDate]);

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings(prev =>
      prev.includes(feeling) ? prev.filter(f => f !== feeling) : [...prev, feeling]
    );
  };

  const toggleThought = (thought: string) => {
    setSelectedThoughts(prev =>
      prev.includes(thought) ? prev.filter(t => t !== thought) : [...prev, thought]
    );
  };

  const activeCategoryItems = FEELINGS.find(f => f.category === activeCategory)?.items ?? [];

  const handleSave = async () => {
    if (!mood) {
      Alert.alert('Выбери настроение', 'Отметь как ты себя чувствуешь сегодня');
      return;
    }

    const entry = {
      date: targetDate,
      mood,
      feelings: selectedFeelings,
      thoughts: selectedThoughts,
      note,
      energy,
      stress,
    };

    try {
      await AsyncStorage.setItem(`mood_${targetDate}`, JSON.stringify(entry));
      Alert.alert('Сохранено', 'Запись сохранена', [
        { text: 'Ок', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {date ? `Запись за ${targetDate}` : 'Как ты сегодня?'}
        </Text>

        {/* Настроение */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настроение</Text>
          <View style={styles.moodRow}>
            {MOODS.map((item) => (
              <TouchableOpacity
                key={item.emoji}
                onPress={() => setMood(item)}
                style={[styles.moodBtn, mood?.emoji === item.emoji && styles.moodActive]}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={[styles.moodLabel, mood?.emoji === item.emoji && styles.moodLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Энергия */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уровень энергии</Text>
          <Text style={styles.energyValue}>{energy}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={energy}
            onValueChange={setEnergy}
            minimumTrackTintColor="#4A90E2"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#4A90E2"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Низкая</Text>
            <Text style={styles.sliderLabelText}>Высокая</Text>
          </View>
        </View>

        {/* Стресс */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Уровень стресса</Text>
          <Text style={styles.stressValue}>{stress}</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={stress}
            onValueChange={setStress}
            minimumTrackTintColor="#F44336"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#F44336"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>Низкий</Text>
            <Text style={styles.sliderLabelText}>Высокий</Text>
          </View>
        </View>

        {/* Чувства */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Чувства</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {FEELINGS.map((f) => (
              <TouchableOpacity
                key={f.category}
                onPress={() => setActiveCategory(activeCategory === f.category ? null : f.category)}
                style={[styles.categoryBtn, activeCategory === f.category && styles.categoryActive]}
              >
                <Text style={[styles.categoryText, activeCategory === f.category && styles.categoryTextActive]}>
                  {f.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {activeCategory && (
            <View style={styles.tagsList}>
              {activeCategoryItems.map((feeling) => (
                <TouchableOpacity
                  key={feeling}
                  onPress={() => toggleFeeling(feeling)}
                  style={[styles.tag, selectedFeelings.includes(feeling) && styles.tagActive]}
                >
                  <Text style={[styles.tagText, selectedFeelings.includes(feeling) && styles.tagTextActive]}>
                    {feeling}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedFeelings.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Выбрано:</Text>
              <View style={styles.tagsList}>
                {selectedFeelings.map((f) => (
                  <View key={f} style={styles.tagActive}>
                    <Text style={styles.tagTextActive}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Мысли и состояния */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Мысли и состояния</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {THOUGHTS.map((t) => (
              <TouchableOpacity
                key={t.category}
                onPress={() => setActiveThoughtCategory(activeThoughtCategory === t.category ? null : t.category)}
                style={[styles.categoryBtn, activeThoughtCategory === t.category && styles.categoryActive]}
              >
                <Text style={[styles.categoryText, activeThoughtCategory === t.category && styles.categoryTextActive]}>
                  {t.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {activeThoughtCategory && (
            <View style={styles.tagsList}>
              {THOUGHTS.find(t => t.category === activeThoughtCategory)?.items.map((thought) => (
                <TouchableOpacity
                  key={thought}
                  onPress={() => toggleThought(thought)}
                  style={[styles.tag, selectedThoughts.includes(thought) && styles.tagActive]}
                >
                  <Text style={[styles.tagText, selectedThoughts.includes(thought) && styles.tagTextActive]}>
                    {thought}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedThoughts.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Выбрано:</Text>
              <View style={styles.tagsList}>
                {selectedThoughts.map((t) => (
                  <View key={t} style={styles.tagActive}>
                    <Text style={styles.tagTextActive}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Заметка */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Заметка</Text>
          <TextInput
            style={styles.input}
            placeholder="Что происходит? Напиши свободно..."
            placeholderTextColor="#bbb"
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Кнопка сохранить */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:             { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  back:               { marginTop: 12 },
  backText:           { fontSize: 16, color: '#4A90E2' },
  title:              { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 24, marginBottom: 32 },
  section:            { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:       { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

  moodRow:            { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn:            { alignItems: 'center', padding: 8, borderRadius: 12, flex: 1 },
  moodActive:         { backgroundColor: '#EFF6FF' },
  moodEmoji:          { fontSize: 32 },
  moodLabel:          { fontSize: 11, color: '#999', marginTop: 4 },
  moodLabelActive:    { color: '#4A90E2', fontWeight: '600' },

  categoryScroll:     { marginBottom: 12 },
  categoryBtn:        { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  categoryActive:     { backgroundColor: '#4A90E2' },
  categoryText:       { fontSize: 14, color: '#555' },
  categoryTextActive: { color: '#fff', fontWeight: '600' },

  tagsList:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tag:                { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f0f0f0' },
  tagActive:          { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#4A90E2', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  tagText:            { fontSize: 14, color: '#555' },
  tagTextActive:      { fontSize: 14, color: '#4A90E2', fontWeight: '600' },

  selectedContainer:  { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 4 },
  selectedLabel:      { fontSize: 12, color: '#999', marginBottom: 8 },

  input:              { fontSize: 15, color: '#1a1a1a', minHeight: 100, textAlignVertical: 'top', lineHeight: 22 },

  saveBtn:            { backgroundColor: '#4A90E2', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:        { color: '#fff', fontSize: 17, fontWeight: '600' },

  energyValue:        { fontSize: 40, fontWeight: '700', color: '#4A90E2', textAlign: 'center', marginBottom: 8 },
  stressValue:        { fontSize: 40, fontWeight: '700', color: '#F44336', textAlign: 'center', marginBottom: 8 },
  slider:             { width: '100%', height: 40 },
  sliderLabels:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  sliderLabelText:    { fontSize: 12, color: '#999' },
});