import { useState } from 'react';
import { AppLayout, Stack, Field, useLocalStorage, type Meta } from './ui';
import { ask, hasKey } from './lib/ai';

const M: Meta = {
  id: 13, icon: '🧭', title: 'JD 기반 채용 진단 서비스', tagline: '채용공고(JD)와 내 경력을 넣으면 적합도 점수·보유/부족 역량·갭 분석·맞춤 문장을 만들어 줘요',
  members: ['정미경'], color: '#7c3aed', ai: true,
  problem:
    '같은 직무라도 회사마다 요구 역량이 다른데, 지원자는 공고와 자신을 객관적으로 맞춰 보기 어렵습니다. ' +
    '본 서비스는 채용공고(JD)와 내 경력·스킬을 입력하면 AI가 키워드를 대조해 적합도 점수를 내고, 보유·부족 역량을 분리하며, ' +
    '부족 역량을 메우는 방법과 JD에 맞춘 이력서 문장(불릿)까지 생성해 “이 공고에 맞춘 지원”을 돕습니다.',
  features: [
    { icon: '🎯', title: '적합도 점수', desc: 'JD 요구사항과 내 역량의 정합도를 점수로 진단' },
    { icon: '✅', title: '보유/부족 역량', desc: '충족한 역량과 빠진 역량을 분리해 시각화' },
    { icon: '🪜', title: '갭 채우기 가이드', desc: '부족 역량을 메울 구체적 방법 제시' },
    { icon: '✍️', title: '맞춤 이력서 문장', desc: 'JD 키워드를 반영한 성과 불릿을 생성' },
    { icon: '🔑', title: '키워드 보강', desc: 'ATS 통과를 위한 추가 키워드 추천' },
    { icon: '💾', title: '진단 보관', desc: '여러 공고 진단을 저장해 비교' },
  ],
  howto: [
    '(선택) OpenAI API 키를 입력하면 실제 AI 진단이 켜집니다',
    '채용공고(JD) 전문과 내 경력·스킬을 붙여 넣습니다',
    '“채용 적합도 진단”으로 점수·역량·갭·문장을 받습니다',
    '맞춤 문장을 복사해 이력서에 반영하고 진단을 저장합니다',
  ],
  facts: [
    { value: '적합도', label: '점수 진단' }, { value: 'Gap', label: '역량 분석' }, { value: 'ATS', label: '키워드' },
    { value: '불릿', label: '맞춤 문장' }, { value: '저장', label: '공고 비교' }, { value: '무키', label: '폴백 동작' },
  ],
  info: [
    { title: 'JD를 읽는 법', body: '채용공고의 “자격요건/우대사항”은 곧 평가 기준입니다. 명시된 키워드를 이력서에 같은 언어로 반영하면 적합도가 올라갑니다.' },
    { title: 'ATS와 키워드', body: '많은 기업이 지원서를 ATS로 1차 선별합니다. JD의 핵심 용어를 자연스럽게 포함해야 사람 눈에 닿을 확률이 높아집니다.' },
    { title: '갭은 약점이 아니다', body: '부족 역량은 “지금 학습 중/대체 경험”으로 풀어낼 수 있습니다. 갭을 인지하고 전략적으로 보완하는 것이 핵심입니다.' },
    { title: '주의', body: 'AI 진단은 참고용입니다. 과장 없이 사실에 기반해 이력서를 작성하세요.' },
  ],
  pipeline: [
    '입력 수집 — JD 전문과 내 경력·스킬을 구조화',
    '대조 분석 — 요구 역량 추출 + 보유/부족 매칭 + JSON 스키마',
    'GPT 호출 — 적합도·역량분리·갭·맞춤불릿·키워드 일괄 수신',
    '검증·폴백 — 누락 시 키워드 교집합 휴리스틱으로 안전 진단',
    '시각화 — 적합도 게이지 + 보유/부족 칩 + 갭 카드',
    '활용 — 맞춤 문장 복사 / 진단 localStorage 저장·비교',
  ],
  techNotes: [
    { title: '단일 구조화 진단', body: '적합도·역량·갭·불릿·키워드를 한 번의 json_object로 받아 일관된 진단 리포트를 구성합니다.' },
    { title: '휴리스틱 폴백', body: 'API 키가 없으면 JD·이력서 토큰의 교집합/차집합으로 보유·부족 역량과 점수를 근사 계산합니다.' },
    { title: '클립보드 활용', body: '맞춤 불릿을 클릭 한 번으로 복사해 이력서에 즉시 반영하게 합니다.' },
    { title: '정적·오프라인', body: '진단 이력은 localStorage에 저장, 백엔드 없이 GitHub Pages에서 완결됩니다.' },
  ],
  targets: ['특정 공고에 맞춰 지원하려는 구직자', '이력서를 JD에 최적화하려는 사람', 'ATS 통과율을 높이려는 지원자'],
  goals: [
    'JD와 내 역량을 대조해 적합도를 진단한다',
    '보유/부족 역량과 갭 채우기·맞춤 문장을 제공한다',
    'API 키가 없어도 키워드 교집합 휴리스틱으로 동작하게 한다',
  ],
  scenarios: [
    '채용공고(JD) 전문과 내 경력·스킬을 붙여넣는다',
    '적합도 점수·보유/부족 역량·갭 가이드를 확인한다',
    'JD 맞춤 이력서 불릿을 복사하고 진단을 저장·비교한다',
  ],
  screens: [
    { name: '입력', desc: 'JD 전문 + 내 경력·스킬 붙여넣기' },
    { name: '적합도 진단', desc: '적합도 게이지 + 보유/부족 역량 칩 + 갭 카드' },
    { name: '맞춤 문장 · 키워드', desc: 'JD 반영 성과 불릿 + ATS 키워드 추천 + 복사' },
    { name: '진단 보관', desc: '여러 공고 진단을 저장·비교' },
  ],
  pipelineDetail: [
    { step: '입력 수집', detail: 'JD 전문과 내 경력·스킬을 구조화한다.' },
    { step: '대조 분석 · 스키마 강제', detail: '요구 역량 추출과 보유/부족 매칭 지침을 system 프롬프트로 지시하고 JSON 스키마를 고정한다.' },
    { step: 'GPT 호출(json_object)', detail: 'json_object로 적합도·역량분리·갭·맞춤불릿·키워드를 한 번에 수신한다.' },
    { step: '검증 · 폴백', detail: '누락 시 JD·이력서 토큰의 교집합/차집합 휴리스틱으로 안전 진단한다.' },
    { step: '시각화', detail: '적합도 게이지 + 보유/부족 칩 + 갭 카드로 표시한다.' },
    { step: '활용', detail: '맞춤 문장 클립보드 복사, 진단을 localStorage(jd.diags)에 저장·비교한다.' },
  ],
  promptNotes: [
    'JD에서 요구 역량 키워드를 추출하고 내 역량과 매칭하도록 system 프롬프트로 지시한다.',
    '적합도·보유/부족 역량·갭·맞춤 불릿·ATS 키워드를 하나의 json_object 스키마로 강제해 받는다.',
    'API 키가 없으면 토큰 교집합/차집합으로 점수와 역량을 근사 계산한다.',
  ],
  architecture:
    '백엔드 없는 React SPA. 공통 레이아웃·5탭은 src/ui.tsx, 진단 기능은 src/App.tsx가 담당한다. ' +
    'OpenAI 호출은 src/lib/ai.ts, 맞춤 문장 복사는 Clipboard API로 처리하며, 진단 이력은 브라우저 localStorage에 저장한다.',
  structure: [
    { path: 'src/App.tsx', desc: '적합도 진단·역량 갭·맞춤 문장 + 메타(M)' },
    { path: 'src/ui.tsx', desc: '공통 레이아웃·5탭·UI 헬퍼' },
    { path: 'src/lib/ai.ts', desc: 'OpenAI chat 헬퍼(ask/hasKey)' },
    { path: 'src/index.css', desc: '테마·게이지/칩 스타일' },
  ],
  dataModel: [
    { name: 'Diag', desc: '적합도·보유/부족 역량·갭·맞춤불릿·키워드 진단 결과' },
    { name: 'Gap', desc: '부족 역량과 채우는 방법' },
    { name: 'Saved', desc: '저장한 공고 진단. localStorage "jd.diags"' },
  ],
  deploy:
    'Vite 빌드(base: "./") 후 GitHub Actions(deploy.yml)가 main push 시 GitHub Pages로 자동 배포 → aebonlee.github.io/project13/',
  scope: {
    include: ['JD·이력 입력 → 적합도·보유/부족 역량·갭·맞춤 불릿', '진단 저장·비교·클립보드 복사', 'AI 진단 + 키 없을 때 키워드 교집합 폴백'],
    exclude: ['실제 지원·ATS 연동', '이력서 자동 완성·디자인', '채용 공고 크롤링'],
  },
  pitch: [
    '"이 공고에 맞춘 지원"을 돕는 적합도 진단',
    'ATS·키워드 관점으로 통과율을 높이는 실전성',
    '키 없이도 토큰 교집합으로 근사 동작',
  ],
  stack: ['React 18', 'TypeScript', 'Vite', 'OpenAI GPT', 'Clipboard API', 'localStorage'],
  links: [
    { label: '워크넷', url: 'https://www.work.go.kr' },
  ],
};

