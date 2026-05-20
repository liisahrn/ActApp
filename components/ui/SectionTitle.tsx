import { Text, type TextProps } from 'react-native'

export function SectionTitle({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`text-lg font-heading text-white ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
