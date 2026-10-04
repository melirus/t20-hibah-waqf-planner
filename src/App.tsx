import {useEffect,useMemo,useState} from "react";
import {Area,AreaChart,CartesianGrid,Legend,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {Download,HeartHandshake,Landmark,ShieldCheck,Sparkles,WalletCards,X,Presentation,Info} from "lucide-react";

type DeferredPrompt={prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
type Form={name:string;age:number;principal:number;rate:number;years:number;hibahPct:number;cover:number};

const RM=(v:number)=>new Intl.NumberFormat("ms-MY",{style:"currency",currency:"MYR",maximumFractionDigits:0}).format(v);
const pct=(v:number)=>`${v.toFixed(0)}%`;

function Slider({label,value,min,max,step=1,onChange,suffix=""}:{label:string,value:number,min:number,max:number,step?:number,onChange:(n:number)=>void,suffix?:string}){
 return <label className="field"><span>{label}<b>{value.toLocaleString("ms-MY")}{suffix}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)}/></label>
}
function Metric({icon:Icon,title,value,note,tone="green"}:any){
 return <div className={`metric ${tone}`}><Icon size={22}/><div><small>{title}</small><strong>{value}</strong><p>{note}</p></div></div>
}
export default function App(){
 const [f,setF]=useState<Form>({name:"Dato' Amir",age:45,principal:500000,rate:6,years:20,hibahPct:60,cover:1000000});
 const [pitch,setPitch]=useState(false),[proposal,setProposal]=useState(false);
 const [install,setInstall]=useState<DeferredPrompt|null>(null);
 useEffect(()=>{const h=(e:any)=>{e.preventDefault();setInstall(e)};window.addEventListener("beforeinstallprompt",h);return()=>window.removeEventListener("beforeinstallprompt",h)},[]);
 const wakafPct=100-f.hibahPct;
 const annualReturn=f.principal*f.rate/100, hibahAnnual=annualReturn*f.hibahPct/100, wakafAnnual=annualReturn*wakafPct/100;
 const data=useMemo(()=>Array.from({length:f.years+1},(_,year)=>{
   // Model: principal compounds while equivalent annual distributable return is illustrated separately.
   const fund=f.principal*Math.pow(1+f.rate/100,year);
   return {year,dana:Math.round(fund),hibah:Math.round(hibahAnnual*year),wakaf:Math.round(wakafAnnual*year)}
 }),[f,hibahAnnual,wakafAnnual]);
 const end=data[data.length-1];
 const set=(k:keyof Form,v:any)=>setF(x=>({...x,[k]:v}));
 const installApp=async()=>{if(install){await install.prompt();await install.userChoice;setInstall(null)}};
 return <div className="app">
  <header><div className="brand"><div className="mark">T20</div><div><b>Hibah & Waqf Planner</b><small>Wealth Studio • Simulasi Perancangan</small></div></div><div className="actions">{install&&<button className="ghost" onClick={installApp}><Download size={17}/> Pasang Aplikasi</button>}<button className="gold" onClick={()=>setPitch(true)}><Presentation size={17}/> Panduan Perunding</button></div></header>
  <main>
   <section className="hero"><div><span className="eyebrow"><Sparkles size={15}/> T20 WEALTH STUDIO</span><h1>Legasi keluarga. Impak berkekalan.</h1><p>Visualisasikan strategi <b>Hibah Bersyarat</b>, <b>Perlindungan Takaful Pelaburan</b> dan <b>Wakaf Tunai</b> dalam satu perbincangan eksekutif.</p></div><button className="primary" onClick={()=>setProposal(true)}>Jana Cadangan Eksekutif</button></section>
   <div className="grid">
    <aside className="panel controls"><div className="sectionTitle"><WalletCards/> Profil & Modal</div>
      <div className="two"><label>Nama Prospek<input value={f.name} onChange={e=>set("name",e.target.value)}/></label><label>Umur<input type="number" min="18" max="80" value={f.age} onChange={e=>set("age",+e.target.value)}/></label></div>
      <Slider label="Nilai Pokok Pelaburan" value={f.principal} min={100000} max={10000000} step={50000} onChange={v=>set("principal",v)}/>
      <input className="number" type="number" value={f.principal} min={100000} max={10000000} step={50000} onChange={e=>set("principal",Math.max(100000,Math.min(10000000,+e.target.value||100000)))}/>
      <Slider label="Jangkaan Pulangan Dana Bersih" value={f.rate} min={3} max={10} step={0.1} suffix="%" onChange={v=>set("rate",v)}/>
      <Slider label="Tempoh Pelaburan" value={f.years} min={5} max={30} suffix=" tahun" onChange={v=>set("years",v)}/>
      <div className="divider"/>
      <div className="sectionTitle"><HeartHandshake/> Dwi-Agihan Pulangan</div>
      <Slider label="Hibah Keluarga / Tunai Waris" value={f.hibahPct} min={0} max={100} suffix="%" onChange={v=>set("hibahPct",v)}/>
      <div className="split"><div><span>Hibah {pct(f.hibahPct)}</span><b>{RM(hibahAnnual)} / tahun</b><small>{RM(hibahAnnual/12)} / bulan</small></div><div><span>Wakaf {pct(wakafPct)}</span><b>{RM(wakafAnnual)} / tahun</b><small>{RM(wakafAnnual/12)} / bulan</small></div></div>
      <label>Anggaran Perlindungan Hibah Hari Pertama<input className="number" type="number" min="0" step="100000" value={f.cover} onChange={e=>set("cover",+e.target.value||0)}/></label>
    </aside>
    <section className="workspace">
      <div className="metrics">
       <Metric icon={ShieldCheck} title="Perlindungan Hibah Hari Pertama" value={RM(f.cover)} note="Anggaran input perunding; tertakluk ilustrasi operator takaful."/>
       <Metric icon={Landmark} title="Potensi Wakaf Tahunan" value={RM(wakafAnnual)} note="Kelayakan potongan cukai bergantung penerima dan peruntukan cukai berkuat kuasa." tone="gold"/>
       <Metric icon={ShieldCheck} title="Hibah & Likuiditi" value="Penamaan / Hibah" note="Kesan pusaka bergantung struktur sijil, penamaan benefisiari dan dokumen sebenar." tone="blue"/>
      </div>
      <div className="panel chart"><div className="chartHead"><div><small>PROJEKSI {f.years} TAHUN</small><h2>Trajektori Dana & Legasi</h2></div><div className="end"><span>Nilai dana simulasi</span><b>{RM(end.dana)}</b></div></div>
       <ResponsiveContainer width="100%" height={340}><AreaChart data={data}><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.45}/><stop offset="95%" stopColor="#059669" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#25324a"/><XAxis dataKey="year" stroke="#94a3b8"/><YAxis stroke="#94a3b8" tickFormatter={v=>`${v/1000}k`}/><Tooltip formatter={(v:any)=>RM(Number(v))} contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12}}/><Legend/><Area type="monotone" dataKey="dana" name="Nilai Dana Terkumpul" stroke="#10b981" fill="url(#g1)" strokeWidth={3}/><Area type="monotone" dataKey="hibah" name="Kumulatif Hibah" stroke="#d97706" fillOpacity={0} strokeWidth={2}/><Area type="monotone" dataKey="wakaf" name="Kumulatif Wakaf" stroke="#38bdf8" fillOpacity={0} strokeWidth={2}/></AreaChart></ResponsiveContainer>
       <p className="modelnote"><Info size={15}/> Model ini memisahkan ilustrasi pertumbuhan dana daripada agihan pulangan. Ia bukan ilustrasi manfaat rasmi mana-mana operator dan tidak mengambil kira caj sijil, tabarru', turun naik unit, fi dana, cukai atau pengeluaran sebenar.</p>
      </div>
      <div className="impact"><div><small>Kumulatif Hibah Diilustrasi</small><b>{RM(end.hibah)}</b></div><div><small>Kumulatif Wakaf Diilustrasi</small><b>{RM(end.wakaf)}</b></div><div><small>Pulangan Tahunan pada Modal Asas</small><b>{RM(annualReturn)}</b></div></div>
    </section>
   </div>
  </main>
  <footer>Alat simulasi pendidikan & sokongan perbincangan. Bukan nasihat cukai, undang-undang, Syariah atau jaminan pulangan.</footer>
  {pitch&&<div className="modal"><div className="dialog"><button className="close" onClick={()=>setPitch(false)}><X/></button><span className="eyebrow">ADVISOR TALKING POINTS</span><h2>Skrip Perbincangan T20</h2>
   <div className="talk"><b>1 — Likuiditi legasi</b><p>“Kita bukan sekadar melihat berapa banyak aset yang ada, tetapi berapa cepat nilai boleh sampai kepada penerima yang dimaksudkan. Struktur penamaan dan hibah manfaat takaful perlu disemak pada sijil sebenar.”</p></div>
   <div className="talk"><b>2 — Tanpa pembiayaan berleveraj</b><p>“Simulasi ini bermula daripada modal yang tuan/puan peruntukkan. Ia tidak mengandaikan pinjaman untuk membesarkan pelaburan, jadi kita tidak mencipta liabiliti hutang semata-mata untuk mengejar pulangan.”</p></div>
   <div className="talk"><b>3 — Legasi berganda</b><p>“Pulangan yang terhasil boleh dirancang kepada dua objektif: manfaat keluarga melalui hibah dan impak berpanjangan melalui Wakaf Tunai / Wakaf Mushtarak sebagai Sadaqah Jariyah.”</p></div>
  </div></div>}
  {proposal&&<div className="modal"><div className="dialog proposal"><button className="close" onClick={()=>setProposal(false)}><X/></button><div className="proposalHead"><div className="mark">T20</div><div><small>CADANGAN EKSEKUTIF</small><h2>Hibah & Waqf Dual-Allocation</h2></div></div>
   <div className="proposalGrid"><div><small>Prospek</small><b>{f.name}, {f.age} tahun</b></div><div><small>Tarikh</small><b>{new Date().toLocaleDateString("ms-MY")}</b></div><div><small>Modal simulasi</small><b>{RM(f.principal)}</b></div><div><small>Horizon</small><b>{f.years} tahun @ {f.rate}%</b></div></div>
   <h3>Struktur Cadangan</h3><div className="split"><div><span>Hibah Keluarga — {f.hibahPct}%</span><b>{RM(hibahAnnual)}/tahun</b></div><div><span>Wakaf Tunai — {wakafPct}%</span><b>{RM(wakafAnnual)}/tahun</b></div></div>
   <div className="disclaimer"><b>Penafian Syariah & Pematuhan</b><p>Simulasi ini ialah alat pendidikan/perbincangan dan bukan fatwa, nasihat undang-undang, cukai atau tawaran produk. Struktur hibah, wakaf, manfaat, caj dan kelayakan cukai hendaklah disahkan terhadap sijil operator takaful, penerima wakaf yang diluluskan, penasihat Syariah dan peraturan semasa.</p></div>
   <button className="primary full" onClick={()=>window.print()}><Download size={17}/> Cetak / Simpan sebagai PDF</button>
  </div></div>}
 </div>
}