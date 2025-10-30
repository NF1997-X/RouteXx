import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface DescriptionItem {
  term: string;
  definition: string;
}

interface EditableDescriptionListProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditable?: boolean;
}

export function EditableDescriptionList({ value, onSave, isEditable = true }: EditableDescriptionListProps) {
  const parseItems = (text: string): DescriptionItem[] => {
    if (!text.trim()) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => {
        // Check if line has format "term : definition"
        if (line.includes(' : ')) {
          const [term, ...defParts] = line.split(' : ');
          return {
            term: term.trim() || `Item ${index + 1}`,
            definition: defParts.join(' : ').trim()
          };
        }
        // Default format without term
        return {
          term: `Item ${index + 1}`,
          definition: line
        };
      });
  };

  // Local state for editing - allows smooth typing
  const [items, setItems] = useState<DescriptionItem[]>(parseItems(value));
  const [lastValue, setLastValue] = useState(value);

  // Only sync from parent when value actually changes externally
  useEffect(() => {
    // Only update if the incoming value is different from what we last synced
    if (value !== lastValue) {
      const currentSerialized = items.map(item => item.definition).join('\n');
      const incomingParsed = parseItems(value);
      const incomingSerialized = incomingParsed.map(item => item.definition).join('\n');
      
      // Only update if values are actually different (prevents unnecessary resets during typing)
      if (currentSerialized !== incomingSerialized) {
        setItems(incomingParsed);
        setLastValue(value);
      }
    }
  }, [value, lastValue, items]);

  const serializeItems = (itemsToSerialize: DescriptionItem[]): string => {
    return itemsToSerialize
      .filter(item => item.definition.trim() || item.term.trim())
      .map(item => {
        // Save in format "term : definition"
        if (item.term.trim() && item.definition.trim()) {
          return `${item.term.trim()} : ${item.definition.trim()}`;
        }
        // If only definition, save as plain text
        return item.definition.trim();
      })
      .join('\n');
  };

  const handleAddItem = () => {
    const newItems = [...items, { term: `Item ${items.length + 1}`, definition: '' }];
    setItems(newItems);
    const newValue = serializeItems(newItems);
    onSave(newValue);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    const newValue = serializeItems(newItems);
    onSave(newValue);
  };

  const handleTermChange = (index: number, newTerm: string) => {
    const newItems = [...items];
    newItems[index].term = newTerm;
    setItems(newItems);
  };

  const handleTermBlur = (index: number) => {
    // Save when user leaves the term field
    const newValue = serializeItems(items);
    onSave(newValue);
  };

  const handleDefinitionChange = (index: number, newDefinition: string) => {
    const newItems = [...items];
    newItems[index].definition = newDefinition;
    setItems(newItems);
  };

  // Save on blur instead of on every keystroke
  const handleDefinitionBlur = (index: number) => {
    const newValue = serializeItems(items);
    onSave(newValue);
  };

  if (!isEditable) {
    const displayItems = parseItems(value);
    return (
      <div className="space-y-2">
        {displayItems.length > 0 ? (
          <dl className="space-y-2" style={{fontSize: '10px'}}>
            {displayItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <dt className="w-20 flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                  {item.term}
                </dt>
                <dd className="flex-1 text-gray-700 dark:text-gray-300 m-0">
                  {item.definition}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground" style={{fontSize: '10px'}}>No information available</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                value={item.term}
                onChange={(e) => handleTermChange(index, e.target.value)}
                onBlur={() => handleTermBlur(index)}
                className="w-24"
                style={{fontSize: '10px'}}
                placeholder="Term"
                data-testid={`input-item-term-${index}`}
              />
              <Input
                value={item.definition}
                onChange={(e) => handleDefinitionChange(index, e.target.value)}
                onBlur={() => handleDefinitionBlur(index)}
                className="flex-1"
                style={{fontSize: '10px'}}
                placeholder="Definition"
                data-testid={`input-item-definition-${index}`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-red-600 hover:text-red-700"
                onClick={() => handleRemoveItem(index)}
                data-testid={`button-remove-item-${index}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground" style={{fontSize: '10px'}}>No items yet. Click "Add Item" to start.</p>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddItem}
        className="bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-blue-600 hover:text-blue-700"
        style={{fontSize: '10px'}}
        data-testid="button-add-item"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add Item
      </Button>
    </div>
  );
}
