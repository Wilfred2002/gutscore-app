import * as FileSystem from 'expo-file-system';

const IMAGES_DIR = `${FileSystem.documentDirectory}meal_images/`;

// Ensure images directory exists
async function ensureImagesDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
}

/**
 * Save a meal image from a temporary URI to permanent local storage.
 * @param tempUri - Temporary URI from camera or image picker
 * @param userId - User ID for organizing images
 * @returns Permanent local file path
 */
export async function saveMealImage(tempUri: string, userId: string): Promise<string> {
    await ensureImagesDir();

    const filename = `${userId}_${Date.now()}.jpg`;
    const permanentPath = `${IMAGES_DIR}${filename}`;

    try {
        await FileSystem.copyAsync({
            from: tempUri,
            to: permanentPath,
        });
        return permanentPath;
    } catch (error) {
        console.error('Failed to save meal image:', error);
        throw error;
    }
}

/**
 * Delete a meal image from local storage.
 * @param imagePath - Local file path to delete
 */
export async function deleteMealImage(imagePath: string): Promise<void> {
    try {
        const fileInfo = await FileSystem.getInfoAsync(imagePath);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(imagePath);
        }
    } catch (error) {
        console.warn('Failed to delete meal image:', error);
    }
}

/**
 * Delete multiple meal images (for cleanup).
 * @param imagePaths - Array of local file paths to delete
 */
export async function deleteMealImages(imagePaths: string[]): Promise<void> {
    await Promise.all(imagePaths.map(path => deleteMealImage(path)));
}

/**
 * Get the total size of stored meal images.
 * @returns Size in bytes
 */
export async function getImagesStorageSize(): Promise<number> {
    try {
        const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
        if (!dirInfo.exists) return 0;

        const files = await FileSystem.readDirectoryAsync(IMAGES_DIR);
        let totalSize = 0;

        for (const file of files) {
            const fileInfo = await FileSystem.getInfoAsync(`${IMAGES_DIR}${file}`);
            if (fileInfo.exists && 'size' in fileInfo) {
                totalSize += fileInfo.size || 0;
            }
        }

        return totalSize;
    } catch (error) {
        console.error('Failed to get images storage size:', error);
        return 0;
    }
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
