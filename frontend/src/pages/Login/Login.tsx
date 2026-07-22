import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  WorkspacePremium,
  Lock,
  Email,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { motion } from 'framer-motion'

const loginBg = new URL('../../assets/images/login1.png', import.meta.url).href

export const Login = () => {
  const navigate = useNavigate()
  const { login, signInWithGoogle, signInWithFacebook, resetPassword, user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => Number(sessionStorage.getItem('loginFailedAttempts') || '0'))
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const value = sessionStorage.getItem('loginLockoutUntil')
    return value ? Number(value) : null
  })

  useEffect(() => {
    const savedRemember = localStorage.getItem('loginRemember')
    const savedEmail = localStorage.getItem('loginEmail')
    if (savedRemember === 'true') {
      setRemember(true)
      if (savedEmail) setEmail(savedEmail)
    }
  }, [])

  const MAX_FAILED_ATTEMPTS = 5
  const LOCKOUT_DURATION_MS = 30_000
  const isLockedOut = lockoutUntil !== null && lockoutUntil > Date.now()

  useEffect(() => {
    if (!lockoutUntil) return
    const interval = window.setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null)
        setFailedAttempts(0)
        sessionStorage.removeItem('loginFailedAttempts')
        sessionStorage.removeItem('loginLockoutUntil')
      }
    }, 1000)
    return () => window.clearInterval(interval)
  }, [lockoutUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) {
      setError('Formulario inválido')
      return
    }

    if (isLockedOut) {
      setError(getLockoutMessage() || 'Demasiados intentos. Intenta de nuevo más tarde.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await login(email, password, remember)
      if (remember) {
        localStorage.setItem('loginRemember', 'true')
        localStorage.setItem('loginEmail', email)
      } else {
        localStorage.removeItem('loginRemember')
        localStorage.removeItem('loginEmail')
      }
      if (!remember) {
        setEmail('')
        setPassword('')
      }
      setFailedAttempts(0)
      setLockoutUntil(null)
      sessionStorage.removeItem('loginFailedAttempts')
      sessionStorage.removeItem('loginLockoutUntil')
      navigate('/dashboard')
    } catch (authError: any) {
      const nextAttempts = failedAttempts + 1
      setFailedAttempts(nextAttempts)
      sessionStorage.setItem('loginFailedAttempts', String(nextAttempts))

      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        const unlockAt = Date.now() + LOCKOUT_DURATION_MS
        setLockoutUntil(unlockAt)
        sessionStorage.setItem('loginLockoutUntil', String(unlockAt))
        setError('Demasiados intentos. Intenta de nuevo en 30 segundos.')
      } else {
        setError('Correo o contraseña incorrectos')
      }

      console.error('Login failed:', authError)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (authError: any) {
      setError(authError.message || 'Error al iniciar sesión con Google')
      console.error('Google login failed:', authError)
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithFacebook()
      navigate('/dashboard')
    } catch (authError: any) {
      setError(authError.message || 'Error al iniciar sesión con Facebook')
      console.error('Facebook login failed:', authError)
    } finally {
      setLoading(false)
    }
  }

  const getLockoutMessage = () => {
    if (!isLockedOut || !lockoutUntil) return null
    const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000)
    return `Demasiados intentos. Intenta de nuevo en ${secondsLeft} segundos.`
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    if (error) setError('')
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    if (error) setError('')
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Ingresa tu correo para restablecer la contraseña')
      return
    }

    setError('')
    try {
      await resetPassword(email)
    } catch (err) {
      console.error('Forgot password failed:', err)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard')
    }
  }, [authLoading, user, navigate])

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', overflow: 'hidden' }}>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap');
      :root{--purple:#7C3AED;--blue:#2563EB;--gold:#FBBF24}
      html,body,#root{height:100%}
      .bgLayer{position:fixed;inset:0;z-index:0;background-image:url(${loginBg});background-size:cover;background-position:center;background-repeat:no-repeat;overflow:hidden}
      .bgLayer::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,20,0.65),rgba(5,8,20,0.75));}
      .radial1{position:absolute;left:-20%;top:-10%;width:920px;height:920px;border-radius:50%;background:radial-gradient(circle,#7C3AED44,transparent 36%);filter:blur(90px);mix-blend-mode:screen}
      .radial2{position:absolute;right:-15%;top:-5%;width:820px;height:820px;border-radius:50%;background:radial-gradient(circle,#2563EB33,transparent 36%);filter:blur(100px);mix-blend-mode:screen}
      .radial3{position:absolute;left:10%;bottom:-20%;width:1200px;height:700px;border-radius:50%;background:radial-gradient(circle,#0b203033,transparent 30%);filter:blur(120px);mix-blend-mode:screen}
      .particles{position:absolute;inset:0;pointer-events:none;opacity:0.9}
      .dot{position:absolute;width:3px;height:3px;background:rgba(255,255,255,0.05);border-radius:50%;animation:drift 60s linear infinite}
      @keyframes drift{0%{transform:translateY(0) translateX(0)}50%{transform:translateY(-12px) translateX(6px)}100%{transform:translateY(0) translateX(0)}}

      /* subtle kenburns */
      @keyframes kenburns{0%{transform:scale(1.02)}50%{transform:scale(1.045)}100%{transform:scale(1.02)}}

      .layout{position:relative;display:flex;height:100vh;z-index:1;gap:0;align-items:center;justify-content:center}
      .leftPane{display:none}
      .lightStrip{position:absolute;right:4%;top:12%;width:2px;height:60%;background:linear-gradient(180deg,rgba(255,255,255,0.14),transparent);transform:rotate(10deg);filter:blur(4px);opacity:0.65}
      .leftImage{position:absolute;inset:0;background-image:url(${loginBg});background-size:cover;background-position:center;filter:blur(2px);transform:scale(1.02);animation:kenburns 28s ease-in-out infinite;will-change:transform}
      .leftPurpleGlow{position:absolute;left:-8%;top:-12%;width:1000px;height:900px;border-radius:50%;background:radial-gradient(circle,#7C3AED22,transparent 30%);filter:blur(120px);mix-blend-mode:screen;z-index:1}
      .leftCenterMask{position:absolute;left:20%;top:18%;width:60%;height:58%;border-radius:30px;background:radial-gradient(ellipse at center, rgba(2,6,23,0.24) 0%, rgba(2,6,23,0.10) 30%, transparent 60%);filter:blur(12px);pointer-events:none;z-index:2}
      .leftOverlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,20,0.12),rgba(5,8,20,0.45));}
      .leftRadial{position:absolute;inset:0;background:radial-gradient(500px 260px at 28% 22%, rgba(124,58,237,0.12), rgba(37,99,235,0.08) 35%, transparent 60%);mix-blend-mode:overlay;filter:blur(18px)}
      .leftContent{position:relative;z-index:3;padding:40px 64px 32px;color:#fff;display:flex;flex-direction:column;justify-content:flex-start;height:100%}
      .brand{display:flex;align-items:center;gap:18px}
      .brandCircle{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--purple),var(--blue));box-shadow:0 0 60px rgba(124,58,237,.45);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.06);}
      .brandTitle{font-weight:900;font-size:20px;letter-spacing:0.4px}
      .brandSub{font-size:12px;opacity:0.85}

      .heroTitle{font-weight:900;font-size:88px;line-height:0.98;margin-top:12px;letter-spacing:-2px;text-shadow:0 10px 40px rgba(255,255,255,0.06);max-width:92%}
      .heroSubtitle{color:#CBD5E1;max-width:520px;margin-top:16px}

      .cardsWrap{display:flex;flex-direction:column;gap:18px;margin-top:36px}
      .glassCard{position:relative;display:flex;gap:16px;align-items:flex-start;padding:20px;border-radius:20px;background:rgba(255,255,255,0.04);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.08);transition:transform .28s,box-shadow .28s}
      .glassCard::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;border-top-left-radius:20px;border-top-right-radius:20px;background:linear-gradient(90deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1));opacity:0.12}
      .glassCard:hover{transform:translateY(-6px);box-shadow:0 40px 120px rgba(0,0,0,0.28),0 0 40px rgba(59,130,246,0.06)}
      .cardIcon{width:54px;height:54px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--purple),var(--blue));box-shadow:0 10px 40px rgba(37,99,235,0.06)}
      .cardTitle{font-weight:600}
      .cardDesc{font-size:13px;opacity:0.85}

      .leftFooter{font-size:15px;opacity:0.95;margin-bottom:20px}

      .rightPane{flex:0 0 42%;display:flex;align-items:center;justify-content:center;padding:64px}
      .glassPanel{position:relative;overflow:hidden;max-width:520px;width:100%;border-radius:28px;padding:44px 44px;background:linear-gradient(180deg, rgba(6,10,22,0.72), rgba(10,14,28,0.6));backdrop-filter:blur(100px);border:1.5px solid rgba(173,216,230,0.22);box-shadow:0 50px 140px rgba(2,6,23,0.6), 0 8px 30px rgba(37,99,235,0.06), inset 0 0 28px rgba(56,189,248,0.03), 0 0 0 1px rgba(255,255,255,0.04);color:#fff;transition:box-shadow .35s,transform .35s}
      .glassPanel::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 40%, rgba(255,255,255,0) 100%);opacity:0.45;pointer-events:none;mix-blend-mode:screen;filter:blur(6px)}
      .glassPanel::after{content:'';position:absolute;inset:-14%;background:radial-gradient(circle at 20% 20%, rgba(56,189,248,0.06), transparent 20%),radial-gradient(circle at 80% 80%, rgba(124,58,237,0.05), transparent 20%);opacity:0.26;pointer-events:none;animation:waterRipples 14s ease-in-out infinite}
      .glassPanel:hover{box-shadow:0 60px 180px rgba(2,6,23,0.7), 0 18px 60px rgba(37,99,235,0.12);transform:translateY(-4px)}
      .panelHeader{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:18px}
      @keyframes waterRipples{0%{transform:translate(0,0) scale(1)}50%{transform:translate(12px,-10px) scale(1.02)}100%{transform:translate(-8px,8px) scale(1)}}
      @keyframes pulseScale{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
      @keyframes headerFloat{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
      @keyframes shimmerMove{0%{left:-40%}70%{left:110%}100%{left:110%}}
      .headerCircle{width:104px;height:104px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top left, rgba(255,255,255,0.38), rgba(56,189,248,0.78) 18%, rgba(37,99,235,0.98) 55%, #071024 100%);border:1px solid rgba(255,255,255,0.22);box-shadow:0 0 120px rgba(56,189,248,0.32),0 28px 120px rgba(15,23,42,0.32), inset 0 0 0 1px rgba(255,255,255,0.14);position:relative;animation:pulseScale 3.6s ease-in-out infinite}
      .headerCircle::after{content:'';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:200px;height:200px;border-radius:50%;background:radial-gradient(circle, rgba(56,189,248,0.14), transparent 40%);filter:blur(22px);z-index:-1;opacity:0.95}

      .panelHeader{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:22px;position:relative;animation:headerFloat 6s ease-in-out infinite}
      .panelTitle{font-weight:800;font-size:24px;background:linear-gradient(90deg,#ffffff 0%, #FBBF24 40%, #EDE9FE 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 6px 30px rgba(124,58,237,0.10);position:relative;padding-bottom:4px}
      .panelTitle::after{content:'';display:block;width:68px;height:5px;border-radius:8px;background:linear-gradient(90deg,#FBBF24,#38bdf8);margin:8px auto 0;box-shadow:0 8px 24px rgba(247,191,36,0.14)}
      .panelSub{opacity:0.95;color:rgba(203,213,225,0.95);font-size:14px;letter-spacing:0.2px}

      .muiInput .MuiInputBase-root{height:58px;border-radius:16px;background:linear-gradient(180deg, rgba(7,12,25,0.72), rgba(7,15,33,0.82));border:1px solid rgba(255,255,255,0.04);box-shadow:inset 0 -6px 18px rgba(0,0,0,0.5)}
      .muiInput .MuiInputBase-root:hover{border-color:rgba(56,189,248,0.14)}
      .muiInput .Mui-focused{box-shadow:0 18px 50px rgba(56,189,248,0.10);border-color:rgba(56,189,248,0.36)}
      .adornmentCircle{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));display:flex;align-items:center;justify-content:center;margin-right:8px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.04);box-shadow:inset 0 -4px 12px rgba(0,0,0,0.45)}

      /* Premium custom inputs */
      .customInput{display:flex;align-items:center;gap:12px;background:linear-gradient(180deg, rgba(7,12,25,0.72), rgba(3,7,18,0.90));backdrop-filter:blur(20px);border-radius:14px;padding:10px 12px;border:1px solid rgba(56,189,248,0.06);transition:all .28s ease;box-shadow: inset 0 -6px 16px rgba(0,0,0,0.55)}
      .customInput:focus-within{transform:translateY(-1px);box-shadow:0 22px 70px rgba(56,189,248,0.08), 0 0 40px rgba(124,58,237,0.06);border:1px solid rgba(56,189,248,0.28)}
      .customInput input{background:transparent !important;border:none !important;outline:none !important;color:#fff !important;caret-color:#fff !important;box-shadow:none !important;appearance:none !important;-webkit-appearance:none !important;-moz-appearance:none !important;font-size:14px}
      .adornmentSquare{width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,rgba(124,58,237,0.26),rgba(56,189,248,0.14));display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(2,6,23,0.6);border:1px solid rgba(255,255,255,0.04)}
      .nativeInput{flex:1;background:transparent !important;border:none !important;outline:none !important;color:#fff !important;font-size:15px;height:42px;padding:6px 4px;caret-color:#fff !important;box-shadow:none !important;}
      .nativeInput::placeholder{color:rgba(203,213,225,0.6)}
      .customInput input::-webkit-text-fill-color{color:#fff !important}
      .customInput input:-webkit-autofill,
      .customInput input:-webkit-autofill:hover,
      .customInput input:-webkit-autofill:focus,
      .customInput input:-webkit-autofill:active {
        -webkit-text-fill-color: #fff !important;
        -webkit-box-shadow: 0 0 0px 1000px rgba(7,12,25,0.90) inset !important;
        box-shadow: 0 0 0px 1000px rgba(7,12,25,0.90) inset !important;
        background-color: transparent !important;
      }

      .submitBtn{position:relative;overflow:hidden;height:60px;border-radius:22px;font-weight:800;background:linear-gradient(90deg,#7C3AED 0%, #2563EB 100%);border:1px solid rgba(255,255,255,0.08);box-shadow:0 18px 60px rgba(37,99,235,0.16),0 8px 28px rgba(124,58,237,0.12),inset 0 -8px 26px rgba(0,0,0,0.5);text-shadow:0 1px 2px rgba(0,0,0,0.25);transition:transform .28s,box-shadow .28s,filter .28s;backdrop-filter:blur(6px)}
      .submitBtn::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));mix-blend-mode:overlay;pointer-events:none}
      .submitBtn::after{content:'';position:absolute;left:-40%;top:0;width:36%;height:100%;background:linear-gradient(90deg,rgba(255,255,255,0.24),rgba(255,255,255,0.02));transform:skewX(-18deg);transition:all .6s ease;opacity:1;animation:shimmerMove 1.6s linear infinite}
      .submitBtn:hover::after{left:110%}
      .submitBtn:hover{transform:translateY(-6px) scale(1.025);box-shadow:0 40px 120px rgba(37,99,235,0.22),0 14px 40px rgba(124,58,237,0.16);filter:brightness(1.06)}

      .sep{display:flex;align-items:center;gap:12px;margin:28px 0;color:#94a3b8}
      .sep hr{flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));border:none;box-shadow:inset 0 1px 0 rgba(255,255,255,0.02)}

      .glassAlt{padding:14px;border-radius:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border:1px solid rgba(255,255,255,0.04);display:flex;align-items:center;gap:10px}

      .glassPanel .MuiButton-root.MuiButton-outlined{border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:#fff;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.25);transition:all .28s}
      .glassPanel .MuiButton-root.MuiButton-outlined:hover{background:linear-gradient(90deg, rgba(56,189,248,0.06), rgba(124,58,237,0.04));border-color:rgba(56,189,248,0.18);box-shadow:0 12px 36px rgba(56,189,248,0.06)}

      .footerSecure{display:flex;align-items:center;gap:10px;justify-content:center;margin-top:18px;color:#94a3b8}

      input[type="checkbox"]{width:16px;height:16px;accent-color:#38bdf8}

      /* Premium social buttons */
      .socialBtnPremium{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:10px;background:linear-gradient(90deg, rgba(255,255,255,0.02), rgba(7,10,25,0.08));border:1px solid rgba(255,255,255,0.06);box-shadow:0 6px 14px rgba(0,0,0,0.48), inset 0 -1px 0 rgba(255,255,255,0.02);transition:transform .18s,box-shadow .18s,background .18s;color:#fff;font-weight:700;height:40px}
      .socialBtnPremium:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,0.5),0 4px 14px rgba(56,189,248,0.05);background:linear-gradient(90deg, rgba(56,189,248,0.03), rgba(124,58,237,0.015));border-color:rgba(56,189,248,0.12)}
      .socialIcon{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));box-shadow:0 4px 12px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.04);flex:0 0 auto}
      .socialIcon.google{background:#ffffff;width:28px;height:28px;border-radius:6px}
      .socialIcon.facebook{background:linear-gradient(135deg,#1877F2,#145DBF);width:28px;height:28px;border-radius:6px}
      .socialBtnText{flex:1;text-align:center;color:#fff;font-size:13px}

      @media (max-width:900px){
        .layout{flex-direction:column}
        .leftPane,.rightPane{flex:1 1 100%}
        .rightPane{padding:24px}
        .glassPanel{width:100%}
        .heroTitle{font-size:40px}
      }
      `}</style>

      <div className="bgLayer">
        <div className="radial1" />
        <div className="radial2" />
        <div className="radial3" />
        <div className="particles">
          {/* subtle, very few particle dots for premium feel */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="dot" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 40}s`, opacity: 0.12 + Math.random() * 0.6 }} />
          ))}
        </div>
      </div>

      <div className="layout">
        <motion.div className="rightPane" initial={{ x: 30, opacity: 0, scale: 0.98 }} animate={{ x: 0, opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <div className="glassPanel">
            <div className="panelHeader">
              <div className="headerCircle"><WorkspacePremium sx={{ color: '#FBBF24', fontSize: 40 }} /></div>
              <div className="panelTitle">Bienvenido</div>
              <div className="panelSub">Inicia sesión para continuar </div>
            </div>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            )}

            <form onSubmit={handleSubmit} autoComplete="off">
              <input type="text" name="hp" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="new-password" tabIndex={-1} style={{ display: 'none' }} aria-hidden="true" />

              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 200 }}>
                <div className="customInput" style={{ marginBottom: 16 }}>
                  <div className="adornmentSquare"><Email sx={{ color: '#fff' }} /></div>
                  <input
                    className="nativeInput"
                    name="user-email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="off"
                    type="email"
                    aria-label="Correo electrónico"
                  />
                </div>
              </motion.div>

              <motion.div whileFocus={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 200 }}>
                <div className="customInput" style={{ marginBottom: 18 }}>
                  <div className="adornmentSquare"><Lock sx={{ color: '#fff' }} /></div>
                  <input
                    className="nativeInput"
                    name="user-password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={handlePasswordChange}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-label="Contraseña"
                  />
                  <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(255,255,255,0.85)', ml: 1 }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </div>
              </motion.div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} id="remember" />
                  <label htmlFor="remember" style={{ color: '#CBD5E1' }}>Recordarme</label>
                </div>
                <button type="button" onClick={handleForgotPassword} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</button>
              </div>

              <div style={{ marginTop: 20 }}>
                <Button type="submit" disabled={loading || isLockedOut} className="submitBtn" fullWidth variant="contained" sx={{ height: '60px', borderRadius: '18px', textTransform: 'none', fontSize: 16 }}>
                  {loading ? 'Cargando...' : 'Iniciar sesión'}
                </Button>
              </div>

              <div className="sep">
                <hr />
                <div>o</div>
                <hr />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button onClick={handleGoogleLogin} className="socialBtnPremium" fullWidth sx={{ borderRadius: 12, textTransform: 'none', padding: 0, minHeight: '40px' }} disableRipple>
                  <span className="socialIcon google"><Google sx={{ color: '#4285F4', fontSize: 16 }} /></span>
                  <span className="socialBtnText">Continuar con Google</span>
                </Button>
                <Button onClick={handleFacebookLogin} className="socialBtnPremium" fullWidth sx={{ borderRadius: 12, textTransform: 'none', padding: 0, minHeight: '40px' }} disableRipple>
                  <span className="socialIcon facebook"><Facebook sx={{ color: '#fff', fontSize: 16 }} /></span>
                  <span className="socialBtnText">Continuar con Facebook</span>
                </Button>
              </div>

              <div className="footerSecure">
                <Lock sx={{ fontSize: 18, color: '#94a3b8' }} />
                <div>Acceso seguro y autorizado </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Box>
  )
}

export default Login
