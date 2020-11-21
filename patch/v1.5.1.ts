import { patch } from './bootstrap'

export enum MoodSet {
  'happy' = '开心',
  'sad' = '伤心',
  'angry' = '生气',
  'sorrow' = '悲哀',
  'pain' = '痛苦',
  'terrible' = '可怕',
  'unhappy' = '不快',
  'detestable' = '可恶',
  'worry' = '担心',
  'despair' = '绝望',
  'anxiety' = '焦虑',
  'excite' = '激动',
}

export enum WeatherSet {
  'sunshine' = '晴',
  'cloudy' = '多云',
  'rainy' = '雨',
  'overcast' = '阴',
  'snow' = '雪',
}

patch(async ({ models }) => {
  const Note = models.note

  const docs = await Note.find()

  await Promise.all(
    docs.map(async (doc) => {
      const weather = doc.weather
      const mood = doc.mood

      if (weather) {
        doc.weather = WeatherSet[weather] ?? doc.weather
      }
      if (mood) {
        doc.mood = MoodSet[mood] ?? doc.mood
      }

      await doc.save()
      return doc
    }),
  )
})
