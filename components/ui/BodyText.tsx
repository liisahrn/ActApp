import { Text, type TextProps } from "react-native";

export function BodyText({
	children,
	className = "",
	style,
	...props
}: TextProps & { className?: string }) {
	return (
		<Text
			className={`font-body text-secondary ${className}`}
			style={style}
			{...props}
		>
			{children}
		</Text>
	);
}
