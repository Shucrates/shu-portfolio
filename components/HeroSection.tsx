'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import GifCanvas from './GifCanvas'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CHARS = 'KABOOM$%^!#*'

/** Returns a scramble-to-target animation controller */
function makeScramble(el: HTMLElement, target: string, duration = 0.3, fps = 15) {
  let raf: number | null = null
  let startTime: number | null = null
  let lastUpdate = 0
  const frameDelay = 1000 / fps

  function stop() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null }
  }

  function run() {
    stop()
    startTime = null

    function tick(now: number) {
      if (startTime === null) startTime = now
      
      const elapsed = now - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      // Only update the characters visually at the specified FPS
      if (now - lastUpdate > frameDelay || progress === 1) {
        lastUpdate = now

        // How many chars from the left are "locked in"
        const locked = Math.floor(progress * target.length)

        let display = ''
        for (let i = 0; i < target.length; i++) {
          if (target[i] === ' ') {
            display += ' '
          } else if (i < locked) {
            display += target[i]
          } else {
            display += CHARS[Math.floor(Math.random() * CHARS.length)]
          }
        }
        el.textContent = display
      }

      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        el.textContent = target
        raf = null
      }
    }

    raf = requestAnimationFrame(tick)
  }

  return { run, stop }
}

const TEXT_DEFAULT = 'SHUISBORED*'
const TEXT_HOVER   = 'SHUBHAM PATIL*'

export default function HeroSection() {
  const curtainTopRef   = useRef<HTMLDivElement>(null)
  const curtainBottomRef= useRef<HTMLDivElement>(null)
  const taglineRef      = useRef<HTMLParagraphElement>(null)
  const imageFrameRef   = useRef<HTMLDivElement>(null)
  const overlayRef      = useRef<HTMLDivElement>(null)
  const zoneRef         = useRef<HTMLDivElement>(null)
  const heroNameRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── 1. Tagline fade-up ───────────────────────────────
      // Starts lower (centered more towards the split) and moves up
      gsap.fromTo(
        taglineRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power4.inOut', delay: 1.5 }
      )

      // ── 2. Curtain reveal (load animation) ───────────────
      // Parting top to bottom after 1.5s delay
      gsap.to(curtainTopRef.current,    { y: '-100%', duration: 1.2, ease: 'power4.inOut', delay: 1.5 })
      gsap.to(curtainBottomRef.current, { y: '100%',  duration: 1.2, ease: 'power4.inOut', delay: 1.5 })

      // ── 3. Scroll-driven expansion ───────────────────────
      // The image frame lives inside the sticky inner.
      // GSAP animates: margin-left/right 32px→0, height 50vh→100vh
      // so it grows edge-to-edge and pins to viewport while expanding.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: zoneRef.current,
          start: 'top top',       // when the zone's top hits the viewport top
          end: 'bottom bottom',   // pin until the zone's bottom reaches viewport bottom
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      // Image frame: shrunk+margined → fullbleed
      tl.fromTo(
        imageFrameRef.current,
        { height: '50vh', marginLeft: 32, marginRight: 32 },
        { height: '100vh', marginLeft: 0, marginRight: 0, ease: 'none' },
        0
      )

      // About overlay background fades in
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'none', duration: 0.1 },
        0.55
      )

      // Statement lines animate up with stagger as we scroll
      const statementLines = gsap.utils.toArray('.statement-line', overlayRef.current)
      if (statementLines.length) {
        tl.fromTo(
          statementLines,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, ease: 'power3.out', stagger: 0.04, duration: 0.3 },
          0.6
        )
      }

      // Scroll arrow gently drops in at the end
      const scrollArrow = gsap.utils.toArray('.scroll-arrow', overlayRef.current)
      if (scrollArrow.length) {
        tl.fromTo(
          scrollArrow,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, ease: 'power3.out', duration: 0.15 },
          0.75
        )
      }

      // ── 4. Hero name: movement + scramble on load ──────────────────
      // Name starts higher (closer to the center split) and moves down
      gsap.fromTo(
        heroNameRef.current,
        { y: -150 },
        { y: 0, duration: 1.2, ease: 'power4.inOut', delay: 1.5 }
      )
      
      // Scramble happens slightly after the curtain begins to part
      gsap.delayedCall(1.8, () => {
        if (heroNameRef.current) {
          makeScramble(heroNameRef.current, TEXT_DEFAULT, 0.5, 12).run()
        }
      })
    })

    return () => ctx.revert()
  }, [])

  // ── Hover scramble handlers ────────────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    if (heroNameRef.current)
      makeScramble(heroNameRef.current, TEXT_HOVER, 0.3, 12).run()
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (heroNameRef.current)
      makeScramble(heroNameRef.current, TEXT_DEFAULT, 0.3, 12).run()
  }, [])

  return (
    <section className="hero-section" id="hero">

      {/* Tagline — normal flow, scrolls away */}
      <p className="hero-tagline" ref={taglineRef}>
        <em>SHUBHAM PATIL AKA </em><strong>SHUISBORED</strong>
        <em> IS A FREELANCE DEVELOPER SKILLED IN </em><strong>FRONTEND</strong>
        <em> DEVELOPMENT, </em><strong>GRAPHIC DESIGN</strong>
        <em> AND </em><strong>BRAND IDENTITY.</strong>
      </p>

      {/* ── Scroll zone: provides the 260vh of scroll distance ── */}
      <div className="hero-parallax-zone" ref={zoneRef}>

        {/* Sticky inner: stays visible while zone scrolls past */}
        <div className="hero-sticky-inner">

          {/*
            THE SINGLE hero image element.
            - Starts: height 50vh, margin 32px either side (page gutter)
            - Scroll drives it to: height 100vh, margin 0 (fullbleed)
            - Curtain panels reveal it on load
            - About overlay fades in once fullscreen
          */}
          <div className="hero-image-frame" ref={imageFrameRef}>
            <GifCanvas src="/blackbg.gif" idleTimeout={400} speed={6} />

            {/* Curtain reveal panels (z-index above image) */}
            <div className="curtain-top"    ref={curtainTopRef}    aria-hidden="true" />
            <div className="curtain-bottom" ref={curtainBottomRef} aria-hidden="true" />

            {/* About Me overlay — fades in when image is fullscreen */}
            <div className="parallax-overlay" ref={overlayRef} id="about" aria-label="About me">
              <div className="parallax-statement">
                <div className="statement-line">LESS NOISE. MORE INTENT.</div>
                <div className="statement-line">I DESIGN AND BUILD</div>
                <div className="statement-line">DIGITAL EXPERIENCES THAT</div>
                <div className="statement-line">JUST WORK.</div>
              </div>
              <div className="scroll-arrow" aria-hidden="true">
                <svg width="14" height="42" viewBox="0 0 14 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 0L7 40M7 40L1 34M7 40L13 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/*
            SHUISBORED* lives inside the sticky inner, below the image frame.
            In the initial viewport it appears under the 50vh image.
            As the image expands to 100vh it covers this text — no duplicate image needed.
          */}
          <div
            className="hero-name"
            ref={heroNameRef}
            aria-label="SHUISBORED*"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'default' }}
          >
            SHUISBORED*
          </div>

        </div>
      </div>
    </section>
  )
}
