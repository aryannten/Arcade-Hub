import React from 'react'
import { Text } from 'react-native'

const createIconComponent = (name) => {
  return ({ name: iconName, size, color, ...props }) => (
    <Text {...props}>{`${name}:${iconName}`}</Text>
  )
}

export const MaterialCommunityIcons = createIconComponent('MaterialCommunityIcons')
export const Ionicons = createIconComponent('Ionicons')
export const FontAwesome5 = createIconComponent('FontAwesome5')
export const FontAwesome = createIconComponent('FontAwesome')
export const Feather = createIconComponent('Feather')
export const MaterialIcons = createIconComponent('MaterialIcons')
