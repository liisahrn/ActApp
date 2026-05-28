import { router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Colors, Shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

const AVATARS = [
	"🌱",
	"🌿",
	"🌲",
	"🌍",
	"⚡",
	"🚲",
	"🐝",
	"🦋",
	"🌊",
	"☀️",
	"🍃",
	"♻️",
];

export default function OnboardingScreen() {
	const { fetchProfile } = useAuthStore();
	const [username, setUsername] = useState("");
	const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
	const [loading, setLoading] = useState(false);

	const handleContinue = async () => {
		const trimmed = username.trim();
		if (trimmed.length < 2) {
			Alert.alert("Pick a username", "Must be at least 2 characters.");
			return;
		}
		if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
			Alert.alert(
				"Invalid username",
				"Only letters, numbers, and underscores.",
			);
			return;
		}
		setLoading(true);
		try {
			const {
				data: { user },
				error: userError,
			} = await supabase.auth.getUser();
			if (userError || !user) {
				Alert.alert("Session expired", "Please sign in again.");
				router.replace("/(auth)/phone");
				return;
			}
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const { data: existing } = await supabase
				.from("profiles")
				.select("id")
				.eq("username", trimmed)
				.neq("id", user.id)
				.maybeSingle();
			if (existing) {
				Alert.alert(
					"Taken!",
					"That username is already in use. Try another.",
				);
				return;
			}
			const { error } = await supabase.from("profiles").upsert({
				id: user.id,
				username: trimmed,
				avatar_url: selectedAvatar,
				xp: 0,
				level: 1,
				timezone,
			});
			if (error) {
				Alert.alert("Error", error.message);
				return;
			}
			await fetchProfile(user.id);
			router.replace("/(tabs)");
		} catch (e) {
			Alert.alert("Something went wrong", (e as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			className="flex-1"
			style={{ backgroundColor: Colors.background }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={{
					padding: 28,
					gap: 24,
					paddingTop: 80,
					paddingBottom: 40,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<View className="items-center gap-2">
					<Text style={{ fontSize: 72, marginBottom: 4 }}>
						{selectedAvatar}
					</Text>
					<Text
						className="text-white text-2xl"
						style={{ fontWeight: "800" }}
					>
						Set up your profile
					</Text>
					<Text className="text-secondary text-md">
						Choose your avatar and pick a username
					</Text>
				</View>

				<View className="flex-row flex-wrap gap-[10] justify-center">
					{AVATARS.map((emoji) => (
						<TouchableOpacity
							key={emoji}
							className="w-14 h-14 items-center justify-center rounded-md border"
							style={{
								backgroundColor:
									selectedAvatar === emoji
										? Colors.surfaceAlt
										: Colors.surface,
								borderWidth:
									selectedAvatar === emoji ? 2.5 : 1.5,
								borderColor:
									selectedAvatar === emoji
										? Colors.primary
										: Colors.border,
							}}
							onPress={() => setSelectedAvatar(emoji)}
							activeOpacity={0.75}
						>
							<Text style={{ fontSize: 28 }}>{emoji}</Text>
						</TouchableOpacity>
					))}
				</View>

				<View style={{ gap: 6 }}>
					<Text
						className="text-secondary text-sm"
						style={{ fontWeight: "600" }}
					>
						Username
					</Text>
					<View
						className="flex-row items-center rounded-md border"
						style={[
							{
								backgroundColor: Colors.surface,
								borderWidth: 1.5,
								borderColor: Colors.border,
								paddingHorizontal: 14,
							},
							Shadow.sm,
						]}
					>
						<Text
							className="text-secondary text-lg"
							style={{ marginRight: 4 }}
						>
							@
						</Text>
						<AppTextInput
							className="flex-1 py-[14] bg-transparent border-0"
							value={username}
							onChangeText={setUsername}
							placeholder="your_username"
							placeholderTextColor={Colors.textMuted}
							autoCapitalize="none"
							autoCorrect={false}
							maxLength={20}
						/>
					</View>
				</View>

				<PrimaryButton
					onPress={handleContinue}
					disabled={loading || username.trim().length < 2}
					label={loading ? "Setting up…" : "Let's go 🌍"}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
