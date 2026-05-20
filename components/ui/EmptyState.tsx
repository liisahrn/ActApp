import { Text, View } from 'react-native'

type Props = {
  emoji: string
  title: string
  hint?: string
  className?: string
}

export function EmptyState({ emoji, title, hint, className = '' }: Props) {
  return (
    <View className={`items-center pt-[60px] gap-2 ${className}`}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text className="text-lg font-heading text-white">{title}</Text>
      {hint && (
        <Text className="text-sm font-body text-muted text-center px-5">{hint}</Text>
      )}
    </View>
  )
}
