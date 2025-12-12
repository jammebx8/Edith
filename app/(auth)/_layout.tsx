import { Stack } from 'expo-router'
import React from 'react'

const AuthStack = () => {
  return (
   <Stack screenOptions={{headerShown:false}}>  
   <Stack.Screen name="index"/> 
    <Stack.Screen name="terms_agree"/> 
    <Stack.Screen name='edith'/>
    <Stack.Screen name="callback" />  
       </Stack>
  )
}

export default AuthStack