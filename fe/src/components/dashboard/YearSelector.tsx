import { Select } from "antd";

type YearSelectorProps = {
    startDate: string;
    value?: string;
    onChange: (newYear?: string) => void;
    allowClear?: boolean;
    placeholder?: string;
    excludeYear?: string;
};

function getYearOptions(startDate: string) {
    const result: { label: string; value: string }[] = [];
    for (let year = parseInt(startDate); year <= new Date().getFullYear(); year++) {
        result.push({ label: year.toString(), value: year.toString() });
    }
    return result;
}

const YearSelector = ({
    startDate,
    value,
    onChange,
    allowClear = false,
    placeholder,
    excludeYear
}: YearSelectorProps) => {
    let options = getYearOptions(startDate);
    options = options.reverse();
    if (excludeYear) {
        options = options.filter((option) => option.value !== excludeYear);
    }

    return (
        <Select
            style={{ width: 220 }}
            options={options}
            value={value}
            onChange={(v) => onChange(v)}
            allowClear={allowClear}
            placeholder={placeholder}
        />
    );
};

export default YearSelector;
