import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { Colors, Fonts } from "@/constants/theme";

function TabIcon({
	emoji,
	label,
	focused,
}: {
	emoji: string;
	label: string;
	focused: boolean;
}) {
	return (
		<View style={{ alignItems: "center", gap: 3, width: 68 }}>
			<View
				style={{
					paddingHorizontal: 14,
					paddingVertical: 4,
					borderRadius: 14,
					backgroundColor: focused
						? Colors.primaryLight
						: "transparent",
				}}
			>
				<Text
					style={{
						fontSize: focused ? 22 : 20,
						opacity: focused ? 1 : 0.35,
					}}
				>
					{emoji}
				</Text>
			</View>
			<Text
				style={{
					fontFamily: Fonts.heading,
					fontSize: 9,
					color: focused ? Colors.primary : Colors.textMuted,
					textAlign: "center",
				}}
				numberOfLines={1}
			>
				{label}
			</Text>
		</View>
	);
}

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					borderTopWidth: 1,
					borderTopColor: `${Colors.primary}22`,
					height: 82,
					paddingBottom: 14,
					paddingTop: 8,
					backgroundColor: "transparent",
				},
				tabBarBackground: () => (
					<LinearGradient
						colors={["rgba(15,38,17,0.97)", "rgba(8,20,9,0.99)"]}
						style={{
							position: "absolute",
							left: 0,
							right: 0,
							top: 0,
							bottom: 0,
						}}
					/>
				),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon emoji="🌱" label="Today" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="impact-bank"
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon emoji="🏦" label="Impact" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="friends"
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon emoji="👥" label="Friends" focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ focused }) => (
						<TabIcon emoji="🏆" label="Profile" focused={focused} />
					),
				}}
			/>
		</Tabs>
	);
}
