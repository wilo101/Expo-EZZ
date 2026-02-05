import { Text as RNText, TextProps } from "react-native";

interface CustomTextProps extends TextProps {
    variant?: "body" | "heading" | "medium" | "bold";
    className?: string; // Standard in NativeWind v4
}

export const Text = ({
    variant = "body",
    className = "",
    style,
    ...props
}: CustomTextProps) => {
    const fontClass = {
        body: "font-montserrat",
        heading: "font-playfair",
        medium: "font-montserratMedium",
        bold: "font-montserratBold",
    }[variant];

    return (
        <RNText
            className={`${fontClass} text-white ${className}`}
            style={style}
            {...props}
        />
    );
};
