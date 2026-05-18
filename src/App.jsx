import React,{useState,useMemo,useEffect,useRef,useCallback}from'react';
import{createClient}from'@supabase/supabase-js';
import{LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip as RT,Legend,ResponsiveContainer,ComposedChart,ReferenceLine,Area,AreaChart,Cell}from'recharts';
import{TrendingUp,AlertTriangle,Download,Plus,Trash2,Users,DollarSign,Wallet,Target,Activity,Calendar,Megaphone,Sparkles,Briefcase,Layers,Copy,Eraser,GitCompare,Settings,FileJson,Upload,RefreshCw,CheckCircle2,Clock,XCircle,Info,ChevronRight,ChevronDown,Flag,Banknote,BarChart3,ListChecks,LogOut,CloudOff,Cloud,Save}from'lucide-react';

const SUPABASE_URL='https://ugpegefiawvronngtdfs.supabase.co';
const SUPABASE_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncGVnZWZpYXd2cm9ubmd0ZGZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzA1MDcsImV4cCI6MjA5NDcwNjUwN30.FdS6Rl-B-hen7YBBormohIbyPG27sbmjrK24FKyUt7g';
const supabase=createClient(SUPABASE_URL,SUPABASE_ANON);

const MN=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const SMULT={conservador:0.6,base:1.0,optimista:1.45};
const SK='profitlab_v3';
const HORIZONS=[{v:6,l:'6 meses'},{v:12,l:'12 meses'},{v:18,l:'18 meses'},{v:24,l:'24 meses'},{v:36,l:'36 meses'}];
const PS_LABELS={pendiente:'Pendiente',aprobado:'Aprobado',pagado:'Pagado',revision:'En revisión',cancelado:'Cancelado'};

function addMo(y,m,d){const t=y*12+m+d;return{year:Math.floor(t/12),month:t%12};}
function mLabel(sy,sm,o){const{year,month}=addMo(sy,sm,o);return`${MN[month]} '${String(year).slice(2)}`;}
function qOf(m){return Math.floor(m/3)+1;}
function qLabel(sy,sm,o){const{year,month}=addMo(sy,sm,o);return`${year} Q${qOf(month)}`;}
function qKey(sy,sm,o){const{year,month}=addMo(sy,sm,o);return`${year}-Q${qOf(month)}`;}
// Persistence via Supabase (see App component)
// localStorage used only as fallback offline cache
function localSave(v){try{localStorage.setItem(SK,JSON.stringify(v));}catch{}}
function localLoad(fb){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):fb;}catch{return fb;}}
const fARS=(v,c=false,s=false)=>{if(v==null||isNaN(v))return'—';const a=Math.abs(v);let t;if(c&&a>=1e6)t=`${(v/1e6).toFixed(2)}M`;else if(c&&a>=1e3)t=`${(v/1e3).toFixed(1)}K`;else t=Math.round(v).toLocaleString('es-AR');return`${s&&v>0?'+':''}$${t}`;};
const fPct=(v)=>v==null||isNaN(v)?'—':`${(v*100).toFixed(1)}%`;
const fNum=(v)=>v==null||isNaN(v)?'—':Math.round(v).toLocaleString('es-AR');
const avg=(a)=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;

const DP=[
  {id:'free',name:'Gratis',price:0,duration:'mensual',varCost:120,varCostPaid:0,aiCost:350,isPaid:false},
  {id:'pers-m',name:'Personal Solo Mensual',price:4990,duration:'mensual',varCost:180,varCostPaid:220,aiCost:750,isPaid:true},
  {id:'pers-t',name:'Personal Solo Trimestral',price:12990,duration:'trimestral',varCost:180,varCostPaid:220,aiCost:750,isPaid:true},
  {id:'pareja-m',name:'Personal Pareja Mensual',price:7990,duration:'mensual',varCost:240,varCostPaid:280,aiCost:1100,isPaid:true},
  {id:'pareja-t',name:'Personal Pareja Trimestral',price:20990,duration:'trimestral',varCost:240,varCostPaid:280,aiCost:1100,isPaid:true},
  {id:'inv-m',name:'Inversión Mensual',price:9990,duration:'mensual',varCost:280,varCostPaid:320,aiCost:1600,isPaid:true},
  {id:'inv-t',name:'Inversión Trimestral',price:26990,duration:'trimestral',varCost:280,varCostPaid:320,aiCost:1600,isPaid:true},
  {id:'duo-m',name:'Dúo Mensual',price:13990,duration:'mensual',varCost:340,varCostPaid:360,aiCost:2200,isPaid:true},
  {id:'duo-t',name:'Dúo Trimestral',price:36990,duration:'trimestral',varCost:340,varCostPaid:360,aiCost:2200,isPaid:true},
];
const DI=[
  {id:'inf-fer',name:'@financefer',code:'FER35',commissionPct:35,commissionMonths:1,quarterlyRule:'full'},
  {id:'inf-milon',name:'@milloninvest',code:'MILLON40',commissionPct:40,commissionMonths:2,quarterlyRule:'proportional'},
  {id:'inf-sergio',name:'@sergionomics',code:'SERGIO30',commissionPct:30,commissionMonths:3,quarterlyRule:'proportional'},
  {id:'inf-lucia',name:'@luciafinance',code:'LUCIA35',commissionPct:35,commissionMonths:2,quarterlyRule:'first_month'},
];
const DFC=[
  {id:'fc-1',name:'Sueldos equipo',amount:1800000},
  {id:'fc-2',name:'Hosting & infra',amount:85000},
  {id:'fc-3',name:'Software y herramientas',amount:120000},
  {id:'fc-4',name:'Contador y legal',amount:90000},
  {id:'fc-5',name:'Otros',amount:60000},
];
const DPART=[
  {id:'p1',name:'Socio A',share:45},{id:'p2',name:'Socio B',share:35},{id:'p3',name:'Inversor',share:20},
];

const PROFILES={
  finanzas:{i:{free:90,'pers-m':28,'pers-t':12,'pareja-m':18,'pareja-t':8,'inv-m':4,'inv-t':2,'duo-m':3,'duo-t':2},g:1.18,ads:450000,ct:{org:1,ads:1,inf:1}},
  inversiones:{i:{free:60,'pers-m':12,'pers-t':5,'pareja-m':8,'pareja-t':4,'inv-m':20,'inv-t':10,'duo-m':14,'duo-t':7},g:1.15,ads:700000,ct:{org:0.9,ads:1.3,inf:0.8}},
  influencers:{i:{free:110,'pers-m':24,'pers-t':10,'pareja-m':14,'pareja-t':6,'inv-m':9,'inv-t':4,'duo-m':6,'duo-t':2},g:1.22,ads:200000,ct:{org:0.7,ads:0.4,inf:1.8}},
  ads:{i:{free:70,'pers-m':20,'pers-t':8,'pareja-m':12,'pareja-t':5,'inv-m':10,'inv-t':4,'duo-m':6,'duo-t':3},g:1.20,ads:1500000,ct:{org:0.7,ads:2.2,inf:0.5}},
  freemium:{i:{free:200,'pers-m':10,'pers-t':6,'pareja-m':6,'pareja-t':4,'inv-m':4,'inv-t':2,'duo-m':2,'duo-t':1},g:1.25,ads:300000,ct:{org:1.6,ads:1.0,inf:0.8}},
};
const BASE_MIX={
  free:{organic:0.55,ads:0.30,'inf-fer':0.08,'inf-milon':0.04,'inf-sergio':0.02,'inf-lucia':0.01},
  'pers-m':{organic:0.30,ads:0.30,'inf-fer':0.18,'inf-milon':0.12,'inf-sergio':0.06,'inf-lucia':0.04},
  'pers-t':{organic:0.35,ads:0.20,'inf-fer':0.20,'inf-milon':0.10,'inf-sergio':0.10,'inf-lucia':0.05},
  'pareja-m':{organic:0.32,ads:0.28,'inf-fer':0.16,'inf-milon':0.12,'inf-sergio':0.08,'inf-lucia':0.04},
  'pareja-t':{organic:0.40,ads:0.20,'inf-fer':0.18,'inf-milon':0.10,'inf-sergio':0.08,'inf-lucia':0.04},
  'inv-m':{organic:0.28,ads:0.32,'inf-fer':0.15,'inf-milon':0.13,'inf-sergio':0.08,'inf-lucia':0.04},
  'inv-t':{organic:0.35,ads:0.25,'inf-fer':0.15,'inf-milon':0.13,'inf-sergio':0.08,'inf-lucia':0.04},
  'duo-m':{organic:0.30,ads:0.30,'inf-fer':0.16,'inf-milon':0.14,'inf-sergio':0.06,'inf-lucia':0.04},
  'duo-t':{organic:0.35,ads:0.25,'inf-fer':0.16,'inf-milon':0.14,'inf-sergio':0.06,'inf-lucia':0.04},
};

function genForecast(plans,channels,months,profileKey='finanzas'){
  const p=PROFILES[profileKey]||PROFILES.finanzas;
  const fc={};
  plans.forEach(pl=>{
    fc[pl.id]={};
    channels.forEach(ch=>{
      let w=(BASE_MIX[pl.id]||{})[ch]||0;
      if(ch==='organic')w*=(p.ct?.org||1);
      else if(ch==='ads')w*=(p.ct?.ads||1);
      else w*=(p.ct?.inf||1);
      fc[pl.id][ch]=Array.from({length:months},(_,mo)=>Math.max(0,Math.round((p.i[pl.id]||3)*w*Math.pow(p.g,mo))));
    });
  });
  return fc;
}

function makeStrategy(id,name,plans,channels,months,profileKey='finanzas'){
  const p=PROFILES[profileKey]||PROFILES.finanzas;
  return{id,name,forecast:genForecast(plans,channels,months,profileKey),monthlyAds:Array(months).fill(p.ads),milestones:{}};
}

