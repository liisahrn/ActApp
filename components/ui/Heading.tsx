import { Text, type TextProps } from 'react-native'

export function Heading({ children, className = '', style, ...props }: TextProps & { className?: string }) {
  return (
    <Text className={`font-heading text-white ${className}`} style={style} {...props}>
      {children}
    </Text>
  )
}
