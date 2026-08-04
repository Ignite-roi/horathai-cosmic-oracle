import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCivilTime, toCivilTime } from "@/lib/civil-time";

const HOURS = Array.from({ length: 24 }, (_, value) => String(value).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, value) => String(value).padStart(2, "0"));

export function Time24Field({
  value,
  onChange,
  disabled = false,
  id = "civil-time",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}) {
  const { hour, minute } = parseCivilTime(value);
  return (
    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2" id={id}>
      <Select
        value={String(hour).padStart(2, "0")}
        disabled={disabled}
        onValueChange={(nextHour) => onChange(toCivilTime(Number(nextHour), minute))}
      >
        <SelectTrigger aria-label="ชั่วโมง (00 ถึง 23)" className="h-11 bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span aria-hidden="true" className="text-foreground">
        :
      </span>
      <Select
        value={String(minute).padStart(2, "0")}
        disabled={disabled}
        onValueChange={(nextMinute) => onChange(toCivilTime(hour, Number(nextMinute)))}
      >
        <SelectTrigger aria-label="นาที (00 ถึง 59)" className="h-11 bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="col-span-3 text-[10px] text-muted-foreground">เวลา 24 ชั่วโมง · HH:mm</p>
    </div>
  );
}