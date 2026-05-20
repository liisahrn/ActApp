import { Text, View } from 'react-native'
import { Fonts } from '@/constants/theme'

type Props = {
	size?: 'sm' | 'md' | 'lg'
	showTagline?: boolean
}

export default function AppLogo({ size = 'md', showTagline = false }: Props) {
	const globeSize = size === 'sm' ? 32 : size === 'md' ? 50 : 70
	const textSize = size === 'sm' ? 16 : size === 'md' ? 24 : 34
	const overlap = Math.round(globeSize * 0.32)
	const rowWidth = globeSize * 3 - overlap * 2

	return (
		<View className="items-center gap-[14px]">
			{/* Globe trio + ACTAPP overlay */}
			<View
				style={{ width: rowWidth, height: globeSize }}
				className="relative items-center justify-center"
			>
				{/* Three overlapping globes */}
				<View className="flex-row items-center absolute">
					<Text style={{ fontSize: globeSize, lineHeight: globeSize }}>🌍</Text>
					<Text
						style={{
							fontSize: globeSize,
							lineHeight: globeSize,
							marginLeft: -overlap,
						}}
					>
						🌍
					</Text>
					<Text
						style={{
							fontSize: globeSize,
							lineHeight: globeSize,
							marginLeft: -overlap,
						}}
					>
						🌍
					</Text>
				</View>

				{/* ACTAPP stencil text on top */}
				<View className="absolute items-center justify-center">
					<Text
						style={{
							fontFamily: Fonts.heading,
							fontSize: textSize,
							color: '#FFFFFF',
							letterSpacing: 2,
							textShadowColor: 'rgba(0,0,0,0.95)',
							textShadowOffset: { width: 0, height: 2 },
							textShadowRadius: 6,
						}}
					>
						ACTAPP
					</Text>
				</View>
			</View>

			{/* Mission tagline pill */}
			{showTagline && (
				<View className="bg-accent rounded-full px-[18px] py-2">
					<Text className="font-body text-white text-xs tracking-[1.5px]">
						ONE MISSION. EVERYONE. EVERY DAY.
					</Text>
				</View>
			)}
		</View>
	)
}
