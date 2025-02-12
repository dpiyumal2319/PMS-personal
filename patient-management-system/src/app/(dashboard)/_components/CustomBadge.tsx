// ParameterBadge.tsx
import { Badge } from "@/components/ui/badge";
import { HTMLAttributes } from "react";


export type badgeColorsType = {
    blue: string;
    green: string;
    red: string;
    yellow: string;
    purple: string;
    pink: string;
    gray: string;
}

interface ParameterBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    text: string;
    color: keyof badgeColorsType;
}

export const badgeColors = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
}

export function CustomBadge({
    text,
    color,
    ...props
}: ParameterBadgeProps) {


    return (
        <Badge
            {...props}
            className={`text-xs ${badgeColors[color]}`}
        >
            {text}
        </Badge>
    );
}