// ParameterBadge.tsx
import {Badge} from "@/components/ui/badge";
import {HTMLAttributes} from "react";

interface ParameterBadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
    text: string;
    color: string;
}

export function CustomBadge({
                                text,
                                color,
                                ...props
                            }: ParameterBadgeProps) {

    console.log(`rendering badge with color: ${color} and text: ${text}`);
    return (
        <Badge
            {...props}
            className={`bg-${color}-100 text-${color}-800 hover:bg-${color}-200 text-xs`}
        >
            {text}
        </Badge>
    );
}