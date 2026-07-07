import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

type Entry = {
  date: string;
  mood: { emoji: string; label: string };
  feelings: string[];
  thoughts: string[];
  note: string;
  energy: number;
  stress: number;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const exportPdf = async (from: string, to: string) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const moodKeys = keys.filter(k => k.startsWith('mood_'));
    const entriesRaw = await AsyncStorage.multiGet(moodKeys);

    const entries: Entry[] = entriesRaw
      .map(([_, value]) => value ? JSON.parse(value) : null)
      .filter((e): e is Entry => e !== null && e.date >= from && e.date <= to)
      .sort((a, b) => b.date.localeCompare(a.date));

    if (entries.length === 0) {
      return { success: false, message: 'Нет записей за выбранный период' };
    }

    const rowsHtml = entries.map(entry => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-date">${formatDate(entry.date)}</span>
          <span class="entry-mood">${entry.mood.emoji} ${entry.mood.label}</span>
        </div>
        <div class="entry-metrics">
          <span class="metric blue">⚡ Энергия: ${entry.energy ?? '—'}/10</span>
          <span class="metric red">🔥 Стресс: ${entry.stress ?? '—'}/10</span>
        </div>
        ${entry.feelings.length > 0 ? `
          <div class="entry-section">
            <span class="label">Чувства:</span> ${entry.feelings.join(', ')}
          </div>` : ''}
        ${entry.thoughts.length > 0 ? `
          <div class="entry-section">
            <span class="label">Мысли:</span> ${entry.thoughts.join(', ')}
          </div>` : ''}
        ${entry.note ? `
          <div class="entry-note">"${entry.note}"</div>` : ''}
      </div>
    `).join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, Helvetica, sans-serif; padding: 32px; color: #1a1a1a; }
            h1 { font-size: 26px; margin-bottom: 4px; }
            .subtitle { color: #999; font-size: 13px; margin-bottom: 32px; }
            .entry { border-bottom: 1px solid #eee; padding: 20px 0; }
            .entry:last-child { border-bottom: none; }
            .entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .entry-date { font-size: 13px; color: #999; }
            .entry-mood { font-size: 18px; font-weight: 600; }
            .entry-metrics { display: flex; gap: 16px; margin-bottom: 10px; }
            .metric { font-size: 13px; font-weight: 600; }
            .blue { color: #4A90E2; }
            .red { color: #F44336; }
            .entry-section { font-size: 13px; margin-bottom: 6px; color: #555; }
            .label { font-weight: 600; color: #1a1a1a; }
            .entry-note { font-size: 14px; margin-top: 10px; color: #333; line-height: 1.6; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>Дневник настроения</h1>
          <div class="subtitle">${formatDate(from)} — ${formatDate(to)} · ${entries.length} записей</div>
          ${rowsHtml}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });

    const from_fmt = from.replace(/-/g, '');
    const to_fmt = to.replace(/-/g, '');
    const filename = `mood_tracker_${from_fmt}-${to_fmt}.pdf`;
    const newUri = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.moveAsync({ from: uri, to: newUri });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
    await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Экспорт дневника настроения',
        UTI: 'com.adobe.pdf',
    });
    }

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Не удалось создать PDF' };
  }
};