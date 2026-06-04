import { useState } from 'react';
import { Hero, Stack, Field, Pill, type Meta } from './ui';

const M: Meta = { id: 13, icon: '🧭', title: 'JD 기반 채용 진단 서비스', tagline: '역량과 JD를 대조해 합격 가능성 진단', members: ['정미경'], color: '#7c3aed' };

// JD에서 추출할 역량 키워드 사전 (별칭 포함)
const SKILL_DICT: { canon: string; aliases: string[] }[] = [
  { canon: 'React', aliases: ['react', '리액트'] }, { canon: 'TypeScript', aliases: ['typescript', 'ts', '타입스크립트'] },
  { canon: 'JavaScript', aliases: ['javascript', 'js', '자바스크립트'] }, { canon: 'Python', aliases: ['python', '파이썬'] },
  { canon: 'SQL', aliases: ['sql', '데이터베이스', 'database', 'mysql', 'postgres'] }, { canon: 'AWS', aliases: ['aws', '클라우드', 'cloud'] },
  { canon: 'Java', aliases: ['java', '자바'] }, { canon: 'Node.js', aliases: ['node', 'nodejs', 'node.js'] },
  { canon: 'Git', aliases: ['git', '깃', 'github'] }, { canon: 'Docker', aliases: ['docker', '도커', '컨테이너'] },
  { canon: '데이터분석', aliases: ['데이터 분석', 'data analysis', '분석', 'pandas'] }, { canon: '커뮤니케이션', aliases: ['커뮤니케이션', '소통', 'communication'] },
  { canon: 'Figma', aliases: ['figma', '피그마', 'ui', 'ux'] }, { canon: '마케팅', aliases: ['마케팅', 'marketing', 'sns', '퍼포먼스'] },
];

const extract = (text: string): string[] => {
  const low = text.toLowerCase();
  return SKILL_DICT.filter((s) => s.aliases.some((a) => low.includes(a))).map((s) => s.canon);
};

export default function App() {
  const [skillsRaw, setSkillsRaw] = useState('React, TypeScript, Git');
  const [jd, setJd] = useState('');
  const [out, setOut] = useState<null | { matched: string[]; missing: string[]; pct: number }>(null);

  const run = () => {
    const mine = extract(skillsRaw);
    const need = extract(jd);
    if (!need.length) { setOut({ matched: [], missing: [], pct: 0 }); return; }
    const matched = need.filter((n) => mine.includes(n));
    const missing = need.filter((n) => !mine.includes(n));
    setOut({ matched, missing, pct: Math.round((matched.length / need.length) * 100) });
  };

  const verdict = (p: number) => p >= 70 ? { t: '합격 가능성 높음', c: '#10b981' } : p >= 40 ? { t: '도전 가능 — 보완 필요', c: '#f59e0b' } : { t: '역량 보강 권장', c: '#ef4444' };

  return (
    <div className="wrap">
      <Hero m={M} />
      <main style={{ marginTop: 22 }}>
        <Stack>
          <Field label="내 역량 (쉼표로 구분)"><input value={skillsRaw} onChange={(e) => setSkillsRaw(e.target.value)} placeholder="예: React, Python, SQL, 커뮤니케이션" /></Field>
          <Field label="채용공고(JD) 붙여넣기"><textarea rows={7} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="목표 기업의 직무기술서를 붙여넣으세요…" /></Field>
          <button className="btn" disabled={!jd.trim()} onClick={run}>🧭 합격 가능성 진단</button>

          {out && (
            <Stack gap={14}>
              {out.pct === 0 && out.matched.length === 0 && out.missing.length === 0 ? (
                <p style={{ color: 'var(--sub)' }}>JD에서 인식된 역량 키워드가 없어요. 기술/역량이 담긴 공고를 넣어보세요.</p>
              ) : (
                <>
                  <div className="box" style={{ textAlign: 'center', borderTop: `4px solid ${verdict(out.pct).c}` }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: verdict(out.pct).c }}>{out.pct}%</div>
                    <div style={{ fontWeight: 700, color: verdict(out.pct).c }}>{verdict(out.pct).t}</div>
                  </div>
                  <Field label={`✅ 충족 역량 (${out.matched.length})`}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{out.matched.length ? out.matched.map((s) => <Pill key={s} color="#10b981">{s}</Pill>) : <span style={{ color: 'var(--faint)', fontSize: 13 }}>없음</span>}</div>
                  </Field>
                  <Field label={`⚠ 보완 필요 (${out.missing.length})`}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{out.missing.length ? out.missing.map((s) => <Pill key={s} color="#ef4444">{s}</Pill>) : <span style={{ color: 'var(--faint)', fontSize: 13 }}>없음 — 완벽해요!</span>}</div>
                  </Field>
                  {out.missing.length > 0 && <div className="box"><p style={{ margin: 0, fontSize: 13.5 }}>💡 부족한 역량 중 1~2개를 골라 포트폴리오·자격으로 보완하면 합격률이 올라갑니다.</p></div>}
                </>
              )}
            </Stack>
          )}
        </Stack>
      </main>
    </div>
  );
}
