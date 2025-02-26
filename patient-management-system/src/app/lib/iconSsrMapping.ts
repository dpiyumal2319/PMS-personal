import * as LucideIcons from 'lucide-react';
import {LucideProps} from 'lucide-react'; // Import the correct props type

type LucideIconComponent = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<LucideProps> & React.RefAttributes<SVGSVGElement>
>;

const iconSsrMapping: Record<string, LucideIconComponent> = Object.keys(LucideIcons)
    .filter((key) => /^[A-Z].*Icon$/.test(key)) // start with capital and end with Icon
    .reduce(
        (acc, key) => {
            acc[key] = LucideIcons[key as keyof typeof LucideIcons] as LucideIconComponent;
            return acc;
        },
        {} as Record<string, LucideIconComponent>
    );

const isLucideIconComponent = (component: unknown): component is LucideIconComponent =>
    typeof component === 'function' &&
    'displayName' in (component as LucideIconComponent) &&
    typeof (component as LucideIconComponent).displayName === 'string';

// Use `satisfies` to avoid `no-unused-vars` error
const iconSsrMappingForType = Object.keys(LucideIcons)
    .filter((key): key is keyof typeof LucideIcons & `${string}Icon` => /^[A-Z].*Icon$/.test(key))
    .reduce(
        (acc, key) => {
            const component = LucideIcons[key];
            if (isLucideIconComponent(component)) {
                acc[key] = component; // Only assign compatible components
            }
            return acc;
        },
        {} as Record<`${string}Icon`, LucideIconComponent>
    ) satisfies Record<string, LucideIconComponent>;

type IconName = keyof typeof iconSsrMappingForType;

export default iconSsrMapping;
export type {IconName};
