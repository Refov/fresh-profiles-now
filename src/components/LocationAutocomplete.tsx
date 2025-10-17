import React, { useRef, useState } from 'react';
import { Input } from './ui/input';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (city: string, country: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter your city and country",
  className = ""
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Simple city suggestions without Google Places API
    if (inputValue.length > 1) {
      const commonCities = [
        'New York, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan', 'Sydney, Australia',
        'Berlin, Germany', 'Madrid, Spain', 'Rome, Italy', 'Amsterdam, Netherlands',
        'Vancouver, Canada', 'Toronto, Canada', 'Los Angeles, USA', 'Chicago, USA',
        'Miami, USA', 'Boston, USA', 'Seattle, USA', 'San Francisco, USA',
        'Dublin, Ireland', 'Edinburgh, UK', 'Manchester, UK', 'Birmingham, UK',
        'Barcelona, Spain', 'Lisbon, Portugal', 'Vienna, Austria', 'Prague, Czech Republic',
        'Warsaw, Poland', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway',
        'Helsinki, Finland', 'Zurich, Switzerland', 'Brussels, Belgium', 'Luxembourg',
        'Monaco', 'Andorra', 'San Marino', 'Vatican City', 'Liechtenstein',
        'Singapore', 'Hong Kong', 'Dubai, UAE', 'Tel Aviv, Israel', 'Jerusalem, Israel',
        'Cairo, Egypt', 'Cape Town, South Africa', 'Johannesburg, South Africa',
        'Nairobi, Kenya', 'Lagos, Nigeria', 'Casablanca, Morocco', 'Tunis, Tunisia',
        'Algiers, Algeria', 'Tripoli, Libya', 'Khartoum, Sudan', 'Addis Ababa, Ethiopia',
        'Kampala, Uganda', 'Dar es Salaam, Tanzania', 'Lusaka, Zambia', 'Harare, Zimbabwe',
        'Gaborone, Botswana', 'Windhoek, Namibia', 'Maseru, Lesotho', 'Mbabane, Swaziland',
        'Maputo, Mozambique', 'Antananarivo, Madagascar', 'Port Louis, Mauritius',
        'Victoria, Seychelles', 'Malabo, Equatorial Guinea', 'Banjul, Gambia',
        'Bissau, Guinea-Bissau', 'Conakry, Guinea', 'Freetown, Sierra Leone',
        'Monrovia, Liberia', 'Abidjan, Ivory Coast', 'Accra, Ghana', 'Lome, Togo',
        'Cotonou, Benin', 'Niamey, Niger', 'Ouagadougou, Burkina Faso', 'Bamako, Mali',
        'Dakar, Senegal', 'Nouakchott, Mauritania', 'Nouadhibou, Mauritania',
        'El Aaiun, Western Sahara', 'Laayoune, Western Sahara', 'Smara, Western Sahara',
        'Dakhla, Western Sahara', 'Boujdour, Western Sahara', 'Aousserd, Western Sahara',
        'Guerguerat, Western Sahara', 'Mahbes, Western Sahara', 'Farsia, Western Sahara',
        'Bir Lahlou, Western Sahara', 'Tifariti, Western Sahara', 'Zouerate, Mauritania',
        'Atar, Mauritania', 'Rosso, Mauritania', 'Kaedi, Mauritania', 'Kiffa, Mauritania',
        'Aleg, Mauritania', 'Selibaby, Mauritania', 'Nema, Mauritania', 'Ain Ehel Taya, Mauritania',
        'Tidjikja, Mauritania', 'Zouerate, Mauritania', 'Atar, Mauritania', 'Rosso, Mauritania'
      ];
      
      const filtered = commonCities.filter(city => 
        city.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    
    // Parse city and country from suggestion
    const parts = suggestion.split(',').map(p => p.trim());
    const city = parts[0];
    const country = parts.slice(1).join(', ');
    
    onPlaceSelect(city, country);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
