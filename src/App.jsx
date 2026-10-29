import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, BriefcaseBusiness, Camera, Check, CheckCircle2, ClipboardCheck,
  Clock3, Copy, FileCheck2, LayoutDashboard, LogOut, Menu, Plus, Search,
  Settings2, ShieldCheck, Sparkles, Users, Wallet, X, ImagePlus, ExternalLink
} from 'lucide-react';

const STORAGE_KEY = 'proofly_jobs_v1';
const PROFILE_KEY = 'proofly_business_v1';
const initialJobs = [
  { id:'PF-24081', title:'Living room repaint', customer:'Amara Okafor', email:'', description:'Prepare walls, apply primer and two coats of warm ivory paint.', price:'185000', status:'Awaiting Approval', dueDate:'2026-10-30', createdAt:'2026-10-27', notes:'Two coats completed. All surfaces cleaned and furniture returned.', evidence:[], token:'demo-passport-24081' },
  { id:'PF-24080', title:'AC installation', customer:'Daniel Musa', email:'', description:'Install and test one 1.5HP split air conditioner.', price:'75000', status:'In Progress', dueDate:'2026-11-02', createdAt:'2026-10-26', notes:'', evidence:[], token:'' },
  { id:'PF-24079', title:'Custom two-piece outfit', customer:'Tomi Adebayo', email:'', description:'Made-to-measure two-piece outfit in navy blue fabric.', price:'95000', status:'Approved', dueDate:'2026-10-24', createdAt:'2026-10-20', notes:'Final fitting completed and outfit handed over.', evidence:[], token:'demo-passport-24079' },
  { id:'PF-24078', title:'Kitchen deep clean', customer:'Ibrahim Bello', email:'', description:'Deep clean cabinets, worktops, appliances and floor.', price:'42000', status:'Revision Requested', dueDate:'2026-10-29', createdAt:'2026-10-19', notes:'', responseNote:'Please revisit the inside of the lower cabinet.', evidence:[], token:'demo-passport-24078' }
];
const fmtMoney = value => '₦' + Number(String(value || '0').replace(/[^\d.]/g, '') || 0).toLocaleString('en-NG');
const fmtDate = value => value ? new Date(value + (value.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-NG', {day:'numeric',month:'short',year:'numeric'}) : 'Not set';
const makeId = () => 'PF-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const makeToken = () => crypto.randomUUID ? crypto.randomUUID().replaceAll('-', '') : Math.random().toString(36).slice(2) + Date.now().toString(36);

function App() {
  const [jobs, setJobs] = useState(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) : initialJobs; }
    catch { return initialJobs; }
  });
  const [business, setBusiness] = useState(() => localStorage.getItem(PROFILE_KEY) || 'Your Business');
  const [view, setView] = useState('Overview');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All statuses');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [passport, setPassport] = useState(null);
  const [responseNote, setResponseNote] = useState('');
  const [draft, setDraft] = useState({title:'', customer:'', email:'', description:'', price:'', dueDate:'', notes:''});
  const [evidence, setEvidence] = useState([]);
  const isPassport = window.location.hash.startsWith('#/passport/');
  const token = window.location.hash.split('/passport/')[1] || '';

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem(PROFILE_KEY, business); }, [business]);
  useEffect(() => {
    if (isPassport) {
      const found = jobs.find(j => j.token === token);
      setPassport(found || null);
    }
  }, [isPassport, token, jobs]);

  const filtered = useMemo(() => jobs.filter(j => {
    const matches = [j.id,j.title,j.customer,j.description].join(' ').toLowerCase().includes(search.toLowerCase());
    return matches && (filter === 'All statuses' || j.status === filter);
  }), [jobs, search, filter]);

  const stats = {
    total: jobs.length,
    progress: jobs.filter(j => j.status === 'In Progress').length,
    approval: jobs.filter(j => j.status === 'Awaiting Approval').length,
    approved: jobs.filter(j => j.status === 'Approved').length
  };

  function notify(message) { setToast(message); window.setTimeout(() => setToast(''), 3000); }
  function createJob(e) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.customer.trim()) return notify('Add a job title and customer name.');
    const job = { ...draft, id:makeId(), status:'In Progress', createdAt:new Date().toISOString().slice(0,10), evidence, token:'', responseNote:'' };
    setJobs(prev => [job, ...prev]);
    setDraft({title:'', customer:'', email:'', description:'', price:'', dueDate:'', notes:''});
    setEvidence([]);
    setShowForm(false);
    setView('Jobs');
    notify('Job created successfully.');
  }
  function updateJob(id, updates) { setJobs(prev => prev.map(j => j.id === id ? {...j,...updates} : j)); }
  function shareJob(job) {
    let shareToken = job.token || makeToken();
    updateJob(job.id, {token:shareToken, status:job.status === 'In Progress' ? 'Awaiting Approval' : job.status});
    const url = window.location.origin + window.location.pathname + '#/passport/' + shareToken;
    navigator.clipboard?.writeText(url).then(() => notify('Passport link copied.')).catch(() => notify('Passport link created. Copy it from the passport view.'));
    setSelected({...job, token:shareToken, status:job.status === 'In Progress' ? 'Awaiting Approval' : job.status});
  }
  function uploadEvidence(e) {
    const files = Array.from(e.target.files || []).slice(0, 8 - evidence.length);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => setEvidence(prev => [...prev, {name:file.name, data:reader.result, stage:'After'}]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }
  function answerPassport(status) {
    if (!passport) return;
    updateJob(passport.id, {status, responseNote:responseNote.trim()});
    setPassport({...passport,status,responseNote:responseNote.trim()});
  }
  const nav = [
    {name:'Overview', icon:LayoutDashboard},
    {name:'Jobs', icon:BriefcaseBusiness},
    {name:'Passports', icon:FileCheck2},
    {name:'Customers', icon:Users},
    {name:'Billing', icon:Wallet},
    {name:'Settings', icon:Settings2}
  ];

  if (isPassport) {
    if (!passport) return <div className="public-wrap"><div className="public-card"><div className="brand"><span className="brand-mark">P</span>Proofly</div><h1>Passport not found</h1><p>This link may be invalid or the job is not saved in this browser. This starter version stores demo data locally.</p><a className="btn primary" href={window.location.pathname}>Open Proofly</a></div></div>;
    return <div className="public-wrap"><div className="public-card">
      <div className="public-head"><div className="brand"><span className="brand-mark">P</span>Proofly</div><span className={'status '+passport.status.toLowerCase().replaceAll(' ','-')}>{passport.status}</span></div>
      <div className="eyebrow">PROOF PASSPORT · {passport.id}</div><h1>{passport.title}</h1><p className="muted">Prepared by {business || 'Your Business'}</p>
      <div className="public-grid"><div><small>Customer</small><strong>{passport.customer}</strong></div><div><small>Job value</small><strong>{fmtMoney(passport.price)}</strong></div><div><small>Created</small><strong>{fmtDate(passport.createdAt)}</strong></div><div><small>Due date</small><strong>{fmtDate(passport.dueDate)}</strong></div></div>
      <h3>Job description</h3><p>{passport.description || 'No description provided.'}</p>
      {passport.notes && <><h3>Completion notes</h3><p>{passport.notes}</p></>}
      {passport.evidence?.length > 0 && <><h3>Work evidence</h3><div className="evidence-grid">{passport.evidence.map((im,i)=><figure key={i}><img src={im.data} alt={im.name}/><figcaption>{im.name}</figcaption></figure>)}</div></>}
      <div className="divider"></div><h3>Customer response</h3>
      {passport.status === 'Approved' ? <p className="success-text"><CheckCircle2 size={18}/> Work approved. Thank you.</p> : <><label className="field-label">Note (optional)</label><textarea value={responseNote} onChange={e=>setResponseNote(e.target.value)} placeholder="Add details if you are requesting a correction..." rows="3"/><div className="row"><button className="btn primary" onClick={()=>answerPassport('Approved')}><Check size={16}/> Approve work</button><button className="btn secondary" onClick={()=>answerPassport('Revision Requested')}>Request correction</button></div></>}
      <p className="tiny muted">Proofly provides a record of submitted job details and customer responses. It does not independently verify work quality.</p>
    </div></div>;
  }

  return <div className="app-shell">
    <aside className={'sidebar '+(mobileNav?'open':'')}>
      <div className="brand"><span className="brand-mark">P</span>proofly</div>
      <div className="workspace"><div className="workspace-icon">{(business || 'B').slice(0,1).toUpperCase()}</div><div><strong>{business || 'Your Business'}</strong><small>Business workspace</small></div><span className="chev">⌄</span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.name} className={'nav-item '+(view===item.name?'active':'')} onClick={()=>{setView(item.name);setMobileNav(false);}}><item.icon size={18}/><span>{item.name}</span>{item.name==='Jobs'&&<b>{jobs.length}</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={18}/></div><strong>Make every job count.</strong><p>Professional proof for every customer.</p><button onClick={()=>{setView('Billing');setMobileNav(false)}}>Explore plans <span>↗</span></button></div><div className="user-row"><div className="avatar">OG</div><div><strong>Proofly User</strong><small>Local demo account</small></div><LogOut size={16}/></div></div>
    </aside>
    {mobileNav && <button className="scrim" onClick={()=>setMobileNav(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <strong>{view}</strong></div><div className="top-actions"><span className="plan-badge"><span/> FREE PLAN</span><button className="icon-btn" title="Help" onClick={()=>notify('Tip: create a job, add evidence, then share its Proof Passport.')}><span>?</span></button><div className="avatar">OG</div></div></header>
      <div className="page-content">
        {view==='Overview' && <>
          <div className="welcome-row"><div><div className="eyebrow">YOUR BUSINESS AT A GLANCE</div><h1>Good work deserves proof.</h1><p>Keep every job organised, documented, and approved.</p></div><button className="btn primary" onClick={()=>setShowForm(true)}><Plus size={17}/> New job</button></div>
          <div className="stats-grid"><Stat icon={BriefcaseBusiness} label="Total jobs" value={stats.total} foot="All recorded jobs"/><Stat icon={Clock3} label="In progress" value={stats.progress} foot="Work underway"/><Stat icon={ClipboardCheck} label="Awaiting approval" value={stats.approval} foot="Customer response needed"/><Stat icon={BadgeCheck} label="Approved jobs" value={stats.approved} foot="Customer approved"/></div>
          <section className="panel"><div className="panel-head"><div><h2>Recent jobs</h2><p>Your latest work and customer updates.</p></div><button className="text-btn" onClick={()=>setView('Jobs')}>View all jobs ↗</button></div><JobTable jobs={filtered.slice(0,5)} onSelect={setSelected} onShare={shareJob}/></section>
          <div className="bottom-grid"><section className="panel how-panel"><div className="panel-head"><div><h2>Make your work official</h2><p>Three steps from job to approval.</p></div><ShieldCheck size={22} className="purple"/></div><div className="steps"><div><span>1</span><strong>Create a job</strong><small>Record customer and job details.</small></div><div><span>2</span><strong>Add evidence</strong><small>Attach photos and completion notes.</small></div><div><span>3</span><strong>Share a passport</strong><small>Let customers review and respond.</small></div></div></section><section className="panel quote-panel"><div className="quote-mark">“</div><h3>Trust is good.<br/>Proof is better.</h3><p>Give every customer a clear record of the work you do.</p><span className="quote-decoration"><ShieldCheck size={70}/></span></section></div>
        </>}
        {view==='Jobs' && <><div className="welcome-row"><div><div className="eyebrow">JOB MANAGEMENT</div><h1>All jobs</h1><p>Manage work from first task to customer approval.</p></div><button className="btn primary" onClick={()=>setShowForm(true)}><Plus size={17}/> New job</button></div><JobControls search={search} setSearch={setSearch} filter={filter} setFilter={setFilter}/><section className="panel"><JobTable jobs={filtered} onSelect={setSelected} onShare={shareJob}/></section></>}
        {view==='Passports' && <><div className="welcome-row"><div><div className="eyebrow">SHAREABLE REPORTS</div><h1>Proof Passports</h1><p>Reports you have prepared for customers.</p></div></div><section className="panel"><JobTable jobs={jobs.filter(j=>j.token)} onSelect={setSelected} onShare={shareJob}/>{!jobs.some(j=>j.token)&&<Empty title="No passports yet" text="Open a job and choose Create passport to generate a share link."/>}</section></>}
        {view === 'Customers' && (
  <>
    <div className="welcome-row">
      <div>
        <div className="eyebrow">CUSTOMER DIRECTORY</div>
        <h1>Customers</h1>
        <p>People connected to your recorded jobs.</p>
      </div>
      <button className="btn primary" onClick={() => setShowForm(true)}>
        <Plus size={17} /> New job
      </button>
    </div>

    <section className="panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>EMAIL</th>
              <th>JOBS</th>
              <th>LAST JOB</th>
            </tr>
          </thead>
          <tbody>
            {[...new Set(jobs.map(j => j.customer))].map(name => {
              const list = jobs.filter(j => j.customer === name);

              return (
                <tr key={name}>
                  <td><strong>{name}</strong></td>
                  <td>{list[0].email || '—'}</td>
                  <td>{list.length}</td>
                  <td>{list[0].title}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <Empty
          title="No customers yet"
          text="Create your first job to add a customer."
        />
      )}
    </section>
  </>
)}{view==='Billing' && <><div className="welcome-row"><div><div className="eyebrow">SIMPLE PRICING</div><h1>Plans that grow with you</h1><p>Start free. Upgrade when your business is ready.</p></div></div><div className="pricing-grid"><Plan name="Free" price="₦0" desc="For trying Proofly out" items={['Up to 10 jobs','Basic job records','Shareable passports']} current/><Plan name="Pro" price="₦5,000" period="/month" desc="For independent professionals" items={['Unlimited jobs','Business-branded reports','Evidence photo uploads','Priority support']}/><Plan name="Business" price="₦15,000" period="/month" desc="For growing teams" items={['Everything in Pro','Team workspace','Advanced reporting','Multiple staff accounts']}/></div><p className="notice">Demo pricing only. Payments and subscriptions are not connected in this starter project.</p></>}
        {view==='Settings' && <><div className="welcome-row"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>Settings</h1><p>Set up the business name shown on your passports.</p></div></div><section className="panel settings-panel"><label className="field-label">Business name</label><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="e.g. Stephen Repairs"/><p className="muted small">Saved automatically in this browser.</p><button className="btn primary" onClick={()=>notify('Business name saved.')}>Save changes</button></section></>}
      </div>
    </main>
    {showForm && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false)}}><form className="modal" onSubmit={createJob}><div className="modal-head"><div><div className="eyebrow">NEW RECORD</div><h2>Create a job</h2><p>Start a record for work you are doing for a customer.</p></div><button type="button" className="icon-btn" onClick={()=>setShowForm(false)}><X size={20}/></button></div><div className="form-grid"><Field label="Job title *" value={draft.title} onChange={v=>setDraft({...draft,title:v})} placeholder="e.g. Website redesign" required/><Field label="Customer name *" value={draft.customer} onChange={v=>setDraft({...draft,customer:v})} placeholder="Full name" required/><Field label="Customer email" value={draft.email} onChange={v=>setDraft({...draft,email:v})} placeholder="name@example.com" type="email"/><Field label="Job value (NGN)" value={draft.price} onChange={v=>setDraft({...draft,price:v})} placeholder="50000" type="number"/><Field label="Due date" value={draft.dueDate} onChange={v=>setDraft({...draft,dueDate:v})} type="date"/><div className="field full"><label>Job description</label><textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} placeholder="What work will be done?" rows="3"/></div><div className="field full"><label>Completion notes</label><textarea value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} placeholder="Add details about the work..." rows="2"/></div><div className="field full"><label>Work evidence (up to 8 images)</label><label className="upload-box"><ImagePlus size={21}/><span>Add photos</span><small>Images stay in this browser's local storage</small><input type="file" accept="image/*" multiple onChange={uploadEvidence} hidden/></label>{evidence.length>0&&<div className="evidence-thumbs">{evidence.map((im,i)=><div key={i}><img src={im.data} alt={im.name}/><button type="button" onClick={()=>setEvidence(prev=>prev.filter((_,n)=>n!==i))}>×</button></div>)}</div>}</div></div><div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setShowForm(false)}>Cancel</button><button className="btn primary" type="submit"><Plus size={16}/> Create job</button></div></form></div>}
    {selected && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="modal detail-modal"><div className="modal-head"><div><div className="eyebrow">{selected.id}</div><h2>{selected.title}</h2><p>Customer: {selected.customer}</p></div><button className="icon-btn" onClick={()=>setSelected(null)}><X size={20}/></button></div><div className="detail-summary"><div><small>Job value</small><strong>{fmtMoney(selected.price)}</strong></div><div><small>Due date</small><strong>{fmtDate(selected.dueDate)}</strong></div><div><small>Status</small><strong><span className={'status '+selected.status.toLowerCase().replaceAll(' ','-')}>{selected.status}</span></strong></div></div><h3>Job details</h3><p>{selected.description||'No description provided.'}</p>{selected.notes&&<><h3>Completion notes</h3><p>{selected.notes}</p></>}{selected.evidence?.length>0&&<><h3>Evidence</h3><div className="evidence-grid">{selected.evidence.map((im,i)=><figure key={i}><img src={im.data} alt={im.name}/><figcaption>{im.name}</figcaption></figure>)}</div></>}<div className="field"><label className="field-label">Update status</label><select value={selected.status} onChange={e=>{updateJob(selected.id,{status:e.target.value});setSelected({...selected,status:e.target.value})}}><option>In Progress</option><option>Awaiting Approval</option><option>Approved</option><option>Revision Requested</option></select></div><div className="modal-actions"><button className="btn secondary" onClick={()=>{setJobs(prev=>prev.filter(j=>j.id!==selected.id));setSelected(null);notify('Job deleted.')}}>Delete job</button><button className="btn primary" onClick={()=>shareJob(selected)}><ExternalLink size={16}/>{selected.token?'Copy passport link':'Create passport'}</button></div>{selected.token&&<div className="share-link"><span>{window.location.origin+window.location.pathname+'#/passport/'+selected.token}</span><button className="btn secondary small-btn" onClick={()=>{const url=window.location.origin+window.location.pathname+'#/passport/'+selected.token;navigator.clipboard?.writeText(url);notify('Passport link copied.')}}><Copy size={15}/> Copy</button></div>}</div></div>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>;
}

function Stat({icon:Icon,label,value,foot}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><Icon size={19}/></div><strong>{value}</strong><small>{foot}</small></div>; }
function Field({label,value,onChange,placeholder,type='text',required=false}) { return <div className="field"><label>{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} required={required}/></div>; }
function JobControls({search,setSearch,filter,setFilter}) { return <div className="controls"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs or customers..."/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All statuses</option><option>In Progress</option><option>Awaiting Approval</option><option>Approved</option><option>Revision Requested</option></select></div>; }
function JobTable({jobs,onSelect,onShare}) {
  if(!jobs.length) return <Empty title="No jobs match" text="Create a job or adjust your search and filters."/>;
  return <div className="table-wrap"><table><thead><tr><th>JOB</th><th>CUSTOMER</th><th>VALUE</th><th>STATUS</th><th>DUE DATE</th><th></th></tr></thead><tbody>{jobs.map(job=><tr key={job.id}><td><button className="job-title" onClick={()=>onSelect(job)}><span className="job-icon"><BriefcaseBusiness size={17}/></span><span><strong>{job.title}</strong><small>{job.id}</small></span></button></td><td>{job.customer}</td><td className="money">{fmtMoney(job.price)}</td><td><span className={'status '+job.status.toLowerCase().replaceAll(' ','-')}>{job.status}</span></td><td>{fmtDate(job.dueDate)}</td><td><button className="icon-btn" title="Open job" onClick={()=>onSelect(job)}>•••</button></td></tr>)}</tbody></table></div>;
}
function Empty({title,text}) { return <div className="empty"><div><ClipboardCheck size={24}/></div><strong>{title}</strong><p>{text}</p></div>; }

export default App;