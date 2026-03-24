'use client'

import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

const SIDE_LINKS = ['HOME', 'WORK', 'SERVICES', 'ABOUT', 'CONTACT']
const SOCIALS    = ['INSTAGRAM', 'VIMEO', 'LINKEDIN', 'FACEBOOK']
const HREF: Record<string, string> = {
  HOME: '#hero', WORK: '#work', SERVICES: '#work', ABOUT: '#about', CONTACT: '#contact',
}

type NavState = 'transparent' | 'white' | 'dark'

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [navState, setNavState]   = useState<NavState>('transparent')
  const navStateRef               = useRef<NavState>('transparent')
  const menuRef                   = useRef<HTMLDivElement>(null)
  const sideLinksRef              = useRef<(HTMLAnchorElement | null)[]>([])
  const socialsRef                = useRef<HTMLDivElement>(null)
  const letsTalkMenuRef           = useRef<HTMLAnchorElement>(null)

  // ── Scroll-aware navbar state ──────────────────────────────────────────
  useEffect(() => {
    const apply = (state: NavState) => {
      if (state === navStateRef.current) return
      navStateRef.current = state
      setNavState(state)
    }

    const getNavState = (): NavState => {
      const scrollY = window.scrollY

      // At the very top → transparent, black text
      if (scrollY < 60) return 'transparent'

      // Find the parallax zone to calculate GSAP scroll progress
      const zoneEl = document.querySelector('.hero-parallax-zone') as HTMLElement | null
      if (zoneEl) {
        // Absolute top/bottom of the zone on the page
        const rect      = zoneEl.getBoundingClientRect()
        const zoneTop   = rect.top + scrollY
        const zoneHeight = rect.height            // 260vh
        const vh        = window.innerHeight

        // GSAP ScrollTrigger progress: 0 when zone top hits viewport top,
        // 1 when zone bottom hits viewport bottom → denominator = zoneHeight - vh
        const denominator = zoneHeight - vh
        const progress = denominator > 0
          ? (scrollY - zoneTop) / denominator
          : 0

        // Dark (transparent bg, white text) when image is ~70%+ fullscreen
        if (progress > 0.68 && progress < 1.05) return 'dark'
      }

      // Default: white bg, black text while scrolling content
      return 'white'
    }

    const onScroll = () => apply(getNavState())

    // Set initial state immediately on mount (in case loading ended mid-scroll)
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])


  // ── Side menu GSAP ────────────────────────────────────────────────────
  useEffect(() => {
    if (!menuRef.current) return
    if (menuOpen) {
      gsap.fromTo(menuRef.current, { x: '100%' }, { x: '0%', duration: 0.55, ease: 'power4.out' })
      gsap.fromTo(
        sideLinksRef.current.filter(Boolean),
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.07, delay: 0.2 }
      )
      gsap.fromTo(
        [socialsRef.current, letsTalkMenuRef.current],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.55 }
      )
    } else {
      gsap.to(menuRef.current, { x: '100%', duration: 0.38, ease: 'power4.in' })
    }
  }, [menuOpen])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  const isDark = navState === 'dark'

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className={`navbar navbar--${navState}`} role="navigation" aria-label="Main navigation">

        {/* Left */}
        <div className="nav-links-horizontal">
          <a href="#work"  id="nav-work">WORK</a>
          <a href="#about" id="nav-about">ABOUT</a>
        </div>

        {/* Centre: asterisk */}
        <div className="nav-center" aria-label="SHUISBORED logo">
          <svg
            id="nav-asterisk"
            width="44" height="44"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {[0, 60, 120].map((angle) => (
              <rect
                key={angle}
                x={50 - 13 / 2} y={50 - 48 / 2}
                width={13} height={48}
                rx={1}
                fill={isDark ? '#ffffff' : '#111111'}
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Right */}
        <div className="nav-right">
          <a href="#contact" className="nav-letstalk" id="nav-letstalk">LET&apos;S TALK</a>
          <button
            className="nav-menu"
            id="nav-menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            MENU
          </button>
        </div>
      </nav>

      {/* ── Side Menu ──────────────────────────────────────────────────── */}
      <div
        className="side-menu"
        ref={menuRef}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Site navigation"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Top: LET'S TALK + CLOSE */}
        <div className="side-menu-top">
          <a href="#contact" className="side-menu-letstalk" ref={letsTalkMenuRef} onClick={close}>
            LET&apos;S TALK
          </a>
          <button className="side-menu-close" onClick={close} aria-label="Close menu">CLOSE</button>
        </div>

        {/* Big nav links */}
        <nav className="side-menu-nav" aria-label="Side navigation">
          {SIDE_LINKS.map((label, i) => (
            <a
              key={label}
              href={HREF[label] || '#'}
              className="side-menu-link"
              ref={(el) => { sideLinksRef.current[i] = el }}
              onClick={close}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Socials */}
        <div className="side-menu-socials" ref={socialsRef}>
          <span className="side-menu-socials-label">SOCIALS:</span>
          {SOCIALS.map((s, i) => (
            <span key={s}>
              <a href="#" className="side-menu-social-link">{s}</a>
              {i < SOCIALS.length - 1 && <span className="side-menu-social-sep">,</span>}
            </span>
          ))}
        </div>
      </div>

      {menuOpen && <div className="side-menu-backdrop" onClick={close} aria-hidden="true" />}
    </>
  )
}