interface Gap { gap: string; how_to_fill: string }
interface Diag { fit_score: number; matched: string[]; missing: string[]; strengths: string[]; gaps: Gap[]; bullets: string[]; keywords: string[] }
interface Saved extends Diag { id: number; title: string }

const tokenize = (s: string) => Array.from(new Set(s.toLowerCase().replace(/[^\w가-힣\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 2)));

function fallbackDiag(jd: string, resume: string): Diag {
  const jt = tokenize(jd), rt = new Set(tokenize(resume));
  const matched = jt.filter((w) => rt.has(w)).slice(0, 12);
  const missing = jt.filter((w) => !rt.has(w)).slice(0, 10);
  const score = jt.length ? Math.round((matched.length / Math.min(jt.length, 20)) * 100) : 0;
  return {
    fit_score: Math.min(100, score),
    matched, missing,
    strengths: ['공고에 등장한 핵심 용어와 겹치는 경험을 보유'],
    gaps: missing.slice(0, 3).map((m) => ({ gap: m, how_to_fill: `${m} 관련 경험·학습을 이력서에 추가하거나 보완하세요.` })),
    bullets: ['(AI 키를 입력하면 JD 맞춤 성과 문장을 생성합니다.) 핵심 성과를 수치와 함께 한 줄로 정리해 보세요.'],
    keywords: missing.slice(0, 6),
  };
}

async function getDiag(jd: string, resume: string, level: string): Promise<Diag> {
  if (!hasKey()) return fallbackDiag(jd, resume);
  try {
    const out = await ask(
      '너는 채용 매칭 분석가야. JD와 지원자 경력을 대조해 객관적으로 진단한다. 과장 금지, 사실 기반. 반드시 JSON만: {"fit_score":0,"matched":["보유 역량"],"missing":["부족 역량"],"strengths":["강점"],"gaps":[{"gap":"","how_to_fill":""}],"bullets":["JD 맞춤 이력서 문장"],"keywords":["추가할 키워드"]}',
      `[채용공고]\n${jd.slice(0, 1500)}\n\n[내 경력/스킬 · ${level}]\n${resume.slice(0, 1200)}\n\nfit_score는 0~100, gaps 2~3, bullets 3개, 한국어.`,
      { json: true, temperature: 0.4, max_tokens: 1500 },
    );
    const p = JSON.parse(out);
    if (typeof p.fit_score === 'undefined') return fallbackDiag(jd, resume);
    return {
      fit_score: Math.max(0, Math.min(100, Number(p.fit_score) || 0)),
      matched: (p.matched || []).map(String), missing: (p.missing || []).map(String), strengths: (p.strengths || []).map(String),
      gaps: (p.gaps || []).map((g: Gap) => ({ gap: String(g.gap || ''), how_to_fill: String(g.how_to_fill || '') })),
      bullets: (p.bullets || []).map(String), keywords: (p.keywords || []).map(String),
    };
  } catch { return fallbackDiag(jd, resume); }
}

function Gauge({ score, color }: { score: number; color: string }) {
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" style={{ flexShrink: 0 }}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="var(--soft)" strokeWidth="9" />
      <circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 46 46)" />
      <text x="46" y="44" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--text)">{score}</text>
      <text x="46" y="60" textAnchor="middle" fontSize="10" fill="var(--faint)">적합도</text>
    </svg>
  );
}

