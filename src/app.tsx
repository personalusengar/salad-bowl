import { useState, useRef, useEffect } from 'react'

// Palette — warm sage, soft coral, cream
const C = {
  olive: '#3E6B48', oliveL: '#5A8F65',
  terra: '#E07A5F', terraL: '#F09A82',
  sand: '#F2E8DB', ink: '#2C2825',
  saffron: '#CC8B3C', saffronL: '#EDBA5E',
  teal: '#3A7D72', tealL: '#58A899',
  bg: '#FDFBF7', white: '#FFFFFF', cream: '#FFF7ED',
}

// Types
interface Module {
  id: string; title: string; description: string; videoUrl: string
  durationMinutes: number; ageLevel: string; contentType: string
  caselTags: string[]; energyLevel: string; learningGoals: string[]
  reflectionPrompt: string; isPublished: boolean; isPremium: boolean
}
interface Progress { id: string; moduleId: string; groupName: string; completed: boolean; timeWatchedEstimate: number; createdAt: Date }
interface Feedback { id: string; message: string; emotionalState: string | null; createdAt: Date }
interface TeamInterest { id: string; name: string; email: string; role: string; organization: string; contribution: string; excitement: string; skills: string; wantsUpdates: boolean; phone: string; createdAt: Date }
interface TeamPerson { name: string; title: string; emoji: string; image?: string; subtitles?: string[] }
interface ChatMsg { role: 'user' | 'assistant'; text: string; modules?: Module[] }

// Team Data
const TEAM_SECTIONS: { label: string; color: string; people: TeamPerson[] }[] = [
  {
    label: 'Founding Team', color: C.olive, people: [
      { name: 'Akriti Asthana', title: 'Founder', emoji: '\u{1F33F}', image: '/akriti.png', subtitles: ['Former Fellow, American Red Cross', 'Former Alumni Specialist, Marketing, BCG'] },
      { name: 'Urvi Sengar', title: 'Technical Lead', emoji: '\u{1F4BB}', image: '/urvi.jpeg', subtitles: ['Senior Software Engineer (AI/ML), Microsoft'] },
      { name: 'Lav Kanoi', title: 'Strategic Advisor', emoji: '\u{1F393}', image: '/lav.jpg', subtitles: ['PhD, Yale University', 'Former Management Consultant, BCG'] },
    ],
  },
  {
    label: 'Program & Pilot Partners', color: C.teal, people: [
      { name: 'Siddheshwar Singh', title: 'Certified Yoga Instructor', emoji: '\u{1F9D8}', image: '/siddheshwar.png', subtitles: ['Content Creator'] },
      { name: 'Media For Change', title: 'Pilot Partner - Ocean College', emoji: '\u{1F3AC}', image: '/media-for-change.png' },
      { name: 'Montgomery County Public Schools', title: 'Pilot Partner - Harmony Hills Elementary School', emoji: '\u{1F3EB}' },
      { name: 'Village of Friendship Heights', title: 'Pilot Partner - Friendship Heights Community Center', emoji: '\u{1F3D8}' },
    ],
  },
  {
    label: 'Institutional Support', color: C.saffron, people: [
      { name: 'Arizona State University', title: 'Institutional Partner', emoji: '\u{1F393}', image: '/asu.png', subtitles: ['The Difference Engine'] },
    ],
  },
]

// Seed Data
const SEED_MODULES: Module[] = [
  { id:'m1', title:'Winter Yoga: Stillness & Breath', description:'A 30-minute guided yoga session focused on stillness and breath awareness. Perfect for calming winter energy and centering before a school day.', videoUrl:'https://www.youtube.com/embed/v7AYKMP6rOE', durationMinutes:30, ageLevel:'middle', contentType:'skill_journey', caselTags:['Self-Management','Self-Awareness'], energyLevel:'calm', learningGoals:['Develop breath awareness','Practice body stillness','Build self-regulation skills'], reflectionPrompt:'What did you notice about your breathing during this practice?', isPublished:true, isPremium:false },
  { id:'m2', title:'Winter Yoga: Grounding Flow', description:'A grounding yoga flow to reconnect with the present moment and release tension held in the body during winter months.', videoUrl:'https://www.youtube.com/embed/4pKly2JojMw', durationMinutes:30, ageLevel:'middle', contentType:'skill_journey', caselTags:['Self-Management','Self-Awareness'], energyLevel:'calm', learningGoals:['Practice grounding postures','Release physical tension','Strengthen body awareness'], reflectionPrompt:'Where did you feel the most tension leaving your body?', isPublished:true, isPremium:false },
  { id:'m3', title:'Winter Yoga: Restorative Rest', description:'A restorative session emphasizing rest and recovery, using supportive poses to cultivate inner quiet and emotional regulation.', videoUrl:'https://www.youtube.com/embed/BiWDsfZ3zbo', durationMinutes:30, ageLevel:'high', contentType:'skill_journey', caselTags:['Self-Management','Self-Awareness'], energyLevel:'calm', learningGoals:['Explore restorative postures','Cultivate stillness','Practice emotional awareness'], reflectionPrompt:'How did resting in stillness feel? What emotions came up?', isPublished:true, isPremium:false },
  { id:'m4', title:'Winter Yoga: Mindful Movement', description:'The final session of the Winter Wellbeing Pilot - a mindful movement flow to integrate learning and close with intention.', videoUrl:'https://www.youtube.com/embed/9kOo_0SHqNw', durationMinutes:30, ageLevel:'elementary', contentType:'skill_journey', caselTags:['Self-Management','Self-Awareness'], energyLevel:'calm', learningGoals:['Connect movement with breath','Practice mindful transitions','Integrate self-awareness tools'], reflectionPrompt:'What is one thing you will carry from this practice into your week?', isPublished:true, isPremium:false },
  { id:'m5', title:'5-Minute Focus Reset', description:'A quick skill to restore focus and calm between classes. Uses breath and grounding to transition your nervous system.', videoUrl:'https://www.youtube.com/embed/inpok4MKVLM', durationMinutes:5, ageLevel:'middle', contentType:'quick_skill', caselTags:['Self-Management'], energyLevel:'focused', learningGoals:['Reset focus quickly','Practice brief breath exercises','Use body awareness for transitions'], reflectionPrompt:'How focused do you feel now compared to before?', isPublished:true, isPremium:false },
  { id:'m6', title:'Shaking It Out: Energy Release', description:'A quick, energizing movement break to shake off excess energy and return to productive focus.', videoUrl:'https://www.youtube.com/embed/a31QLHPW8Q0', durationMinutes:8, ageLevel:'elementary', contentType:'quick_skill', caselTags:['Self-Management','Social Awareness'], energyLevel:'active', learningGoals:['Release excess energy mindfully','Practice body regulation','Build community through movement'], reflectionPrompt:'How does your body feel after shaking it out?', isPublished:true, isPremium:false },
  { id:'m7', title:'The Talking Circle: Indigenous Listening', description:'Explore the tradition of talking circles as a cultural practice of deep listening and respectful dialogue.', videoUrl:'https://www.youtube.com/embed/placeholder', durationMinutes:20, ageLevel:'high', contentType:'cultural_moment', caselTags:['Social Awareness','Relationship Skills'], energyLevel:'calm', learningGoals:['Learn about talking circle traditions','Practice deep listening','Honor Indigenous communication practices'], reflectionPrompt:'What would change in your school if you used talking circles regularly?', isPublished:true, isPremium:true },
  { id:'m8', title:'Ubuntu: I Am Because We Are', description:'A cultural exploration of the Ubuntu philosophy from Southern Africa and its applications in building community in schools.', videoUrl:'https://www.youtube.com/embed/placeholder', durationMinutes:15, ageLevel:'middle', contentType:'cultural_moment', caselTags:['Social Awareness','Relationship Skills','Responsible Decision-Making'], energyLevel:'focused', learningGoals:['Understand Ubuntu philosophy','Apply communal thinking to daily life','Reflect on interdependence'], reflectionPrompt:'How does Ubuntu change the way you think about your actions?', isPublished:true, isPremium:true },
]

const SEED_JOURNEYS = [
  { id:'j1', title:'Winter Wellbeing Pilot', description:'A 4-session yoga journey to cultivate calm, self-awareness, and grounded presence through the winter months.', orderedModuleIds:['m1','m2','m3','m4'] },
]

