import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { AuthProvider } from '@/context/AuthContext'
import * as authApi from '@/api/auth'
import { clearStoredToken } from '@/api/client'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('LoginPage Component', () => {
  let container
  let root

  beforeEach(() => {
    clearStoredToken()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
    clearStoredToken()
  })

  it('displays authentication error and does not navigate when server returns { errorMessage: "Invalid credentials" }', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValueOnce(new Error('Invalid credentials'))

    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/overview" element={<div>Overview Dashboard</div>} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      )
    })

    const emailInput = container.querySelector('#email')
    const passwordInput = container.querySelector('#password')
    const submitBtn = container.querySelector('button[type="submit"]')

    act(() => {
      // Simulate typing into inputs
      const emailSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      emailSetter.call(emailInput, 'user@example.com')
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))

      const passSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      passSetter.call(passwordInput, 'wrongpass')
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      submitBtn.click()
    })

    // Should NOT have navigated to Overview Dashboard
    expect(container.textContent).not.toContain('Overview Dashboard')

    // Should show small error below password input
    const passwordError = container.querySelector('#password-error')
    expect(passwordError).not.toBeNull()
    expect(passwordError.textContent).toBe('Invalid credentials')

    // No large expanding alert box
    expect(container.querySelector('[role="alert"]')).toBeNull()

    // Password field container should have shake animation class
    const passwordWrapper = passwordInput.closest('.animate-shake')
    expect(passwordWrapper).not.toBeNull()

    // Password field should be erased
    expect(passwordInput.value).toBe('')
  })

  it('renders "Welcome to the Crowd Management System" heading', () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      )
    })

    expect(container.textContent).toContain('Welcome to the Crowd Management System')
  })
})
