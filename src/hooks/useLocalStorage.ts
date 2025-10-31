import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  expirationHours: number = 24
): [T, (value: T) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        
        // Check if data has expired
        if (parsed.timestamp && Date.now() - parsed.timestamp > expirationHours * 60 * 60 * 1000) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        
        return parsed.data || parsed;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage with timestamp
      const dataToStore = {
        data: valueToStore,
        timestamp: Date.now()
      };
      window.localStorage.setItem(key, JSON.stringify(dataToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to clear the stored value
  const clearValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error clearing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, clearValue];
}

// Specialized hook for user-specific data
export function useUserLocalStorage<T>(
  userAddress: string | null,
  key: string,
  initialValue: T,
  expirationHours: number = 24
): [T, (value: T) => void, () => void] {
  const userKey = userAddress ? `${key}_${userAddress}` : null;
  
  const [value, setValue, clearValue] = useLocalStorage<T>(
    userKey || 'temp',
    initialValue,
    expirationHours
  );

  // Clear value when user changes
  useEffect(() => {
    if (userKey) {
      // Load user-specific data when user changes
      try {
        const item = window.localStorage.getItem(userKey);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && Date.now() - parsed.timestamp <= expirationHours * 60 * 60 * 1000) {
            setValue(parsed.data || parsed);
          }
        }
      } catch (error) {
        console.error(`Error loading user localStorage key "${userKey}":`, error);
      }
    }
  }, [userAddress, userKey, expirationHours]);

  return [value, setValue, clearValue];
} 