// In-memory store
let _progress: Progress[] = []
let _feedback: Feedback[] = []
let _teamInterest: TeamInterest[] = []
let _modules: Module[] = [...SEED_MODULES]

// Scroll reveal hook
const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)' } as React.CSSProperties }
}

// Global styles
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${C.bg};color:${C.ink};font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
  h1,h2,h3,h4,h5{font-family:'Playfair Display',Georgia,serif}
  ::selection{background:${C.saffron}44}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${C.olive}40;border-radius:99px}
  button{cursor:pointer;font-family:'Inter',sans-serif}
  textarea,input,select{font-family:'Inter',sans-serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float1{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(20px,-30px) rotate(8deg)}}
  @keyframes float2{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-25px,20px) rotate(-6deg)}}
  @keyframes float3{0%,100%{transform:translate(0,0)}50%{transform:translate(15px,25px)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
  @keyframes gradientMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes dotBlink{0%,100%{opacity:0.3}50%{opacity:1}}
  .fade-up{animation:fadeUp 0.65s cubic-bezier(.22,1,.36,1) forwards}
  .card-hover{transition:transform 0.3s cubic-bezier(.22,1,.36,1),box-shadow 0.3s ease}
  .card-hover:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 20px 48px rgba(0,0,0,0.12)}
  .btn-primary{background:linear-gradient(135deg,${C.terra},${C.terraL});color:white;border:none;padding:14px 32px;border-radius:60px;font-weight:600;font-size:0.95rem;letter-spacing:0.3px;transition:all 0.3s;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 16px ${C.terra}44;position:relative;overflow:hidden}
  .btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);background-size:200% 100%;animation:shimmer 3s infinite}
  .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px ${C.terra}55;filter:brightness(1.08)}
  .btn-secondary{background:transparent;color:${C.olive};border:2px solid ${C.olive};padding:12px 28px;border-radius:60px;font-weight:600;font-size:0.95rem;transition:all 0.3s;display:inline-flex;align-items:center;gap:8px}
  .btn-secondary:hover{background:${C.olive};color:white;box-shadow:0 4px 16px ${C.olive}33}
  .btn-ghost{background:transparent;color:${C.teal};border:none;padding:8px 18px;border-radius:10px;font-weight:500;transition:all 0.2s}
  .btn-ghost:hover{background:${C.teal}14}
  .tag{display:inline-block;padding:4px 14px;border-radius:99px;font-size:0.73rem;font-weight:700;letter-spacing:0.6px;text-transform:uppercase}
  .tag-olive{background:${C.olive}16;color:${C.olive}}
  .tag-terra{background:${C.terra}16;color:${C.terra}}
  .tag-teal{background:${C.teal}16;color:${C.teal}}
  .tag-saffron{background:${C.saffron}22;color:#7a5a00}
  .input-field{width:100%;padding:14px 18px;border-radius:14px;border:2px solid ${C.sand};background:white;font-size:1rem;color:${C.ink};outline:none;transition:border 0.3s,box-shadow 0.3s}
  .input-field:focus{border-color:${C.teal};box-shadow:0 0 0 4px ${C.teal}18}
  .filter-select{padding:10px 36px 10px 14px;border-radius:12px;border:1.5px solid ${C.sand};background:white;font-size:0.88rem;color:${C.ink};outline:none;transition:border 0.3s;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;cursor:pointer;min-width:140px}
  .filter-select:focus{border-color:${C.teal}}
  .select-field{width:100%;padding:12px 18px;border-radius:14px;border:2px solid ${C.sand};background:white;font-size:0.95rem;color:${C.ink};outline:none;transition:border 0.3s;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
  .section{padding:80px 0}
  .container{max-width:1200px;margin:0 auto;padding:0 28px}
  .nav-link{padding:8px 16px;border-radius:10px;font-weight:500;font-size:0.92rem;transition:all 0.25s;color:${C.ink}cc;background:none;border:none;position:relative}
  .nav-link:hover{background:${C.olive}0c;color:${C.ink}}
  .nav-link.active{color:${C.terra};font-weight:700}
  .nav-link.active::after{content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:16px;height:3px;background:${C.terra};border-radius:99px}
  .page-header{background:linear-gradient(135deg,${C.olive} 0%,${C.teal} 100%);color:white;padding:80px 24px 64px;text-align:center;position:relative;overflow:hidden}
  .page-header::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 40%,rgba(255,255,255,0.08) 0%,transparent 60%),radial-gradient(circle at 80% 70%,rgba(255,255,255,0.06) 0%,transparent 50%)}
  .page-header h1{font-size:clamp(2rem,4.5vw,3.2rem);margin-bottom:14px;position:relative}
  .page-header p{font-size:1.1rem;opacity:0.88;max-width:540px;margin:0 auto;position:relative;line-height:1.6}
  .glass-card{background:rgba(255,255,255,0.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.5);box-shadow:0 8px 32px rgba(0,0,0,0.06)}

  /* Mobile Responsive */
  @media(max-width:768px){
    .container{padding:0 16px}
    .section{padding:48px 0}
    .page-header{padding:56px 16px 44px}
    .page-header h1{font-size:1.8rem}
    .page-header p{font-size:0.95rem}
    .nav-inner{flex-direction:column;height:auto!important;padding:10px 0;gap:4px!important}
    .nav-links-wrap{width:100%;justify-content:center!important;gap:0!important}
    .nav-link{padding:8px 14px;font-size:0.92rem}
    .hero-stats{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}
    .library-filters{flex-direction:column;align-items:stretch!important}
    .library-filters .filter-select{width:100%;min-width:0}
    .library-cols{grid-template-columns:1fr!important}
    .plans-grid{grid-template-columns:1fr!important}
    .build-cols{grid-template-columns:1fr!important}
    .form-grid-2{grid-template-columns:1fr!important}
    .dash-stats-4{grid-template-columns:repeat(2,1fr)!important}
    .dash-grid-2{grid-template-columns:1fr!important}
    .footer-inner{flex-direction:column;text-align:center;gap:28px!important}
    .footer-links{justify-content:center}
    .why-grid{grid-template-columns:1fr!important}
    .team-cards-grid{flex-direction:column}
    .build-form-wrap{padding:28px 20px!important}
    .build-card{padding:28px 20px 24px!important}
    .ask-header{padding:16px!important}
    .ask-input-wrap{padding:12px 16px!important}
    .ask-input-inner{flex-direction:row;gap:8px}
    .chat-area{padding:16px!important}
  }
  @media(max-width:480px){
    .hero-stats{grid-template-columns:1fr 1fr!important}
    .nav-link{padding:7px 12px;font-size:0.88rem}
    .build-cols{gap:16px!important}
    .build-card{padding:24px 16px 20px!important}
  }
