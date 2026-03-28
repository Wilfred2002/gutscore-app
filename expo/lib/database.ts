import * as SQLite from 'expo-sqlite';
import { Meal, Symptom, Trigger } from '@/types';

const DB_NAME = 'gutscore.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (dbInstance) return dbInstance;

    const db = await SQLite.openDatabaseAsync(DB_NAME);

    // Enable WAL mode for better performance
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // Create tables
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      photo_path TEXT,
      foods TEXT,
      gut_scores TEXT,
      score INTEGER DEFAULT 0,
      analysis TEXT,
      triggers TEXT,
      swaps TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      meal_id TEXT,
      bloat INTEGER DEFAULT 0,
      energy INTEGER DEFAULT 5,
      pain INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS triggers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'monitor',
      confidence INTEGER DEFAULT 0,
      last_eaten TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_lists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT CHECK (category IN ('safe', 'limit', 'avoid')),
      source TEXT DEFAULT 'manual',
      confidence INTEGER DEFAULT 100,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, name)
    );

    CREATE INDEX IF NOT EXISTS idx_meals_user ON meals(user_id);
    CREATE INDEX IF NOT EXISTS idx_symptoms_user ON symptoms(user_id);
    CREATE INDEX IF NOT EXISTS idx_triggers_user ON triggers(user_id);
  `);

    dbInstance = db;
    return db;
}

// Meal CRUD operations
export async function insertMeal(meal: Omit<Meal, 'createdAt'> & { userId: string }): Promise<void> {
    const db = await openDatabase();
    await db.runAsync(
        `INSERT INTO meals (id, user_id, photo_path, foods, gut_scores, score, analysis, triggers, swaps, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            meal.id,
            meal.userId,
            meal.imageUri || null,
            JSON.stringify(meal.foods || []),
            JSON.stringify(meal.gutScores || {}),
            meal.score || 0,
            JSON.stringify(meal.analysis || []),
            JSON.stringify(meal.triggers || []),
            JSON.stringify(meal.swaps || []),
            new Date().toISOString()
        ]
    );
}

export async function getMeals(userId: string): Promise<Meal[]> {
    const db = await openDatabase();
    const rows = await db.getAllAsync<{
        id: string;
        user_id: string;
        photo_path: string | null;
        foods: string;
        gut_scores: string;
        score: number;
        analysis: string;
        triggers: string;
        swaps: string;
        created_at: string;
    }>('SELECT * FROM meals WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    return rows.map(row => ({
        id: row.id,
        imageUri: row.photo_path || '',
        foods: JSON.parse(row.foods || '[]'),
        gutScores: JSON.parse(row.gut_scores || '{}'),
        score: row.score,
        analysis: JSON.parse(row.analysis || '[]'),
        triggers: JSON.parse(row.triggers || '[]'),
        swaps: JSON.parse(row.swaps || '[]'),
        timestamp: new Date(row.created_at),
    }));
}

export async function deleteMeal(mealId: string): Promise<void> {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM meals WHERE id = ?', [mealId]);
}

export async function getMealById(mealId: string): Promise<Meal | null> {
    const db = await openDatabase();
    const row = await db.getFirstAsync<{
        id: string;
        photo_path: string | null;
        foods: string;
        gut_scores: string;
        score: number;
        analysis: string;
        triggers: string;
        swaps: string;
        created_at: string;
    }>('SELECT * FROM meals WHERE id = ?', [mealId]);

    if (!row) return null;

    return {
        id: row.id,
        imageUri: row.photo_path || '',
        foods: JSON.parse(row.foods || '[]'),
        gutScores: JSON.parse(row.gut_scores || '{}'),
        score: row.score,
        analysis: JSON.parse(row.analysis || '[]'),
        triggers: JSON.parse(row.triggers || '[]'),
        swaps: JSON.parse(row.swaps || '[]'),
        timestamp: new Date(row.created_at),
    };
}

