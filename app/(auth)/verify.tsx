import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { PrimaryButton } from "@/components/ui";
import { Colors, Radius, Shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

export default function VerifyScreen() {
	const { email } = useLocalSearchParams<{ email: string }>();
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<TextInput>(null);

	const handleVerify = async () => {
		if (code.length !== 6) {
			Alert.alert("Invalid code", "Please enter the 6-digit code.");
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "email",
		});
		setLoading(false);
		if (error) {
			Alert.alert("Wrong code", "That code didn't work. Try again.");
			setCode("");
		}
	};

	const handleResend = async () => {
		await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: true },
		});
		Alert.alert("Code resent!", `We sent a new code to ${email}`);
	};

	return (
		<KeyboardAvoidingView
			className="flex-1"
			style={{ backgroundColor: Colors.background }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<View className="flex-1 justify-center gap-6 px-7">
				<TouchableOpacity
					className="absolute top-[60] left-7"
					onPress={() => router.back()}
				>
					<Text className="text-primary text-md" style={{ fontWeight: "600" }}>
						← Back
					</Text>
				</TouchableOpacity>

				<View className="items-center gap-[10]">
					<Text style={{ fontSize: 56, marginBottom: 4 }}>📧</Text>
					<Text
						className="text-white text-3xl text-center"
						style={{ fontWeight: "800" }}
					>
						Check your email
					</Text>
					<Text
						className="text-secondary text-md text-center"
						style={{ lineHeight: 22 }}
					>
						We sent a 6-digit code to{"\n"}
						<Text style={{ fontWeight: "700", color: Colors.text }}>
							{email}
						</Text>
					</Text>
				</View>

				<TouchableOpacity
					activeOpacity={0.9}
					onPress={() => inputRef.current?.focus()}
				>
					<View className="flex-row justify-center gap-[10]">
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<View
								key={i}
								className="items-center justify-center"
								style={[
									{
										width: 48,
										height: 58,
										borderRadius: Radius.md,
										backgroundColor: Colors.surface,
										borderWidth: code.length === i ? 2 : 1.5,
										borderColor:
											code.length === i ? Colors.primary : Colors.border,
									},
									Shadow.sm,
								]}
							>
								<Text
									style={{
										fontSize: 26,
										fontWeight: "700",
										color: Colors.text,
									}}
								>
									{code[i] ?? ""}
								</Text>
							</View>
						))}
					</View>
				</TouchableOpacity>

				<TextInput
					ref={inputRef}
					value={code}
					onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
					keyboardType="number-pad"
					maxLength={6}
					style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
					autoFocus
				/>

				<PrimaryButton
					onPress={handleVerify}
					disabled={loading || code.length !== 6}
					label={loading ? "Verifying…" : "Verify →"}
				/>

				<TouchableOpacity onPress={handleResend} className="items-center">
					<Text className="text-primary text-sm" style={{ fontWeight: "600" }}>
						Didn't get it? Resend code
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}
