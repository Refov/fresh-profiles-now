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

  // Helper to split input on comma and return trimmed, unique tags (not in value, respecting maxTags)
  const getNewTags = (input: string) => {
    console.log("TagInput: Original input string to getNewTags:", input);
    const splitAndTrimmed = input
      .split(",")
      .map(tag => tag.trim());
    console.log("TagInput: After split and trim:", splitAndTrimmed);
    const filtered = splitAndTrimmed.filter(tag => tag && !value.includes(tag));
    console.log("TagInput: After filtering (non-empty & unique):", filtered);
    return filtered;
  };

  const addTags = (rawInput: string) => {
    console.log("TagInput: addTags called with rawInput:", rawInput);
    if (!rawInput.trim()) {
      console.log("TagInput: addTags - Input is empty or just whitespace, returning.");
      return;
    }
    if (value.length >= maxTags) {
      console.log("TagInput: addTags - Max tags reached, returning.");
      return;
    }
    const newTags = getNewTags(rawInput);
    console.log("TagInput: addTags - newTags from getNewTags:", newTags);
    const limitedTags = [...value];
    newTags.forEach(tag => {
      if (limitedTags.length < maxTags && !limitedTags.includes(tag)) {
        limitedTags.push(tag);
      }
    });
    console.log("TagInput: addTags - Final limitedTags array:", limitedTags);
    if (newTags.length > 0) {
      onChange(limitedTags);
      setInputValue("");
      console.log("TagInput: addTags - Tags successfully updated and input cleared.");
    } else {
      console.log("TagInput: addTags - No new tags to add.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("TagInput: handleKeyDown triggered for key:", e.key);
    if (e.key === "Enter") {
      e.preventDefault();
      addTags(inputValue);
    }
  };

  const handleAdd = () => {
    console.log("TagInput: handleAdd triggered.");
    addTags(inputValue);
  };

  const handleBlur = () => {
    console.log("TagInput: handleBlur triggered.");
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
