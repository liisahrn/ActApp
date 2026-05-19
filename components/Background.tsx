import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import {
	BG_GRADIENT,
	BG_GRADIENT_END,
	BG_GRADIENT_START,
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