function project({plans,fixedCosts,influencers,mpFees,partners,scenario,sy,sm,hm,strategy,paymentStatus}){
  const mult=SMULT[scenario]||1;
  const channels=['organic','ads',...influencers.map(i=>i.id)];
  const fcTotal=fixedCosts.reduce((s,c)=>s+c.amount,0);
  const cohorts={};
  plans.forEach(p=>{
    cohorts[p.id]={};
    channels.forEach(ch=>{
      const row=(strategy.forecast[p.id]?.[ch]||[]).slice(0,hm).map(v=>Math.round((v||0)*mult));
      while(row.length<hm)row.push(0);
      cohorts[p.id][ch]=row;
    });
  });
  const monthly=[];let cumCash=0;
  for(let m=0;m<hm;m++){
    const adsCost=strategy.monthlyAds?.[m]??0;
    const mo={m,label:mLabel(sy,sm,m),qLabel:qLabel(sy,sm,m),qKey:qKey(sy,sm,m),year:addMo(sy,sm,m).year,
      activeUsers:0,paidActiveUsers:0,freeUsers:0,newUsers:0,newPaidUsers:0,
      newUsersByChannel:{},newPaidByChannel:{},newFreeByChannel:{},
      billings:0,billingCount:0,mpFeesVar:0,mpFeesFix:0,mpFeesTotal:0,
      influencerCommissions:0,infCommByInf:{},infBillingsByInf:{},
      infActiveByInf:{},infNewPaidByInf:{},infNewFreeByInf:{},
      cashInflow:0,variableCosts:0,adsCost,fixedCosts:fcTotal,
      cashOutflow:0,cashFlow:0,cumCash:0,accrued:0,mrr:0,arr:0,
      grossMargin:0,grossMarginAmount:0,netResult:0,cacAds:null,cacByInf:{},perPlan:{}};
    channels.forEach(ch=>{mo.newUsersByChannel[ch]=0;mo.newPaidByChannel[ch]=0;mo.newFreeByChannel[ch]=0;});
    influencers.forEach(i=>{mo.infCommByInf[i.id]=0;mo.infBillingsByInf[i.id]=0;mo.infActiveByInf[i.id]=0;mo.infNewPaidByInf[i.id]=0;mo.infNewFreeByInf[i.id]=0;});
    plans.forEach(plan=>{
      const pd={active:0,billings:0,billingCount:0,accrued:0,variableCost:0,newUsers:0};
      channels.forEach(ch=>{
        for(let a=0;a<=m;a++){
          const u=cohorts[plan.id][ch][a]||0;if(!u)continue;
          if(a===m){pd.newUsers+=u;mo.newUsersByChannel[ch]+=u;if(plan.isPaid)mo.newPaidByChannel[ch]+=u;else mo.newFreeByChannel[ch]+=u;const inf=influencers.find(i=>i.id===ch);if(inf){if(plan.isPaid)mo.infNewPaidByInf[inf.id]+=u;else mo.infNewFreeByInf[inf.id]+=u;}}
          pd.active+=u;
          const inf=influencers.find(i=>i.id===ch);if(inf)mo.infActiveByInf[inf.id]+=u;
          const ms=m-a;
          const isBill=plan.duration==='mensual'?true:ms%3===0;
          if(isBill&&plan.price>0){
            const amt=u*plan.price;pd.billings+=amt;pd.billingCount+=u;
            mo.mpFeesVar+=amt*(mpFees.variablePct/100);mo.mpFeesFix+=u*mpFees.fixedAmount;
            if(inf){
              mo.infBillingsByInf[inf.id]+=amt;
              let bc=0;
              if(plan.duration==='mensual'){if(ms<inf.commissionMonths)bc=amt*(inf.commissionPct/100);}
              else if(ms<inf.commissionMonths){
                if(inf.quarterlyRule==='full')bc=amt*(inf.commissionPct/100);
                else if(inf.quarterlyRule==='proportional')bc=amt*(inf.commissionPct/100)*(Math.min(3,inf.commissionMonths-ms)/3);
                else bc=(amt/3)*(inf.commissionPct/100);
              }
              if(bc>0){mo.influencerCommissions+=bc;mo.infCommByInf[inf.id]+=bc;}
            }
          }
          if(plan.price>0)pd.accrued+=plan.duration==='mensual'?u*plan.price:u*(plan.price/3);
          pd.variableCost+=u*(plan.varCost+plan.aiCost+(plan.isPaid?plan.varCostPaid:0));
        }
      });
      pd.marginPerUser=pd.active>0?(pd.accrued-pd.variableCost)/pd.active:0;
      pd.marginPct=pd.accrued>0?(pd.accrued-pd.variableCost)/pd.accrued:0;
      mo.perPlan[plan.id]=pd;
      mo.activeUsers+=pd.active;if(plan.isPaid)mo.paidActiveUsers+=pd.active;else mo.freeUsers+=pd.active;
      mo.newUsers+=pd.newUsers;if(plan.isPaid)mo.newPaidUsers+=pd.newUsers;
      mo.billings+=pd.billings;mo.billingCount+=pd.billingCount;mo.accrued+=pd.accrued;mo.variableCosts+=pd.variableCost;
    });
    mo.mpFeesTotal=mo.mpFeesVar+mo.mpFeesFix;mo.mrr=mo.accrued;mo.arr=mo.mrr*12;
    mo.cashInflow=mo.billings-mo.mpFeesTotal-mo.influencerCommissions;
    mo.cashOutflow=mo.variableCosts+mo.adsCost+mo.fixedCosts;
    mo.cashFlow=mo.cashInflow-mo.cashOutflow;cumCash+=mo.cashFlow;mo.cumCash=cumCash;
    mo.grossMarginAmount=mo.accrued-mo.variableCosts;
    mo.grossMargin=mo.accrued>0?mo.grossMarginAmount/mo.accrued:0;
    mo.netResult=mo.accrued-mo.variableCosts-mo.fixedCosts-mo.adsCost-mo.mpFeesTotal-mo.influencerCommissions;
    const adsNP=plans.filter(p=>p.isPaid).reduce((s,p)=>s+(cohorts[p.id]['ads']?.[m]||0),0);
    mo.cacAds=adsNP>0?mo.adsCost/adsNP:null;
    influencers.forEach(inf=>{const n=plans.filter(p=>p.isPaid).reduce((s,p)=>s+(cohorts[p.id][inf.id]?.[m]||0),0);mo.cacByInf[inf.id]=n>0?(mo.infCommByInf[inf.id]||0)/n:null;});
    mo.partnerShares=partners.map(p=>({name:p.name,share:p.share,amount:mo.netResult*(p.share/100)}));
    mo.usersStart=monthly.length>0?monthly[monthly.length-1].activeUsers:0;mo.usersEnd=mo.activeUsers;mo.altas=mo.newUsers;
    monthly.push(mo);
  }
  const tot=monthly.reduce((a,m)=>({billings:a.billings+m.billings,cashFlow:a.cashFlow+m.cashFlow,cashInflow:a.cashInflow+m.cashInflow,accrued:a.accrued+m.accrued,netResult:a.netResult+m.netResult,variableCosts:a.variableCosts+m.variableCosts,fixedCosts:a.fixedCosts+m.fixedCosts,adsCost:a.adsCost+m.adsCost,mpFeesTotal:a.mpFeesTotal+m.mpFeesTotal,influencerCommissions:a.influencerCommissions+m.influencerCommissions,newPaidUsers:a.newPaidUsers+m.newPaidUsers}),{billings:0,cashFlow:0,cashInflow:0,accrued:0,netResult:0,variableCosts:0,fixedCosts:0,adsCost:0,mpFeesTotal:0,influencerCommissions:0,newPaidUsers:0});
  const last=monthly[monthly.length-1];
  const be=monthly.find(m=>m.netResult>0);
  const minCA=Math.min(...monthly.map(m=>m.cumCash));
  const bCash=monthly.reduce((b,m)=>!b||m.cashFlow>b.cashFlow?m:b,null);
  const wCash=monthly.reduce((b,m)=>!b||m.cashFlow<b.cashFlow?m:b,null);
  const arpuL=last.paidActiveUsers>0?last.mrr/last.paidActiveUsers:0;
  const cacAA=tot.newPaidUsers>0?tot.adsCost/tot.newPaidUsers:null;
  const gmA=avg(monthly.filter(m=>m.accrued>0).map(m=>m.grossMargin));
  const pb=arpuL>0&&cacAA?cacAA/(arpuL*(gmA||0.01)):null;
  return{monthly,cohorts,channels,summary:{tot,last,be,minCA,capitalNeeded:Math.max(0,-minCA),bCash,wCash,arpuL,cacAA,gmA,pb,burnBE:be?monthly.slice(0,be.m).reduce((s,m)=>s+Math.min(0,m.cashFlow),0):monthly.reduce((s,m)=>s+Math.min(0,m.cashFlow),0)}};
}

function aggregateBy(monthly,view){
  if(view==='monthly')return monthly.map(m=>({...m,pKey:m.label,pLabel:m.label}));
  const g={};
  monthly.forEach(m=>{
    const k=view==='quarterly'?m.qKey:String(m.year);
    const l=view==='quarterly'?m.qLabel:String(m.year);
    if(!g[k])g[k]={pKey:k,pLabel:l,months:[]};
    g[k].months.push(m);
  });
  return Object.values(g).map(gr=>{
    const last=gr.months[gr.months.length-1];const first=gr.months[0];
    const sum=(k)=>gr.months.reduce((s,m)=>s+m[k],0);
    return{pKey:gr.pKey,pLabel:gr.pLabel,months:gr.months,
      usersStart:first.usersStart,usersEnd:last.usersEnd,
      activeUsers:last.activeUsers,paidActiveUsers:last.paidActiveUsers,freeUsers:last.freeUsers,
      altas:sum('altas'),newUsers:sum('newUsers'),newPaidUsers:sum('newPaidUsers'),
      billings:sum('billings'),mpFeesTotal:sum('mpFeesTotal'),influencerCommissions:sum('influencerCommissions'),
      cashInflow:sum('cashInflow'),variableCosts:sum('variableCosts'),adsCost:sum('adsCost'),
      fixedCosts:sum('fixedCosts'),cashFlow:sum('cashFlow'),cumCash:last.cumCash,
      accrued:sum('accrued'),mrr:last.mrr,arr:last.arr,grossMargin:last.grossMargin,
      grossMarginAmount:sum('grossMarginAmount'),netResult:sum('netResult')};
  });
}

// === UI ATOMS ===
const Card=({children,className='',tone})=>{
  const tc=tone==='warning'?'border-amber-200 bg-amber-50/40':tone==='negative'?'border-rose-200 bg-rose-50/30':tone==='positive'?'border-emerald-200 bg-emerald-50/30':'border-stone-200 bg-white';
  return <div className={`border rounded-xl ${tc} ${className}`}>{children}</div>;
};
const Tip=({text,children})=>(
  <span className="relative inline-flex items-center group">
    {children}<span className="ml-0.5 text-stone-400 hover:text-stone-600 cursor-help"><Info size={11}/></span>
    <span className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-52 px-2.5 py-2 bg-stone-900 text-white text-[11px] rounded-lg leading-snug shadow-xl z-50 pointer-events-none whitespace-normal">{text}</span>
  </span>
);
const KPI=({label,value,sub,tone='default',icon:I,tip})=>{
  const tc={default:'text-stone-900',positive:'text-emerald-700',negative:'text-rose-700',warning:'text-amber-700',accent:'text-indigo-700'};
  return(
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">{tip?<Tip text={tip}>{label}</Tip>:label}</div>
        {I&&<I size={15} className="text-stone-400"/>}
      </div>
      <div className={`mt-2 text-2xl font-medium tabular-nums ${tc[tone]}`} style={{letterSpacing:'-0.02em'}}>{value}</div>
      {sub&&<div className="mt-1 text-xs text-stone-500 tabular-nums">{sub}</div>}
    </Card>
  );
};
const NI=({value,onChange,id,onKeyDown,onPaste,step=1,suffix,placeholder})=>(
  <div className="relative w-full">
    <input id={id} type="number" step={step} value={value??''} placeholder={placeholder??'0'} onChange={e=>onChange(e.target.value===''?0:parseFloat(e.target.value)||0)} onKeyDown={onKeyDown} onPaste={onPaste} onFocus={e=>e.target.select()}
      className="w-full px-2 py-1 text-sm border border-stone-200 rounded-md bg-stone-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:outline-none tabular-nums text-right"/>
    {suffix&&<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">{suffix}</span>}
  </div>
);
const TI=({value,onChange,placeholder,className=''})=>(
  <input type="text" value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
    className={`w-full px-2 py-1 text-sm border border-stone-200 rounded-md bg-stone-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:outline-none ${className}`}/>
);
const TA=({value,onChange,rows=3,placeholder})=>(
  <textarea rows={rows} value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
    className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-md bg-stone-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:outline-none"/>
);
const SI=({value,onChange,options,className=''})=>(
  <select value={value} onChange={e=>onChange(e.target.value)}
    className={`w-full px-2 py-1 text-sm border border-stone-200 rounded-md bg-stone-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:outline-none ${className}`}>
    {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);
const Toggle=({value,onChange})=>(
  <button type="button" onClick={()=>onChange(!value)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${value?'bg-emerald-600':'bg-stone-300'}`}>
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${value?'translate-x-5':'translate-x-1'}`}/>
  </button>
);
const Badge=({children,tone='default'})=>{
  const tc={default:'bg-stone-100 text-stone-700 border-stone-200',positive:'bg-emerald-50 text-emerald-800 border-emerald-200',negative:'bg-rose-50 text-rose-800 border-rose-200',warning:'bg-amber-50 text-amber-800 border-amber-200',accent:'bg-indigo-50 text-indigo-800 border-indigo-200'};
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-md ${tc[tone]}`}>{children}</span>;
};
function ConfirmBtn({onConfirm,label,icon:I,confirmText='¿Confirmás?',className='',danger=false}){
  const [armed,setArmed]=useState(false);
  useEffect(()=>{if(!armed)return;const t=setTimeout(()=>setArmed(false),4000);return()=>clearTimeout(t);},[armed]);
  return(
    <button onClick={()=>{if(armed){onConfirm();setArmed(false);}else setArmed(true);}}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition ${armed?'bg-amber-100 text-amber-900 border-amber-300':''+(!danger?'bg-stone-900 text-white border-stone-900':'bg-rose-600 text-white border-rose-600')} ${className}`}>
      {I&&<I size={13}/>}{armed?confirmText:label}
    </button>
  );
}
const VSwitcher=({view,setView})=>(
  <div className="flex bg-stone-100 rounded-lg p-0.5 text-xs">
    {[{id:'monthly',l:'Mensual'},{id:'quarterly',l:'Trimestral'},{id:'annual',l:'Anual'}].map(o=>(
      <button key={o.id} onClick={()=>setView(o.id)}
        className={`px-3 py-1.5 rounded-md font-medium transition ${view===o.id?'bg-white text-stone-900 shadow-sm':'text-stone-600 hover:text-stone-900'}`}>{o.l}</button>
    ))}
  </div>
);

