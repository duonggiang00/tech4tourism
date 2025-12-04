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

export interface Tour {
    id: number;
    title: string;
    price_adult: number;
    price_children: number;
    thumbnail?: string;
    day: number;
}

interface TourComboboxProps {
    tours: Tour[];
    value: number | string;
    onChange: (tourId: number) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function TourCombobox({
    tours,
    value,
    onChange,
    placeholder = 'Tìm và chọn tour...',
    disabled = false,
}: TourComboboxProps) {
    const [open, setOpen] = useState(false);

    const selectedTour = tours.find((tour) => tour.id === Number(value));

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
                        !selectedTour && 'text-muted-foreground'
                    )}
                >
                    {selectedTour ? (
                        <div className="flex items-center gap-2 truncate">
                            <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                            <span className="truncate">{selectedTour.title}</span>
                            <span className="ml-auto shrink-0 text-xs text-green-600">
                                {Number(selectedTour.price_adult).toLocaleString()}đ
                            </span>
                        </div>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                            {tours.map((tour) => (
                                <CommandItem
                                    key={tour.id}
                                    value={tour.title}
                                    onSelect={() => {
                                        onChange(tour.id);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <div className="flex w-full items-center gap-3">
                                        <Check
                                            className={cn(
                                                'h-4 w-4 shrink-0',
                                                Number(value) === tour.id
                                                    ? 'opacity-100 text-green-600'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium text-gray-900">
                                                {tour.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {tour.day} ngày •{' '}
                                                <span className="text-green-600 font-medium">
                                                    {Number(tour.price_adult).toLocaleString()}đ
                                                </span>
                                                /người lớn
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

