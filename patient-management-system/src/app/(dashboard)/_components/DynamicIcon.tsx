import React, {CSSProperties} from "react";
import iconMapping, {IconName} from "@/app/lib/iconMapping";

interface DynamicIconProps {
    className?: string;
    icon: IconName;
    style?: CSSProperties;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({className, icon, style}) => {
    // Check if icon is a valid key in the mapping
    if (!(icon in iconMapping)) {
        console.warn(`Icon "${icon}" not found in mapping!`, {
            receivedIcon: icon,
            availableIcons: Object.keys(iconMapping),
        });
        return null;
    }

    const IconComponent = iconMapping[icon];

    return <IconComponent className={className} style={style}/>;
};

export default DynamicIcon;
