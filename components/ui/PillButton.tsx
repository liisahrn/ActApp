import { Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & {
  label: string
  outlined?: boolean
}

export function PillButton({ label, outlined, className = '', style, ...props }: Props) {
  return (
    <TouchableOpacity
      className={`rounded-full px-[14px] py-[6px] ${outlined ? 'bg-surface border border-primary' : 'bg-primary'} ${className}`}
      style={style}
      activeOpacity={0.85}
      {...props}
    >
      <Text className="text-white text-xs font-heading">{label}</Text>
    </TouchableOpacity>
  )
}
