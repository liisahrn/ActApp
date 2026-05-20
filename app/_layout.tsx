import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
	const { setSession, fetchProfile } = useAuthStore();

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			if (session?.user) fetchProfile(session.user.id);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (session?.user) fetchProfile(session.user.id);
		});

		return () => subscription.unsubscribe();
	}, [fetchProfile, setSession]);

	return (
		<GestureHandlerRootView className="flex-1">
			<StatusBar style="light" />
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="(auth)/phone" />
				<Stack.Screen name="(auth)/verify" />
				<Stack.Screen name="onboarding" />
				<Stack.Screen name="(tabs)" />
				<Stack.Screen
					name="impact-report"
					options={{ presentation: "modal", animation: "slide_from_bottom" }}
				/>
			</Stack>
		</GestureHandlerRootView>
	);
}
