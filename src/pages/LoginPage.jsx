import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { cn } from '@/lib/utils'

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
  const [shake, setShake] = useState(false)
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
    resetField,
    setFocus,
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
      const res = await login({
        email: values.email.trim(),
        password: values.password,
      })
      if (res?.errorMessage) {
        throw new Error(res.errorMessage)
      }
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err.message ||
        err.data?.errorMessage ||
        err.errorMessage ||
        'Invalid credentials'
      setServerError(message)
      // Trigger horizontal shake on password field
      setShake(true)
      setTimeout(() => setShake(false), 500)
      // Erase password field and refocus on failed authentication
      resetField('password')
      setFocus('password')
    }
  }

  return (
    <div className="min-h-screen sidebar-gradient relative overflow-hidden flex flex-col justify-between p-4 md:p-8">
      {/* Abstract geometric network pattern overlay identical to sidebar */}
      <div
        className="absolute inset-0 sidebar-network-pattern pointer-events-none opacity-80"
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#0B8F8B] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 001.5-7.7 5.5 5.5 0 00-10.7-1.8A4 4 0 003 15z" />
              <circle cx="12" cy="13" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-white leading-none">
              CMS
            </span>
            <span className="text-[10px] text-[#A0B0B2] uppercase tracking-widest font-mono mt-1">
              Crowd Ops
            </span>
          </div>
        </div>
        <ThemeToggle className="text-white border-white/20 bg-white/5 hover:bg-white/10 hover:text-white [&>svg]:text-white" />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center py-12 relative z-10">
        <Card className="w-full max-w-md border border-border bg-card rounded-xl shadow-2xl">
          <CardHeader className="space-y-1.5 pb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              Sign In to Operations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your credentials to access the crowd management system.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              {/* Email / ID Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  disabled={isSubmitting}
                  placeholder="operator@example.com"
                  className="h-9 text-xs bg-card border-border text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email', {
                    onChange: () => {
                      if (serverError) setServerError(null)
                    },
                  })}
                />
                <div className="min-h-[16px]">
                  {errors.email && (
                    <p id="email-error" className="text-[11px] text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                </div>
                <div className={cn('relative', shake && 'animate-shake')}>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    placeholder="••••••••"
                    className={cn(
                      'h-9 text-xs pr-9 bg-card text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-colors',
                      serverError || errors.password
                        ? 'border-destructive focus:border-destructive focus:ring-destructive'
                        : 'border-border'
                    )}
                    aria-invalid={Boolean(errors.password || serverError)}
                    aria-describedby={errors.password || serverError ? 'password-error' : undefined}
                    {...register('password', {
                      onChange: () => {
                        if (serverError) setServerError(null)
                      },
                    })}
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
                <div className="min-h-[16px]">
                  {(serverError || errors.password) && (
                    <p id="password-error" className="text-[11px] text-destructive font-medium">
                      {serverError || errors.password?.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 text-xs font-semibold mt-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
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
      <footer className="text-center text-[11px] text-[#A0B0B2] max-w-md mx-auto py-4 relative z-10">
        Restricted access — authorized personnel only
      </footer>
    </div>
  )
}
