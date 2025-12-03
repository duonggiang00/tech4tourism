import { ReactNode } from "react";

export function InfoItem({
    icon,
    bg,
    label,
    value,
}: {
    icon: ReactNode;
    bg: string;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <div className="text-sm font-medium text-gray-900">{value}</div>
            </div>
        </div>
    );
}
