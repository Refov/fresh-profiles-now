import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const TagInput = ({ value, onChange, maxTags = 8, placeholder = "Type and press Enter" }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const addTags = (input: string) => {
    if (!input.trim()) return;
    
    // Split by comma, trim each part, filter out empty and duplicates
    const newTags = input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && !value.includes(tag));
    
    // Add new tags up to the max limit
    const tagsToAdd = newTags.slice(0, maxTags - value.length);
    
    if (tagsToAdd.length > 0) {
      onChange([...value, ...tagsToAdd]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTags(inputValue);
    }
  };

  const handleAdd = () => {
    addTags(inputValue);
  };

  const handleBlur = () => {
    addTags(inputValue);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={value.length >= maxTags}
        />
        <Button type="button" onClick={handleAdd} disabled={!inputValue.trim() || value.length >= maxTags}>
          + Add
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{value.length}/{maxTags}</span>
      </div>
    </div>
  );
};

export default TagInput;
