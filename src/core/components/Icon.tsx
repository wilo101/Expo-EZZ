import { icons } from "lucide-react-native";
import { ColorValue } from "react-native";

export type IconName = keyof typeof icons;

interface IconProps {
    name: IconName;
    size?: number;
    color?: ColorValue;
}

const Icon = ({ name, size = 24, color = "black" }: IconProps) => {
    const LucideIcon = icons[name];

    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return <LucideIcon size={size} color={color} />;
};

export default Icon;
