import { Text, type TextProps } from 'react-native'

export function MutedText({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`font-body text-muted ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
