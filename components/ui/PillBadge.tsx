import { Text, View, type ViewProps } from "react-native";

type Props = ViewProps & {
	label: string;
};

export function PillBadge({ label, className = "", style, ...props }: Props) {
	return (
		<View
			className={`bg-accent rounded-full px-[10] py-1 self-start ${className}`}
			style={style}
			{...props}
		>
			<Text className="text-xs font-heading text-white tracking-[1.5]">
				{label}
			</Text>
		</View>
	);
}
