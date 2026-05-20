import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { Shadow } from '@/constants/theme'

type Props = TouchableOpacityProps & {
  label?: string
}

export function PrimaryButton({ label, disabled, className = '', style, children, ...props }: Props) {
  return (
    <TouchableOpacity
      className={`bg-primary rounded-lg py-4 items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      style={[Shadow.lg, style]}
      disabled={disabled}
      activeOpacity={0.85}
      {...props}
    >
      {children ?? (
        <Text className="text-white font-heading text-lg">{label}</Text>
      )}
    </TouchableOpacity>
  )
}
