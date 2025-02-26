import React, {CSSProperties} from "react";
import {cn} from "@/lib/utils";
import iconSsrMapping, {IconName} from "@/app/lib/iconSsrMapping";

interface DynamicIconSsrProps {
    className?: string;
    icon: IconName;
    size?: "lg";
    strokeWidth?: number;
    style?: CSSProperties;
}

const DynamicIconSsr: React.FC<DynamicIconSsrProps> = ({
                                                           className,
                                                           icon,
                                                           size,
                                                           strokeWidth,
                                                           style,
                                                       }) => {
    // Check if icon is a valid key in the mapping
    if (!(icon in iconSsrMapping)) {
        console.warn(`Icon "${icon}" not found in mapping!`, {
            receivedIcon: icon,
            availableIcons: Object.keys(iconSsrMapping),
        });
        return null;
    }

    const IconComponent = iconSsrMapping[icon];

    return (
        <IconComponent
            className={cn(
                size === "lg" ? "h-6 w-6" : "h-5 w-5",
                className
            )}
            strokeWidth={strokeWidth}
            style={style}
        />
    );
};

export default DynamicIconSsr;