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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (value.length >= maxTags) {
        return;
      }
      // Split input by commas and trim
      const newTags = inputValue.split(",")
        .map(t => t.trim())
        .filter(t => t && !value.includes(t));
      const limitedTags = [...value];
      newTags.forEach(tag => {
        if (limitedTags.length < maxTags && !limitedTags.includes(tag)) {
          limitedTags.push(tag);
        }
      });
      if (newTags.length > 0) {
        onChange(limitedTags);
        setInputValue("");
      }
    }
  };

  const handleAdd = () => {
    const val = inputValue.trim();
    if (!val) return;
    if (value.length >= maxTags) return;
    // Split input by commas and trim
    const newTags = val.split(",")
      .map(t => t.trim())
      .filter(t => t && !value.includes(t));
    const limitedTags = [...value];
    newTags.forEach(tag => {
      if (limitedTags.length < maxTags && !limitedTags.includes(tag)) {
        limitedTags.push(tag);
      }
    });
    if (newTags.length > 0) {
      onChange(limitedTags);
      setInputValue("");
    }
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
