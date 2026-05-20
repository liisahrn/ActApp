import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, Text, View } from "react-native";
import { Colors, Fonts, Radius } from "@/constants/theme";

const TRACK_WIDTH = Dimensions.get("window").width - 40 - 48;
const THUMB_SIZE = 56;
const MAX_SLIDE = TRACK_WIDTH - THUMB_SIZE - 4;
const THRESHOLD = MAX_SLIDE * 0.8;

type Props = {
	onComplete: () => void;
	disabled?: boolean;
	color?: "green" | "blue";
};

export default function SwipeToComplete({
	onComplete,
	disabled,
	color = "green",
}: Props) {
	const thumbColor = color === "blue" ? Colors.kindGem : Colors.primary;
	const translateX = useRef(new Animated.Value(0)).current;
	const [completed, setCompleted] = useState(false);
	const hasTriggered = useRef(false);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => !disabled && !hasTriggered.current,
			onMoveShouldSetPanResponder: () => !disabled && !hasTriggered.current,
			onPanResponderMove: (_, { dx }) => {
				const clamped = Math.max(0, Math.min(dx, MAX_SLIDE));
				translateX.setValue(clamped);
			},
			onPanResponderRelease: (_, { dx }) => {
				if (dx >= THRESHOLD && !hasTriggered.current) {
					hasTriggered.current = true;
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
					Animated.spring(translateX, {
						toValue: MAX_SLIDE,
						useNativeDriver: true,
						tension: 80,
					}).start(() => {
						setCompleted(true);
						onComplete();
					});
				} else {
					Animated.spring(translateX, {
						toValue: 0,
						useNativeDriver: true,
						tension: 100,
					}).start();
				}
			},
		}),
	).current;

	const trackOpacity = translateX.interpolate({
		inputRange: [0, MAX_SLIDE],
		outputRange: [1, 0],
		extrapolate: "clamp",
	});
	const fillScale = translateX.interpolate({
		inputRange: [0, MAX_SLIDE],
		outputRange: [(THUMB_SIZE + 4) / TRACK_WIDTH, 1],
		extrapolate: "clamp",
	});
	// scaleX anchors to center, so we shift left to keep the fill left-anchored
	const fillTranslateX = translateX.interpolate({
		inputRange: [0, MAX_SLIDE],
		outputRange: [-MAX_SLIDE / 2, 0],
		extrapolate: "clamp",
	});

	if (completed) {
		return (
			<View
				className="items-center justify-center border border-primary bg-primary-light"
				style={{
					width: TRACK_WIDTH,
					height: THUMB_SIZE + 8,
					borderRadius: Radius.full,
				}}
			>
				<Text
					style={{
						fontSize: 15,
						fontFamily: Fonts.heading,
						color: Colors.primary,
					}}
				>
					✅ Mission complete!
				</Text>
			</View>
		);
	}

	return (
		<View
			className="justify-center overflow-hidden border border-border bg-surface-alt"
			style={{
				width: TRACK_WIDTH,
				height: THUMB_SIZE + 8,
				borderWidth: 1.5,
				borderRadius: Radius.full,
			}}
		>
			<Animated.View
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					bottom: 0,
					width: TRACK_WIDTH,
					backgroundColor: thumbColor,
					borderRadius: Radius.full,
					opacity: 0.2,
					transform: [{ translateX: fillTranslateX }, { scaleX: fillScale }],
				}}
			/>
			<Animated.Text
				style={{
					opacity: trackOpacity,
					textAlign: "center",
					fontSize: 14,
					fontFamily: Fonts.body,
					color: Colors.textSecondary,
					paddingLeft: THUMB_SIZE + 8,
				}}
			>
				Swipe to complete mission →
			</Animated.Text>
			<Animated.View
				style={{
					position: "absolute",
					left: 4,
					width: THUMB_SIZE,
					height: THUMB_SIZE,
					borderRadius: THUMB_SIZE / 2,
					backgroundColor: thumbColor,
					alignItems: "center",
					justifyContent: "center",
					shadowColor: thumbColor,
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.4,
					shadowRadius: 8,
					elevation: 6,
					transform: [{ translateX }],
				}}
				{...panResponder.panHandlers}
			>
				<Text style={{ fontSize: 22, color: "#fff", fontWeight: "700" }}>
					→
				</Text>
			</Animated.View>
		</View>
	);
}
