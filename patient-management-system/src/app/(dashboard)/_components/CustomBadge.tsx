// ParameterBadge.tsx
import {Badge} from "@/components/ui/badge";
import {HTMLAttributes} from "react";


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
    color?: keyof badgeColorsType;
    className?: string;
}

export const badgeColors = {
    slate: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    zinc: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200',
    neutral: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
    stone: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
    orange: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    amber: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    lime: 'bg-lime-100 text-lime-800 hover:bg-lime-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    emerald: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
    teal: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
    cyan: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    sky: 'bg-sky-100 text-sky-800 hover:bg-sky-200',
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    violet: 'bg-violet-100 text-violet-800 hover:bg-violet-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200',
    pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    rose: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
};


export function CustomBadge({
                                text,
                                color,
                                className,
                                ...props
                            }: ParameterBadgeProps) {


    return (
        <Badge
            className={`text-xs font-semibold ${badgeColors[color || 'gray']} ${className}`}
            {...props}
        >
            {text}
        </Badge>
    );
}

//Get random colored badge without 'gray', 'zinc', 'slate', 'neutral', 'stone'
export function getRandomColor() {
    const colors = Object.keys(badgeColors).filter(color => !['gray', 'zinc', 'slate', 'neutral', 'stone'].includes(color));
    return colors[Math.floor(Math.random() * colors.length)] as keyof badgeColorsType;
}


export function RandomColorBadge({
                                     text,
                                     ...props
                                 }: ParameterBadgeProps) {
    return (
        <CustomBadge
            {...props}
            text={text}
            color={getRandomColor()}
        />
    );
}