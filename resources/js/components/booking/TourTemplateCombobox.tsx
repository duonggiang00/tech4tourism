import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { useState } from 'react';

export interface TourTemplate {
    id: number;
    title: string;
    instances?: Array<{
        id: number;
        date_start: string;
        price_adult: number | null;
        limit: number | null;
        booked_count: number;
    }>;
}

interface TourTemplateComboboxProps {
    templates: TourTemplate[];
    value: number | string;
    onChange: (templateId: number) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function TourTemplateCombobox({
    templates,
    value,
    onChange,
    placeholder = 'Tìm và chọn tour template...',
    disabled = false,
}: TourTemplateComboboxProps) {
    const [open, setOpen] = useState(false);

    const selectedTemplate = templates.find(
        (template) => template.id === Number(value)
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-11 w-full justify-between font-normal',
                        !selectedTemplate && 'text-muted-foreground'
                    )}
                >
                    {selectedTemplate ? (
                        <div className="flex items-center gap-2 truncate">
                            <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                            <span className="truncate">
                                {selectedTemplate.title}
                            </span>
                            <span className="ml-auto shrink-0 text-xs text-gray-500">
                                ({selectedTemplate.instances?.length || 0}{' '}
                                chuyến)
                            </span>
                        </div>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Nhập tên tour để tìm..." />
                    <CommandList>
                        <CommandEmpty>
                            <div className="py-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Không tìm thấy tour nào
                                </p>
                            </div>
                        </CommandEmpty>
                        <CommandGroup>
                            {templates.map((template) => (
                                <CommandItem
                                    key={template.id}
                                    value={template.title}
                                    onSelect={() => {
                                        onChange(template.id);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <div className="flex w-full items-center gap-3">
                                        <Check
                                            className={cn(
                                                'h-4 w-4 shrink-0',
                                                Number(value) === template.id
                                                    ? 'opacity-100 text-green-600'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium text-gray-900">
                                                {template.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {template.instances?.length || 0}{' '}
                                                chuyến đi
                                                {template.instances &&
                                                template.instances.length > 0
                                                    ? ` • Từ ${new Date(
                                                          template.instances[0]
                                                              .date_start
                                                      ).toLocaleDateString(
                                                          'vi-VN'
                                                      )}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

