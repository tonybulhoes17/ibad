'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function OneSignalInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const init = async () => {
      await window.OneSignalDeferred?.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: '084601a8-95d9-4382-8b21-e38a803b0e0a',
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          notifyButton: { enable: false },
          promptOptions: {
            slidedown: {
              prompts: [{
                type: 'push',
                autoPrompt: false,
              }]
            }
          }
        })
      })
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    script.onload = init
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    const linkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.User.addTag('user_id', user.id)
      })
    }
    linkUser()
  }, [])

  return null
}

declare global {
  interface Window {
    OneSignalDeferred: any[]
  }
}