`

// Logo
const Logo = ({ size = 48 }: { size?: number }) => (
  <img src="/logo.jpeg" alt="Salad Bowl" style={{
    width: size, height: size, borderRadius: '50%', objectFit: 'cover',
    border: `2px solid ${C.olive}20`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }} />
)

// Nav - simplified: Home, Plans, Ask (conversational AI), Connect, Our Team
type Role = 'public' | 'teacher' | 'admin'
const Nav = ({ page, setPage, role, setRole, teamRef }: {
  page: string; setPage: (p: string) => void
  role: Role; setRole: (r: Role) => void
  teamRef: React.RefObject<HTMLDivElement>
}) => {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  const scrollToTeam = () => {
    setPage('home')
    setTimeout(() => teamRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? C.sand : 'transparent'}`,
      transition: 'all 0.35s ease',
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
    }}>
      <div className="container nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setPage('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none' }}>
          <Logo size={38} />
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1.3rem', color: C.olive, letterSpacing: '-0.3px' }}>Salad Bowl</span>
        </button>
        <div className="nav-links-wrap" style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {([['home', 'Home'], ['ask', 'Guide Me'], ['plans', 'Plans'], ['connect', 'Build With Us']] as [string, string][]).map(([p, label]) => (
            <button key={p} className={`nav-link ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{label}</button>
          ))}
          <button className="nav-link" onClick={scrollToTeam} style={{ color: C.teal, fontWeight: 600 }}>Our Team</button>
          {(role === 'teacher' || role === 'admin') && (
            <button className={`nav-link ${page === 'teacher' ? 'active' : ''}`} onClick={() => setPage('teacher')}>Dashboard</button>
          )}
          {role === 'admin' && (
            <button className={`nav-link ${page === 'admin' ? 'active' : ''}`} onClick={() => setPage('admin')}>Admin</button>
          )}
          <select className="filter-select" style={{ marginLeft: 12, minWidth: 'auto', padding: '6px 30px 6px 12px', fontSize: '0.82rem', fontWeight: 600, borderRadius: 99 }}
            value={role} onChange={e => setRole(e.target.value as Role)}>
            <option value="public">Public</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </nav>
  )
}

// Team Section
const TeamSection = ({ teamRef }: { teamRef: React.RefObject<HTMLDivElement> }) => {
  const reveal = useReveal()

  const Avatar = ({ person, color, size = 56 }: { person: TeamPerson; color: string; size?: number }) => (
    person.image ? (
      <img src={person.image} alt={person.name} style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        border: `2px solid ${color}30`, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', flexShrink: 0,
      }} />
    ) : (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg,${color}20,${color}10)`,
        border: `2px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 800, color, flexShrink: 0,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        {person.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
    )
  )

  const PersonCard = ({ person, color }: { person: TeamPerson; color: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
      background: C.white, borderRadius: 16, border: `1px solid ${C.sand}`,
      boxShadow: '0 1px 6px rgba(0,0,0,0.03)', transition: 'box-shadow 0.25s',
      flex: '1 1 280px', maxWidth: 400,
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.03)'}>
      <Avatar person={person} color={color} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.92rem', fontWeight: 700, color: C.ink, lineHeight: 1.3, marginBottom: 3 }}>{person.name}</p>
        <p style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>{person.title}</p>
        {person.subtitles?.map((s, i) => (
          <p key={i} style={{ fontSize: '0.74rem', color: '#aaa', lineHeight: 1.4 }}>{s}</p>
        ))}
      </div>
    </div>
  )

  return (
    <div ref={teamRef} style={{ background: `linear-gradient(180deg,${C.bg},${C.cream})`, borderTop: `1px solid ${C.sand}`, padding: '72px 24px 64px' }}>
      <div ref={reveal.ref} style={{ maxWidth: 960, margin: '0 auto', ...reveal.style }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 99, background: `${C.terra}12`, color: C.terra, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>Our Team</div>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: C.ink, lineHeight: 1.2 }}>The people behind Salad Bowl</h2>
        </div>

        {TEAM_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: si < TEAM_SECTIONS.length - 1 ? 44 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 4, height: 24, borderRadius: 4, background: section.color }} />
              <h3 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: section.color }}>{section.label}</h3>
            </div>
            <div className="team-cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {section.people.map(p => <PersonCard key={p.name} person={p} color={section.color} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Module helpers
const TYPE_LABEL: Record<string, string> = { quick_skill: 'Quick Skill', skill_journey: 'Skill Journey', cultural_moment: 'Cultural Moment' }
const TYPE_COLOR: Record<string, string> = { quick_skill: 'terra', skill_journey: 'olive', cultural_moment: 'teal' }
const TYPE_GRADIENT: Record<string, string> = {
  quick_skill: `linear-gradient(135deg,${C.terra},${C.terraL})`,
  skill_journey: `linear-gradient(135deg,${C.olive},${C.oliveL})`,
  cultural_moment: `linear-gradient(135deg,${C.teal},${C.tealL})`,
}

const ModuleCard = ({ mod, onClick, completed }: { mod: Module; onClick: (m: Module) => void; completed: boolean }) => (
  <div className="card-hover" onClick={() => onClick(mod)} style={{
    background: C.white, borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
    border: `1px solid ${C.sand}`, position: 'relative', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  }}>
    <div style={{ height: 5, background: TYPE_GRADIENT[mod.contentType] || C.terra }} />
    {completed && <div style={{ position: 'absolute', top: 14, right: 14, background: `linear-gradient(135deg,${C.olive},${C.oliveL})`, color: 'white', borderRadius: '99px', padding: '3px 12px', fontSize: '0.73rem', fontWeight: 700, boxShadow: `0 2px 8px ${C.olive}33` }}>Done</div>}
    {mod.isPremium && <div style={{ position: 'absolute', top: completed ? 40 : 14, right: 14, background: `linear-gradient(135deg,${C.saffron},${C.saffronL})`, color: 'white', borderRadius: '99px', padding: '3px 12px', fontSize: '0.73rem', fontWeight: 700 }}>Garden</div>}
    <div style={{ padding: '22px 24px 26px' }}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={`tag tag-${TYPE_COLOR[mod.contentType]}`}>{TYPE_LABEL[mod.contentType]}</span>
        <span className="tag tag-saffron">{mod.ageLevel}</span>
      </div>
      <h3 style={{ fontSize: '1.08rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.4, color: C.ink }}>{mod.title}</h3>
      <p style={{ fontSize: '0.88rem', color: '#777', lineHeight: 1.7, marginBottom: 16 }}>{mod.description.slice(0, 110)}...</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.82rem', color: '#999' }}>
        <span>{mod.durationMinutes} min</span>
        <span style={{ width: 1, height: 12, background: C.sand }} />
        <span>{mod.energyLevel}</span>
      </div>
    </div>
  </div>
)

// Stats badge for hero
const StatBadge = ({ num, label, delay }: { num: string; label: string; delay: number }) => (
  <div style={{
    background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, padding: '18px 28px', textAlign: 'center',
    animation: `fadeUp 0.6s ${delay}s cubic-bezier(.22,1,.36,1) both`,
  }}>
    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 900, marginBottom: 2 }}>{num}</div>
    <div style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 500, letterSpacing: '0.5px' }}>{label}</div>
  </div>
)

// Home Page (IS the library - no separate library page)
const HomePage = ({ setPage, setCurrentModule, teamRef }: {
  setPage: (p: string) => void
  setCurrentModule: (m: Module) => void
  teamRef: React.RefObject<HTMLDivElement>
}) => {
  const [ageFilter, setAgeFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [durFilter, setDurFilter] = useState('all')
  const completedIds = _progress.filter(p => p.completed).map(p => p.moduleId)
  const libraryReveal = useReveal()

  const filtered = _modules.filter(m => m.isPublished).filter(m => {
    if (ageFilter !== 'all' && m.ageLevel !== ageFilter) return false
    if (typeFilter !== 'all' && m.contentType !== typeFilter) return false
    if (durFilter === 'short' && m.durationMinutes > 15) return false
    if (durFilter === 'long' && m.durationMinutes <= 15) return false
    return true
  })

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(155deg,${C.olive} 0%,${C.teal} 50%,${C.olive}dd 100%)`,
        backgroundSize: '400% 400%', animation: 'gradientMove 12s ease infinite',
        padding: '100px 24px 80px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden',
        minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '8%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', animation: 'float1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 160, height: 160, borderRadius: '30%', background: 'rgba(255,255,255,0.03)', animation: 'float2 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '50%', left: '60%', width: 120, height: 120, borderRadius: '50%', background: `${C.saffron}10`, animation: 'float3 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle,white 1.2px,transparent 1.2px)', backgroundSize: '40px 40px' }} />

        <div style={{ position: 'relative', maxWidth: 740 }}>
          <div style={{ animation: 'fadeUp 0.6s cubic-bezier(.22,1,.36,1) both' }}><Logo size={80} /></div>
          <h1 style={{ fontSize: 'clamp(2.6rem,6vw,4.2rem)', margin: '24px 0 16px', lineHeight: 1.1, fontWeight: 900, letterSpacing: '-1px', animation: 'fadeUp 0.6s 0.1s cubic-bezier(.22,1,.36,1) both' }}>
            Salad Bowl
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.25rem)', opacity: 0.9, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 300, animation: 'fadeUp 0.6s 0.2s cubic-bezier(.22,1,.36,1) both' }}>
            A cultural wellness studio for schools - mindfulness, movement, and community rooted in social-emotional learning.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.3s cubic-bezier(.22,1,.36,1) both' }}>
            <button className="btn-primary" onClick={() => setPage('ask')} style={{ background: `linear-gradient(135deg,${C.saffron},${C.saffronL})`, color: C.ink, fontWeight: 700, padding: '16px 36px', fontSize: '1rem', boxShadow: `0 4px 20px ${C.saffron}55` }}>
              Guide Me
            </button>
            <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} onClick={() => setPage('plans')}>
              View Plans
            </button>
          </div>
          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,auto)', gap: 16, justifyContent: 'center', marginTop: 56 }}>
            <StatBadge num={`${_modules.filter(m => m.isPublished).length}`} label="Modules" delay={0.5} />
            <StatBadge num="4" label="Session Journey" delay={0.6} />
            <StatBadge num="5" label="CASEL Tags" delay={0.7} />
            <StatBadge num="K-12" label="Age Levels" delay={0.8} />
          </div>
        </div>
      </div>

      {/* Filter + Library */}
      <div className="container" style={{ paddingTop: 56 }}>
        <div ref={libraryReveal.ref} style={libraryReveal.style}>
          <div className="library-filters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontSize: '1.8rem', color: C.ink }}>Content Library</h2>
            {/* Clean dropdown filters */}
            <div className="library-filters" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="filter-select" value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
                <option value="all">All Ages</option>
                <option value="elementary">Elementary</option>
                <option value="middle">Middle School</option>
                <option value="high">High School</option>
              </select>
              <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                <option value="quick_skill">Quick Skills</option>
                <option value="skill_journey">Skill Journeys</option>
                <option value="cultural_moment">Cultural Moments</option>
              </select>
              <select className="filter-select" value={durFilter} onChange={e => setDurFilter(e.target.value)}>
                <option value="all">Any Duration</option>
                <option value="short">15 min or less</option>
                <option value="long">Over 15 min</option>
              </select>
              {(ageFilter !== 'all' || typeFilter !== 'all' || durFilter !== 'all') && (
                <button onClick={() => { setAgeFilter('all'); setTypeFilter('all'); setDurFilter('all') }}
                  style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: `${C.terra}14`, color: C.terra, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Organized by category — vertical columns */}
        {(() => {
          const sections: { type: string; icon: string; label: string; desc: string; color: string; gradient: string }[] = [
            { type: 'quick_skill', icon: '\u26A1', label: 'Quick Skills', desc: 'Short practices for transitions and resets.', color: C.terra, gradient: `linear-gradient(135deg,${C.terra}10,${C.terraL}08)` },
            { type: 'skill_journey', icon: '\u{1F9D8}', label: 'Skill Journeys', desc: 'Multi-session deep dives into movement and breath.', color: C.olive, gradient: `linear-gradient(135deg,${C.olive}10,${C.oliveL}08)` },
            { type: 'cultural_moment', icon: '\u{1F30D}', label: 'Cultural Moments', desc: 'Practices rooted in diverse traditions.', color: C.teal, gradient: `linear-gradient(135deg,${C.teal}10,${C.tealL}08)` },
          ]
          const visibleSections = typeFilter === 'all' ? sections : sections.filter(s => s.type === typeFilter)
          const cols = visibleSections.map(sec => ({ ...sec, mods: filtered.filter(m => m.contentType === sec.type) })).filter(s => s.mods.length > 0)
          if (cols.length === 0) return (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#bbb' }}>
              <p style={{ fontSize: '1.05rem' }}>No modules match these filters.</p>
            </div>
          )
          return (
            <div className="library-cols" style={{
              display: 'grid',
              gridTemplateColumns: cols.length === 1 ? '1fr' : `repeat(${cols.length},1fr)`,
              gap: 28, alignItems: 'start',
            }}>
              {cols.map(sec => (
                <div key={sec.type} style={{
                  background: C.white, borderRadius: 22, border: `1px solid ${C.sand}`,
                  overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                }}>
                  {/* Column header */}
                  <div style={{
                    padding: '24px 24px 20px', borderBottom: `1px solid ${C.sand}`,
                    background: sec.gradient,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: `${sec.color}14`, border: `1.5px solid ${sec.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                      }}>{sec.icon}</div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', color: C.ink, fontWeight: 700, lineHeight: 1.2 }}>{sec.label}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{sec.desc}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: sec.color, background: `${sec.color}12`, padding: '3px 12px', borderRadius: 99 }}>
                      {sec.mods.length} module{sec.mods.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Stacked cards */}
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {sec.mods.map((m, i) => (
                      <div key={m.id} style={{ animation: `fadeUp 0.5s ${i * 0.08}s cubic-bezier(.22,1,.36,1) both` }}>
                        <ModuleCard mod={m} onClick={mod => { setCurrentModule(mod); setPage('module') }} completed={completedIds.includes(m.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
        <div style={{ paddingBottom: 60 }} />
      </div>

      <WhySection />
      <TeamSection teamRef={teamRef} />
    </div>
  )
}

// Why Section
const WhySection = () => {
  const reveal = useReveal()
  const features = [
    { icon: '\u{1F9D8}', title: 'Rooted in SEL', desc: 'Every module maps to CASEL competencies - self-awareness, self-management, social awareness, relationship skills, and responsible decision-making.' },
    { icon: '\u{1F30D}', title: 'Culturally Sustaining', desc: 'Content honoring diverse cultural traditions - from Ubuntu to Indigenous listening circles - so every student sees themselves reflected.' },
    { icon: '\u{26A1}', title: 'Flexible & Fast', desc: 'From 5-minute energy resets to 30-minute deep journeys, find practices that fit your schedule and your students\' needs.' },
    { icon: '\u{1F4CA}', title: 'Data You Can Use', desc: 'Track completions, engagement patterns, and emotional pulse - delivered in clean dashboards for teachers and administrators.' },
  ]
  return (
    <div style={{ background: `linear-gradient(180deg,${C.cream},${C.bg})`, padding: '80px 0' }}>
      <div className="container" ref={reveal.ref} style={reveal.style}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 99, background: `${C.terra}12`, color: C.terra, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>Why Salad Bowl</div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: C.ink, maxWidth: 560, margin: '0 auto', lineHeight: 1.2 }}>
            Whole-child wellbeing, designed for real classrooms
          </h2>
        </div>
        <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className="card-hover" style={{
              background: C.white, borderRadius: 20, padding: '36px 30px',
              border: `1px solid ${C.sand}`, boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: `${C.olive}06` }} />
              <div style={{ fontSize: '2rem', marginBottom: 16, position: 'relative' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', color: C.ink, marginBottom: 10, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#777', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Module Page
const ModulePage = ({ mod, setPage }: { mod: Module; setPage: (p: string) => void }) => {
  const [reflection, setReflection] = useState('')
  const [completed, setCompleted] = useState(() => _progress.some(p => p.moduleId === mod.id && p.completed))
  const [saved, setSaved] = useState(false)

  const markComplete = () => {
    if (!completed) {
      _progress.push({ id: Date.now().toString(), moduleId: mod.id, groupName: 'Classroom', completed: true, timeWatchedEstimate: mod.durationMinutes, createdAt: new Date() })
      setCompleted(true)
    }
  }
  return (
    <div className="fade-up container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 820 }}>
      <button className="btn-ghost" onClick={() => setPage('home')} style={{ marginBottom: 28 }}>
        <span style={{ marginRight: 6 }}>&larr;</span> Back to Library
      </button>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <span className={`tag tag-${TYPE_COLOR[mod.contentType]}`}>{TYPE_LABEL[mod.contentType]}</span>
        <span className="tag tag-saffron">{mod.ageLevel}</span>
        {mod.caselTags.map(t => <span key={t} className="tag tag-teal">{t}</span>)}
      </div>
      <h1 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.6rem)', marginBottom: 14, color: C.ink, lineHeight: 1.2 }}>{mod.title}</h1>
      <p style={{ fontSize: '1.05rem', color: '#666', marginBottom: 36, lineHeight: 1.75 }}>{mod.description}</p>
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 40, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', background: '#000', aspectRatio: '16/9' }}>
        <iframe src={mod.videoUrl} title={mod.title} width="100%" height="100%" style={{ border: 'none', display: 'block' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
      <div style={{ background: `linear-gradient(135deg,${C.olive}08,${C.teal}06)`, borderRadius: 20, padding: 32, marginBottom: 28, border: `1px solid ${C.olive}12` }}>
        <h3 style={{ fontSize: '1.1rem', color: C.olive, marginBottom: 18 }}>Learning Goals</h3>
        {mod.learningGoals.map((g, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${C.olive},${C.oliveL})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <span style={{ fontSize: '0.95rem', color: C.ink, lineHeight: 1.7 }}>{g}</span>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ borderRadius: 20, padding: 32, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.1rem', color: C.teal, marginBottom: 10 }}>Reflection</h3>
        <p style={{ color: '#777', marginBottom: 18, fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>{mod.reflectionPrompt}</p>
        <textarea className="input-field" rows={4} placeholder="Write your reflection here..." value={reflection} onChange={e => setReflection(e.target.value)} style={{ resize: 'vertical' }} />
        {saved && <p style={{ color: C.olive, marginTop: 10, fontSize: '0.9rem', fontWeight: 600 }}>Reflection saved</p>}
        <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => { if (reflection.trim()) setSaved(true) }}>Save Reflection</button>
      </div>
      <div style={{ textAlign: 'center', padding: '28px 0' }}>
        {completed
          ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: `linear-gradient(135deg,${C.olive},${C.oliveL})`, color: 'white', padding: '16px 40px', borderRadius: '60px', fontWeight: 700, fontSize: '1.05rem', boxShadow: `0 4px 20px ${C.olive}33` }}>Session Complete</div>
          : <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 44px' }} onClick={markComplete}>Mark Session Complete</button>
        }
      </div>
    </div>
  )
}

// Plans Page - Sprout & Garden
const PlansPage = ({ setPage }: { setPage: (p: string) => void }) => {
  const reveal = useReveal()
  return (
    <div className="fade-up">
      <div className="page-header" style={{ background: `linear-gradient(155deg,${C.olive},${C.teal}ee,${C.olive}cc)`, backgroundSize: '200% 200%', animation: 'gradientMove 8s ease infinite' }}>
        <h1>Choose Your Path</h1>
        <p>Start small, grow deep. Every garden begins with a sprout.</p>
      </div>
      <div className="container section" ref={reveal.ref} style={reveal.style}>
        <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 32, maxWidth: 880, margin: '0 auto' }}>
          {/* Sprout - Free */}
          <div style={{
            background: C.white, borderRadius: 24, padding: '44px 36px',
            border: `1.5px solid ${C.sand}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${C.olive}06` }} />
            <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{'\u{1F331}'}</div>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 99, background: `${C.olive}14`, color: C.olive, fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>Free</div>
            <div style={{ fontSize: '3.2rem', fontFamily: "'Playfair Display',serif", fontWeight: 900, color: C.olive, marginBottom: 6 }}>Sprout</div>
            <p style={{ color: '#888', marginBottom: 32, fontSize: '0.95rem', lineHeight: 1.6 }}>Plant the seed. Explore core mindfulness content with your classroom at no cost.</p>
            {['Core Quick Skills', 'Pilot Skill Journey (4 sessions)', 'Unlimited classroom playback', 'Basic completion tracking', 'Feedback & reflection tools'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 12, marginBottom: 14, fontSize: '0.93rem', alignItems: 'flex-start' }}>
                <span style={{ color: C.olive, fontWeight: 800 }}>{'\u2713'}</span>
                <span style={{ color: '#555' }}>{f}</span>
              </div>
            ))}
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 32, padding: '16px', fontSize: '1rem' }} onClick={() => setPage('home')}>Start with Sprout</button>
          </div>
          {/* Garden - Premium */}
          <div style={{
            background: `linear-gradient(155deg,${C.olive},${C.teal})`,
            borderRadius: 24, padding: '44px 36px', color: 'white',
            boxShadow: `0 12px 48px ${C.olive}44`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{'\u{1F33B}'}</div>
            <div style={{ background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '5px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: 0.8, marginBottom: 16, textTransform: 'uppercase' }}>Premium</div>
            <div style={{ fontSize: '3.2rem', fontFamily: "'Playfair Display',serif", fontWeight: 900, marginBottom: 6 }}>Garden</div>
            <p style={{ opacity: 0.85, marginBottom: 32, fontSize: '0.95rem', lineHeight: 1.6 }}>Watch your school flourish. Full library access with analytics for whole-school wellbeing.</p>
            {['Full content library', 'Advanced engagement dashboard', 'Exportable reports', 'Priority new cultural modules', 'Dedicated support & onboarding'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 12, marginBottom: 14, fontSize: '0.93rem', alignItems: 'flex-start' }}>
                <span style={{ opacity: 0.7, fontSize: '1rem' }}>{'\u2726'}</span>
                <span style={{ opacity: 0.92 }}>{f}</span>
              </div>
            ))}
            <button onClick={() => setPage('connect')} style={{
              width: '100%', justifyContent: 'center', marginTop: 32,
              background: 'white', color: C.olive, border: 'none', padding: '16px',
              borderRadius: '60px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all 0.3s',
            }}>Grow with Garden</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Conversational AI Page - "Guide Me"
const AskPage = ({ setPage, setCurrentModule }: { setPage: (p: string) => void; setCurrentModule: (m: Module) => void }) => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: "Hey there! I'm here to help you find the right practice for today. Tell me - what's the vibe in your classroom right now? Are students restless, anxious, unfocused, or something else?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const moduleList = _modules.filter(m => m.isPublished).map(m => ({
        id: m.id, title: m.title, caselTags: m.caselTags, energyLevel: m.energyLevel,
        durationMinutes: m.durationMinutes, contentType: m.contentType, description: m.description
      }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: `You are a warm, experienced SEL educator embedded in a school wellness platform called Salad Bowl. You speak conversationally like a supportive colleague. Based on what the teacher describes, recommend 1-3 modules. Return ONLY valid JSON: {"message":"your conversational response explaining why these fit","recommendations":[{"id":"moduleId","reason":"one-line reason"}]}. Keep your message warm, brief (2-3 sentences), and actionable. No markdown.`,
          messages: [{ role: 'user', content: `Teacher says: "${userMsg}"\n\nAvailable modules:\n${JSON.stringify(moduleList)}` }]
        })
      })
      const data = await res.json()
      const text = (data.content as { text?: string }[])?.map(c => c.text || '').join('') || ''
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      const mods = (parsed.recommendations as { id: string; reason: string }[])
        .map(r => _modules.find(m => m.id === r.id)!)
        .filter(Boolean)
      setMessages(prev => [...prev, { role: 'assistant', text: parsed.message, modules: mods }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now. In the meantime, try browsing the library - you might find something that fits! You can filter by energy level or duration." }])
    }
    setLoading(false)
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 68px)' }}>
      {/* Header */}
      <div className="ask-header" style={{
        background: `linear-gradient(135deg,${C.olive}10,${C.teal}08)`,
        padding: '24px 28px', borderBottom: `1px solid ${C.sand}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: `linear-gradient(135deg,${C.olive},${C.tealL})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 12px ${C.olive}33`,
        }}>
          <Logo size={36} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', color: C.ink, fontWeight: 700, marginBottom: 2 }}>Guide Me</h2>
          <p style={{ fontSize: '0.82rem', color: '#999' }}>Describe your classroom and we'll find the right practice</p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-area" style={{ flex: 1, overflowY: 'auto', padding: '28px', background: C.bg }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 20, animation: 'fadeUp 0.4s cubic-bezier(.22,1,.36,1) both',
            }}>
              <div style={{
                maxWidth: '80%', padding: '16px 20px', borderRadius: 20,
                ...(msg.role === 'user'
                  ? { background: `linear-gradient(135deg,${C.olive},${C.oliveL})`, color: 'white', borderBottomRightRadius: 6 }
                  : { background: C.white, color: C.ink, border: `1px solid ${C.sand}`, borderBottomLeftRadius: 6, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }
                ),
              }}>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7 }}>{msg.text}</p>
                {msg.modules && msg.modules.length > 0 && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {msg.modules.map(m => (
                      <button key={m.id} onClick={() => { setCurrentModule(m); setPage('module') }}
                        style={{
                          background: `${C.olive}0a`, border: `1px solid ${C.olive}20`, borderRadius: 14,
                          padding: '14px 18px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span className={`tag tag-${TYPE_COLOR[m.contentType]}`} style={{ marginBottom: 6, display: 'inline-block' }}>{TYPE_LABEL[m.contentType]}</span>
                            <p style={{ fontWeight: 700, fontSize: '0.93rem', color: C.ink, marginTop: 4 }}>{m.title}</p>
                            <p style={{ fontSize: '0.82rem', color: '#999', marginTop: 2 }}>{m.durationMinutes} min &middot; {m.energyLevel}</p>
                          </div>
                          <span style={{ color: C.terra, fontSize: '1.2rem', flexShrink: 0, marginLeft: 12 }}>&rarr;</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
              <div style={{ background: C.white, border: `1px solid ${C.sand}`, borderRadius: 20, borderBottomLeftRadius: 6, padding: '16px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: C.olive, animation: `dotBlink 1.2s ${i * 0.2}s ease infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>
      </div>

      {/* Input */}
      <div className="ask-input-wrap" style={{ borderTop: `1px solid ${C.sand}`, padding: '16px 28px', background: C.white }}>
        <div className="ask-input-inner" style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 12 }}>
          <input
            className="input-field"
            placeholder="My students are feeling restless after lunch..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            style={{ flex: 1, borderRadius: 60, padding: '14px 24px' }}
          />
          <button className="btn-primary" onClick={send} disabled={loading || !input.trim()}
            style={{ borderRadius: '50%', width: 52, height: 52, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#bbb', marginTop: 8, maxWidth: 680, margin: '8px auto 0' }}>
          Personalized recommendations based on your classroom's needs
        </p>
      </div>
    </div>
  )
}

// Build With Us Page — 3-column cards, click to expand form
const BuildWithUsPage = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !activeCard || submitting) return
    setSubmitting(true)
    _teamInterest.push({ id: Date.now().toString(), name: form.name, email: form.email, role: activeCard, organization: form.organization, contribution: '', excitement: form.message, skills: '', wantsUpdates: true, phone: '', createdAt: new Date() })
    try { await fetch('/api/team-interest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, role: activeCard, organization: form.organization, contribution: '', excitement: form.message, skills: '', wantsUpdates: true, phone: '' }) }) } catch {}
    setSubmitting(false)
    setSubmitted(true)
  }

  const selectCard = (id: string) => {
    const isOpen = activeCard === id
    setActiveCard(isOpen ? null : id)
    setSubmitted(false)
    setForm({ name: '', email: '', organization: '', message: '' })
    if (!isOpen) setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  const cards = [
    { id: 'partner', emoji: '\u{1F3EB}', title: 'Partner With Us', subtitle: 'Schools & Programs', description: 'For schools, afterschool programs, charter networks, and organized learning communities interested in launching a pilot.', color: C.olive, gradient: `linear-gradient(135deg,${C.olive},${C.oliveL})`, cta: 'Start a Pilot' },
    { id: 'join', emoji: '\u{1F331}', title: 'Join Our Team', subtitle: 'Educators & Builders', description: 'For educators, cultural practitioners, designers, and operators who want to help shape the future of embodied SEL.', color: C.teal, gradient: `linear-gradient(135deg,${C.teal},${C.tealL})`, cta: 'Express Interest' },
    { id: 'backer', emoji: '\u{1F4B0}', title: 'Become an Early Backer', subtitle: 'Angels & Supporters', description: 'We are raising $100,000 at pre-seed to move from pilot validation to recurring institutional revenue. We welcome aligned angels and small early checks.', color: C.saffron, gradient: `linear-gradient(135deg,${C.saffron},${C.saffronL})`, cta: 'Back Salad Bowl' },
  ]

  const active = cards.find(c => c.id === activeCard)

  return (
    <div className="fade-up">
      <div className="page-header" style={{ background: `linear-gradient(155deg,${C.terra}dd,${C.saffron}bb,${C.olive}cc)`, backgroundSize: '200% 200%', animation: 'gradientMove 8s ease infinite' }}>
        <h1>Build With Us</h1>
        <p style={{ maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>Salad Bowl is growing through educators, institutional partners, and early believers who see the need for culturally grounded, embodied SEL. If you feel aligned, we'd love to connect.</p>
      </div>
      <div className="container section" style={{ maxWidth: 1020 }}>
        {/* Three Columns */}
        <div className="build-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {cards.map(card => {
            const isActive = activeCard === card.id
            return (
              <div key={card.id} className="build-card" onClick={() => selectCard(card.id)} style={{
                background: isActive ? card.color : C.white,
                borderRadius: 24, padding: '40px 28px 36px', textAlign: 'center',
                border: `2px solid ${isActive ? card.color : C.sand}`,
                boxShadow: isActive ? `0 8px 32px ${card.color}28` : '0 2px 12px rgba(0,0,0,0.04)',
                transition: 'all 0.35s cubic-bezier(.22,1,.36,1)',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
              }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = card.color + '66'; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${card.color}18` } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = C.sand; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)' } }}>
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: isActive ? 'rgba(255,255,255,0.3)' : card.gradient, transition: 'background 0.35s' }} />
                {/* Emoji */}
                <div style={{
                  width: 64, height: 64, borderRadius: 20, margin: '0 auto 20px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : `${card.color}0d`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                  transition: 'background 0.35s',
                }}>{card.emoji}</div>
                {/* Subtitle tag */}
                <div style={{
                  display: 'inline-block', padding: '4px 14px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 14,
                  background: isActive ? 'rgba(255,255,255,0.2)' : `${card.color}12`,
                  color: isActive ? 'rgba(255,255,255,0.9)' : card.color,
                  transition: 'all 0.35s',
                }}>{card.subtitle}</div>
                {/* Title */}
                <h3 style={{
                  fontFamily: "'Playfair Display',serif", fontSize: '1.35rem', fontWeight: 700,
                  color: isActive ? 'white' : card.color, marginBottom: 12, transition: 'color 0.35s',
                }}>{card.title}</h3>
                {/* Description */}
                <p style={{
                  color: isActive ? 'rgba(255,255,255,0.85)' : '#666',
                  fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 24, transition: 'color 0.35s',
                }}>{card.description}</p>
                {/* CTA */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 60, fontWeight: 700, fontSize: '0.9rem',
                  background: isActive ? 'white' : card.gradient,
                  color: isActive ? card.color : 'white',
                  boxShadow: isActive ? '0 4px 16px rgba(0,0,0,0.12)' : `0 4px 16px ${card.color}22`,
                  transition: 'all 0.35s',
                }}>
                  {isActive ? '\u2715  Close' : card.cta}
                </div>
              </div>
            )
          })}
        </div>

        {/* Expandable Form */}
        <div ref={formRef} style={{
          maxHeight: activeCard ? 600 : 0, opacity: activeCard ? 1 : 0,
          overflow: 'hidden', transition: 'max-height 0.5s cubic-bezier(.22,1,.36,1), opacity 0.4s ease',
          marginTop: activeCard ? 36 : 0,
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '52px 0 40px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>{'\u{1F957}'}</div>
              <h2 style={{ color: active?.color || C.olive, marginBottom: 12, fontSize: '1.8rem' }}>Thank you!</h2>
              <p style={{ color: '#777', fontSize: '1.05rem', lineHeight: 1.6 }}>We'll be in touch soon. Thank you for believing in embodied SEL.</p>
              <button className="btn-secondary" style={{ marginTop: 28 }} onClick={() => { setActiveCard(null); setSubmitted(false) }}>Done</button>
            </div>
          ) : active && (
            <div className="build-form-wrap" style={{
              background: C.white, borderRadius: 24, padding: '40px 44px',
              border: `2px solid ${active.color}20`, boxShadow: `0 4px 24px ${active.color}0c`,
              maxWidth: 620, margin: '0 auto',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: active.gradient }} />
                <h3 style={{ fontFamily: "'Playfair Display',serif", color: active.color, fontSize: '1.2rem', fontWeight: 700 }}>{active.title}</h3>
              </div>
              <p style={{ color: '#999', fontSize: '0.88rem', marginBottom: 28 }}>Fill out the form and we'll reach out.</p>
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
                <div><label style={{ fontWeight: 700, fontSize: '0.86rem', display: 'block', marginBottom: 8 }}>Name *</label><input className="input-field" placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div><label style={{ fontWeight: 700, fontSize: '0.86rem', display: 'block', marginBottom: 8 }}>Email *</label><input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
              </div>
              <div style={{ marginBottom: 20 }}><label style={{ fontWeight: 700, fontSize: '0.86rem', display: 'block', marginBottom: 8 }}>Organization</label><input className="input-field" placeholder="School, network, or org name" value={form.organization} onChange={e => set('organization', e.target.value)} /></div>
              <div style={{ marginBottom: 28 }}><label style={{ fontWeight: 700, fontSize: '0.86rem', display: 'block', marginBottom: 8 }}>Message <span style={{ color: '#bbb', fontWeight: 400 }}>(optional)</span></label><textarea className="input-field" rows={3} placeholder="Tell us a bit about yourself..." value={form.message} onChange={e => set('message', e.target.value)} style={{ resize: 'vertical' }} /></div>
              <button onClick={handleSubmit} disabled={!form.name || !form.email || submitting} style={{
                width: '100%', padding: '16px', borderRadius: 60, border: 'none', fontWeight: 700, fontSize: '1rem',
                background: active.gradient, color: 'white', cursor: 'pointer',
                boxShadow: `0 4px 16px ${active.color}22`, transition: 'all 0.3s',
                opacity: (!form.name || !form.email) ? 0.5 : 1,
              }}>{submitting ? 'Submitting...' : 'Send'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Teacher Dashboard
const TeacherDashboard = () => {
  const completed = _progress.filter(p => p.completed)
  const totalTime = completed.reduce((s, p) => s + (p.timeWatchedEstimate || 0), 0)
  const byModule: Record<string, number> = {}
  completed.forEach(p => { byModule[p.moduleId] = (byModule[p.moduleId] || 0) + 1 })
  const topModules = Object.entries(byModule).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const byType: Record<string, number> = {}
  completed.forEach(p => { const m = _modules.find(x => x.id === p.moduleId); if (m) byType[m.contentType] = (byType[m.contentType] || 0) + 1 })

  const Stat = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) => (
    <div style={{ background: C.white, borderRadius: 20, padding: 32, border: `1px solid ${C.sand}`, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: '2.6rem', fontFamily: "'Playfair Display',serif", fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: 500 }}>{label}</div>
    </div>
  )
  return (
    <div className="fade-up">
      <div className="page-header" style={{ background: `linear-gradient(155deg,${C.olive},${C.teal}ee)` }}>
        <h1>Teacher Dashboard</h1>
        <p>Aggregate engagement and completion data for your classroom.</p>
      </div>
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, marginBottom: 44 }}>
          <Stat label="Sessions Completed" value={completed.length} color={C.olive} icon={'\u2705'} />
          <Stat label="Est. Minutes of Practice" value={totalTime} color={C.terra} icon={'\u23F1'} />
          <Stat label="Modules Engaged" value={Object.keys(byModule).length} color={C.teal} icon={'\u{1F4DA}'} />
        </div>
        <div className="dash-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, border: `1px solid ${C.sand}` }}>
            <h3 style={{ color: C.olive, marginBottom: 22 }}>Most Completed Modules</h3>
            {topModules.length ? topModules.map(([id, count]) => {
              const m = _modules.find(x => x.id === id)
              return m ? (
                <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.sand}` }}>
                  <span style={{ fontSize: '0.93rem', fontWeight: 500 }}>{m.title}</span>
                  <span style={{ background: `linear-gradient(135deg,${C.olive},${C.oliveL})`, color: 'white', borderRadius: '99px', padding: '3px 14px', fontSize: '0.78rem', fontWeight: 700 }}>{count}</span>
                </div>
              ) : null
            }) : <p style={{ color: '#bbb' }}>No completions yet. Mark some modules complete to see data.</p>}
          </div>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, border: `1px solid ${C.sand}` }}>
            <h3 style={{ color: C.olive, marginBottom: 22 }}>Engagement by Type</h3>
            {Object.entries(byType).length ? Object.entries(byType).map(([type, count]) => (
              <div key={type} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 500 }}>{TYPE_LABEL[type] || type}</span><span style={{ fontWeight: 700, color: C.olive }}>{count}</span>
                </div>
                <div style={{ height: 8, background: C.sand, borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: 8, borderRadius: 99, background: TYPE_GRADIENT[type] || C.olive, width: `${Math.min(100, count * 20)}%`, transition: 'width 0.8s' }} />
                </div>
              </div>
            )) : <p style={{ color: '#bbb' }}>Mark some modules complete to see data.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin Dashboard
const AdminDashboard = ({ setPage, setCurrentModule }: { setPage: (p: string) => void; setCurrentModule: (m: Module) => void }) => {
  const [activeTab, setActiveTab] = useState('modules')
  const [filterRole, setFilterRole] = useState('all')
  const [, forceUpdate] = useState(0)
  const [dbFeedback, setDbFeedback] = useState<Feedback[]>([])
  const [dbTeam, setDbTeam] = useState<TeamInterest[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Fetch persisted data from API (merge with in-memory)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [fbRes, tiRes] = await Promise.all([fetch('/api/feedback'), fetch('/api/team-interest')])
        if (!cancelled && fbRes.ok) {
          const rows = await fbRes.json()
          setDbFeedback(rows.map((r: any) => ({ id: String(r.id), message: r.message, emotionalState: r.emotional_state, createdAt: new Date(r.created_at) })))
        }
        if (!cancelled && tiRes.ok) {
          const rows = await tiRes.json()
          setDbTeam(rows.map((r: any) => ({ id: String(r.id), name: r.name, email: r.email, role: r.role, organization: r.organization, contribution: r.contribution, excitement: r.excitement, skills: r.skills, wantsUpdates: r.wants_updates, phone: r.phone, createdAt: new Date(r.created_at) })))
        }
      } catch {}
      if (!cancelled) setLoadingData(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Merge DB + in-memory (deduplicate by checking if in-memory items already exist in DB)
  const allFeedback = [...dbFeedback, ..._feedback.filter(f => !dbFeedback.some(d => d.message === f.message))]
  const allTeam = [...dbTeam, ..._teamInterest.filter(t => !dbTeam.some(d => d.email === t.email))]

  const togglePublish = (id: string) => { const m = _modules.find(x => x.id === id); if (m) { m.isPublished = !m.isPublished; forceUpdate(n => n + 1) } }
  const togglePremium = (id: string) => { const m = _modules.find(x => x.id === id); if (m) { m.isPremium = !m.isPremium; forceUpdate(n => n + 1) } }
  const deleteModule = (id: string) => { const i = _modules.findIndex(x => x.id === id); if (i > -1) { _modules.splice(i, 1); forceUpdate(n => n + 1) } }
  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Role', 'Organization', 'WantsUpdates', 'CreatedAt']]
    allTeam.forEach(t => rows.push([t.name, t.email, t.role, t.organization, String(t.wantsUpdates), String(t.createdAt)]))
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'team_interest.csv'; a.click()
  }

  const filteredTeam = filterRole === 'all' ? allTeam : allTeam.filter(t => t.role === filterRole)
  const Tab = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '10px 22px', borderRadius: '99px', border: 'none',
      background: activeTab === id ? C.olive : 'transparent',
      color: activeTab === id ? 'white' : C.ink,
      fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.25s',
    }}>{label}</button>
  )

  return (
    <div className="fade-up">
      <div className="page-header" style={{ background: `linear-gradient(155deg,${C.ink},${C.teal}ee)` }}>
        <h1>Admin Dashboard</h1>
        <p>Manage content, analytics, and submissions.</p>
      </div>
      <div className="container section">
        <div className="dash-stats-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 40 }}>
          {([['Total Modules', _modules.length, '\u{1F4E6}'], ['Published', _modules.filter(m => m.isPublished).length, '\u2705'], ['Feedback', allFeedback.length, '\u{1F4AC}'], ['Team Submissions', allTeam.length, '\u{1F465}']] as [string, number, string][]).map(([l, v, icon]) => (
            <div key={l} style={{ background: C.white, borderRadius: 18, padding: '26px 24px', textAlign: 'center', border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: "'Playfair Display',serif", color: C.olive }}>{v}</div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 4, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, background: C.sand, borderRadius: 99, padding: 5, width: 'fit-content' }}>
          <Tab id="modules" label="Modules" /><Tab id="feedback" label="Feedback" /><Tab id="team" label="Team Interest" />
        </div>

        {activeTab === 'modules' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <button className="btn-primary" style={{ fontSize: '0.88rem', padding: '10px 24px' }} onClick={() => {
                _modules.push({ id: 'm' + Date.now(), title: 'New Module', description: 'Edit this description.', videoUrl: '', durationMinutes: 30, ageLevel: 'middle', contentType: 'quick_skill', caselTags: [], energyLevel: 'calm', learningGoals: [], reflectionPrompt: '', isPublished: false, isPremium: false })
                forceUpdate(n => n + 1)
              }}>+ Add Module</button>
            </div>
            <div style={{ background: C.white, borderRadius: 20, overflow: 'hidden', border: `1px solid ${C.sand}` }}>
              {_modules.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: i < _modules.length - 1 ? `1px solid ${C.sand}` : 'none', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.93rem' }}>{m.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#999', marginTop: 2 }}>{m.durationMinutes} min | {m.ageLevel} | {m.contentType}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => togglePublish(m.id)} style={{ padding: '5px 14px', borderRadius: 99, border: 'none', background: m.isPublished ? `${C.olive}16` : C.sand, color: m.isPublished ? C.olive : '#999', fontWeight: 700, fontSize: '0.78rem' }}>{m.isPublished ? 'Published' : 'Draft'}</button>
                    <button onClick={() => togglePremium(m.id)} style={{ padding: '5px 14px', borderRadius: 99, border: 'none', background: m.isPremium ? `${C.saffron}22` : '#f0f0f0', color: m.isPremium ? '#7a5a00' : '#999', fontWeight: 700, fontSize: '0.78rem' }}>{m.isPremium ? 'Garden' : 'Sprout'}</button>
                    <button className="btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => { setCurrentModule(m); setPage('module') }}>View</button>
                    <button onClick={() => deleteModule(m.id)} style={{ padding: '5px 14px', borderRadius: 99, border: 'none', background: '#fef0f0', color: '#c44', fontWeight: 700, fontSize: '0.78rem' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            {loadingData ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}><p>Loading feedback...</p></div>
            : allFeedback.length === 0
              ? <div style={{ textAlign: 'center', padding: '80px 0', color: '#bbb' }}><p>No feedback yet.</p></div>
              : allFeedback.map(f => (
                <div key={f.id} style={{ background: C.white, borderRadius: 18, padding: 28, marginBottom: 16, border: `1px solid ${C.sand}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    {f.emotionalState && <span className="tag tag-teal">{f.emotionalState}</span>}
                    <span style={{ fontSize: '0.8rem', color: '#bbb' }}>{f.createdAt?.toLocaleDateString?.()}</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: C.ink, lineHeight: 1.75 }}>{f.message}</p>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'team' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                  <option value="Partner">Partner</option>
                  <option value="Investor">Investor</option>
                  <option value="Advisor">Advisor</option>
                </select>
              </div>
              <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 20px' }} onClick={exportCSV}>Export CSV</button>
            </div>
            {filteredTeam.length === 0
              ? <div style={{ textAlign: 'center', padding: '80px 0', color: '#bbb' }}><p>No submissions yet.</p></div>
              : filteredTeam.map(t => (
                <div key={t.id} style={{ background: C.white, borderRadius: 18, padding: 28, marginBottom: 16, border: `1px solid ${C.sand}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t.name}</span>
                      <span style={{ color: '#999', marginLeft: 12, fontSize: '0.88rem' }}>{t.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {t.role && <span className="tag tag-olive">{t.role}</span>}
                      {t.organization && <span className="tag tag-teal">{t.organization}</span>}
                      {t.wantsUpdates && <span className="tag tag-saffron">Wants Updates</span>}
                    </div>
                  </div>
                  {t.excitement && <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.7 }}><strong style={{ color: C.olive }}>Excited about:</strong> {t.excitement}</p>}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Footer
const Footer = ({ setPage, teamRef }: { setPage: (p: string) => void; teamRef: React.RefObject<HTMLDivElement> }) => {
  const scrollToTeam = () => {
    setPage('home')
    setTimeout(() => teamRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }
  const FLink = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <div style={{ marginBottom: 10 }}>
      <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.92rem', padding: 0, transition: 'color 0.2s' }}
        onMouseEnter={e => (e.target as HTMLElement).style.color = 'white'}
        onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}>
        {children}
      </button>
    </div>
  )
  return (
    <footer style={{
      background: `linear-gradient(180deg,${C.ink} 0%,#12121a 100%)`,
      color: 'rgba(255,255,255,0.65)', padding: '64px 24px 36px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${C.teal}44,${C.saffron}44,transparent)` }} />
      <div className="container footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Logo size={36} />
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1.3rem', color: 'white' }}>Salad Bowl</span>
          </div>
          <p style={{ maxWidth: 300, fontSize: '0.9rem', lineHeight: 1.7 }}>A cultural wellness studio for schools - rooted in SEL, community, and whole-child flourishing.</p>
        </div>
        <div className="footer-links" style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 700, marginBottom: 16, fontSize: '0.78rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>Explore</div>
            <FLink onClick={() => setPage('home')}>Home</FLink>
            <FLink onClick={() => setPage('ask')}>Guide Me</FLink>
            <FLink onClick={() => setPage('plans')}>Plans</FLink>
            <FLink onClick={scrollToTeam}>Our Team</FLink>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, marginBottom: 16, fontSize: '0.78rem', letterSpacing: 1.5, textTransform: 'uppercase' }}>Community</div>
            <FLink onClick={() => setPage('connect')}>Partner With Us</FLink>
            <FLink onClick={() => setPage('connect')}>Join Our Team</FLink>
            <FLink onClick={() => setPage('connect')}>Become a Backer</FLink>
          </div>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 40, paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.82rem' }}>&copy; 2026 Salad Bowl. Made with love for educators everywhere.</span>
        <span style={{ fontSize: '0.82rem', color: C.saffron, fontWeight: 500 }}>Every ingredient matters.</span>
      </div>
    </footer>
  )
}

// App
export default function App() {
  const getPageFromHash = () => { const h = window.location.hash.replace('#', ''); return ['home','ask','plans','connect','teacher','admin'].includes(h) ? h : 'home' }
  const [page, setPage] = useState(getPageFromHash)
  const [role, setRole] = useState<Role>('public')
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const teamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onHash = () => { const p = getPageFromHash(); setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigateTo = (p: string) => { setPage(p); window.location.hash = p === 'home' ? '' : p; window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav page={page} setPage={navigateTo} role={role} setRole={setRole} teamRef={teamRef} />
        <main style={{ flex: 1 }}>
          {page === 'home' && <HomePage setPage={navigateTo} setCurrentModule={setCurrentModule} teamRef={teamRef} />}
          {page === 'module' && currentModule && <ModulePage mod={currentModule} setPage={navigateTo} />}
          {page === 'plans' && <PlansPage setPage={navigateTo} />}
          {page === 'ask' && <AskPage setPage={navigateTo} setCurrentModule={setCurrentModule} />}
          {page === 'connect' && <BuildWithUsPage />}
          {page === 'teacher' && (role === 'teacher' || role === 'admin') && <TeacherDashboard />}
          {page === 'admin' && role === 'admin' && <AdminDashboard setPage={navigateTo} setCurrentModule={setCurrentModule} />}
          {page === 'teacher' && role === 'public' && (
            <div style={{ textAlign: 'center', padding: '100px 24px', color: '#bbb' }}>
              <h2 style={{ fontWeight: 700 }}>Teacher access required</h2>
              <p style={{ marginTop: 8, color: '#999' }}>Switch to Teacher or Admin role to view this page.</p>
            </div>
          )}
        </main>
        <Footer setPage={navigateTo} teamRef={teamRef} />
      </div>
    </>
  )
}
