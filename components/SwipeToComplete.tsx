import { useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Animated,
	PanResponder,
	Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, Fonts, Radius } from "@/constants/theme";

const TRACK_WIDTH = Dimensions.get("window").width - 40 - 48; // full width minus padding
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

	const fillWidth = translateX.interpolate({
		inputRange: [0, MAX_SLIDE],
		outputRange: [THUMB_SIZE + 4, TRACK_WIDTH],
		extrapolate: "clamp",
	});

	if (completed) {
		return (
			<View style={[styles.track, styles.trackDone]}>
				<Text style={styles.doneText}>✅ Mission complete!</Text>
			</View>
		);
	}

	return (
		<View style={styles.track}>
			<Animated.View
				style={[styles.fill, { width: fillWidth, backgroundColor: thumbColor }]}
			/>
			<Animated.Text style={[styles.label, { opacity: trackOpacity }]}>
				Swipe to complete mission →
			</Animated.Text>
			<Animated.View
				style={[
					styles.thumb,
					{
						transform: [{ translateX }],
						backgroundColor: thumbColor,
						shadowColor: thumbColor,
					},
				]}
				{...panResponder.panHandlers}
			>
				<Text style={styles.thumbIcon}>→</Text>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		width: TRACK_WIDTH,
		height: THUMB_SIZE + 8,
		backgroundColor: Colors.surfaceAlt,
		borderRadius: Radius.full,
		borderWidth: 1.5,
		borderColor: Colors.border,
		justifyContent: "center",
		overflow: "hidden",
		position: "relative",
	},
	trackDone: {
		backgroundColor: Colors.primaryLight,
		borderColor: Colors.primary,
		alignItems: "center",
	},
	fill: {
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		backgroundColor: Colors.primary,
		borderRadius: Radius.full,
		opacity: 0.2,
	},
	label: {
		textAlign: "center",
		fontSize: 14,
		fontFamily: Fonts.body,
		color: Colors.textSecondary,
		paddingLeft: THUMB_SIZE + 8,
	},
	thumb: {
		position: "absolute",
		left: 4,
		width: THUMB_SIZE,
		height: THUMB_SIZE,
		borderRadius: THUMB_SIZE / 2,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: Colors.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 8,
		elevation: 6,
	},
	thumbIcon: {
		fontSize: 22,
		color: "#fff",
		fontWeight: "700",
	},
	doneText: {
		fontSize: 15,
		fontFamily: Fonts.heading,
		color: Colors.primary,
	},
});