// Symptom CRUD operations
export async function insertSymptom(symptom: Symptom & { userId: string }): Promise<void> {
    const db = await openDatabase();
    await db.runAsync(
        `INSERT INTO symptoms (id, user_id, meal_id, bloat, energy, pain, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            symptom.id,
            symptom.userId,
            symptom.associatedMealId || null,
            symptom.bloat,
            symptom.energy,
            symptom.pain,
            symptom.notes || null,
            new Date(symptom.timestamp).toISOString()
        ]
    );
}

export async function getSymptoms(userId: string): Promise<Symptom[]> {
    const db = await openDatabase();
    const rows = await db.getAllAsync<{
        id: string;
        meal_id: string | null;
        bloat: number;
        energy: number;
        pain: number;
        notes: string | null;
        created_at: string;
    }>('SELECT * FROM symptoms WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    return rows.map(row => ({
        id: row.id,
        timestamp: new Date(row.created_at),
        bloat: row.bloat,
        energy: row.energy,
        pain: row.pain,
        notes: row.notes || undefined,
        associatedMealId: row.meal_id || undefined,
    }));
}

export async function deleteSymptom(symptomId: string): Promise<void> {
    const db = await openDatabase();
    await db.runAsync('DELETE FROM symptoms WHERE id = ?', [symptomId]);
}

// Trigger CRUD operations
export async function insertTrigger(trigger: Trigger & { userId: string }): Promise<void> {
    const db = await openDatabase();
    await db.runAsync(
        `INSERT OR REPLACE INTO triggers (id, user_id, name, status, confidence, last_eaten, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            trigger.id,
            trigger.userId,
            trigger.name,
            trigger.status,
            trigger.confidence,
            trigger.lastEaten ? new Date(trigger.lastEaten).toISOString() : null,
            new Date().toISOString()
        ]
    );
}

export async function getTriggers(userId: string): Promise<Trigger[]> {
    const db = await openDatabase();
    const rows = await db.getAllAsync<{
        id: string;
        name: string;
        status: string;
        confidence: number;
        last_eaten: string | null;
    }>('SELECT * FROM triggers WHERE user_id = ? ORDER BY confidence DESC', [userId]);

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status as 'avoid' | 'limit' | 'monitor',
        confidence: row.confidence,
        lastEaten: row.last_eaten ? new Date(row.last_eaten) : undefined,
    }));
}

// Food list operations
export async function addToFoodList(
    userId: string,
    name: string,
    category: 'safe' | 'limit' | 'avoid',
    source: 'manual' | 'ai' | 'trigger_engine' = 'manual'
): Promise<void> {
    const db = await openDatabase();
    const id = `${userId}_${name}_${Date.now()}`;
    await db.runAsync(
        `INSERT OR REPLACE INTO food_lists (id, user_id, name, category, source, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, name, category, source, new Date().toISOString()]
    );
}

export async function getFoodList(userId: string, category?: 'safe' | 'limit' | 'avoid'): Promise<Array<{ name: string; category: string }>> {
    const db = await openDatabase();
    const query = category
        ? 'SELECT name, category FROM food_lists WHERE user_id = ? AND category = ?'
        : 'SELECT name, category FROM food_lists WHERE user_id = ?';
    const params = category ? [userId, category] : [userId];

    return db.getAllAsync<{ name: string; category: string }>(query, params);
}

// Cleanup old data
export async function cleanupOldMeals(userId: string, daysToKeep: number = 30): Promise<string[]> {
    const db = await openDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Get photo paths before deleting
    const oldMeals = await db.getAllAsync<{ id: string; photo_path: string | null }>(
        'SELECT id, photo_path FROM meals WHERE user_id = ? AND created_at < ?',
        [userId, cutoffDate.toISOString()]
    );

    const photoPaths = oldMeals
        .filter(m => m.photo_path)
        .map(m => m.photo_path as string);

    // Delete old meals
    await db.runAsync(
        'DELETE FROM meals WHERE user_id = ? AND created_at < ?',
        [userId, cutoffDate.toISOString()]
    );

    return photoPaths; // Return paths so caller can delete files
}
