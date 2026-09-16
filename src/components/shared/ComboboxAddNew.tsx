"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A searchable select that also lets you type a brand-new value — for
 * brand/transportPackage/origin, which stay plain strings server-side (not
 * enums) because the supplier list keeps growing. `options` should be the
 * distinct values already in use (from GET /products/meta).
 */
export function ComboboxAddNew({
  value,
  onChange,
  options,
  placeholder = "Select or type new...",
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const trimmed = search.trim();
  const showAddNew = trimmed.length > 0 && !options.some((o) => o.toLowerCase() === trimmed.toLowerCase());

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button variant="outline" className="w-full justify-between font-normal" />}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type new..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {filtered.map((option) => (
                <CommandItem key={option} onSelect={() => select(option)}>
                  <Check className={cn("mr-2 size-4", value === option ? "opacity-100" : "opacity-0")} />
                  {option}
                </CommandItem>
              ))}
              {showAddNew && (
                <CommandItem onSelect={() => select(trimmed)}>
                  <Plus className="mr-2 size-4" />
                  Add &quot;{trimmed}&quot;
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
