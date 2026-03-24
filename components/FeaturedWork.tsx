'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  { name: 'CODE VISUALIZER', number: '01' },
  { name: 'PROJECT TWO', number: '02' },
  { name: 'AUTOPHARMA X', number: '03' },
  { name: 'RANDOM GEN', number: '04' },
]

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animate in
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          },
        }
      )

      // Stagger project rows
      rowsRef.current.forEach((row, i) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.1,
            scrollTrigger: {
              trigger: row,
              start: 'top 88%',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="featured-work" id="work" ref={sectionRef} aria-labelledby="featured-work-heading">
      <div className="featured-work-header" ref={headerRef} style={{ opacity: 0 }}>
        <h2 className="featured-work-label" id="featured-work-heading">FEATURED WORK</h2>
        <a href="#" className="featured-work-cta" id="check-all-work-link">CHECK ALL WORK →</a>
      </div>

      <ul className="projects-list" role="list">
        {PROJECTS.map((project, i) => (
          <li
            key={project.number}
            className="project-row"
            ref={(el) => { rowsRef.current[i] = el }}
            style={{ opacity: 0 }}
            id={`project-row-${project.number}`}
            role="listitem"
            tabIndex={0}
            aria-label={`${project.name} — project ${project.number}`}
          >
            <span className="project-name">{project.name}</span>
            <span className="project-number">{project.number}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
