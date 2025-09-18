'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './LocationAutocomplete.module.css';

interface NominatimLocation {
  place_id: number;
  licence: string;
  display_name: string;
  lat: string;
  lon: string;
  category: string;
  type: string;
  importance: number;
}

// Debounce function to limit API calls
const debounce = (func: (searchQuery: string) => Promise<void>, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (searchQuery: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(searchQuery), delay);
  };
};

export interface Location {
  name: string;
  lat: number;
  lon: number;
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

export default function LocationAutocomplete({ onLocationSelect, placeholder }: LocationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      // Using Nominatim API - free and no key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useCallback to memoize the debounced function
  const debouncedFetch = useCallback(debounce(fetchSuggestions, 500), []);

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  const handleSelect = (location: NominatimLocation) => {
    setQuery(location.display_name);
    setSuggestions([]);
    onLocationSelect({
      name: location.display_name,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
    });
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || 'Enter a location...'}
        className={styles.input}
      />
      {isLoading && <div className={styles.loader}>Loading...</div>}
      {suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((loc) => (
            <li 
              key={loc.place_id} 
              onClick={() => handleSelect(loc)}
              className={styles.suggestionItem}
            >
              {loc.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}