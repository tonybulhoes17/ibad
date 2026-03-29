'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'

export default function PWAInstallBanner() {
  const [promptEvento, setPromptEvento] = useState<any>(null)
  const [mostrarAndroid, setMostrarAndroid] = useState(false)
  const [mostrarIOS, setMostrarIOS] = useState(false)

  useEffect(() => {
    // Já está instalado como PWA — não mostrar nada
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((window.navigator as any).standalone === true) return

    // Android — evento nativo do Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setPromptEvento(e)
      const dispensado = localStorage.getItem('pwa-android-dispensado')
      if (!dispensado) setMostrarAndroid(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // iOS Safari — instruções manuais
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
    if (isIOS && isSafari) {
      const dispensado = localStorage.getItem('pwa-ios-dispensado')
      if (!dispensado) setTimeout(() => setMostrarIOS(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  async function instalarAndroid() {
    if (!promptEvento) return
    promptEvento.prompt()
    const { outcome } = await promptEvento.userChoice
    if (outcome === 'accepted') localStorage.setItem('pwa-android-dispensado', 'true')
    setMostrarAndroid(false)
  }

  function dispensarAndroid() {
    localStorage.setItem('pwa-android-dispensado', 'true')
    setMostrarAndroid(false)
  }

  function dispensarIOS() {
    localStorage.setItem('pwa-ios-dispensado', 'true')
    setMostrarIOS(false)
  }

  // ── BANNER ANDROID ──
  if (mostrarAndroid) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <img src="/icons/icon-192.png" alt="AnestPrime" className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">Instalar AnestPrime</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Adicione à sua tela inicial para acesso rápido, mesmo sem internet.
              </p>
            </div>
            <button onClick={dispensarAndroid} className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={instalarAndroid}
              className="flex-1 bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-800 transition-colors">
              Instalar agora
            </button>
            <button onClick={dispensarAndroid}
              className="px-4 text-sm text-slate-500 hover:text-slate-700 font-medium">
              Agora não
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── BANNER IOS ──
  if (mostrarIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 max-w-md mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src="/icons/icon-192.png" alt="AnestPrime" className="w-12 h-12 rounded-xl" />
              <div>
                <p className="font-semibold text-slate-900 text-sm">Instalar AnestPrime</p>
                <p className="text-xs text-slate-500">Adicione ao iPhone</p>
              </div>
            </div>
            <button onClick={dispensarIOS} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            Para instalar o AnestPrime no seu iPhone, siga os passos:
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-slate-700">
                <strong>1.</strong> Toque no botão <strong>Compartilhar</strong> <span className="inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 font-bold text-[10px]">□↑</span> na barra inferior do Safari
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-700">
                <strong>2.</strong> Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>3.</strong> Toque em <strong>"Adicionar"</strong> no canto superior direito
              </p>
            </div>
          </div>

          <button onClick={dispensarIOS}
            className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600 font-medium py-2">
            Fechar
          </button>
        </div>
      </div>
    )
  }

  return null
}
