import { LinearGradient } from 'expo-linear-gradient'
import {
	BG_GRADIENT,
	BG_GRADIENT_END,
	BG_GRADIENT_START,
} from '@/constants/theme'

export default function Background() {
	return (
		<LinearGradient
			colors={BG_GRADIENT}
			start={BG_GRADIENT_START}
			end={BG_GRADIENT_END}
			style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
		/>
	)
}
