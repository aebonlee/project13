import { useState } from 'react';
import { AppLayout, Stack, Field, Pill, type Meta } from './ui';
import { ask } from './lib/ai';

const M: Meta = {
  id: 13, icon: '🧭', title: 'JD 기반 채용 진단 서비스', tagline: '역량과 JD를 대조해 합격 가능성 진단', members: ['정미경'], color: '#7c3aed', ai: true,
  problem: '지원 전 “내가 이 공고에 얼마나 맞는지” 객관적으로 알기 어렵습니다. 내 역량과 목표 기업의 직무기술서(JD)를 넣으면 매칭률을 진단하고, AI가 충족·부족 역량과 보완 전략을 분석합니다.',
  features: [
    { icon: '🎯', title: '매칭률 진단', desc: '역량과 JD 키워드를 대조해 적합도 산출' },
    { icon: '🤖', title: 'AI 심층 분석', desc: 'OpenAI가 강점·갭·보완 전략을 정리' },
    { icon: '✅', title: '충족/부족 역량', desc: '갖춘 역량과 보완할 역량을 구분 표시' },
    { icon: '📈', title: '합격 가능성', desc: '점수로 직관적 적합도 확인' },
  ],
  howto: ['내 역량을 입력해요', '목표 기업의 JD를 붙여넣어요', '매칭률 + AI 심층 분석을 받아요'],
  facts: [{ value: 'GPT', label: 'AI 분석' }, { value: '14+', label: '역량 사전' }, { value: '%', label: '매칭률' }, { value: '갭', label: '진단' }],
  info: [
    { title: 'JD 읽는 법', body: '‘자격요건(필수)’과 ‘우대사항’을 구분하세요. 필수 미충족은 치명적이지만, 우대사항은 차별화 포인트입니다.' },
    { title: '키워드 매칭', body: 'ATS(채용 시스템)는 JD 키워드와의 일치도를 봅니다. 자소서·이력서에 JD의 핵심 용어를 자연스럽게 반영하세요.' },
    { title: '갭 메우기', body: '부족 역량은 단기 강의·프로젝트·자격으로 보완하고, 포트폴리오로 증명하면 설득력이 커집니다.' },
  ],
  stack: ['React', 'TypeScript', 'OpenAI API', 'Vite'],
};

const DICT: { canon: string; aliases: string[] }[] = [
  { canon: 'React', aliases: ['react', '리액트'] }, { canon: 'TypeScript', aliases: ['typescript', 'ts', '타입스크립트'] },
  { canon: 'JavaScript', aliases: ['javascript', 'js', '자바스크립트'] }, { canon: 'Python', aliases: ['python', '파이썬'] },
  { canon: 'SQL', aliases: ['sql', '데이터베이스', 'database', 'mysql'] }, { canon: 'AWS', aliases: ['aws', '클라우드', 'cloud'] },
  { canon: 'Java', aliases: ['java', '자바'] }, { canon: 'Node.js', aliases: ['node', 'nodejs'] }, { canon: 'Git', aliases: ['git', '깃', 'github'] },
  { canon: 'Docker', aliases: ['docker', '도커', '컨테이너'] }, { canon: '데이터분석', aliases: ['데이터 분석', '분석', 'pandas'] },
  { canon: '커뮤니케이션', aliases: ['커뮤니케이션', '소통'] }, { canon: 'Figma', aliases: ['figma', '피그마', 'ui', 'ux'] }, { canon: '마케팅', aliases: ['마케팅', 'sns', '퍼포먼스'] },
];
const extract = (t: string) => { const l = t.toLowerCase(); return DICT.filter((s) => s.aliases.some((a) => l.includes(a))).map((s) => s.canon); };

function Feature() {
  const [skills, setSkills] = useState('React, TypeScript, Git');
  const [jd, setJd] = useState('');
  const [out, setOut] = useState<null | { matched: string[]; missing: string[]; pct: number }>(null);
  const [ai, setAi] = useState(''); const [loading, setLoading] = useState(false);

  const run = async () => {
    const mine = extract(skills), need = extract(jd);
    const matched = need.filter((n) => mine.includes(n)), missing = need.filter((n) => !mine.includes(n));
    const pct = need.length ? Math.round((matched.length / need.length) * 100) : 0;
    setOut({ matched, missing, pct }); setLoading(true); setAi('');
    try { const r = await ask('너는 채용 컨설턴트야. 지원자 역량과 JD를 비교해 강점·부족 역량·보완 전략을 3~5문장으로 분석해.', `내 역량: ${skills}\nJD:\n${jd}`, { temperature: 0.5, max_tokens: 400 }); setAi(r); }
    catch { setAi(''); }
    setLoading(false);
  };
  const verdict = (p: number) => p >= 70 ? { t: '합격 가능성 높음', c: '#10b981' } : p >= 40 ? { t: '도전 가능 — 보완 필요', c: '#f59e0b' } : { t: '역량 보강 권장', c: '#ef4444' };

  return (
    <Stack>
      <Field label="내 역량 (쉼표로 구분)"><input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="예: React, Python, SQL, 커뮤니케이션" /></Field>
      <Field label="채용공고(JD) 붙여넣기"><textarea rows={7} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="목표 기업의 직무기술서를 붙여넣으세요…" /></Field>
      <button className="btn" style={{ background: M.color }} disabled={!jd.trim() || loading} onClick={run}>{loading ? '🧭 진단 중…' : '🧭 합격 가능성 진단'}</button>
      {out && (
        <Stack gap={14}>
          <div className="box" style={{ textAlign: 'center', borderTop: `4px solid ${verdict(out.pct).c}` }}><div style={{ fontSize: 40, fontWeight: 800, color: verdict(out.pct).c }}>{out.pct}%</div><div style={{ fontWeight: 700, color: verdict(out.pct).c }}>{verdict(out.pct).t}</div></div>
          {ai && <div className="box" style={{ borderLeft: `4px solid ${M.color}` }}><p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>🤖 {ai}</p></div>}
          <Field label={`✅ 충족 역량 (${out.matched.length})`}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{out.matched.length ? out.matched.map((s) => <Pill key={s} color="#10b981">{s}</Pill>) : <span style={{ color: 'var(--faint)', fontSize: 13 }}>없음</span>}</div></Field>
          <Field label={`⚠ 보완 필요 (${out.missing.length})`}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{out.missing.length ? out.missing.map((s) => <Pill key={s} color="#ef4444">{s}</Pill>) : <span style={{ color: 'var(--faint)', fontSize: 13 }}>없음 — 완벽해요!</span>}</div></Field>
        </Stack>
      )}
    </Stack>
  );
}

export default function App() { return <AppLayout m={M} feature={<Feature />} />; }
