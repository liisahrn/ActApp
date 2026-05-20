import { View, type ViewProps } from 'react-native'
import { Shadow } from '@/constants/theme'

type Props = ViewProps & {
  row?: boolean
  shadow?: 'sm' | 'md' | 'lg'
}

export function Card({ row, shadow, className = '', style, children, ...props }: Props) {
  return (
    <View
      className={`bg-surface-dark rounded-lg border border-border ${row ? 'flex-row items-center' : ''} ${className}`}
      style={[shadow ? Shadow[shadow] : undefined, style]}
      {...props}
    >
      {children}
    </View>
  )
}