function Feature() {
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [level, setLevel] = useState('신입');
  const [diag, setDiag] = useState<Diag | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useLocalStorage<Saved[]>('jd.diags', []);

  const run = async () => { if (!jd.trim()) return; setLoading(true); setDiag(await getDiag(jd, resume, level)); setLoading(false); requestAnimationFrame(() => document.getElementById('d-top')?.scrollIntoView({ behavior: 'smooth' })); };
  const fitColor = (s: number) => s >= 70 ? '#16a34a' : s >= 45 ? '#f59e0b' : '#dc2626';

  return (
    <Stack>
      <div className="studio">
        <Field label="채용공고(JD)" hint="자격요건·우대사항 포함"><textarea rows={5} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="채용공고 전문을 붙여 넣으세요." /></Field>
        <Field label="내 경력 · 스킬"><textarea rows={4} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="경력 요약, 보유 기술, 프로젝트를 적어 주세요." /></Field>
        <Field label="지원 레벨"><div className="chips">{['신입', '주니어', '시니어'].map((l) => <button key={l} type="button" className="choice" onClick={() => setLevel(l)} style={{ borderColor: level === l ? M.color : 'var(--border)', background: level === l ? `${M.color}12` : 'var(--card)', flex: 'none', padding: '7px 14px' }}>{l}</button>)}</div></Field>
        <button className="btn" style={{ background: M.color }} disabled={loading || !jd.trim()} onClick={run}>{loading ? '진단 중…' : '🧭 채용 적합도 진단'}</button>
      </div>

      <div id="d-top" />
      {loading && <div className="spinner" />}
      {diag && !loading && (
        <Stack gap={16}>
          <div className="rcard" style={{ display: 'flex', gap: 16, alignItems: 'center', borderColor: `${fitColor(diag.fit_score)}55` }}>
            <Gauge score={diag.fit_score} color={fitColor(diag.fit_score)} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 16 }}>채용 적합도 {diag.fit_score}%</strong>
              {diag.strengths.length > 0 && <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13.5, color: 'var(--sub)' }}>{diag.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>}
              <button className="btn btn-ghost" style={{ marginTop: 10, padding: '6px 12px', fontSize: 12 }} onClick={() => setSaved([{ ...diag, id: Date.now(), title: jd.slice(0, 24).trim() || '진단' }, ...saved].slice(0, 20))}>💾 진단 저장</button>
            </div>
          </div>

          <div className="result-grid">
            <div className="rcard"><span className="tag" style={{ background: '#16a34a' }}>보유 역량 {diag.matched.length}</span><div className="chips" style={{ marginTop: 8 }}>{diag.matched.map((m) => <span key={m} style={{ fontSize: 12.5, color: '#16a34a', fontWeight: 600 }}>✓ {m}</span>)}</div></div>
            <div className="rcard"><span className="tag" style={{ background: '#dc2626' }}>부족 역량 {diag.missing.length}</span><div className="chips" style={{ marginTop: 8 }}>{diag.missing.map((m) => <span key={m} style={{ fontSize: 12.5, color: 'var(--faint)' }}>+ {m}</span>)}</div></div>
          </div>

          {diag.gaps.length > 0 && (
            <div className="learn">
              <h3 className="learn-h" style={{ color: M.color }}>🪜 갭 채우기</h3>
              <Stack gap={8}>{diag.gaps.map((g, i) => <div key={i} className="rcard"><strong style={{ color: '#f59e0b' }}>{g.gap}</strong><p style={{ marginTop: 4 }}>{g.how_to_fill}</p></div>)}</Stack>
            </div>
          )}

          {diag.bullets.length > 0 && (
            <div className="learn">
              <h3 className="learn-h" style={{ color: M.color }}>✍️ JD 맞춤 이력서 문장</h3>
              <Stack gap={8}>{diag.bullets.map((b, i) => (
                <div key={i} className="rcard" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ flex: 1, fontSize: 14, lineHeight: 1.7 }}>• {b}</span>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11.5, flexShrink: 0 }} onClick={() => navigator.clipboard?.writeText(b)}>복사</button>
                </div>
              ))}</Stack>
            </div>
          )}

          {diag.keywords.length > 0 && (
            <div className="learn">
              <h3 className="learn-h" style={{ color: M.color }}>🔑 추가하면 좋은 키워드</h3>
              <div className="chips">{diag.keywords.map((k) => <span key={k} className="tag" style={{ background: M.color, fontSize: 12.5, padding: '5px 12px' }}>{k}</span>)}</div>
            </div>
          )}
        </Stack>
      )}

      {saved.length > 0 && (
        <div className="learn">
          <h3 className="learn-h" style={{ color: M.color }}>💾 저장한 진단 ({saved.length})</h3>
          <Stack gap={8}>{[...saved].sort((a, b) => b.fit_score - a.fit_score).map((s) => (
            <div key={s.id} className="rcard" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="tag" style={{ background: fitColor(s.fit_score), position: 'static' }}>{s.fit_score}%</span>
              <span style={{ flex: 1, fontSize: 13.5 }}>{s.title}…</span>
              <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => { setDiag(s); requestAnimationFrame(() => document.getElementById('d-top')?.scrollIntoView({ behavior: 'smooth' })); }}>열기</button>
              <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 12 }} onClick={() => setSaved(saved.filter((x) => x.id !== s.id))}>✕</button>
            </div>
          ))}</Stack>
        </div>
      )}
    </Stack>
  );
}

export default function App() { return <AppLayout m={M} feature={<Feature />} />; }
