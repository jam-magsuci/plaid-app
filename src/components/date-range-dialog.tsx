'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDate(date: Date | undefined) {
  if (!date) return '';
  return format(date, 'MMMM dd, yyyy');
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

type DateRangeDialogProps = {
  onDateRangeSelected: (range: { startDate: string; endDate: string }) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DateRangeDialog({ onDateRangeSelected, open, onOpenChange }: DateRangeDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const [startMonth, setStartMonth] = useState<Date | undefined>(startDate);
  const [endMonth, setEndMonth] = useState<Date | undefined>(endDate);
  
  const [startValue, setStartValue] = useState(formatDate(startDate));
  const [endValue, setEndValue] = useState(formatDate(endDate));
  
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handleSubmit = () => {
    if (startDate && endDate) {
      onDateRangeSelected({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
      onOpenChange?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Transaction Date Range</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="start-date">Start Date</Label>
            <div className="relative flex gap-2">
              <Input
                id="start-date"
                value={startValue}
                placeholder="Select start date"
                className="bg-background pr-10"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setStartValue(e.target.value);
                  if (isValidDate(date)) {
                    setStartDate(date);
                    setStartMonth(date);
                  }
                }}
              />
              <Popover open={startOpen} onOpenChange={setStartOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="sr-only">Start date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    month={startMonth}
                    onMonthChange={setStartMonth}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setStartValue(formatDate(date));
                        setStartOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="end-date">End Date</Label>
            <div className="relative flex gap-2">
              <Input
                id="end-date"
                value={endValue}
                placeholder="Select end date"
                className="bg-background pr-10"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setEndValue(e.target.value);
                  if (isValidDate(date)) {
                    setEndDate(date);
                    setEndMonth(date);
                  }
                }}
              />
              <Popover open={endOpen} onOpenChange={setEndOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="sr-only">End date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    month={endMonth}
                    onMonthChange={setEndMonth}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setEndValue(formatDate(date));
                        setEndOpen(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={handleSubmit} className="mt-4">
            Confirm Date Range
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
