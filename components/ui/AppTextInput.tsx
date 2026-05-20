import { TextInput, type TextInputProps } from 'react-native'

export function AppTextInput({ className = '', style, ...props }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      className={`bg-surface border border-border rounded-md px-[14px] py-[10px] text-md font-body text-white ${className}`}
      style={style}
      {...props}
    />
  )
}
