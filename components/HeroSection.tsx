'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const curtainLeftRef  = useRef<HTMLDivElement>(null)
  const curtainRightRef = useRef<HTMLDivElement>(null)
  const taglineRef      = useRef<HTMLParagraphElement>(null)
  const imageFrameRef   = useRef<HTMLDivElement>(null)
  const overlayRef      = useRef<HTMLDivElement>(null)
  const zoneRef         = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── 1. Tagline fade-up ───────────────────────────────
      gsap.fromTo(
        taglineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      )

      // ── 2. Curtain reveal (load animation) ───────────────
      gsap.to(curtainLeftRef.current,  { x: '-100%', duration: 1.2, ease: 'power4.inOut', delay: 0.6 })
      gsap.to(curtainRightRef.current, { x: '100%',  duration: 1.2, ease: 'power4.inOut', delay: 0.6 })

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

      // About overlay: fades in when image is ~80% fullscreen
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, ease: 'none' },
        0.65
      )
    })

    return () => ctx.revert()
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/blackbg.gif"
              alt="Animated black background"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'rotate(90deg)',
                transformOrigin: 'center center',
              }}
            />

            {/* Curtain reveal panels (z-index above image) */}
            <div className="curtain-left"  ref={curtainLeftRef}  aria-hidden="true" />
            <div className="curtain-right" ref={curtainRightRef} aria-hidden="true" />

            {/* About Me overlay — fades in when image is fullscreen */}
            <div className="parallax-overlay" ref={overlayRef} id="about" aria-label="About me">
              <h2 className="parallax-about-title">ABOUT ME*</h2>
              <p className="parallax-about-bio">
                <em>SHUBHAM PATIL AKA </em><strong>SHUISBORED</strong>
                <em> IS A FREELANCE DEVELOPER SKILLED IN </em><strong>FRONTEND</strong>
                <em> DEVELOPMENT, </em><strong>GRAPHIC DESIGN</strong>
                <em> AND </em><strong>BRAND IDENTITY.</strong>
              </p>
            </div>
          </div>

          {/*
            SHUISBORED* lives inside the sticky inner, below the image frame.
            In the initial viewport it appears under the 50vh image.
            As the image expands to 100vh it covers this text — no duplicate image needed.
          */}
          <div className="hero-name" aria-label="SHUISBORED*">SHUISBORED*</div>

        </div>
      </div>
    </section>
  )
}
