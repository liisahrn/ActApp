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
		<View className="items-center gap-[3] w-[72]">
			<Text style={{ fontSize: 24, opacity: focused ? 1 : 0.38 }}>
				{emoji}
			</Text>
			<Text
				style={{
					fontFamily: focused ? Fonts.heading : Fonts.body,
					fontSize: focused ? 10 : 11,
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
					borderTopColor: Colors.border,
					height: 82,
					paddingBottom: 14,
					paddingTop: 8,
					backgroundColor: "transparent",
				},
				tabBarBackground: () => (
					<LinearGradient
						colors={["rgba(0,0,0,0.6)", "rgba(13,32,24,0.97)"]}
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
