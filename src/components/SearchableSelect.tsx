
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  items: { id: string; name: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  label: string;
  onAddNew?: (name: string) => void;
  addNewLabel?: string;
  newItemValue: string;
  onNewItemValueChange: (value: string) => void;
}

export const SearchableSelect = ({
  items,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  label,
  onAddNew,
  addNewLabel,
  newItemValue,
  onNewItemValueChange,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find(item => item.id === value);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedItem ? selectedItem.name : placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50 max-h-60 overflow-auto">
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="border-none focus:ring-0" />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandList className="max-h-40 overflow-y-auto">
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onValueChange(item.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {onAddNew && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Don't see your {label.toLowerCase()}? Add it below:
          </p>
          <div className="flex gap-2">
            <Input
              placeholder={addNewLabel}
              value={newItemValue}
              onChange={(e) => onNewItemValueChange(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => {
                if (newItemValue.trim()) {
                  onAddNew(newItemValue.trim());
                }
              }}
              disabled={!newItemValue.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