// === HEADER + NAV ===
function Header({scenario,setScenario,strategies,activeId,setActiveId,onExport,saving,lastSaved,onLogout,userEmail}){
  return(
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-[1500px] mx-auto px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-stone-900 text-white flex items-center justify-center"><Layers size={16}/></div>
          <div><div className="text-[15px] font-medium text-stone-900">ProfitLab</div><div className="text-[11px] text-stone-500 -mt-0.5">Modelo financiero SaaS · ARS</div></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-100 rounded-lg text-xs">
            <Sparkles size={12} className="text-stone-500"/>
            <span className="text-stone-500">Estrategia:</span>
            <select value={activeId} onChange={e=>setActiveId(e.target.value)} className="bg-transparent text-stone-900 font-medium focus:outline-none cursor-pointer">
              {strategies.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex bg-stone-100 rounded-lg p-0.5 text-xs">
            {['conservador','base','optimista'].map(s=>(
              <button key={s} onClick={()=>setScenario(s)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition ${scenario===s?'bg-white text-stone-900 shadow-sm':'text-stone-600'}`}>{s}</button>
            ))}
          </div>
          {/* Save status indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            {saving
              ? <><RefreshCw size={12} className="animate-spin text-amber-600"/><span className="text-amber-600">Guardando...</span></>
              : lastSaved
              ? <><Cloud size={12} className="text-emerald-600"/><span className="text-emerald-600">Guardado {lastSaved.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</span></>
              : <><CloudOff size={12}/><span>Sin guardar</span></>
            }
          </div>
          <button onClick={onExport} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg">
            <Download size={13}/> CSV
          </button>
          {userEmail&&(
            <button onClick={onLogout} title={`Cerrar sesión (${userEmail})`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg">
              <LogOut size={13}/>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
function Nav({current,setTab}){
  const tabs=[
    {id:'dashboard',l:'Dashboard',I:Activity},{id:'forecast',l:'Forecast',I:TrendingUp},
    {id:'strategies',l:'Estrategias',I:GitCompare},{id:'comparator',l:'Comparador',I:BarChart3},
    {id:'plans',l:'Planes',I:Briefcase},{id:'costs',l:'Costos',I:Wallet},
    {id:'influencers',l:'Influencers',I:Megaphone},{id:'milestones',l:'Plan. trimestral',I:Flag},
    {id:'results',l:'Resultados',I:Calendar},{id:'partners',l:'Socios',I:Users},
    {id:'config',l:'Config.',I:Settings},
  ];
  return(
    <nav className="bg-white border-b border-stone-200 sticky top-[57px] z-20">
      <div className="max-w-[1500px] mx-auto px-6 flex items-center overflow-x-auto">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${current===t.id?'border-stone-900 text-stone-900':'border-transparent text-stone-500 hover:text-stone-800'}`}>
            <t.I size={13}/>{t.l}
          </button>
        ))}
      </div>
    </nav>
  );
}

// === DASHBOARD ===
function DashboardTab({proj,plans,influencers,strategy,scenario,view,setView}){
  const {monthly,summary}=proj;
  const periods=useMemo(()=>aggregateBy(monthly,view),[monthly,view]);
  const negPlans=plans.filter(p=>{const pd=summary.last.perPlan[p.id];return p.isPaid&&pd?.active>0&&pd?.marginPerUser<0;});
  const negInfs=influencers.filter(inf=>{const cac=summary.last.cacByInf[inf.id];const paidPlans=plans.filter(p=>p.isPaid);const avgM=avg(paidPlans.map(p=>summary.last.perPlan[p.id]?.marginPerUser||0));return cac!==null&&cac!==undefined&&cac>avgM*3;});
  const lowPaid=influencers.filter(inf=>summary.last.infNewFreeByInf[inf.id]>8&&summary.last.infNewPaidByInf[inf.id]<2);
  const cd=periods.map(p=>({label:p.pLabel,Caja:Math.round(p.cashInflow),Dev:Math.round(p.accrued),Neto:Math.round(p.netResult),MRR:Math.round(p.mrr),Activos:p.activeUsers,Pagos:p.paidActiveUsers,Acum:Math.round(p.cumCash)}));
  const int=view==='monthly'&&cd.length>18?2:0;
  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><div className="text-xs text-stone-500">Estrategia activa</div><h2 className="text-lg font-medium text-stone-900">{strategy.name}</h2></div>
        <VSwitcher view={view} setView={setView}/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="MRR final" value={fARS(summary.last.mrr,true)} sub={`ARR · ${fARS(summary.last.arr,true)}`} tone="accent" icon={Sparkles} tip="Monthly Recurring Revenue: ingreso devengado del último mes. ARR = MRR × 12."/>
        <KPI label="Resultado neto acum." value={fARS(summary.tot.netResult,true)} sub={`Margen bruto · ${fPct(summary.gmA)}`} tone={summary.tot.netResult>=0?'positive':'negative'} icon={Target} tip="Devengado − costos variables − fijos − ads − MP − influencers, acumulado."/>
        <KPI label="Caja acumulada" value={fARS(summary.last.cumCash,true)} sub={`Mín · ${fARS(summary.minCA,true)}`} tone={summary.last.cumCash>=0?'positive':'negative'} icon={Wallet} tip="Saldo de caja al cierre del horizonte."/>
        <KPI label="Usuarios pagos" value={fNum(summary.last.paidActiveUsers)} sub={`Totales · ${fNum(summary.last.activeUsers)}`} icon={Users} tip="Con cobertura vigente al cierre."/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Break-even" value={summary.be?summary.be.label:'No alcanzado'} sub={summary.be?`Mes ${summary.be.m+1} · ${fARS(summary.be.netResult,true)}`:'en el horizonte'} tone={summary.be?'positive':'warning'} icon={TrendingUp} tip="Primer mes con resultado neto > 0."/>
        <KPI label="CAC ads promedio" value={fARS(summary.cacAA)} sub={`Ads · ${fARS(summary.tot.adsCost,true)}`} icon={Megaphone} tip="Inversión en ads / nuevos usuarios pagos vía ads."/>
        <KPI label="ARPU mensual" value={fARS(summary.arpuL)} sub={`Payback · ${summary.pb?`${summary.pb.toFixed(1)}m`:'—'}`} icon={DollarSign} tip="MRR / usuarios pagos del último mes."/>
        <KPI label="Capital necesario" value={fARS(summary.capitalNeeded,true)} sub={`Burn BE · ${fARS(summary.burnBE,true)}`} tone={summary.capitalNeeded>0?'warning':'positive'} icon={Banknote} tip="Capital mínimo = −caja en el peor momento del período."/>
      </div>
      {(negPlans.length>0||negInfs.length>0||lowPaid.length>0)&&(
        <Card tone="warning" className="p-4">
          <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-2"><AlertTriangle size={15}/>Alertas del modelo</div>
          <ul className="space-y-1.5 text-sm text-amber-900">
            {negPlans.map((p,i)=><li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"/>Plan <strong>{p.name}</strong>: margen unitario negativo {fARS(summary.last.perPlan[p.id]?.marginPerUser||0)}/u.</li>)}
            {negInfs.map((inf,i)=><li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"/>Influencer <strong>{inf.name}</strong>: CAC ({fARS(summary.last.cacByInf[inf.id])}) supera 3× margen promedio.</li>)}
            {lowPaid.map((inf,i)=><li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"/>Influencer <strong>{inf.name}</strong>: mayormente trae usuarios gratis este mes.</li>)}
          </ul>
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-baseline justify-between mb-1"><h3 className="text-sm font-medium text-stone-900">Caja vs Devengado</h3><Badge>{view}</Badge></div>
          <p className="text-xs text-stone-500 mb-4">Cobros netos (caja) vs revenue atribuible al período (devengado).</p>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={cd} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#78716c'}} tickLine={false} axisLine={{stroke:'#e7e5e4'}} interval={int}/>
              <YAxis tick={{fontSize:11,fill:'#78716c'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`}/>
              <RT formatter={v=>fARS(v)} contentStyle={{fontSize:12,borderRadius:8}}/>
              <Legend iconType="square" iconSize={8} wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Caja" fill="#0891b2" radius={[3,3,0,0]} maxBarSize={28}/>
              <Line dataKey="Dev" name="Devengado" stroke="#4f46e5" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-baseline justify-between mb-1"><h3 className="text-sm font-medium text-stone-900">Resultado neto y caja acum.</h3><Badge>{view}</Badge></div>
          <p className="text-xs text-stone-500 mb-4">Barras = neto del período · línea = caja acumulada.</p>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={cd} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#78716c'}} tickLine={false} axisLine={{stroke:'#e7e5e4'}} interval={int}/>
              <YAxis tick={{fontSize:11,fill:'#78716c'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`}/>
              <ReferenceLine y={0} stroke="#a8a29e" strokeDasharray="3 3"/>
              <RT formatter={v=>fARS(v)} contentStyle={{fontSize:12,borderRadius:8}}/>
              <Legend iconType="square" iconSize={8} wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="Neto" maxBarSize={28} radius={[3,3,0,0]}>{cd.map((d,i)=><Cell key={i} fill={d.Neto>=0?'#059669':'#e11d48'}/>)}</Bar>
              <Line dataKey="Acum" stroke="#0f172a" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-baseline justify-between mb-1"><h3 className="text-sm font-medium text-stone-900">Usuarios activos</h3><Badge>{view}</Badge></div>
          <p className="text-xs text-stone-500 mb-4">Stock al cierre del período.</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={cd} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#78716c'}} tickLine={false} axisLine={{stroke:'#e7e5e4'}} interval={int}/>
              <YAxis tick={{fontSize:11,fill:'#78716c'}} tickLine={false} axisLine={false}/>
              <RT contentStyle={{fontSize:12,borderRadius:8}}/>
              <Legend iconType="square" iconSize={8} wrapperStyle={{fontSize:11}}/>
              <Area type="monotone" dataKey="Activos" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.6}/>
              <Area type="monotone" dataKey="Pagos" stroke="#4f46e5" fill="#a5b4fc" fillOpacity={0.6}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-baseline justify-between mb-1"><h3 className="text-sm font-medium text-stone-900">Evolución de MRR</h3><Badge tone="accent">{fARS(summary.last.mrr,true)}</Badge></div>
          <p className="text-xs text-stone-500 mb-4">Devengado mensual al cierre de cada período.</p>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={cd} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4"/>
              <XAxis dataKey="label" tick={{fontSize:10,fill:'#78716c'}} tickLine={false} axisLine={{stroke:'#e7e5e4'}} interval={int}/>
              <YAxis tick={{fontSize:11,fill:'#78716c'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1e6).toFixed(1)}M`}/>
              <RT formatter={v=>fARS(v)} contentStyle={{fontSize:12,borderRadius:8}}/>
              <Line dataKey="MRR" stroke="#7c3aed" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="text-sm font-medium text-stone-900 mb-1">Distribución a socios · último mes ({fARS(summary.last.netResult)})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {summary.last.partnerShares.map((p,i)=>(
            <div key={i} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
              <div className="text-[11px] text-stone-500 uppercase tracking-wider">{p.name}</div>
              <div className={`text-lg font-medium tabular-nums mt-1 ${p.amount>=0?'text-emerald-700':'text-rose-700'}`}>{fARS(p.amount,true)}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{p.share}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// === FORECAST TAB ===
function ForecastTab({strategy,updateStrategy,plans,influencers,hm,sy,sm}){
  const channels=useMemo(()=>[{id:'organic',l:'Orgánico'},{id:'ads',l:'Ads'},...influencers.map(i=>({id:i.id,l:i.name}))]  ,[influencers]);
  const [ch,setCh]=useState('organic');
  const iid=(pi,mi)=>`fc-${pi}-${mi}`;
  const focus=(pi,mi)=>{const el=document.getElementById(iid(pi,mi));if(el){el.focus();el.select();}};
  const setCell=(pid,mi,val)=>{
    const row=[...(strategy.forecast[pid]?.[ch]||Array(hm).fill(0))];
    row[mi]=Math.max(0,val);
    updateStrategy({...strategy,forecast:{...strategy.forecast,[pid]:{...strategy.forecast[pid],[ch]:row}}});
  };
  const handleKey=(e,pi,mi)=>{
    const last=plans.length-1;const lc=hm-1;
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();focus(Math.min(last,pi+1),mi);}
    else if(e.key==='ArrowUp'){e.preventDefault();focus(Math.max(0,pi-1),mi);}
    else if(e.key==='ArrowLeft'&&e.target.selectionStart===0){e.preventDefault();focus(pi,Math.max(0,mi-1));}
    else if(e.key==='ArrowRight'&&e.target.selectionEnd===e.target.value.length){e.preventDefault();focus(pi,Math.min(lc,mi+1));}
  };
  const handlePaste=(e,pi,mi)=>{
    const t=e.clipboardData.getData('text/plain');
    if(!t.includes('\t')&&!t.includes('\n'))return;
    e.preventDefault();
    const rows=t.replace(/\r/g,'').split('\n').filter(r=>r).map(r=>r.split('\t'));
    const updated={...strategy.forecast};
    rows.forEach((row,ri)=>{
      const p2=plans[pi+ri];if(!p2)return;
      const cur=[...(updated[p2.id]?.[ch]||Array(hm).fill(0))];
      row.forEach((v,ci)=>{const m2=mi+ci;if(m2>=hm)return;cur[m2]=Math.max(0,Math.round(parseFloat(v.replace(/[^\d.-]/g,''))||0));});
      updated[p2.id]={...updated[p2.id],[ch]:cur};
    });
    updateStrategy({...strategy,forecast:updated});
  };
  const clearRow=(pid)=>updateStrategy({...strategy,forecast:{...strategy.forecast,[pid]:{...strategy.forecast[pid],[ch]:Array(hm).fill(0)}}});
  const dupRow=(pid)=>{
    const idx=plans.findIndex(p=>p.id===pid);if(idx<0||idx>=plans.length-1)return;
    const src=strategy.forecast[pid]?.[ch]||Array(hm).fill(0);
    const tp=plans[idx+1];
    updateStrategy({...strategy,forecast:{...strategy.forecast,[tp.id]:{...strategy.forecast[tp.id],[ch]:[...src]}}});
  };
  const clearAllCh=()=>{
    const u={...strategy.forecast};plans.forEach(p=>{u[p.id]={...u[p.id],[ch]:Array(hm).fill(0)};});updateStrategy({...strategy,forecast:u});
  };
  const clearAll=()=>{
    const u={};plans.forEach(p=>{u[p.id]={};channels.forEach(c=>{u[p.id][c.id]=Array(hm).fill(0);});});updateStrategy({...strategy,forecast:u});
  };
  const totals=useMemo(()=>{
    const o=Array(hm).fill(0);
    plans.forEach(p=>channels.forEach(c=>{(strategy.forecast[p.id]?.[c.id]||[]).forEach((v,i)=>{if(i<hm)o[i]+=v||0;});}));
    return o;
  },[strategy.forecast,plans,channels,hm]);
  const yb=useMemo(()=>{const o=[];for(let m=1;m<hm;m++){const py=addMo(sy,sm,m-1).year;const cy=addMo(sy,sm,m).year;if(py!==cy)o.push(m);}return o;},[sy,sm,hm]);
  return(
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-medium text-stone-900">Forecast — {strategy.name}</h2>
            <p className="text-xs text-stone-500 mt-0.5">Enter↓ · Tab→ · ↑↓←→ navegan · Pegá tabla de Excel/Sheets directo en celdas</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ConfirmBtn onConfirm={clearAllCh} label="Limpiar canal" icon={Eraser} confirmText="¿Borrar canal?"/>
            <ConfirmBtn onConfirm={clearAll} label="Limpiar todo" icon={Trash2} confirmText="¿Borrar todo?" danger/>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-stone-500">Canal:</span>
          <div className="flex bg-stone-100 rounded-lg p-0.5 text-xs flex-wrap">
            {channels.map(c=>(
              <button key={c.id} onClick={()=>setCh(c.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${ch===c.id?'bg-white text-stone-900 shadow-sm':'text-stone-600'}`}>{c.l}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="text-sm" style={{minWidth:`${220+hm*68}px`}}>
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="text-left py-2 pr-1 font-medium sticky left-0 bg-white" style={{width:170}}>Plan</th>
                <th className="text-center py-2 px-1 w-16 sticky bg-white" style={{left:170}}>Acc.</th>
                {Array.from({length:hm}).map((_,m)=>(
                  <th key={m} className={`text-right py-2 px-0.5 font-medium w-16 ${yb.includes(m)?'border-l-2 border-indigo-200':''}`}>
                    <button onClick={()=>{const u={...strategy.forecast};plans.forEach(p=>{const r=[...(u[p.id]?.[ch]||Array(hm).fill(0))];r[m]=0;u[p.id]={...u[p.id],[ch]:r};});updateStrategy({...strategy,forecast:u});}} title="Limpiar mes" className="hover:text-rose-600">{mLabel(sy,sm,m)}</button>
                  </th>
                ))}
                <th className="text-right py-2 px-2 font-medium bg-stone-50 w-16">Tot.</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p,pi)=>{
                const row=strategy.forecast[p.id]?.[ch]||Array(hm).fill(0);
                const tot=row.slice(0,hm).reduce((s,v)=>s+v,0);
                return(
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/30">
                    <td className="py-1.5 pr-1 sticky left-0 bg-white text-xs font-medium text-stone-700">{p.name}</td>
                    <td className="py-1 px-1 sticky bg-white" style={{left:170}}>
                      <div className="flex items-center gap-0.5">
                        <button onClick={()=>clearRow(p.id)} className="p-1 text-stone-400 hover:text-rose-600" title="Limpiar fila"><Eraser size={11}/></button>
                        <button onClick={()=>dupRow(p.id)} className="p-1 text-stone-400 hover:text-indigo-600" title="Duplicar al siguiente plan"><Copy size={11}/></button>
                      </div>
                    </td>
                    {row.slice(0,hm).map((v,m)=>(
                      <td key={m} className={`py-0.5 px-0.5 ${yb.includes(m)?'border-l-2 border-indigo-200':''}`}>
                        <input id={iid(pi,m)} type="number" value={v===0?'':v} placeholder="0"
                          onChange={e=>setCell(p.id,m,e.target.value===''?0:Math.max(0,parseInt(e.target.value)||0))}
                          onKeyDown={e=>handleKey(e,pi,m)} onPaste={e=>handlePaste(e,pi,m)} onFocus={e=>e.target.select()}
                          className="w-full px-1 py-1 text-xs text-right tabular-nums border border-stone-200 rounded bg-stone-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"/>
                      </td>
                    ))}
                    <td className="py-1.5 px-2 text-right tabular-nums text-xs bg-stone-50 text-stone-700">{fNum(tot)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-stone-300 font-medium">
                <td colSpan={2} className="py-2 text-xs text-stone-900 uppercase tracking-wider sticky left-0 bg-stone-50">Total todos los canales</td>
                {totals.map((v,m)=>(
                  <td key={m} className={`py-2 px-0.5 text-right tabular-nums text-xs ${yb.includes(m)?'border-l-2 border-indigo-200':''}`}>{fNum(v)}</td>
                ))}
                <td className="py-2 px-2 text-right tabular-nums text-xs bg-stone-100 font-medium">{fNum(totals.reduce((s,v)=>s+v,0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 grid md:grid-cols-2 gap-2">
          <div><strong className="text-stone-800">Atajos:</strong> Enter / ↓ baja fila · Tab → derecha · ← → saltan celdas en bordes · click en mes = limpiar columna. Líneas azules = nuevo año.</div>
          <div><strong className="text-stone-800">Multianual:</strong> El stock de usuarios se arrastra automáticamente. Cargá las altas del año 2 manualmente — no se copian.</div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div><h3 className="text-sm font-medium text-stone-900">Presupuesto ads — {strategy.name}</h3><p className="text-xs text-stone-500 mt-0.5">Inversión mensual en publicidad. Editable por mes.</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="text-sm" style={{minWidth:`${hm*80}px`}}>
            <thead><tr className="text-[11px] text-stone-500 border-b border-stone-200">
              {Array.from({length:hm}).map((_,m)=><th key={m} className={`text-right py-2 px-1 font-medium w-20 ${yb.includes(m)?'border-l-2 border-indigo-200':''}`}>{mLabel(sy,sm,m)}</th>)}
            </tr></thead>
            <tbody><tr>
              {(strategy.monthlyAds||Array(hm).fill(0)).slice(0,hm).map((v,m)=>(
                <td key={m} className={`py-1 px-0.5 ${yb.includes(m)?'border-l-2 border-indigo-200':''}`}>
                  <input type="number" value={v} onChange={e=>{const n=[...strategy.monthlyAds];n[m]=parseFloat(e.target.value)||0;updateStrategy({...strategy,monthlyAds:n});}}
                    className="w-full px-1 py-1 text-xs text-right tabular-nums border border-stone-200 rounded bg-stone-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:outline-none"/>
                </td>
              ))}
            </tr></tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// === STRATEGIES TAB ===
function StrategiesTab({strategies,setStrategies,activeId,setActiveId,plans,influencers,hm}){
  const channels=['organic','ads',...influencers.map(i=>i.id)];
  const add=(pk)=>{
    const id=`strat-${Date.now()}`;const pnames={finanzas:'Finanzas personales',inversiones:'ProfitLab Inversiones',influencers:'Influencers chicos',ads:'Ads agresivo',freemium:'Freemium con conversión'};
    const s=makeStrategy(id,pnames[pk]||'Nueva estrategia',plans,channels,hm,pk);
    setStrategies([...strategies,s]);setActiveId(id);
  };
  const dup=(sid)=>{const src=strategies.find(s=>s.id===sid);if(!src)return;const id=`strat-${Date.now()}`;setStrategies([...strategies,{...JSON.parse(JSON.stringify(src)),id,name:`${src.name} (copia)`}]);setActiveId(id);};
  const del=(sid)=>{if(strategies.length<=1)return;const next=strategies.filter(s=>s.id!==sid);setStrategies(next);if(activeId===sid)setActiveId(next[0].id);};
  const rename=(sid,n)=>setStrategies(strategies.map(s=>s.id===sid?{...s,name:n}:s));
  const reset=(sid)=>{const u={};plans.forEach(p=>{u[p.id]={};channels.forEach(c=>{u[p.id][c]=Array(hm).fill(0);});});setStrategies(strategies.map(s=>s.id===sid?{...s,forecast:u}:s));};
  const regen=(sid)=>{const src=strategies.find(s=>s.id===sid);if(!src)return;const u=makeStrategy(sid,src.name,plans,channels,hm,'finanzas');setStrategies(strategies.map(s=>s.id===sid?{...u,milestones:src.milestones}:s));};
  return(
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-2"><h2 className="text-base font-medium text-stone-900">Estrategias de crecimiento</h2><p className="text-xs text-stone-500 mt-0.5">Cada estrategia tiene su propio forecast y presupuesto de ads. Planes, costos y socios son compartidos.</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {strategies.map(s=>{
            const isActive=s.id===activeId;
            const totF=plans.reduce((sum,p)=>sum+Object.values(s.forecast[p.id]||{}).reduce((s2,r)=>s2+(r||[]).reduce((s3,v)=>s3+v,0),0),0);
            const totA=(s.monthlyAds||[]).reduce((sum,v)=>sum+v,0);
            return(
              <div key={s.id} className={`border rounded-xl p-4 transition ${isActive?'border-stone-900 bg-stone-50':'border-stone-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1"><TI value={s.name} onChange={v=>rename(s.id,v)} className="font-medium text-base"/>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-stone-500">
                    <span>Forecast: <strong className="text-stone-700">{fNum(totF)}</strong> usuarios</span>
                    <span>Ads: <strong className="text-stone-700">{fARS(totA,true)}</strong></span>
                  </div></div>
                  {isActive&&<Badge tone="accent">Activa</Badge>}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {!isActive&&<button onClick={()=>setActiveId(s.id)} className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-medium rounded-md">Usar</button>}
                  <button onClick={()=>dup(s.id)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-[11px] font-medium rounded-md"><Copy size={11}/>Duplicar</button>
                  <button onClick={()=>regen(s.id)} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-[11px] font-medium rounded-md"><RefreshCw size={11}/>Regenerar</button>
                  <ConfirmBtn onConfirm={()=>reset(s.id)} label="Resetear forecast" icon={Eraser} confirmText="¿Resetear?" className="text-[11px] py-1 px-2.5"/>
                  {strategies.length>1&&<ConfirmBtn onConfirm={()=>del(s.id)} label="Eliminar" icon={Trash2} confirmText="¿Eliminar?" danger className="text-[11px] py-1 px-2.5"/>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-stone-200">
          <div className="text-xs text-stone-600 font-medium mb-2">Crear estrategia a partir de perfil:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {[['finanzas','Finanzas personales'],['inversiones','Inversiones'],['influencers','Influencers chicos'],['ads','Ads agresivo'],['freemium','Freemium']].map(([pk,l])=>(
              <button key={pk} onClick={()=>add(pk)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg"><Plus size={12}/>{l}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// === COMPARATOR TAB ===
function ComparatorTab({projByStrat,strategies}){
  const COLORS=['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
  const svs=strategies.map((s,i)=>{
    const p=projByStrat[s.id];if(!p)return{id:s.id,name:s.name,color:COLORS[i%COLORS.length],vals:{}};
    const{summary:sm,monthly}=p;
    return{id:s.id,name:s.name,color:COLORS[i%COLORS.length],vals:{
      paidActive:sm.last.paidActiveUsers,freeActive:sm.last.freeUsers,totalActive:sm.last.activeUsers,
      mrr:sm.last.mrr,arr:sm.last.arr,
      cashInflow:sm.tot.cashInflow,accrued:sm.tot.accrued,
      fixedCosts:sm.tot.fixedCosts,variableCosts:sm.tot.variableCosts,adsCost:sm.tot.adsCost,
      mpFees:sm.tot.mpFeesTotal,infComm:sm.tot.influencerCommissions,netResult:sm.tot.netResult,
      bCash:sm.bCash?.cashFlow,bCashL:sm.bCash?.label,wCash:sm.wCash?.cashFlow,wCashL:sm.wCash?.label,
      beLabel:sm.be?.label,beIdx:sm.be?sm.be.m:Infinity,
      cac:sm.cacAA,arpu:sm.arpuL,gm:sm.gmA,pb:sm.pb,burn:sm.burnBE,cap:sm.capitalNeeded,
    }};
  });
  const rows=[
    {k:'paidActive',l:'Usuarios pagos finales',f:fNum,best:'max'},
    {k:'freeActive',l:'Usuarios gratis finales',f:fNum,best:'max'},
    {k:'totalActive',l:'Usuarios totales finales',f:fNum,best:'max'},
    {k:'mrr',l:'MRR final',f:v=>fARS(v,true),best:'max'},
    {k:'arr',l:'ARR final',f:v=>fARS(v,true),best:'max'},
    null,
    {k:'cashInflow',l:'Ingresos caja acum.',f:v=>fARS(v,true),best:'max'},
    {k:'accrued',l:'Ingresos devengados acum.',f:v=>fARS(v,true),best:'max'},
    {k:'fixedCosts',l:'Costos fijos acum.',f:v=>fARS(v,true),best:'min'},
    {k:'variableCosts',l:'Costos variables acum.',f:v=>fARS(v,true),best:'min'},
    {k:'adsCost',l:'Publicidad acum.',f:v=>fARS(v,true),best:'min'},
    {k:'mpFees',l:'Comisiones MP acum.',f:v=>fARS(v,true),best:'min'},
    {k:'infComm',l:'Comisiones influencers acum.',f:v=>fARS(v,true),best:'min'},
    {k:'netResult',l:'Resultado neto acum.',f:v=>fARS(v,true),best:'max'},
    null,
    {k:'bCash',l:'Mejor mes caja',f:v=>fARS(v,true),best:'max'},{k:'bCashL',l:'Mes del mejor cash',f:v=>v||'—',best:null},
    {k:'wCash',l:'Peor mes caja',f:v=>fARS(v,true),best:'max'},{k:'wCashL',l:'Mes del peor cash',f:v=>v||'—',best:null},
    {k:'beLabel',l:'Mes de break-even',f:v=>v||'—',best:null,customBest:'beIdx'},
    null,
    {k:'cac',l:'CAC ads promedio',f:fARS,best:'min'},
    {k:'arpu',l:'ARPU mensual final',f:fARS,best:'max'},
    {k:'gm',l:'Margen bruto promedio',f:fPct,best:'max'},
    {k:'pb',l:'Payback (meses)',f:v=>v?`${v.toFixed(1)}m`:'—',best:'min'},
    {k:'burn',l:'Burn hasta break-even',f:v=>fARS(v,true),best:'max'},
    {k:'cap',l:'Capital necesario',f:v=>fARS(v,true),best:'min'},
  ];
  const best={};
  rows.forEach(r=>{
    if(!r)return;const bk=r.customBest||r.k;const vals=svs.map(sv=>sv.vals[bk]).filter(v=>v!==null&&v!==undefined&&!isNaN(v));
    if(!vals.length)return;if(r.best==='max')best[r.k]=Math.max(...vals);else if(r.best==='min')best[r.k]=Math.min(...vals);
  });
  const allHaveBE=svs.every(sv=>sv.vals.beIdx!==Infinity);
  const base=projByStrat[strategies[0]?.id]?.monthly||[];
  const mC=(key)=>base.map((_,i)=>{const row={label:base[i].label};strategies.forEach(s=>{const m=projByStrat[s.id]?.monthly[i];row[s.name]=m?Math.round(m[key]):0;});return row;});
  const int=base.length>18?2:0;
  return(
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div><h2 className="text-base font-medium text-stone-900">Comparador de estrategias</h2><p className="text-xs text-stone-500 mt-0.5">{strategies.length} estrategias · verde = mejor valor por métrica</p></div>
          {!allHaveBE&&<Badge tone="warning"><AlertTriangle size={11} className="mr-1"/>Hay estrategias sin break-even</Badge>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="text-left py-2 pr-2 font-medium sticky left-0 bg-white">Métrica</th>
                {svs.map(sv=><th key={sv.id} className="text-right py-2 px-2 font-medium text-xs" style={{color:sv.color}}>{sv.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>{
                if(r===null)return (<tr key={`s${i}`}><td colSpan={svs.length+1} className="h-2"/></tr>);
                const bv=best[r.k];
                return(
                  <tr key={r.k} className="border-b border-stone-100">
                    <td className="py-1.5 pr-2 text-xs text-stone-700 sticky left-0 bg-white">{r.l}</td>
                    {svs.map(sv=>{
                      const v=sv.vals[r.k];const isBest=r.best&&v!==null&&v!==undefined&&!isNaN(v)&&v===bv&&svs.length>1;
                      return (<td key={sv.id} className={`py-1.5 px-2 text-right tabular-nums text-xs ${isBest?'bg-emerald-50 text-emerald-800 font-medium':'text-stone-700'}`}>{r.f(v)}</td>);
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[['paidActiveUsers','Usuarios pagos',false],['mrr','MRR',true],['netResult','Resultado neto',true],['cumCash','Caja acumulada',true]].map(([key,title,isMoney])=>(
          <Card key={key} className="p-5">
            <h3 className="text-sm font-medium text-stone-900 mb-3">{title} por estrategia</h3>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={mC(key)} margin={{top:5,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4"/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:'#78716c'}} tickLine={false} interval={int}/>
                <YAxis tick={{fontSize:11,fill:'#78716c'}} tickLine={false} axisLine={false} tickFormatter={isMoney?v=>`${(v/1e6).toFixed(1)}M`:undefined}/>
                {key==='netResult'||key==='cumCash'?<ReferenceLine y={0} stroke="#a8a29e" strokeDasharray="3 3"/>:null}
                <RT formatter={isMoney?v=>fARS(v):undefined} contentStyle={{fontSize:12,borderRadius:8}}/>
                <Legend iconType="square" iconSize={8} wrapperStyle={{fontSize:11}}/>
                {strategies.map((s,i)=><Line key={s.id} dataKey={s.name} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={false}/>)}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>
    </div>
  );
}

// === PLANS TAB ===
function PlansTab({plans,setPlans,proj}){
  const last=proj.summary.last;
  const up=(id,f,v)=>setPlans(plans.map(p=>p.id===id?{...p,[f]:v}:p));
  return(
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-base font-medium text-stone-900">Catálogo de planes</h2><p className="text-xs text-stone-500 mt-0.5">Precios y costos compartidos entre todas las estrategias.</p></div>
          <button onClick={()=>setPlans([...plans,{id:`p-${Date.now()}`,name:'Nuevo plan',price:5000,duration:'mensual',varCost:200,varCostPaid:200,aiCost:500,isPaid:true}])} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg"><Plus size={14}/>Agregar plan</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <th className="text-left py-2 pr-2 font-medium">Plan</th>
              <th className="text-right py-2 px-2 font-medium">Precio</th>
              <th className="text-left py-2 px-2 font-medium">Duración</th>
              <th className="text-right py-2 px-2 font-medium w-20"><Tip text="Costo de servidor/infra por usuario activo.">Var/u</Tip></th>
              <th className="text-right py-2 px-2 font-medium w-20"><Tip text="Costo adicional solo para usuarios pagos (MP, soporte, etc.)">Var pago</Tip></th>
              <th className="text-right py-2 px-2 font-medium w-20"><Tip text="Costo de IA (OpenAI, etc.) por usuario activo por mes.">IA/u</Tip></th>
              <th className="text-center py-2 px-2 font-medium">Pago</th>
              <th className="text-right py-2 px-2 font-medium">Margen u.</th>
              <th className="text-right py-2 px-2 font-medium">Activos</th>
              <th className="w-8"/>
            </tr></thead>
            <tbody>
              {plans.map(p=>{
                const pd=last.perPlan[p.id]||{marginPerUser:0,active:0};
                const neg=pd.marginPerUser<0&&pd.active>0;
                return(
                  <tr key={p.id} className={`border-b border-stone-100 ${neg?'bg-rose-50/40':''}`}>
                    <td className="py-2 pr-2"><TI value={p.name} onChange={v=>up(p.id,'name',v)}/></td>
                    <td className="py-2 px-2 w-28"><NI value={p.price} onChange={v=>up(p.id,'price',v)}/></td>
                    <td className="py-2 px-2 w-32"><SI value={p.duration} onChange={v=>up(p.id,'duration',v)} options={[{v:'mensual',l:'Mensual'},{v:'trimestral',l:'Trimestral'}]}/></td>
                    <td className="py-2 px-2 w-24"><NI value={p.varCost} onChange={v=>up(p.id,'varCost',v)}/></td>
                    <td className="py-2 px-2 w-24"><NI value={p.varCostPaid} onChange={v=>up(p.id,'varCostPaid',v)}/></td>
                    <td className="py-2 px-2 w-24"><NI value={p.aiCost} onChange={v=>up(p.id,'aiCost',v)}/></td>
                    <td className="py-2 px-2 text-center"><Toggle value={p.isPaid} onChange={v=>up(p.id,'isPaid',v)}/></td>
                    <td className={`py-2 px-2 text-right tabular-nums text-sm ${neg?'text-rose-700 font-medium':'text-stone-700'}`}>{fARS(pd.marginPerUser)}{neg&&<AlertTriangle size={12} className="inline ml-1 -mt-0.5"/>}</td>
                    <td className="py-2 px-2 text-right tabular-nums text-sm text-stone-600">{fNum(pd.active)}</td>
                    <td className="py-2 pl-2"><button onClick={()=>setPlans(plans.filter(pl=>pl.id!==p.id))} className="text-stone-400 hover:text-rose-600 p-1"><Trash2 size={14}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {plans.filter(p=>p.isPaid).map(p=>{const pd=last.perPlan[p.id]||{};const tone=pd.marginPerUser<0?'negative':pd.marginPct<0.4?'warning':'positive';return(
          <div key={p.id} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
            <div className="text-xs text-stone-600 font-medium">{p.name}</div>
            <div className={`text-base font-medium tabular-nums mt-1 ${tone==='negative'?'text-rose-700':tone==='warning'?'text-amber-700':'text-emerald-700'}`}>{fARS(pd.marginPerUser)} <span className="text-xs text-stone-500 font-normal">/u · {fPct(pd.marginPct)}</span></div>
            <div className="text-[11px] text-stone-500 mt-0.5 tabular-nums">Dev {fARS(pd.accrued,true)} · CVar {fARS(pd.variableCost,true)}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

// === COSTS TAB ===
function CostsTab({fixedCosts,setFixedCosts,mpFees,setMpFees}){
  const total=fixedCosts.reduce((s,c)=>s+c.amount,0);
  const up=(id,f,v)=>setFixedCosts(fixedCosts.map(c=>c.id===id?{...c,[f]:v}:c));
  return(
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-base font-medium text-stone-900">Costos fijos mensuales</h2><p className="text-xs text-stone-500 mt-0.5">Total: <strong className="tabular-nums">{fARS(total,true)}</strong>/mes · Compartidos entre estrategias.</p></div>
          <button onClick={()=>setFixedCosts([...fixedCosts,{id:`fc-${Date.now()}`,name:'Nuevo costo',amount:0}])} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg"><Plus size={14}/>Agregar</button>
        </div>
        <div className="space-y-2">
          {fixedCosts.map(c=>(
            <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-7"><TI value={c.name} onChange={v=>up(c.id,'name',v)}/></div>
              <div className="col-span-4"><NI value={c.amount} onChange={v=>up(c.id,'amount',v)}/></div>
              <button onClick={()=>setFixedCosts(fixedCosts.filter(fc=>fc.id!==c.id))} className="text-stone-400 hover:text-rose-600 p-1 col-span-1"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">La publicidad se configura por estrategia en Forecast → Presupuesto ads.</p>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-medium text-stone-900 mb-3"><Tip text="Comisión variable sobre el monto cobrado + costo fijo por transacción procesada.">Mercado Pago</Tip></h3>
        <div className="space-y-3">
          <div><label className="block text-xs text-stone-600 mb-1">Comisión variable</label><NI value={mpFees.variablePct} step={0.01} onChange={v=>setMpFees({...mpFees,variablePct:v})} suffix="%"/></div>
          <div><label className="block text-xs text-stone-600 mb-1">Costo fijo por cobro</label><NI value={mpFees.fixedAmount} onChange={v=>setMpFees({...mpFees,fixedAmount:v})}/></div>
        </div>
      </Card>
    </div>
  );
}

// === INFLUENCERS TAB ===
function InfluencersTab({influencers,setInfluencers,proj,paymentStatus,setPaymentStatus}){
  const [sub,setSub]=useState('config');
  const {monthly,summary}=proj;
  const up=(id,f,v)=>setInfluencers(influencers.map(i=>i.id===id?{...i,[f]:v}:i));
  const infKpis=influencers.map(inf=>{
    const cG=monthly.reduce((s,m)=>s+(m.infCommByInf[inf.id]||0),0);
    const bT=monthly.reduce((s,m)=>s+(m.infBillingsByInf[inf.id]||0),0);
    const nP=monthly.reduce((s,m)=>s+(m.infNewPaidByInf[inf.id]||0),0);
    const nF=monthly.reduce((s,m)=>s+(m.infNewFreeByInf[inf.id]||0),0);
    let paid=0,pend=0;
    monthly.forEach(m=>{const k=`${inf.id}-${m.m}`;const st=paymentStatus[k];const c=m.infCommByInf[inf.id]||0;if(!c)return;if(st?.status==='pagado')paid+=(st.paidAmount??c);else if(st?.status!=='cancelado')pend+=c-(st?.paidAmount||0);});
    return{...inf,cG,bT,nP,nF,paid,pend,cac:nP>0?cG/nP:null,roi:cG>0?(bT-cG)/cG:null};
  });
  return(
    <div className="space-y-4">
      <div className="flex bg-stone-100 rounded-lg p-0.5 text-xs w-fit">
        {[{id:'config',l:'Configuración'},{id:'kpis',l:'KPIs'},{id:'cc',l:'Cuenta corriente'}].map(s=>(
          <button key={s.id} onClick={()=>setSub(s.id)} className={`px-3 py-1.5 rounded-md font-medium transition ${sub===s.id?'bg-white text-stone-900 shadow-sm':'text-stone-600'}`}>{s.l}</button>
        ))}
      </div>
      {sub==='config'&&(
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-base font-medium text-stone-900">Influencers y referidos</h2><p className="text-xs text-stone-500 mt-0.5">Comisión, duración comisionable y regla para planes trimestrales.</p></div>
            <button onClick={()=>setInfluencers([...influencers,{id:`inf-${Date.now()}`,name:'@nuevo',code:'CODE',commissionPct:35,commissionMonths:1,quarterlyRule:'full'}])} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg"><Plus size={14}/>Agregar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="text-left py-2 pr-2 font-medium">Influencer</th>
                <th className="text-left py-2 px-2 font-medium">Código</th>
                <th className="text-right py-2 px-2 font-medium">% Com.</th>
                <th className="text-right py-2 px-2 font-medium">Meses</th>
                <th className="text-left py-2 px-2 font-medium"><Tip text="full=cobro completo · proportional=meses_en_ventana/3 · first_month=solo 1/3 del cobro">Regla trim.</Tip></th>
                <th className="w-8"/>
              </tr></thead>
              <tbody>
                {influencers.map(i=>(
                  <tr key={i.id} className="border-b border-stone-100">
                    <td className="py-2 pr-2"><TI value={i.name} onChange={v=>up(i.id,'name',v)}/></td>
                    <td className="py-2 px-2 w-32"><TI value={i.code} onChange={v=>up(i.id,'code',v)}/></td>
                    <td className="py-2 px-2 w-20"><NI value={i.commissionPct} onChange={v=>up(i.id,'commissionPct',v)} suffix="%"/></td>
                    <td className="py-2 px-2 w-24"><SI value={String(i.commissionMonths)} onChange={v=>up(i.id,'commissionMonths',parseInt(v))} options={[{v:'1',l:'1 mes'},{v:'2',l:'2 meses'},{v:'3',l:'3 meses'}]}/></td>
                    <td className="py-2 px-2 w-48"><SI value={i.quarterlyRule||'full'} onChange={v=>up(i.id,'quarterlyRule',v)} options={[{v:'full',l:'Cobro completo'},{v:'proportional',l:'Proporcional'},{v:'first_month',l:'Solo primer mes equiv.'}]}/></td>
                    <td className="py-2 pl-2"><button onClick={()=>setInfluencers(influencers.filter(x=>x.id!==i.id))} className="text-stone-400 hover:text-rose-600 p-1"><Trash2 size={14}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {sub==='kpis'&&(
        <div className="space-y-3">
          {infKpis.map(k=>{
            const neg=k.bT>0&&(k.bT-k.cG)<0;const lowPaid=k.nF>8&&k.nP<2;
            return(
              <Card key={k.id} className="p-5" tone={neg?'negative':undefined}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-base font-medium text-stone-900">{k.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5">Código: <code className="px-1.5 py-0.5 bg-stone-100 rounded">{k.code}</code> · {k.commissionPct}% · {k.commissionMonths}m · regla {k.quarterlyRule}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {neg&&<Badge tone="negative"><AlertTriangle size={11} className="mr-1"/>Margen negativo</Badge>}
                    {lowPaid&&<Badge tone="warning"><AlertTriangle size={11} className="mr-1"/>Solo gratis</Badge>}
                    {k.pend>0&&<Badge tone="warning">Pendiente {fARS(k.pend,true)}</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                  {[['Pagos traídos',fNum(k.nP)],['Gratis traídos',fNum(k.nF)],['Ingreso bruto',fARS(k.bT,true)],['Comisión gen.',fARS(k.cG,true)],['CAC',fARS(k.cac)],['ROI',k.roi!=null?`${k.roi.toFixed(1)}×`:'—']].map(([l,v])=>(
                    <div key={l}><div className="text-stone-500">{l}</div><div className="text-stone-900 font-medium tabular-nums">{v}</div></div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200 flex items-center gap-4 text-[11px]">
                  <span>Gen: <strong className="text-stone-800">{fARS(k.cG,true)}</strong></span>
                  <span>Pagada: <strong className="text-emerald-700">{fARS(k.paid,true)}</strong></span>
                  <span>Pendiente: <strong className="text-amber-700">{fARS(k.pend,true)}</strong></span>
                  <span>Margen neto: <strong className={k.bT-k.cG>=0?'text-emerald-700':'text-rose-700'}>{fARS(k.bT-k.cG,true)}</strong></span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {sub==='cc'&&(
        <Card className="p-5">
          <div className="mb-3"><h2 className="text-base font-medium text-stone-900">Cuenta corriente de influencers</h2><p className="text-xs text-stone-500 mt-0.5">Comisiones devengadas mes a mes. Marcá estado, monto pagado y fecha.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <th className="text-left py-2 pr-2 font-medium">Mes</th><th className="text-left py-2 px-2 font-medium">Influencer</th>
                <th className="text-right py-2 px-2 font-medium">Nv. pagos</th><th className="text-right py-2 px-2 font-medium">Ingresos</th>
                <th className="text-right py-2 px-2 font-medium">%</th><th className="text-right py-2 px-2 font-medium">Generado</th>
                <th className="text-right py-2 px-2 font-medium">Pagado</th><th className="text-right py-2 px-2 font-medium">Pendiente</th>
                <th className="text-left py-2 px-2 font-medium">Estado</th><th className="text-left py-2 px-2 font-medium">Fecha pago</th>
              </tr></thead>
              <tbody>
                {monthly.flatMap(m=>influencers.map(inf=>{
                  const comm=m.infCommByInf[inf.id]||0;if(!comm)return null;
                  const k=`${inf.id}-${m.m}`;
                  const st=paymentStatus[k]||{status:'pendiente',paidAmount:0,paidDate:''};
                  const pend=st.status==='cancelado'?0:comm-(st.paidAmount||0);
                  const setSt=p=>setPaymentStatus({...paymentStatus,[k]:{...st,...p}});
                  return(
                    <tr key={k} className="border-b border-stone-100">
                      <td className="py-1.5 pr-2 text-xs text-stone-700">{m.label}</td>
                      <td className="py-1.5 px-2 text-xs text-stone-700 font-medium">{inf.name}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-xs">{fNum(m.infNewPaidByInf[inf.id]||0)}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-xs">{fARS(m.infBillingsByInf[inf.id]||0,true)}</td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-xs">{inf.commissionPct}%</td>
                      <td className="py-1.5 px-2 text-right tabular-nums text-xs font-medium">{fARS(comm)}</td>
                      <td className="py-1.5 px-2 w-24"><NI value={st.paidAmount||0} onChange={v=>setSt({paidAmount:v})} className="text-xs"/></td>
                      <td className={`py-1.5 px-2 text-right tabular-nums text-xs font-medium ${pend>0?'text-amber-700':'text-stone-400'}`}>{fARS(pend)}</td>
                      <td className="py-1.5 px-2 w-32"><SI value={st.status} onChange={v=>setSt({status:v})} options={Object.keys(PS_LABELS).map(k=>({v:k,l:PS_LABELS[k]}))}/></td>
                      <td className="py-1.5 px-2 w-32"><input type="date" value={st.paidDate||''} onChange={e=>setSt({paidDate:e.target.value})} className="w-full px-2 py-1 text-xs border border-stone-200 rounded-md bg-stone-50 hover:bg-white focus:outline-none"/></td>
                    </tr>
                  );
                })).filter(Boolean)}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// === MILESTONES TAB ===
function MilestonesTab({strategy,updateStrategy,proj,influencers,sy,sm,hm}){
  const quarters=useMemo(()=>{
    const s=new Map();
    for(let m=0;m<hm;m++){const k=qKey(sy,sm,m);const l=qLabel(sy,sm,m);if(!s.has(k))s.set(k,{k,l,months:[]});s.get(k).months.push(m);}
    return Array.from(s.values());
  },[sy,sm,hm]);
  const [exp,setExp]=useState({});
  const upMS=(qk,patch)=>{const n={...(strategy.milestones||{})};n[qk]={...(n[qk]||{}),...patch};updateStrategy({...strategy,milestones:n});};
  const aggrQ=useMemo(()=>aggregateBy(proj.monthly,'quarterly'),[proj.monthly]);
  return(
    <div className="space-y-3">
      <Card className="p-5"><h2 className="text-base font-medium text-stone-900">Planificación trimestral — {strategy.name}</h2><p className="text-xs text-stone-500 mt-0.5">Hipótesis, hitos, acciones y riesgos por trimestre. La data financiera se calcula automáticamente.</p></Card>
      {quarters.map(q=>{
        const ms=(strategy.milestones||{})[q.k]||{};
        const ag=aggrQ.find(a=>a.pKey===q.k);
        const open=exp[q.k];
        return(
          <Card key={q.k} className="overflow-hidden">
            <button onClick={()=>setExp({...exp,[q.k]:!open})} className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-stone-50/50">
              <div className="flex items-center gap-3">
                {open?<ChevronDown size={15} className="text-stone-400"/>:<ChevronRight size={15} className="text-stone-400"/>}
                <div><div className="text-sm font-medium text-stone-900">{q.l}</div><div className="text-[11px] text-stone-500">{ms.objetivo||'Sin objetivo'} · driver: {ms.driver||'—'}</div></div>
              </div>
              {ag&&(
                <div className="flex items-center gap-3 text-xs text-stone-600">
                  <span>Altas: <strong className="text-stone-900 tabular-nums">{fNum(ag.altas)}</strong></span>
                  <span>Dev: <strong className="tabular-nums">{fARS(ag.accrued,true)}</strong></span>
                  <span className={`tabular-nums font-medium ${ag.netResult>=0?'text-emerald-700':'text-rose-700'}`}>Neto: {fARS(ag.netResult,true)}</span>
                </div>
              )}
            </button>
            {open&&(
              <div className="border-t border-stone-200 p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 bg-stone-50/30">
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">Resumen financiero</div>
                  {ag&&(
                    <div className="grid grid-cols-2 gap-1.5">
                      {[['Usuarios inicio',fNum(ag.usersStart)],['Usuarios fin',fNum(ag.usersEnd)],['Altas',`+${fNum(ag.altas)}`],['Caja',fARS(ag.cashInflow,true)],['Devengado',fARS(ag.accrued,true)],['Neto',fARS(ag.netResult,true)]].map(([l,v])=>(
                        <div key={l} className="bg-white border border-stone-200 rounded-md p-2"><div className="text-[10px] text-stone-500">{l}</div><div className="tabular-nums font-medium">{v}</div></div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 space-y-1.5">
                    <div><label className="block text-[10px] text-stone-500 mb-0.5">Driver principal</label>
                      <SI value={ms.driver||'organico'} onChange={v=>upMS(q.k,{driver:v})} options={[{v:'organico',l:'Orgánico'},{v:'ads',l:'Ads paga'},{v:'influencers',l:'Influencers'},{v:'producto',l:'Producto/features'},{v:'precio',l:'Precio'},{v:'retencion',l:'Retención'}]}/>
                    </div>
                    <div><label className="block text-[10px] text-stone-500 mb-0.5">Riesgo principal</label><TI value={ms.riesgo||''} onChange={v=>upMS(q.k,{riesgo:v})} placeholder="Ej: churn alto, CAC elevado..."/></div>
                  </div>
                </div>
                <div className="space-y-3 lg:col-span-2 text-xs">
                  <div><label className="block text-[11px] uppercase tracking-wider text-stone-500 font-medium mb-1">Objetivo principal</label><TI value={ms.objetivo||''} onChange={v=>upMS(q.k,{objetivo:v})} placeholder="Ej: validar PMF con 100 usuarios pagos"/></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] text-stone-500 mb-0.5">Hitos planificados</label><TA value={ms.hitos||''} onChange={v=>upMS(q.k,{hitos:v})} placeholder="• Lanzamiento beta&#10;• Campaña influencers..."/></div>
                    <div><label className="block text-[10px] text-stone-500 mb-0.5">Acciones comerciales</label><TA value={ms.acciones||''} onChange={v=>upMS(q.k,{acciones:v})} placeholder="• Ads $500K/mes&#10;• 3 influencers..."/></div>
                    <div><label className="block text-[10px] text-stone-500 mb-0.5">Hipótesis</label><TA value={ms.hipotesis||''} onChange={v=>upMS(q.k,{hipotesis:v})} rows={2} placeholder="Ej: plan trimestral mejora retención"/></div>
                    <div><label className="block text-[10px] text-stone-500 mb-0.5">Resultado esperado</label><TA value={ms.resultado||''} onChange={v=>upMS(q.k,{resultado:v})} rows={2} placeholder="+120 usuarios · MRR $X"/></div>
                  </div>
                  <div><label className="block text-[10px] text-stone-500 mb-0.5">Notas internas</label><TA value={ms.notas||''} onChange={v=>upMS(q.k,{notas:v})} rows={2} placeholder="Links a docs, recordatorios..."/></div>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// === RESULTS TAB ===
function ResultsTab({proj,view,setView}){
  const periods=useMemo(()=>aggregateBy(proj.monthly,view),[proj.monthly,view]);
  const rows=[
    {l:'Usuarios activos',k:'activeUsers',f:fNum,g:'u'},{l:'Usuarios pagos',k:'paidActiveUsers',f:fNum,g:'u'},
    {l:'Altas en el período',k:'altas',f:fNum,g:'u'},
    null,
    {l:'Facturación bruta',k:'billings',f:fARS,g:'c'},{l:'(−) Comisión MP',k:'mpFeesTotal',f:v=>fARS(-v),g:'c'},
    {l:'(−) Comisiones influencers',k:'influencerCommissions',f:v=>fARS(-v),g:'c'},
    {l:'= Ingreso en caja',k:'cashInflow',f:fARS,g:'c',bold:true},
    {l:'(−) Costos variables',k:'variableCosts',f:v=>fARS(-v),g:'c'},{l:'(−) Publicidad',k:'adsCost',f:v=>fARS(-v),g:'c'},
    {l:'(−) Costos fijos',k:'fixedCosts',f:v=>fARS(-v),g:'c'},
    {l:'= Flujo de caja neto',k:'cashFlow',f:fARS,g:'c',bold:true,signed:true},
    {l:'Caja acumulada',k:'cumCash',f:fARS,g:'c',signed:true},
    null,
    {l:'Ingreso devengado',k:'accrued',f:fARS,g:'d',bold:true},{l:'MRR (último mes)',k:'mrr',f:fARS,g:'d'},
    {l:'ARR (MRR × 12)',k:'arr',f:v=>fARS(v,true),g:'d'},{l:'Margen bruto %',k:'grossMargin',f:fPct,g:'d'},
    {l:'= Resultado neto',k:'netResult',f:fARS,g:'d',bold:true,signed:true},
  ];
  return(
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div><h2 className="text-base font-medium text-stone-900">P&L · caja vs devengado</h2><p className="text-xs text-stone-500 mt-0.5">Trimestrales generan caja el mes de cobro pero devengan en 3 meses.</p></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-200 border border-cyan-300"/>Caja</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-200 border border-violet-300"/>Devengado</span>
          </div>
          <VSwitcher view={view} setView={setView}/>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="text-sm" style={{minWidth:`${280+periods.length*100}px`}}>
          <thead><tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
            <th className="text-left py-2 pr-3 font-medium sticky left-0 bg-white">Concepto</th>
            {periods.map((p,i)=><th key={i} className="text-right py-2 px-2 font-medium" style={{minWidth:100}}>{p.pLabel}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r,i)=>{
              if(!r)return (<tr key={`s${i}`}><td colSpan={periods.length+1} className="h-2"/></tr>);
              const bg=r.g==='c'?'bg-cyan-50/30':r.g==='d'?'bg-violet-50/30':'';
              return(
                <tr key={r.l} className={`border-b border-stone-100 ${r.bold?'font-medium':''}`}>
                  <td className={`py-1.5 pr-3 sticky left-0 ${bg.replace('/30','/70')||'bg-white'} text-xs text-stone-700`}>{r.l}</td>
                  {periods.map((p,pi)=>{const v=p[r.k];const n=r.signed&&v<0;return(
                    <td key={pi} className={`py-1.5 px-2 text-right tabular-nums text-xs ${bg} ${n?'text-rose-700':r.signed&&v>0?'text-emerald-700':'text-stone-700'}`}>{r.f(v)}</td>
                  );})}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// === PARTNERS TAB ===
function PartnersTab({partners,setPartners,proj}){
  const {monthly}=proj;const tot12=monthly.reduce((s,m)=>s+m.netResult,0);
  const up=(id,f,v)=>setPartners(partners.map(p=>p.id===id?{...p,[f]:v}:p));
  const totalShare=partners.reduce((s,p)=>s+p.share,0);
  return(
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-base font-medium text-stone-900">Participación de socios</h2><p className="text-xs text-stone-500 mt-0.5">Total: <span className={`font-medium ${totalShare===100?'text-emerald-700':'text-amber-700'}`}>{totalShare}%</span></p></div>
          <button onClick={()=>setPartners([...partners,{id:`p-${Date.now()}`,name:'Nuevo socio',share:0}])} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg"><Plus size={14}/>Agregar</button>
        </div>
        <div className="space-y-2">{partners.map(p=>(
          <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-7"><TI value={p.name} onChange={v=>up(p.id,'name',v)}/></div>
            <div className="col-span-4"><NI value={p.share} step={0.5} onChange={v=>up(p.id,'share',v)} suffix="%"/></div>
            <button onClick={()=>setPartners(partners.filter(x=>x.id!==p.id))} className="text-stone-400 hover:text-rose-600 p-1 col-span-1"><Trash2 size={14}/></button>
          </div>
        ))}</div>
      </Card>
      <Card className="p-5">
        <h3 className="text-sm font-medium text-stone-900 mb-3">Distribución mensual</h3>
        <div className="overflow-x-auto">
          <table className="text-sm w-full" style={{minWidth:`${280+monthly.length*70}px`}}>
            <thead><tr className="text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <th className="text-left py-2 pr-2 font-medium">Socio</th><th className="text-right py-2 px-2 font-medium">%</th>
              {monthly.map((m,i)=><th key={i} className="text-right py-2 px-2 font-medium" style={{minWidth:70}}>{m.label}</th>)}
              <th className="text-right py-2 pl-2 font-medium bg-stone-50">Total</th>
            </tr></thead>
            <tbody>
              {partners.map(p=>{const tot=monthly.reduce((s,m)=>s+m.netResult*(p.share/100),0);return(
                <tr key={p.id} className="border-b border-stone-100">
                  <td className="py-2 pr-2 text-xs text-stone-700 font-medium">{p.name}</td><td className="py-2 px-2 text-right tabular-nums text-xs text-stone-600">{p.share}%</td>
                  {monthly.map((m,i)=>{const a=m.netResult*(p.share/100);return (<td key={i} className={`py-2 px-2 text-right tabular-nums text-xs ${a>=0?'text-stone-700':'text-rose-700'}`}>{fARS(a,true)}</td>);})}
                  <td className={`py-2 pl-2 text-right tabular-nums text-xs font-medium bg-stone-50 ${tot>=0?'text-emerald-700':'text-rose-700'}`}>{fARS(tot,true)}</td>
                </tr>
              );})}
              <tr className="border-t-2 border-stone-300 font-medium">
                <td className="py-2 pr-2 text-xs text-stone-900">Resultado neto</td><td className="py-2 px-2 text-right text-xs">100%</td>
                {monthly.map((m,i)=><td key={i} className={`py-2 px-2 text-right tabular-nums text-xs ${m.netResult>=0?'text-emerald-700':'text-rose-700'}`}>{fARS(m.netResult,true)}</td>)}
                <td className={`py-2 pl-2 text-right tabular-nums text-xs bg-stone-50 ${tot12>=0?'text-emerald-700':'text-rose-700'}`}>{fARS(tot12,true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// === CONFIG TAB ===
function ConfigTab({sy,setSY,sm,setSM,hm,setHM,exportCSV,exportJSON,importJSON,resetAll,resetStrategies,resetPS}){
  const fileRef=useRef(null);
  const onImport=e=>{
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{try{importJSON(JSON.parse(ev.target.result));alert('Datos importados.');}catch(err){alert('Error: '+err.message);}};
    r.readAsText(f);e.target.value='';
  };
  return(
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <h2 className="text-base font-medium text-stone-900 mb-3">Horizonte temporal</h2>
        <div className="space-y-4">
          <div><label className="block text-xs text-stone-600 mb-1">Mes y año de inicio</label>
            <div className="grid grid-cols-2 gap-2">
              <SI value={String(sm)} onChange={v=>setSM(parseInt(v))} options={MN.map((n,i)=>({v:String(i),l:n}))}/>
              <SI value={String(sy)} onChange={v=>setSY(parseInt(v))} options={[2024,2025,2026,2027,2028,2029,2030].map(y=>({v:String(y),l:String(y)}))}/>
            </div>
          </div>
          <div><label className="block text-xs text-stone-600 mb-1">Duración del forecast</label>
            <div className="grid grid-cols-3 gap-1">
              {HORIZONS.map(h=>(
                <button key={h.v} onClick={()=>setHM(h.v)} className={`px-2 py-1.5 text-xs font-medium rounded-md border transition ${hm===h.v?'bg-stone-900 text-white border-stone-900':'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'}`}>{h.l}</button>
              ))}
            </div>
          </div>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
            <strong className="text-stone-800">Stock de usuarios:</strong> Se arrastra automáticamente entre años (los usuarios adquiridos en un año siguen activos el siguiente). Las <strong className="text-stone-800">altas nuevas no</strong> se arrastran — cargalas manualmente para el año 2+.
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-stone-900 mb-3">Exportar datos</h3>
          <div className="space-y-2">
            <button onClick={exportCSV} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg"><Download size={13}/>Exportar CSV (P&L)</button>
            <button onClick={exportJSON} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg"><FileJson size={13}/>Exportar JSON (copia de seguridad)</button>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-stone-900 mb-3">Importar datos</h3>
          <input ref={fileRef} type="file" accept=".json" onChange={onImport} className="hidden"/>
          <button onClick={()=>fileRef.current?.click()} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg"><Upload size={13}/>Importar JSON</button>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-stone-900 mb-3">Resetear datos</h3>
          <div className="space-y-2">
            <ConfirmBtn onConfirm={resetStrategies} label="Resetear todos los forecasts" icon={Eraser} confirmText="¿Resetear forecasts?" className="w-full justify-center text-xs py-2 px-3"/>
            <ConfirmBtn onConfirm={resetPS} label="Resetear pagos influencers" icon={Eraser} confirmText="¿Resetear pagos?" className="w-full justify-center text-xs py-2 px-3"/>
            <ConfirmBtn onConfirm={resetAll} label="Resetear todo (PELIGRO)" icon={Trash2} confirmText="¿BORRAR TODO?" danger className="w-full justify-center text-xs py-2 px-3"/>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-medium text-stone-900 mb-2">Persistencia</h3>
          <p className="text-xs text-stone-500 leading-relaxed">Los datos se guardan en localStorage del navegador. Para compartir o hacer copias de seguridad, usá el botón "Exportar JSON" — el archivo puede importarse en cualquier navegador con la app. En el sandbox de Claude.ai localStorage puede no persistir entre sesiones; importá el JSON en ese caso.</p>
        </Card>
      </div>
    </div>
  );
}

// === EXPORT HELPERS ===
function buildCSV(monthly,plans,influencers){
  let c='P&L MENSUAL\nMes,Activos,Pagos,Facturación,Comisión MP,Comisiones Infl.,Ingreso Caja,Costos Var.,Publicidad,Costos Fijos,Flujo Caja,Caja Acum.,Devengado,MRR,ARR,Margen Bruto,Resultado Neto\n';
  monthly.forEach(m=>{c+=`${m.label},${m.activeUsers},${m.paidActiveUsers},${m.billings.toFixed(0)},${m.mpFeesTotal.toFixed(0)},${m.influencerCommissions.toFixed(0)},${m.cashInflow.toFixed(0)},${m.variableCosts.toFixed(0)},${m.adsCost.toFixed(0)},${m.fixedCosts.toFixed(0)},${m.cashFlow.toFixed(0)},${m.cumCash.toFixed(0)},${m.accrued.toFixed(0)},${m.mrr.toFixed(0)},${m.arr.toFixed(0)},${(m.grossMargin*100).toFixed(2)}%,${m.netResult.toFixed(0)}\n`;});
  return c;
}
function dlCSV(monthly,plans,influencers){const b=new Blob([buildCSV(monthly,plans,influencers)],{type:'text/csv;charset=utf-8;'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`profitlab_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(u);}
function dlJSON(state){const b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`profitlab_backup_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(u);}

// === APP ROOT ===
// === LOGIN SCREEN ===
function LoginScreen(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState('login');
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState(null);
  const [err,setErr]=useState(null);

  const handle=async(e)=>{
    e.preventDefault();setLoading(true);setErr(null);setMsg(null);
    if(mode==='login'){
      const{error}=await supabase.auth.signInWithPassword({email,password});
      if(error)setErr(error.message);
    } else if(mode==='signup'){
      const{error}=await supabase.auth.signUp({email,password,options:{data:{name:email.split('@')[0]}}});
      if(error)setErr(error.message);
      else setMsg('Revisá tu email para confirmar la cuenta.');
    } else {
      const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
      if(error)setErr(error.message);
      else setMsg('Te enviamos un link de recuperación.');
    }
    setLoading(false);
  };

  return(
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center"><Layers size={18}/></div>
          <div><div className="text-base font-medium text-stone-900">ProfitLab</div><div className="text-[11px] text-stone-500">Modelo financiero SaaS</div></div>
        </div>
        <h2 className="text-lg font-medium text-stone-900 mb-1">
          {mode==='login'?'Iniciar sesión':mode==='signup'?'Crear cuenta':'Recuperar contraseña'}
        </h2>
        <p className="text-xs text-stone-500 mb-5">Tus datos se guardan de forma segura en la nube.</p>
        <form onSubmit={handle} className="space-y-3">
          <div>
            <label className="block text-xs text-stone-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-400 focus:outline-none"/>
          </div>
          {mode!=='reset'&&(
            <div>
              <label className="block text-xs text-stone-600 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-400 focus:outline-none"/>
            </div>
          )}
          {err&&(<div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">{err}</div>)}
          {msg&&(<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">{msg}</div>)}
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-sm font-medium rounded-lg transition">
            {loading?'Cargando...':mode==='login'?'Entrar':mode==='signup'?'Crear cuenta':'Enviar link'}
          </button>
        </form>
        <div className="mt-4 flex flex-col gap-1.5 text-xs text-center text-stone-500">
          {mode!=='login'&&(<button onClick={()=>setMode('login')} className="hover:text-stone-800">Volver al login</button>)}
          {mode==='login'&&(<button onClick={()=>setMode('signup')} className="hover:text-stone-800">No tengo cuenta — Registrarme</button>)}
          {mode==='login'&&(<button onClick={()=>setMode('reset')} className="hover:text-stone-800">Olvidé mi contraseña</button>)}
        </div>
      </div>
    </div>
  );
}

// === APP ROOT ===
const DFLT_CHANNELS=['organic','ads',...DI.map(i=>i.id)];

function buildDefaultState(){
  const strategies=[makeStrategy('strat-1','Finanzas personales',DP,DFLT_CHANNELS,12,'finanzas')];
  return{plans:DP,fixedCosts:DFC,influencers:DI,partners:DPART,mpFees:{variablePct:5.99,fixedAmount:150},sy:2026,sm:6,hm:12,scenario:'base',view:'monthly',tab:'dashboard',strategies,activeId:'strat-1',paymentStatus:{}};
}

export default function App(){
  const [session,setSession]=useState(undefined);
  const [st,setSt]=useState(null);
  const [workspaceId,setWorkspaceId]=useState(null);
  const [saving,setSaving]=useState(false);
  const [lastSaved,setLastSaved]=useState(null);
  const [loadingData,setLoadingData]=useState(false);
  const saveTimer=useRef(null);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session??null));
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s??null));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(session===undefined)return;
    if(!session){setSt(null);setWorkspaceId(null);return;}
    loadWorkspace(session.user.id);
  },[session?.user?.id]);

  const loadWorkspace=async(userId)=>{
    setLoadingData(true);
    const{data,error}=await supabase.from('profitlab_workspaces').select('id,app_state').eq('owner_id',userId).maybeSingle();
    if(error){console.error(error);setLoadingData(false);setSt(localLoad(buildDefaultState()));return;}
    if(data){
      setWorkspaceId(data.id);
      const loaded=(data.app_state&&Object.keys(data.app_state).length>0)?data.app_state:buildDefaultState();
      setSt(loaded);localSave(loaded);
    } else {
      const defState=localLoad(buildDefaultState());
      const{data:created,error:ce}=await supabase.from('profitlab_workspaces').insert({owner_id:userId,name:'ProfitLab',app_state:defState}).select('id').single();
      if(!ce&&created)setWorkspaceId(created.id);
      setSt(defState);
    }
    setLoadingData(false);
  };

  const scheduleSave=useCallback((newState,wId)=>{
    if(!wId)return;
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current=setTimeout(async()=>{
      const{error}=await supabase.from('profitlab_workspaces').update({app_state:newState}).eq('id',wId);
      setSaving(false);
      if(!error){setLastSaved(new Date());localSave(newState);}
      else console.error('Save error:',error);
    },1500);
  },[]);

  const set=useCallback((patch)=>{
    setSt(prev=>{
      if(!prev)return prev;
      const next={...prev,...(typeof patch==='function'?patch(prev):patch)};
      scheduleSave(next,workspaceId);
      return next;
    });
  },[workspaceId,scheduleSave]);

  const handleLogout=async()=>{
    clearTimeout(saveTimer.current);
    await supabase.auth.signOut();
    setSt(null);setWorkspaceId(null);setLastSaved(null);
  };

  if(session===undefined||loadingData){
    return(
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-stone-900 text-white flex items-center justify-center"><Layers size={16}/></div>
          <div className="text-sm text-stone-500">Cargando ProfitLab...</div>
        </div>
      </div>
    );
  }

  if(!session)return (<LoginScreen/>);
  if(!st)return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-sm text-stone-500">Preparando tu workspace...</div>
    </div>
  );

  const{plans,fixedCosts,influencers,partners,mpFees,sy,sm,hm,scenario,view,tab,strategies,activeId,paymentStatus}=st;
  const activeStrategy=strategies.find(s=>s.id===activeId)||strategies[0];

  const projArgs={plans,fixedCosts,influencers,mpFees,partners,scenario,sy,sm,hm,paymentStatus};
  const activeProj=useMemo(()=>project({...projArgs,strategy:activeStrategy}),[JSON.stringify(projArgs),activeStrategy?.id,activeStrategy?.forecast,activeStrategy?.monthlyAds]);
  const projByStrat=useMemo(()=>{const r={};strategies.forEach(s=>{r[s.id]=project({...projArgs,strategy:s});});return r;},[JSON.stringify(projArgs),strategies.map(s=>s.id).join(',')]);

  const updateActiveStrategy=(s)=>set({strategies:strategies.map(x=>x.id===activeId?s:x)});

  const exportCSV=()=>dlCSV(activeProj.monthly,plans,influencers);
  const exportJSON=()=>dlJSON(st);
  const importJSON=(data)=>{const next={...buildDefaultState(),...data};setSt(next);scheduleSave(next,workspaceId);};
  const resetAll=()=>{const next=buildDefaultState();setSt(next);scheduleSave(next,workspaceId);};
  const resetStrategies=()=>set({strategies:strategies.map(s=>{const u={};plans.forEach(p=>{u[p.id]={};['organic','ads',...influencers.map(i=>i.id)].forEach(c=>{u[p.id][c]=Array(hm).fill(0);});});return{...s,forecast:u};})});
  const resetPS=()=>set({paymentStatus:{}});

  return(
    <div className="min-h-screen bg-stone-50" style={{fontFamily:"'Inter',system-ui,-apple-system,sans-serif"}}>
      <Header scenario={scenario} setScenario={v=>set({scenario:v})} strategies={strategies} activeId={activeId} setActiveId={v=>set({activeId:v})} onExport={exportCSV} saving={saving} lastSaved={lastSaved} onLogout={handleLogout} userEmail={session?.user?.email}/>
      <Nav current={tab} setTab={v=>set({tab:v})}/>
      <main className="max-w-[1500px] mx-auto px-6 py-6">
        {tab==='dashboard'&&(<DashboardTab proj={activeProj} plans={plans} influencers={influencers} strategy={activeStrategy} scenario={scenario} view={view} setView={v=>set({view:v})}/>)}
        {tab==='forecast'&&(<ForecastTab strategy={activeStrategy} updateStrategy={updateActiveStrategy} plans={plans} influencers={influencers} hm={hm} sy={sy} sm={sm}/>)}
        {tab==='strategies'&&(<StrategiesTab strategies={strategies} setStrategies={v=>set({strategies:v})} activeId={activeId} setActiveId={v=>set({activeId:v})} plans={plans} influencers={influencers} hm={hm}/>)}
        {tab==='comparator'&&(<ComparatorTab projByStrat={projByStrat} strategies={strategies}/>)}
        {tab==='plans'&&(<PlansTab plans={plans} setPlans={v=>set({plans:v})} proj={activeProj}/>)}
        {tab==='costs'&&(<CostsTab fixedCosts={fixedCosts} setFixedCosts={v=>set({fixedCosts:v})} mpFees={mpFees} setMpFees={v=>set({mpFees:v})}/>)}
        {tab==='influencers'&&(<InfluencersTab influencers={influencers} setInfluencers={v=>set({influencers:v})} proj={activeProj} paymentStatus={paymentStatus} setPaymentStatus={v=>set({paymentStatus:v})}/>)}
        {tab==='milestones'&&(<MilestonesTab strategy={activeStrategy} updateStrategy={updateActiveStrategy} proj={activeProj} influencers={influencers} sy={sy} sm={sm} hm={hm}/>)}
        {tab==='results'&&(<ResultsTab proj={activeProj} view={view} setView={v=>set({view:v})}/>)}
        {tab==='partners'&&(<PartnersTab partners={partners} setPartners={v=>set({partners:v})} proj={activeProj}/>)}
        {tab==='config'&&(<ConfigTab sy={sy} setSY={v=>set({sy:v})} sm={sm} setSM={v=>set({sm:v})} hm={hm} setHM={v=>set({hm:v})} exportCSV={exportCSV} exportJSON={exportJSON} importJSON={importJSON} resetAll={resetAll} resetStrategies={resetStrategies} resetPS={resetPS}/>)}
        <div className="mt-12 pt-6 border-t border-stone-200 text-[11px] text-stone-500 text-center">
          ProfitLab · {session?.user?.email} · estrategia: <span className="text-stone-700 font-medium">{activeStrategy.name}</span> · escenario: <span className="text-stone-700 font-medium capitalize">{scenario}</span>
        </div>
      </main>
    </div>
  );
}
