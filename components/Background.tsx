import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
	BG_GRADIENT,
	BG_GRADIENT_START,
	BG_GRADIENT_END,
} from "@/constants/theme";

export default function Background() {
	return (
		<LinearGradient
			colors={BG_GRADIENT}
			start={BG_GRADIENT_START}
			end={BG_GRADIENT_END}
			style={StyleSheet.absoluteFill}
		/>
	);
}
