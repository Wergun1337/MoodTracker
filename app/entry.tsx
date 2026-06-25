import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

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
        items: ['Горечь', 'Тоска', 'Скорбь', 'Лень', 'Жалость','Отрешенность','Отчаяние','Беспомощность','Душевная боль','Безнадёжность','Отчуждённость','Разочарование','Потрясение','Сожаление','Скука','Безысходность','Печаль','Загнанность',] 
    },
    { 
        category: 'Радость',     
        items: ['Счастье', 'Восторг', 'Ликование', 'Приподнятость', 'Оживление','Умиротворённость','Увлечение','Интерес','Забота','Ожидание','Возбуждение','Предвкушение','Надежда','Любопытство','Освобождение','Принятие','Нетерпение','Вера','Изумление',] 
    },
    { 
        category: 'Любовь',     
        items: ['Нежность', 'Теплота', 'Сочувствие', 'Блаженство', 'Доверие','Безопасность','Благостность','Спокойствие','Симпатия','Идентичность','Гордость','Восхищение','Уважение','Самоценность','Влюбленность','Любовь к себе','Очарованность','Смирение','Искренность','Дружелюбие','Доброта','Взаимовыручка'] 
    },
];

const THOUGHTS =[
    {
        items: ['Нервозность', 'Пренебрежение', 'Недовольство', 'Вредность', 'Огорчение', 'Нетерпимость', 'Вседозволенность'],
    },
    {
        items: ['Раскаяние', 'Безысходность', 'Превосходство', 'Высокомерие', 'Неполноценность', 'Неудобство', 'Неловкость', 'Апатия', 'Безразличие', 'Неуверенность'],
    },
    {
        items: ['Тупик', 'Усталость', 'Принуждение', 'Одиночество', 'Отверженность', 'Подавленность', 'Холодность', 'Безучастность', 'Равнодушие'],
    },
    {
        items: ['Удовлетворение', 'Уверенность', 'Довольство', 'Окрылённость', 'Торжественность', 'Жизнерадостность', 'Облегчение', 'Ободрённость', 'Удивление'],
    },
    {
        items: ['Сопереживание', 'Сопричастность', 'Уравновешенность', 'Смирение', 'Естественность', 'Жизнелюбие', 'Вдохновение', 'Воодушевление'],
    },
    


]

type Mood = typeof MOODS[0];

export default function EntryScreen() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings(prev =>
      prev.includes(feeling)
        ? prev.filter(f => f !== feeling)
        : [...prev, feeling]
    );
  };

  const activeCategoryItems = FEELINGS.find(f => f.category === activeCategory)?.items ?? [];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Шапка */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Как ты сегодня?</Text>

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

        {/* Чувства */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Чувства</Text>

          {/* Категории */}
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

          {/* Список чувств выбранной категории */}
          {activeCategory && (
            <View style={styles.feelingsList}>
              {activeCategoryItems.map((feeling) => (
                <TouchableOpacity
                  key={feeling}
                  onPress={() => toggleFeeling(feeling)}
                  style={[styles.feelingBtn, selectedFeelings.includes(feeling) && styles.feelingActive]}
                >
                  <Text style={[styles.feelingText, selectedFeelings.includes(feeling) && styles.feelingTextActive]}>
                    {feeling}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Выбранные чувства */}
          {selectedFeelings.length > 0 && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedLabel}>Выбрано:</Text>
              <View style={styles.selectedList}>
                {selectedFeelings.map((feelingExtra) => (
                  <View key={feelingExtra} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>{feelingExtra}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* Мысли и состояния */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:              { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  back:                { marginTop: 12 },
  backText:            { fontSize: 16, color: '#4A90E2' },
  title:               { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 24, marginBottom: 32 },
  section:             { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:        { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Настроение
  moodRow:             { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn:             { alignItems: 'center', padding: 5, borderRadius: 12, flex: 1 },
  moodActive:          { backgroundColor: '#EFF6FF' },
  moodEmoji:           { fontSize: 32 },
  moodLabel:           { fontSize: 11, color: '#999', marginTop: 4 },
  moodLabelActive:     { color: '#4A90E2', fontWeight: '600' },

  // Категории чувств
  categoryScroll:      { marginBottom: 12 },
  categoryBtn:         { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8 },
  categoryActive:      { backgroundColor: '#4A90E2' },
  categoryText:        { fontSize: 14, color: '#555' },
  categoryTextActive:  { color: '#fff', fontWeight: '600' },

  // Список чувств
  feelingsList:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  feelingBtn:          { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f0f0f0' },
  feelingActive:       { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#4A90E2' },
  feelingText:         { fontSize: 14, color: '#555' },
  feelingTextActive:   { color: '#4A90E2', fontWeight: '600' },

  // Выбранные чувства
  selectedContainer:   { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 4 },
  selectedLabel:       { fontSize: 12, color: '#999', marginBottom: 8 },
  selectedList:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selectedTag:         { backgroundColor: '#EFF6FF', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  selectedTagText:     { fontSize: 13, color: '#4A90E2', fontWeight: '500' },
});