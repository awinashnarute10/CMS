import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/common/ThemeToggle'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(4, 'Password must be at least 4 characters'),
})

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState(null)
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/overview'

  // Redirect away from login if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      })
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    } catch (err) {
      const message = err.message || 'Invalid credentials or login rejected by server'
      setServerError(message)
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 md:p-8">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
            CM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Crowd Ops
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
              Enterprise Monitoring
            </span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md border border-border bg-card shadow-none">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="h-9 w-9 rounded-md bg-secondary border border-border flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Sign In to Operations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your credentials to access the live crowd monitoring console.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Server Error Alert */}
              {serverError && (
                <div
                  role="alert"
                  className="p-3 rounded-md border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] flex items-start gap-2.5 text-xs text-[var(--status-danger)]"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium">Authentication Failed</p>
                    <p className="opacity-90">{serverError}</p>
                  </div>
                </div>
              )}

              {/* Email / ID Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  disabled={isSubmitting}
                  placeholder="operator@example.com"
                  className="h-9 text-xs"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-[11px] text-[var(--status-danger)] font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    className="h-9 text-xs pr-9"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-[11px] text-[var(--status-danger)] font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 text-xs font-medium mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer Notice */}
      <footer className="text-center text-[11px] text-muted-foreground max-w-md mx-auto py-4">
        Protected by Bearer JWT Authentication
      </footer>
    </div>
  )
}
