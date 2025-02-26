import * as LuIcons from "react-icons/bs";
import {IconType} from "react-icons";

const iconMapping: Record<string, IconType> = Object.keys(LuIcons)
    .filter((key) => key.startsWith("Bs")) // Ensure we only pick Lucide icons
    .reduce(
        (acc, key) => {
            acc[key] = LuIcons[key as keyof typeof LuIcons];
            return acc;
        },
        {} as Record<string, IconType>
    );

type IconName = keyof typeof iconMapping;

export default iconMapping;
export type {IconName};