import React, { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (city: string, country: string) => void;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter your city and country",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Places API script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBvOkBwJcTjqBwJcTjqBwJcTjqBwJcTjqBw&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        initAutocomplete();
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
      initAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const initAutocomplete = () => {
    if (!window.google || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['(cities)'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.geometry) {
        console.log("No details available for input: '" + place.name + "'");
        return;
      }

      let city = '';
      let country = '';
      
      for (const component of place.address_components) {
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
          city = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      // If no city found, use the formatted address
      if (!city) {
        city = place.formatted_address.split(',')[0];
      }

      // Update the input value
      onChange(place.formatted_address);
      
      // Call the callback with parsed city and country
      onPlaceSelect(city, country);
    });
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={!isLoaded}
    />
  );
};

export default LocationAutocomplete;
