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
import AppLogo from "@/components/AppLogo";
import Background from "@/components/Background";
import { AppTextInput, PrimaryButton } from "@/components/ui";
import { Colors, Shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

export default function AuthScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(true);
	const [loading, setLoading] = useState(false);

	const handleAuth = async () => {
		const trimmedEmail = email.trim().toLowerCase();
		if (!trimmedEmail.includes("@")) {
			Alert.alert("Invalid email", "Please enter a valid email address.");
			return;
		}
		if (password.length < 6) {
			Alert.alert(
				"Password too short",
				"Password must be at least 6 characters.",
			);
			return;
		}
		setLoading(true);
		if (isSignUp) {
			const { data, error } = await supabase.auth.signUp({
				email: trimmedEmail,
				password,
			});
			if (error) {
				if (error.message.includes("already registered")) {
					Alert.alert(
						"Already registered",
						"You already have an account. Try signing in instead.",
					);
					setIsSignUp(false);
				} else Alert.alert("Sign up failed", error.message);
			} else if (data.session === null) {
				Alert.alert(
					"Check your email",
					'Confirm your email then sign in.\n\nTip: disable "Enable email confirmations" in Supabase → Auth → Settings for dev.',
				);
			} else {
				router.replace("/");
			}
		} else {
			const { error } = await supabase.auth.signInWithPassword({
				email: trimmedEmail,
				password,
			});
			if (error) {
				if (error.message.includes("Email not confirmed"))
					Alert.alert(
						"Email not confirmed",
						'Disable "Enable email confirmations" in Supabase → Auth → Settings.',
					);
				else Alert.alert("Sign in failed", error.message);
			} else {
				router.replace("/");
			}
		}
		setLoading(false);
	};

	return (
		<KeyboardAvoidingView
			className="flex-1"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<Background />
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 24,
					justifyContent: "center",
					gap: 32,
					paddingVertical: 60,
				}}
				keyboardShouldPersistTaps="handled"
			>
				<View className="items-center">
					<AppLogo size="lg" showTagline />
				</View>

				<View
					className="rounded-[28] border border-border gap-5 p-6"
					style={[{ backgroundColor: Colors.surfaceDark }, Shadow.md]}
				>
					<Text className="font-heading text-white text-2xl tracking-[1]">
						{isSignUp ? "Create account" : "Welcome back"}
					</Text>

					<View style={{ gap: 14 }}>
						<View style={{ gap: 6 }}>
							<Text className="font-body text-secondary text-sm tracking-[0.5]">
								Email
							</Text>
							<AppTextInput
								value={email}
								onChangeText={setEmail}
								placeholder="you@example.com"
								placeholderTextColor={Colors.textMuted}
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								autoFocus
							/>
						</View>
						<View style={{ gap: 6 }}>
							<Text className="font-body text-secondary text-sm tracking-[0.5]">
								Password
							</Text>
							<AppTextInput
								value={password}
								onChangeText={setPassword}
								placeholder="At least 6 characters"
								placeholderTextColor={Colors.textMuted}
								secureTextEntry
							/>
						</View>
					</View>

					<PrimaryButton
						onPress={handleAuth}
						disabled={loading}
						label={
							loading ? "Loading…" : isSignUp ? "Create account →" : "Sign in →"
						}
						className="tracking-[1]"
					/>

					<TouchableOpacity
						onPress={() => setIsSignUp(!isSignUp)}
						className="items-center"
					>
						<Text className="font-body text-muted text-sm">
							{isSignUp
								? "Already have an account? "
								: "Don't have an account? "}
							<Text className="text-primary font-heading">
								{isSignUp ? "Sign in" : "Sign up"}
							</Text>
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
