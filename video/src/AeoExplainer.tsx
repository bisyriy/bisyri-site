import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
} from 'remotion';

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0F1014',
  bgCard:  '#16181F',
  indigo:  '#4F46E5',
  indigoL: '#6D65F7',
  white:   '#EDEef2',
  muted:   '#AFB4C0',
  sub:     '#5B6270',
  line:    'rgba(255,255,255,0.08)',
  tag:     '#1E1D3A',
  tagText: '#A6A0F7',
};

const FONT_DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const FONT_BODY    = "'Inter', system-ui, sans-serif";
const FONT_MONO    = "'Space Mono', monospace";

// ─── Shared helpers ──────────────────────────────────────────────────────────
function fadeUp(frame: number, delay = 0, duration = 20) {
  const f = frame - delay;
  const opacity = interpolate(f, [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y       = interpolate(f, [0, duration], [28, 0],  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return { opacity, transform: `translateY(${y}px)` };
}

function fadeIn(frame: number, delay = 0, duration = 20) {
  const f = frame - delay;
  const opacity = interpolate(f, [0, duration], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return { opacity };
}

// ─── Scene 1 · Title (0–149) ─────────────────────────────────────────────────
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 120, mass: 0.8 } });
  const exitOpacity = interpolate(frame, [130, 149], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exitOpacity }}>
      {/* Indigo glow blob */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%',
        transform: 'translateX(-50%)',
        width: 700, height: 700,
        background: `radial-gradient(circle, ${C.indigo}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 28 }}>
        {/* Logo mark */}
        <div style={{
          ...fadeIn(frame, 0, 18),
          transform: `scale(${logoScale})`,
          width: 72, height: 72,
          background: C.indigo,
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: '#fff',
        }}>B</div>

        {/* Tag */}
        <div style={{
          ...fadeUp(frame, 12, 20),
          background: C.tag, color: C.tagText,
          fontFamily: FONT_MONO, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: '6px 18px', borderRadius: 999,
        }}>Bisyri · 2026 Guide</div>

        {/* Headline */}
        <div style={{
          ...fadeUp(frame, 22, 22),
          fontFamily: FONT_DISPLAY, fontWeight: 700,
          fontSize: 96, lineHeight: 1.0, letterSpacing: '-0.03em',
          color: C.white, textAlign: 'center', maxWidth: 1100,
        }}>
          What Is <span style={{ color: C.indigo }}>AEO</span>?
        </div>

        {/* Sub */}
        <div style={{
          ...fadeUp(frame, 38, 22),
          fontFamily: FONT_BODY, fontSize: 30, color: C.muted,
          textAlign: 'center', maxWidth: 760, lineHeight: 1.5,
        }}>
          Answer Engine Optimization — how to get cited by AI search.
        </div>

        {/* Bottom engines row */}
        <div style={{ ...fadeIn(frame, 65, 25), display: 'flex', gap: 20, marginTop: 24 }}>
          {['ChatGPT', 'Perplexity', 'Google AI', 'Bing Copilot', 'Claude'].map((name) => (
            <div key={name} style={{
              background: C.bgCard, border: `1px solid ${C.line}`,
              borderRadius: 10, padding: '8px 18px',
              fontFamily: FONT_MONO, fontSize: 14, color: C.muted,
            }}>{name}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2 · SEO vs AEO (150–399) ─────────────────────────────────────────
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const exitOpacity = interpolate(frame, [230, 249], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const leftIn  = fadeUp(frame, 5,  22);
  const rightIn = fadeUp(frame, 18, 22);
  const vsIn    = fadeIn(frame, 30, 20);
  const calloutIn = fadeUp(frame, 70, 25);

  const Card: React.FC<{title: string; items: string[]; accent: string; delay: number; style?: React.CSSProperties}> =
    ({ title, items, accent, delay, style: s }) => {
      const anim = fadeUp(frame, delay, 22);
      return (
        <div style={{
          ...anim, ...s,
          background: C.bgCard,
          border: `1px solid ${C.line}`,
          borderTop: `3px solid ${accent}`,
          borderRadius: 20, padding: '40px 44px',
          flex: 1, maxWidth: 520,
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: C.white, marginBottom: 28 }}>{title}</div>
          {items.map((item, i) => (
            <div key={i} style={{
              ...fadeUp(frame, delay + 15 + i * 10, 18),
              display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, marginTop: 10, flexShrink: 0 }} />
              <div style={{ fontFamily: FONT_BODY, fontSize: 22, color: C.muted, lineHeight: 1.5 }}>{item}</div>
            </div>
          ))}
        </div>
      );
    };

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exitOpacity, padding: '60px 100px', display: 'flex', flexDirection: 'column' }}>
      {/* Section label */}
      <div style={{ ...fadeIn(frame, 0, 18), fontFamily: FONT_MONO, fontSize: 14, color: C.tagText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
        Understanding the difference
      </div>

      {/* Cards row */}
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flex: 1 }}>
        <Card
          title="SEO"
          accent={C.sub}
          delay={5}
          items={[
            'Competes for a position on a ranked list',
            'Optimises for crawlers and authority signals',
            'Goal: earn the click from page one',
            'Traffic arrives at your site',
          ]}
        />

        {/* VS */}
        <div style={{ ...vsIn, alignSelf: 'center', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 1, height: 80, background: C.line }} />
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, color: C.sub }}>VS</div>
          <div style={{ width: 1, height: 80, background: C.line }} />
        </div>

        <Card
          title="AEO"
          accent={C.indigo}
          delay={18}
          items={[
            'Competes to be the cited answer',
            'Optimises for AI extractability',
            'Goal: become what AI quotes',
            'Your name reaches readers who never click',
          ]}
        />
      </div>

      {/* Callout quote */}
      <div style={{
        ...calloutIn,
        background: `linear-gradient(135deg, ${C.indigo}22 0%, ${C.bgCard} 100%)`,
        border: `1px solid ${C.indigo}44`,
        borderLeft: `3px solid ${C.indigo}`,
        borderRadius: 14, padding: '22px 36px', marginTop: 36,
      }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 24, color: C.white, fontStyle: 'italic', lineHeight: 1.5 }}>
          "SEO gets you on the list. AEO makes you the answer — often <span style={{ color: C.indigoL }}>before there is a list</span>."
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3 · 5 AI Engines (400–599) ────────────────────────────────────────
const ENGINES = [
  { name: 'Google AI Overviews', desc: 'Appears at the top of Google results for informational queries' },
  { name: 'ChatGPT Search',      desc: 'OpenAI browsing — used by hundreds of millions worldwide' },
  { name: 'Perplexity',          desc: 'Dedicated AI answer engine that cites sources heavily' },
  { name: 'Bing Copilot',        desc: 'Microsoft AI-first search, integrated into Windows and Edge' },
  { name: 'Claude',              desc: "Anthropic's assistant, increasingly used for research queries" },
];

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const exitOpacity = interpolate(frame, [180, 199], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exitOpacity, padding: '60px 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ ...fadeIn(frame, 0, 18), fontFamily: FONT_MONO, fontSize: 14, color: C.tagText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
        Which AI engines to optimise for
      </div>
      <div style={{ ...fadeUp(frame, 5, 22), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: C.white, letterSpacing: '-0.02em', marginBottom: 48 }}>
        5 AI search engines that cite sources
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {ENGINES.map((e, i) => (
          <div key={e.name} style={{
            ...fadeUp(frame, 20 + i * 14, 20),
            display: 'flex', alignItems: 'center', gap: 28,
            background: C.bgCard,
            border: `1px solid ${C.line}`,
            borderRadius: 14, padding: '20px 32px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.indigo,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 22, color: C.white, letterSpacing: '-0.01em' }}>{e.name}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 17, color: C.muted, marginTop: 4 }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4 · 5 AEO Levers (600–809) ────────────────────────────────────────
const LEVERS = [
  { num: '01', title: 'Answer questions directly',      body: 'Put the direct answer first — AI extracts the clearest, most direct response.' },
  { num: '02', title: 'Use structured data',            body: 'FAQ, How-To, Article, and LocalBusiness schema help AI parse your content.' },
  { num: '03', title: 'Create entity clarity',          body: 'Be explicit about who you are, what you do, and who you serve.' },
  { num: '04', title: 'Earn citations and authority',   body: 'Domain authority from SEO directly supports AEO — they feed each other.' },
  { num: '05', title: 'Format for extractability',      body: 'Clear headings, short paragraphs, bullet lists, numbered steps.' },
];

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const exitOpacity = interpolate(frame, [185, 209], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: exitOpacity, padding: '56px 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ ...fadeIn(frame, 0, 18), fontFamily: FONT_MONO, fontSize: 14, color: C.tagText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
        How AEO actually works
      </div>
      <div style={{ ...fadeUp(frame, 5, 22), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: C.white, letterSpacing: '-0.02em', marginBottom: 40 }}>
        5 levers to get cited by AI
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 36px' }}>
        {LEVERS.map((l, i) => (
          <div key={l.num} style={{
            ...fadeUp(frame, 20 + i * 12, 20),
            display: 'flex', gap: 20,
            background: C.bgCard, border: `1px solid ${C.line}`,
            borderRadius: 14, padding: '22px 26px',
            ...(i === 4 ? { gridColumn: '1 / -1', maxWidth: '49%' } : {}),
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 13, color: C.indigo,
              fontWeight: 700, flexShrink: 0, paddingTop: 3,
            }}>{l.num}</div>
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 20, color: C.white, letterSpacing: '-0.01em', marginBottom: 6 }}>{l.title}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 16, color: C.muted, lineHeight: 1.55 }}>{l.body}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5 · CTA (810–899) ─────────────────────────────────────────────────
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale  = spring({ frame, fps, config: { damping: 16, stiffness: 100, mass: 0.9 } });
  const fadeIn_ = fadeIn(frame, 10, 25);

  return (
    <AbsoluteFill style={{ background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        width: 900, height: 600,
        background: `radial-gradient(ellipse, ${C.indigo}28 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        transform: `scale(${scale})`,
        background: C.bgCard,
        border: `1px solid ${C.indigo}44`,
        borderRadius: 28, padding: '64px 96px',
        textAlign: 'center', maxWidth: 900,
      }}>
        <div style={{ ...fadeIn(frame, 5, 18), fontFamily: FONT_MONO, fontSize: 14, color: C.tagText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 22 }}>
          Ready to get cited by AI?
        </div>
        <div style={{ ...fadeUp(frame, 12, 22), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 64, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24 }}>
          Get your site<br /><span style={{ color: C.indigo }}>AEO-ready.</span>
        </div>
        <div style={{ ...fadeUp(frame, 25, 22), fontFamily: FONT_BODY, fontSize: 22, color: C.muted, lineHeight: 1.6, marginBottom: 40 }}>
          Audit · Schema · Restructure · Rank in AI search.
        </div>
        <div style={{ ...fadeIn(frame, 38, 20), display: 'inline-flex', background: C.indigo, borderRadius: 999, padding: '18px 44px' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: '#fff', fontWeight: 700, letterSpacing: '0.02em' }}>bisyri-site.vercel.app</span>
        </div>
      </div>

      {/* Bisyri credit */}
      <div style={{ ...fadeIn_, position: 'absolute', bottom: 36, fontFamily: FONT_MONO, fontSize: 13, color: C.sub }}>
        Bisyri™ · Web Design · SEO · AEO · AI Automation
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const AeoExplainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence from={0}   durationInFrames={150}><Scene1 /></Sequence>
      <Sequence from={150} durationInFrames={250}><Scene2 /></Sequence>
      <Sequence from={400} durationInFrames={200}><Scene3 /></Sequence>
      <Sequence from={600} durationInFrames={210}><Scene4 /></Sequence>
      <Sequence from={810} durationInFrames={90}> <Scene5 /></Sequence>
    </AbsoluteFill>
  );
};
