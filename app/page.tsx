'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturedWork from '@/components/FeaturedWork'

export default function Home() {
  const [loadingDone, setLoadingDone] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  const handleLoadComplete = useCallback(() => {
    setLoadingDone(true)
  }, [])

  useEffect(() => {
    if (!loadingDone) return

    // Reveal main content
    if (mainRef.current) {
      mainRef.current.classList.add('visible')
    }

    // Animate the large loading asterisk flying up into the navbar
    // The loading-asterisk element is now hidden (faded out), but we animate
    // the nav asterisk from a large size/center-screen position into its normal position
    const navAst = document.getElementById('nav-asterisk')
    if (navAst) {
      gsap.fromTo(
        navAst,
        {
          scale: 6,
          y: 200,
          opacity: 0,
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          delay: 0.1,
        }
      )
    }
  }, [loadingDone])

  return (
    <>
      {/* Loading Screen */}
      {!loadingDone && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* Main Site */}
      <div ref={mainRef} className="main-content" id="main-content">
        {/* Navbar — only mounted after loading to guarantee it's invisible during load */}
        {loadingDone && <Navbar />}

        <main>
          <HeroSection />
          <FeaturedWork />
        </main>

        <footer className="site-footer" role="contentinfo">
          <span className="footer-copy">© 2024 Shubham Patil</span>
          <span className="footer-brand">SHUISBORED*</span>
        </footer>
      </div>
    </>
  )
}
