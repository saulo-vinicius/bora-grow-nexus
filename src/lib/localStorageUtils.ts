
/**
 * Utility functions for working with localStorage
 */

/**
 * Get an item from localStorage and parse it as JSON
 * @param key The key to retrieve from localStorage
 * @param defaultValue Default value if the key doesn't exist
 * @returns The parsed value or the default value
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save an item to localStorage as JSON
 * @param key The key to save to
 * @param value The value to save
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

/**
 * Remove an item from localStorage
 * @param key The key to remove
 */
export function removeLocalStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Get custom user substances from localStorage
 */
export function getCustomSubstances(): any[] {
  return getLocalStorage<any[]>('customSubstances', []);
}

/**
 * Save a custom substance to localStorage
 * @param substance The substance to save
 */
export function saveCustomSubstance(substance: any): void {
  const substances = getCustomSubstances();
  substances.push(substance);
  setLocalStorage('customSubstances', substances);
}

/**
 * Get saved recipes from localStorage
 */
export function getSavedRecipes(): any[] {
  return getLocalStorage<any[]>('savedRecipes', []);
}

/**
 * Save plant data to localStorage
 * @param plants The plants to save
 */
export function savePlants(plants: any[]): void {
  setLocalStorage('plants', plants);
}

/**
 * Get plants from localStorage
 */
export function getPlants(): any[] {
  return getLocalStorage<any[]>('plants', []);
}
