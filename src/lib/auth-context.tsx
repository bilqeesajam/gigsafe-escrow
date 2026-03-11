import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client' 
import bcrypt from 'bcryptjs'

interface User {
  id: string
  email: string
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  verifyEmail: (token: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash(password, salt)

      // Generate verification token
      const verification_token = Math.random().toString(36).substring(2, 15) + 
                                Math.random().toString(36).substring(2, 15)
      const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Insert user into custom users table
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash,
            verification_token,
            verification_expires,
            is_verified: false
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Send verification email (you'll need to implement this)
      await sendVerificationEmail(email, verification_token)

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        throw new Error('Invalid email or password')
      }

      // Check if verified
      if (!user.is_verified) {
        throw new Error('Please verify your email first')
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash)
      if (!validPassword) {
        throw new Error('Invalid email or password')
      }

      // Remove sensitive data
      const { password_hash, verification_token, verification_expires, ...userWithoutSensitive } = user
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userWithoutSensitive))
      setUser(userWithoutSensitive)

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      // Find user with this token
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('verification_token', token)
        .single()

      if (fetchError || !user) {
        throw new Error('Invalid verification token')
      }

      // Check if token expired
      if (new Date(user.verification_expires) < new Date()) {
        throw new Error('Verification token expired')
      }

      // Update user as verified
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_verified: true, 
          verification_token: null,
          verification_expires: null 
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  // Helper function to send verification email
  const sendVerificationEmail = async (email: string, token: string) => {
    // You'll need to implement this using an email service
    // For now, just log it
    console.log(`Verification link: ${window.location.origin}/verify-email?token=${token}`)
    
    // You can use services like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - or Supabase's built-in email (if you enable it)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  )
}