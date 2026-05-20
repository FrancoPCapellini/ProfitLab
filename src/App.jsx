import React,{useState,useMemo,useEffect,useRef,useCallback}from'react';
import{createClient}from'@supabase/supabase-js';
import{LineChart,Line,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip as RT,Legend,ResponsiveContainer,ComposedChart,ReferenceLine,Area,AreaChart,Cell,PieChart,Pie}from'recharts';
import{TrendingUp,TrendingDown,AlertTriangle,Download,Plus,Trash2,Users,DollarSign,Wallet,Target,Activity,Calendar,Megaphone,Sparkles,Briefcase,Layers,Copy,Eraser,GitCompare,Settings,FileJson,Upload,RefreshCw,CheckCircle2,Clock,XCircle,Info,ChevronRight,ChevronDown,Flag,Banknote,BarChart3,ListChecks,LogOut,CloudOff,Cloud,Save,Lock,Unlock,Zap,Percent,Gift,Radio,Lightbulb,ClipboardList,PiggyBank,UserCog,Rocket,ShieldAlert,Receipt,HandCoins,Scale,Eye,Gauge,LineChart as LineIcon,ArrowRight,Check,X,Edit3,FileText}from'lucide-react';
 
const SUPABASE_URL='https://ugpegefiawvronngtdfs.supabase.co';
const SUPABASE_ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncGVnZWZpYXd2cm9ubmd0ZGZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzA1MDcsImV4cCI6MjA5NDcwNjUwN30.FdS6Rl-B-hen7YBBormohIbyPG27sbmjrK24FKyUt7g';
const supabase=createClient(SUPABASE_URL,SUPABASE_ANON);
 
// ============ CONSTANTES ============
const MN=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const SK='profitlab_v4';
const HORIZONS=[{v:6,l:'6 meses'},{v:12,l:'12 meses'},{v:18,l:'18 meses'},{v:24,l:'24 meses'}];
 
// ============ HELPERS ============
function addMo(y,m,d){const t=y*12+m+d;return{year:Math.floor(t/12),month:((t%12)+12)%12};}
function mLabel(sy,sm,o){const{year,month}=addMo(sy,sm,o);return`${MN[month]} '${String(year).slice(2)}`;}
function mKey(o){return`M${String(o+1).padStart(2,'0')}`;}
function qOf(m){return Math.floor(m/3)+1;}
function localSave(v){try{localStorage.setItem(SK,JSON.stringify(v));}catch{}}
function localLoad(fb){try{const r=localStorage.getItem(SK);return r?JSON.parse(r):fb;}catch{return fb;}}
const fARS=(v,c=false,s=false)=>{if(v==null||isNaN(v))return'—';const a=Math.abs(v);let t;if(c&&a>=1e6)t=`${(v/1e6).toFixed(2)}M`;else if(c&&a>=1e3)t=`${(v/1e3).toFixed(0)}K`;else t=Math.round(v).toLocaleString('es-AR');return`${s&&v>0?'+':''}$${t}`;};
const fPct=(v,d=1)=>v==null||isNaN(v)?'—':`${(v*100).toFixed(d)}%`;
const fNum=(v,d=0)=>v==null||isNaN(v)?'—':Number(v).toLocaleString('es-AR',{maximumFractionDigits:d});
const fX=(v)=>v==null||isNaN(v)?'—':`${v.toFixed(1)}x`;
const avg=(a)=>a.length?a.reduce((s,v)=>s+(v||0),0)/a.length:0;
const sum=(a)=>a.reduce((s,v)=>s+(v||0),0);
const uid=()=>Math.random().toString(36).slice(2,10);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 
// ============ ESCENARIOS (números reales del Excel v2) ============
// Recalibrados: Base = defendible (no asume ejecución perfecta), Conservador = estrés, Optimista = upside realista
const SCENARIO_VARS=[
  {key:'orgM1',label:'Registros orgánicos mes 1',cons:15,base:30,opt:50,fmt:'int',grp:'Adquisición'},
  {key:'orgGrowth',label:'Crecimiento mensual orgánico',cons:0.03,base:0.07,opt:0.12,fmt:'pct',grp:'Adquisición'},
  {key:'cpcMeta',label:'CPC Meta Ads (ARS)',cons:600,base:450,opt:320,fmt:'money',grp:'Adquisición'},
  {key:'cpcTiktok',label:'CPC TikTok Ads (ARS)',cons:380,base:280,opt:200,fmt:'money',grp:'Adquisición'},
  {key:'cpmYoutube',label:'Costo x 1000 regs YouTube',cons:400000,base:250000,opt:150000,fmt:'money',grp:'Adquisición'},
  {key:'convClickReg',label:'Conv click ads → registro',cons:0.015,base:0.025,opt:0.035,fmt:'pct',grp:'Adquisición'},
  {key:'refPct',label:'Referidos como % pagos nuevos',cons:0.02,base:0.06,opt:0.12,fmt:'pct',grp:'Adquisición'},
  {key:'actPre',label:'Activación PRE-lector',cons:0.20,base:0.30,opt:0.40,fmt:'pct',grp:'Conversión'},
  {key:'actPost',label:'Activación POST-lector',cons:0.40,base:0.55,opt:0.70,fmt:'pct',grp:'Conversión'},
  {key:'convActPaid',label:'Conv activado → pago',cons:0.05,base:0.08,opt:0.13,fmt:'pct',grp:'Conversión'},
  {key:'convFreePaid',label:'Conv free → pago (mensual)',cons:0.01,base:0.02,opt:0.035,fmt:'pct',grp:'Conversión'},
  {key:'churnInvM',label:'Churn Inv Mensual',cons:0.18,base:0.13,opt:0.09,fmt:'pct',grp:'Churn'},
  {key:'churnInvQ',label:'Churn Inv Trimestral',cons:0.08,base:0.05,opt:0.03,fmt:'pct',grp:'Churn'},
  {key:'churnInvA',label:'Churn Inv Anual',cons:0.03,base:0.02,opt:0.01,fmt:'pct',grp:'Churn'},
  {key:'churnPersM',label:'Churn Personal Mensual',cons:0.20,base:0.16,opt:0.12,fmt:'pct',grp:'Churn'},
  {key:'churnPersQ',label:'Churn Personal Trimestral',cons:0.10,base:0.07,opt:0.05,fmt:'pct',grp:'Churn'},
  {key:'churnDuoM',label:'Churn Dúo Mensual',cons:0.14,base:0.10,opt:0.07,fmt:'pct',grp:'Churn'},
  {key:'churnDuoQ',label:'Churn Dúo Trimestral',cons:0.07,base:0.04,opt:0.02,fmt:'pct',grp:'Churn'},
  {key:'churnDuoA',label:'Churn Dúo Anual',cons:0.03,base:0.02,opt:0.01,fmt:'pct',grp:'Churn'},
  {key:'churnFree',label:'Churn free mensual',cons:0.20,base:0.22,opt:0.25,fmt:'pct',grp:'Churn'},
  {key:'readerDelay',label:'Retraso lector (meses)',cons:2,base:0,opt:-1,fmt:'int',grp:'Lector'},
  {key:'readerMult',label:'Multiplicador lector sobre conv',cons:1.10,base:1.25,opt:1.40,fmt:'ratio',grp:'Lector'},
  {key:'crossInvDuo',label:'Cross-sell Inv→Dúo (%/mes)',cons:0.015,base:0.035,opt:0.06,fmt:'pct',grp:'Cross-sell'},
  {key:'crossPersDuo',label:'Cross-sell Personal→Dúo (%/mes)',cons:0.02,base:0.05,opt:0.08,fmt:'pct',grp:'Cross-sell'},
  {key:'orgPersMult',label:'Mult. orgánico al lanzar Personal',cons:1.2,base:1.5,opt:1.9,fmt:'ratio',grp:'Cross-sell'},
  {key:'freeDormant',label:'% pool free dormido (sin costo)',cons:0.40,base:0.50,opt:0.60,fmt:'pct',grp:'Free & Costos'},
  {key:'varCostUsd',label:'Costo variable USD/usuario/mes',cons:0.50,base:0.35,opt:0.22,fmt:'usd',grp:'Free & Costos'},
];
const SCEN_MIX={
  invM:{cons:0.65,base:0.55,opt:0.45},invQ:{cons:0.30,base:0.35,opt:0.40},invA:{cons:0.05,base:0.10,opt:0.15},
  persSoloM:{cons:0.55,base:0.45,opt:0.35},persSoloQ:{cons:0.25,base:0.25,opt:0.25},persParejaM:{cons:0.12,base:0.18,opt:0.25},persParejaQ:{cons:0.08,base:0.12,opt:0.15},
  duoM:{cons:0.55,base:0.45,opt:0.35},duoQ:{cons:0.35,base:0.40,opt:0.45},duoA:{cons:0.10,base:0.15,opt:0.20},
};
function scenVars(scenario){
  const k=scenario==='conservador'?'cons':scenario==='optimista'?'opt':'base';
  const o={};SCENARIO_VARS.forEach(v=>{o[v.key]=v[k];});
  o.mix={};Object.keys(SCEN_MIX).forEach(m=>{o.mix[m]=SCEN_MIX[m][k];});
  return o;
}
// Construye los 3 escenarios editables (semilla = números del Excel)
function buildScenarios(){
  return{conservador:scenVars('conservador'),base:scenVars('base'),optimista:scenVars('optimista')};
}
// Presupuesto de ads total por mes (editable). Default del Excel.
function buildDefaultAdsBudget(){return[...ADS_BUDGET];}
// Resuelve los supuestos activos: usa los editables del state si existen, sino el default
function resolveVars(scenario,scenarios){
  const base=scenVars(scenario);
  const sv=scenarios&&scenarios[scenario]?scenarios[scenario]:base;
  return{...base,...sv,mix:{...base.mix,...(sv.mix||{})}};
}
 
// ============ PLANES (precios reales del roadmap) ============
const DEFAULT_PLANS=[
  {id:'inv-m',name:'Inversión Mensual',product:'inversiones',price:15000,duration:1,launchMonth:0,active:true,defaultDiscount:0},
  {id:'inv-q',name:'Inversión Trimestral',product:'inversiones',price:36000,duration:3,launchMonth:0,active:true,defaultDiscount:0},
  {id:'inv-a',name:'Inversión Anual',product:'inversiones',price:126000,duration:12,launchMonth:5,active:true,defaultDiscount:0},
  {id:'pers-solo-m',name:'Personal Solo Mensual',product:'personal',price:4500,duration:1,launchMonth:8,active:true,defaultDiscount:0},
  {id:'pers-solo-q',name:'Personal Solo Trimestral',product:'personal',price:10500,duration:3,launchMonth:8,active:true,defaultDiscount:0},
  {id:'pers-par-m',name:'Personal Pareja Mensual',product:'personal',price:8000,duration:1,launchMonth:8,active:true,defaultDiscount:0},
  {id:'pers-par-q',name:'Personal Pareja Trimestral',product:'personal',price:20400,duration:3,launchMonth:8,active:true,defaultDiscount:0},
  {id:'duo-m',name:'Dúo Mensual',product:'duo',price:16500,duration:1,launchMonth:8,active:true,defaultDiscount:0},
  {id:'duo-q',name:'Dúo Trimestral',product:'duo',price:45000,duration:3,launchMonth:8,active:true,defaultDiscount:0},
  {id:'duo-a',name:'Dúo Anual',product:'duo',price:165000,duration:12,launchMonth:11,active:true,defaultDiscount:0},
];
const PLAN_MIX_KEY={'inv-m':'invM','inv-q':'invQ','inv-a':'invA','pers-solo-m':'persSoloM','pers-solo-q':'persSoloQ','pers-par-m':'persParejaM','pers-par-q':'persParejaQ','duo-m':'duoM','duo-q':'duoQ','duo-a':'duoA'};
const PLAN_CHURN_KEY={'inv-m':'churnInvM','inv-q':'churnInvQ','inv-a':'churnInvA','pers-solo-m':'churnPersM','pers-solo-q':'churnPersQ','pers-par-m':'churnPersM','pers-par-q':'churnPersQ','duo-m':'churnDuoM','duo-q':'churnDuoQ','duo-a':'churnDuoA'};
 
// ============ INFLUENCERS (7 reales del Excel + nuevo modelo económico) ============
// Default correcto: SIN fee fijo, 20% desc usuario 3m, 35% comisión sobre lo COBRADO 3m
const DEFAULT_INFLUENCERS=[
  {id:'inf-a',name:'Influencer Finanzas A',platform:'Instagram',niche:'Finanzas',audience:30000,startMonth:0,endMonth:null,code:'FINANZA10',product:'inversiones',hasFixedFee:false,fixedFee:0,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.20,userDiscountMonths:3,commissionPct:0.35,commissionBase:'collected',commissionMonths:3,expectedPayments:3,active:true},
  {id:'inf-b',name:'Influencer Inversiones B',platform:'Instagram',niche:'Inversiones',audience:25000,startMonth:0,endMonth:null,code:'BOLSA10',product:'inversiones',hasFixedFee:false,fixedFee:0,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.20,userDiscountMonths:3,commissionPct:0.35,commissionBase:'collected',commissionMonths:3,expectedPayments:3,active:true},
  {id:'inf-c',name:'Trader Joven C',platform:'TikTok',niche:'Trading',audience:40000,startMonth:1,endMonth:null,code:'TRADER10',product:'inversiones',hasFixedFee:false,fixedFee:0,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.20,userDiscountMonths:3,commissionPct:0.35,commissionBase:'collected',commissionMonths:3,expectedPayments:3,active:true},
  {id:'inf-d',name:'Asesor LinkedIn D',platform:'LinkedIn',niche:'Asesoría',audience:15000,startMonth:2,endMonth:null,code:'ASESOR15',product:'inversiones',hasFixedFee:true,fixedFee:25000,fixedFeeMonthly:true,fixedFeeRecoverable:true,userDiscount:0.15,userDiscountMonths:3,commissionPct:0.20,commissionBase:'collected',commissionMonths:3,expectedPayments:2,active:true},
  {id:'inf-e',name:'YouTuber Finanzas E',platform:'YouTube',niche:'Finanzas',audience:80000,startMonth:3,endMonth:null,code:'YOUTUBE10',product:'inversiones',hasFixedFee:true,fixedFee:40000,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.10,userDiscountMonths:3,commissionPct:0.20,commissionBase:'collected',commissionMonths:3,expectedPayments:4,active:true},
  {id:'inf-f',name:'Lifestyle Finanzas F',platform:'Instagram',niche:'Lifestyle',audience:50000,startMonth:8,endMonth:null,code:'PERSONAL10',product:'personal',hasFixedFee:false,fixedFee:0,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.20,userDiscountMonths:3,commissionPct:0.35,commissionBase:'collected',commissionMonths:3,expectedPayments:5,active:true},
  {id:'inf-g',name:'Lifestyle TikTok G',platform:'TikTok',niche:'Lifestyle',audience:60000,startMonth:9,endMonth:null,code:'VIDA10',product:'personal',hasFixedFee:false,fixedFee:0,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.20,userDiscountMonths:3,commissionPct:0.35,commissionBase:'collected',commissionMonths:3,expectedPayments:5,active:true},
];
 
// ============ CANALES (presupuestos ads por mes del Excel) ============
const ADS_BUDGET=[365000,392000,429000,540000,540000,540000,760000,760000,760000,1090000,1090000,1090000,1420000,1420000,1420000,1420000,1420000,1420000,1750000,1750000,1750000,1750000,1750000,1750000];
function metaBudget(t){const v=[200000,200000,200000,350000,350000,350000,500000,500000,500000,700000,700000,700000,900000,900000,900000,900000,900000,900000,1100000,1100000,1100000,1100000,1100000,1100000];return v[Math.min(t,v.length-1)]||0;}
function tiktokBudget(t){const v=[50000,50000,50000,80000,80000,80000,120000,120000,120000,180000,180000,180000,240000,240000,240000,240000,240000,240000,300000,300000,300000,300000,300000,300000];return v[Math.min(t,v.length-1)]||0;}
function youtubeBudget(t){const v=[50000,50000,50000,80000,80000,80000,100000,100000,100000,150000,150000,150000,200000,200000,200000,200000,200000,200000,250000,250000,250000,250000,250000,250000];return v[Math.min(t,v.length-1)]||0;}
const DEFAULT_CHANNELS=[
  {id:'organic',name:'Orgánico',type:'organic',color:'#10b981'},
  {id:'meta',name:'Meta Ads',type:'paid',color:'#3b82f6'},
  {id:'tiktok',name:'TikTok Ads',type:'paid',color:'#ec4899'},
  {id:'youtube',name:'YouTube / Shorts',type:'paid',color:'#ef4444'},
  {id:'influencers',name:'Influencers',type:'influencer',color:'#a855f7'},
  {id:'referrals',name:'Referidos',type:'referral',color:'#f59e0b'},
];
 
// ============ COSTOS FIJOS (16 reales del Excel) ============
const DEFAULT_COSTS=[
  {id:'c1',name:'Sueldos founders (2p)',category:'Sueldos',startMonth:0,endMonth:null,amount:2400000,type:'fixed',inflationAdj:true},
  {id:'c2',name:'Sueldo dev backend',category:'Sueldos',startMonth:3,endMonth:null,amount:1500000,type:'fixed',inflationAdj:true},
  {id:'c3',name:'Sueldo growth/marketing',category:'Sueldos',startMonth:7,endMonth:null,amount:1200000,type:'fixed',inflationAdj:true},
  {id:'c4',name:'Servidores e infra (AWS/Vercel)',category:'Infra',startMonth:0,endMonth:null,amount:120000,type:'fixed',inflationAdj:true},
  {id:'c5',name:'Supabase / DB',category:'Infra',startMonth:0,endMonth:null,amount:50000,type:'fixed',inflationAdj:true},
  {id:'c6',name:'Posthog / Mixpanel',category:'Tools',startMonth:0,endMonth:null,amount:25000,type:'fixed',inflationAdj:true},
  {id:'c7',name:'Crisp / soporte',category:'Tools',startMonth:0,endMonth:null,amount:18000,type:'fixed',inflationAdj:true},
  {id:'c8',name:'Diseño + ads manager',category:'Tools',startMonth:0,endMonth:null,amount:40000,type:'fixed',inflationAdj:true},
  {id:'c9',name:'Contador',category:'Legal',startMonth:0,endMonth:null,amount:50000,type:'fixed',inflationAdj:true},
  {id:'c10',name:'WhatsApp Business API',category:'Tools',startMonth:1,endMonth:null,amount:35000,type:'fixed',inflationAdj:true},
  {id:'c11',name:'LLM API / IA',category:'IA',startMonth:8,endMonth:null,amount:80000,type:'fixed',inflationAdj:true},
  {id:'c12',name:'OCR servicio (lector boletos)',category:'IA',startMonth:2,endMonth:null,amount:60000,type:'fixed',inflationAdj:true},
  {id:'c13',name:'Setup legal y constitución',category:'Legal',startMonth:0,endMonth:0,amount:250000,type:'oneshot',inflationAdj:false},
  {id:'c14',name:'Diseño branding inicial',category:'Tools',startMonth:0,endMonth:0,amount:180000,type:'oneshot',inflationAdj:false},
];
 
// ============ SOCIOS (con activación condicional - Luis 10% solo ganancias futuras) ============
const DEFAULT_PARTNERS=[
  {id:'franco',name:'Franco',sharePct:0.90,type:'founder',joinMonth:0,activeFromMonth:0,participatesPastLosses:true,participatesPastCash:true,notes:'Founder. Recupera gastos personales según regla configurable.'},
  {id:'luis',name:'Luis',sharePct:0.10,type:'sweat_equity',joinMonth:0,activeFromMonth:0,participatesPastLosses:false,participatesPastCash:false,notes:'10% solo sobre ganancias futuras (resultado neto positivo). NO come pérdidas previas ni caja negativa acumulada.'},
];
 
// ============ HITOS DEL ROADMAP (12 reales del documento) ============
const DEFAULT_MILESTONES=[
  {id:'m1',name:'Lanzamiento Inversiones',month:0,status:'planned',kpi:'Registros 100-150, activación ≥30%, 5-10 pagos',expectedImpact:'Producto en vivo',risk:'Carga manual mata embudo',action:'Onboarding asistido 1-a-1'},
  {id:'m2',name:'Lector de boletos BETA',month:2,status:'planned',kpi:'≥30% ops vía lector, activación ≥50%',expectedImpact:'Duplica activación y conversión',risk:'Cuello de botella del año. Si se atrasa, todo el plan se corre 3-6m',action:'Contratar dev externo si no avanza al M03'},
  {id:'m3',name:'Lector estable + Black Friday',month:3,status:'planned',kpi:'Cobertura ≥80% boletos, 25-35 pagos, ≥40% trimestrales',expectedImpact:'Primer mes caja positiva',risk:'Cazadores de oferta con alto churn',action:'Ajustar descuento M12 si retención BF <70%'},
  {id:'m4',name:'Lector completo + Break-even mensual',month:4,status:'planned',kpi:'≥120 pagos activos, caja mensual positiva',expectedImpact:'Break-even mensual logrado',risk:'Vacaciones matan engagement',action:'Plan Q1 con foco retención'},
  {id:'m5',name:'Plan Anual Inversiones',month:5,status:'planned',kpi:'8-12 ventas anual, ≥160 pagos activos',expectedImpact:'Caja anticipada + hedge inflacionario',risk:'Precio percibido alto',action:'Si <5 ventas, descontinuar'},
  {id:'m6',name:'Programa de Referidos',month:6,status:'planned',kpi:'Referidos 10-15% de pagos nuevos, ≥190 activos',expectedImpact:'Crecimiento orgánico barato',risk:'Usuarios no comparten',action:'Revisar incentivo'},
  {id:'m7',name:'CHECK-POINT: lanzar Personal?',month:7,status:'planned',kpi:'≥150 pagos activos = lanzar / 100-149 = postergar / <100 = no lanzar',expectedImpact:'Decisión binaria mayor del año',risk:'Lanzar Personal sin base suficiente',action:'Decidir solo con datos del check-point'},
  {id:'m8',name:'Lanzamiento Personal beta + Cross-sell Dúo',month:8,status:'planned',kpi:'30-50 pagos Personal, cross-sell Inv→Dúo 5-8%, MRR ≥$4M',expectedImpact:'Nueva audiencia + revenue Dúo',risk:'Free Personal explota, soporte se triplica',action:'Endurecer límites free si conversión <2%'},
  {id:'m9',name:'Ajuste Dúo + ARCA módulo fiscal',month:9,status:'planned',kpi:'Dúo 15-25 nuevos, conversión Personal→Dúo ≥5%, MRR ≥$4.5M',expectedImpact:'Maximizar conversión a Dúo',risk:'Personal no son inversores',action:'Replantear si Personal→Dúo <3% por 2 meses'},
  {id:'m10',name:'Consolidación + análisis IA portfolio',month:10,status:'planned',kpi:'≥420 pagos activos, MRR ≥$5M, LTV/CAC ≥3',expectedImpact:'Confirmar escalabilidad',risk:'Saturación canal, equipo agotado',action:'Decidir capital/escala/foco'},
  {id:'m11',name:'Cierre año 1 + decisión estratégica',month:11,status:'planned',kpi:'≥480 pagos activos, MRR ≥$5.9M, ARR ≥$70M, NPS ≥50',expectedImpact:'Año 1 exitoso',risk:'Números por debajo del plan',action:'Bootstrap / levantar capital / foco'},
];
 
// ============ MOTOR FINANCIERO (cohortes mensuales por plan) ============
function project({plans,costs,influencers,channels,campaigns,referral,mpFees,scenario,scenarios,adsBudget,sy,sm,hm,inflation,fx,personalLaunch}){
  const sv=resolveVars(scenario,scenarios);
  const adsArr=adsBudget&&adsBudget.length?adsBudget:ADS_BUDGET;
  const readerPlannedMonth=2;
  const readerActiveMonth=readerPlannedMonth+(sv.readerDelay||0);
  // Personal launch: 8 (M09), 11 (M12 postergado), o 999 (no lanzar)
  const persLaunch=personalLaunch==='postpone'?11:personalLaunch==='no'?999:8;
  const activePlans=plans.filter(p=>p.active).map(p=>{
    let lm=p.launchMonth;
    if(p.product==='personal'||p.product==='duo')lm=Math.max(lm,persLaunch);
    return{...p,effLaunch:lm};
  });
 
  // cohorts[planId] = [{start, count}]
  const cohorts={};activePlans.forEach(p=>cohorts[p.id]=[]);
  let freePool=0;
  const monthly=[];
  let cumCash=0,cumNet=0;
  let beMonth=null,beCumMonth=null;
 
  for(let t=0;t<hm;t++){
    const readerActive=t>=readerActiveMonth;
    const personalLive=t>=persLaunch;
    const actRate=readerActive?sv.actPost:sv.actPre;
    const paidMult=readerActive?sv.readerMult:1;
 
    // ---- Registros por canal ----
    let orgBase=sv.orgM1*Math.pow(1+sv.orgGrowth,t);
    if(personalLive)orgBase*=sv.orgPersMult;
    const regOrganic=orgBase;
    // El presupuesto de ads editable escala proporcionalmente los canales pagos
    const defTotal=ADS_BUDGET[Math.min(t,ADS_BUDGET.length-1)]||1;
    const adsTotal=adsArr[Math.min(t,adsArr.length-1)]||0;
    const adsScale=defTotal>0?adsTotal/defTotal:1;
    const regMeta=(metaBudget(t)*adsScale)/sv.cpcMeta*sv.convClickReg;
    const regTiktok=(tiktokBudget(t)*adsScale)/sv.cpcTiktok*sv.convClickReg;
    const regYoutube=(youtubeBudget(t)*adsScale)/sv.cpmYoutube*1000;
    // influencers: registros estimados desde expectedPayments / convActPaid (aprox)
    let regInfluencers=0,infExpectedPayments=0;
    influencers.forEach(inf=>{
      if(!inf.active)return;
      const started=t>=inf.startMonth;const ended=inf.endMonth!=null&&t>inf.endMonth;
      const prodLive=inf.product==='inversiones'||((inf.product==='personal'||inf.product==='duo')&&personalLive);
      if(started&&!ended&&prodLive){infExpectedPayments+=inf.expectedPayments;regInfluencers+=inf.expectedPayments/Math.max(0.01,sv.convActPaid*actRate);}
    });
    const regByChannel={organic:regOrganic,meta:regMeta,tiktok:regTiktok,youtube:regYoutube,influencers:regInfluencers};
    const regPaidChannels=regMeta+regTiktok+regYoutube;
    const regTotal=regOrganic+regPaidChannels+regInfluencers;
 
    // ---- Activación ----
    const activations=regTotal*actRate;
 
    // ---- Pagos nuevos ----
    const newFromAct=activations*sv.convActPaid*paidMult;
    const newFromFree=freePool*sv.convFreePaid;
    let newPaidInv=newFromAct+newFromFree;
    // referidos: % extra sobre pagos nuevos
    const refPayments=newPaidInv*sv.refPct;
    newPaidInv+=refPayments;
 
    // Personal/Dúo nuevos (cuando vivo): fracción del top-of-funnel ampliado
    let newPaidPers=0,newPaidDuo=0;
    if(personalLive){
      const persFunnel=(regOrganic*0.4)*actRate*sv.convActPaid*paidMult;
      newPaidPers=persFunnel*0.6;
      newPaidDuo=persFunnel*0.4;
      // cross-sell desde Inversiones
      const invActive=sumCohorts(cohorts,activePlans,'inversiones');
      newPaidDuo+=invActive*sv.crossInvDuo;
    }
 
    // ---- Asignar a planes por mix ----
    const newByPlan={};
    activePlans.forEach(p=>{
      if(t<p.effLaunch){newByPlan[p.id]=0;return;}
      const mixKey=PLAN_MIX_KEY[p.id];const mixVal=sv.mix[mixKey]||0;
      let pool=p.product==='inversiones'?newPaidInv:p.product==='personal'?newPaidPers:newPaidDuo;
      newByPlan[p.id]=pool*mixVal;
    });
 
    // ---- Decaer cohortes y agregar nuevas ----
    activePlans.forEach(p=>{
      const churnKey=PLAN_CHURN_KEY[p.id];const churn=sv[churnKey]||0.1;
      cohorts[p.id]=cohorts[p.id].map(c=>({...c,count:c.count*(1-churn)})).filter(c=>c.count>0.01);
      if(newByPlan[p.id]>0)cohorts[p.id].push({start:t,count:newByPlan[p.id]});
    });
 
    // ---- Activos por plan / producto ----
    const activeByPlan={};let activeTotal=0;const activeByProduct={inversiones:0,personal:0,duo:0};
    activePlans.forEach(p=>{
      const a=sum(cohorts[p.id].map(c=>c.count));
      activeByPlan[p.id]=a;activeTotal+=a;activeByProduct[p.product]+=a;
    });
 
    // ---- MRR / Revenue devengado / Caja ----
    let mrr=0,cashCollected=0,grossBillings=0,discounts=0,influencerComm=0;
    const mrrByProduct={inversiones:0,personal:0,duo:0};
    activePlans.forEach(p=>{
      const mrrEquiv=p.price/p.duration;
      const a=activeByPlan[p.id];
      mrr+=a*mrrEquiv;mrrByProduct[p.product]+=a*mrrEquiv;
      // Caja: cohortes que pagan este mes (mes 0 del cohort y cada `duration` meses)
      cohorts[p.id].forEach(c=>{
        const age=t-c.start;
        if(age>=0&&age%p.duration===0){
          const billed=c.count*p.price;
          grossBillings+=billed;cashCollected+=billed;
        }
      });
    });
 
    // ---- Comisiones influencer (sobre lo COBRADO durante N meses) ----
    influencers.forEach(inf=>{
      if(!inf.active)return;
      const started=t>=inf.startMonth;const ended=inf.endMonth!=null&&t>inf.endMonth;
      if(!started||ended)return;
      // pagos generados activos en ventana de comisión
      for(let cm=0;cm<inf.commissionMonths;cm++){
        const cohortMonth=t-cm;
        if(cohortMonth<inf.startMonth)continue;
        // estimación: expectedPayments con descuento usuario, comisión sobre neto cobrado
        const planPrice=15000;// referencia plan ancla; afinar por plan aplicable
        const collected=inf.expectedPayments*planPrice*(1-inf.userDiscount);
        if(cm===0){
          const base=inf.commissionBase==='collected'?collected:inf.expectedPayments*planPrice;
          influencerComm+=base*inf.commissionPct;
          discounts+=inf.expectedPayments*planPrice*inf.userDiscount;
        }
      }
    });
    // fees fijos influencer
    let influencerFees=0;
    influencers.forEach(inf=>{
      if(!inf.active||!inf.hasFixedFee)return;
      const started=t>=inf.startMonth;const ended=inf.endMonth!=null&&t>inf.endMonth;
      if(started&&!ended)influencerFees+=inf.fixedFee;
    });
 
    // ---- Free pool ----
    const nonActivated=regTotal*(1-actRate);
    freePool=freePool*(1-sv.churnFree)+nonActivated-newFromFree;
    if(freePool<0)freePool=0;
    const freeActiveCost=freePool*(1-sv.freeDormant);
 
    // ---- Costos ----
    let fixedCosts=0;const costByCategory={};
    costs.forEach(c=>{
      const started=t>=c.startMonth;const ended=c.endMonth!=null&&t>c.endMonth;
      if(!started||ended)return;
      let amt=c.amount;
      if(c.type==='oneshot'&&t!==c.startMonth)return;
      if(c.inflationAdj)amt=c.amount*Math.pow(1+inflation,t-c.startMonth);
      fixedCosts+=amt;costByCategory[c.category]=(costByCategory[c.category]||0)+amt;
    });
    const varCostUser=(activeTotal+freeActiveCost)*sv.varCostUsd*fx;
    const mpFee=cashCollected*(mpFees.variablePct/100);
    const adsCost=adsArr[Math.min(t,adsArr.length-1)]||0;
    const cogs=varCostUser+mpFee;
    const grossProfit=mrr-cogs;
    const grossMargin=mrr>0?grossProfit/mrr:0;
    const marketing=adsCost+influencerFees+influencerComm;
    const ebitda=grossProfit-fixedCosts-marketing+0; // marketing incluido abajo
    const opResult=mrr-cogs-fixedCosts-marketing;
    // Caja del mes (base caja cobrada)
    const cashOut=cogs+fixedCosts+marketing-mpFee+mpFee; // mpFee ya en cogs
    const cashFlow=cashCollected-varCostUser-mpFee-fixedCosts-marketing;
    cumCash+=cashFlow;cumNet+=opResult;
    if(beMonth===null&&opResult>0)beMonth=t;
    if(beCumMonth===null&&cumCash>0)beCumMonth=t;
 
    // ---- CAC ----
    const newPaidTotal=sum(Object.values(newByPlan));
    const cac=newPaidTotal>0?(adsCost+influencerFees+influencerComm)/newPaidTotal:0;
    const arpu=activeTotal>0?mrr/activeTotal:0;
    const churnBlended=activeTotal>0?sum(activePlans.map(p=>activeByPlan[p.id]*(sv[PLAN_CHURN_KEY[p.id]]||0.1)))/activeTotal:0;
    const ltv=churnBlended>0?(arpu*grossMargin)/churnBlended:0;
    const ltvCac=cac>0?ltv/cac:0;
    const payback=arpu*grossMargin>0?cac/(arpu*grossMargin):0;
 
    monthly.push({
      t,label:mLabel(sy,sm,t),mkey:mKey(t),q:qOf(addMo(sy,sm,t).month),readerActive,personalLive,
      regByChannel,regTotal,regPaidChannels,activations,actRate,
      newByPlan,newPaidTotal,newPaidInv,newPaidPers,newPaidDuo,refPayments,
      activeByPlan,activeTotal,activeByProduct,freePool,freeActiveCost,
      mrr,arr:mrr*12,mrrByProduct,grossBillings,discounts,cashCollected,
      cogs,varCostUser,mpFee,influencerComm,influencerFees,adsCost,marketing,
      fixedCosts,costByCategory,grossProfit,grossMargin,opResult,ebitda:opResult,
      cashFlow,cumCash,cumNet,cac,arpu,churnBlended,ltv,ltvCac,payback,
    });
  }
 
  return{monthly,beMonth,beCumMonth,readerActiveMonth,persLaunch,
    summary:{
      mrrEnd:monthly[hm-1]?.mrr||0,arrEnd:monthly[hm-1]?.arr||0,
      activeEnd:monthly[hm-1]?.activeTotal||0,cumCashEnd:monthly[hm-1]?.cumCash||0,
      worstCash:Math.min(...monthly.map(m=>m.cumCash)),
      capitalNeeded:Math.abs(Math.min(0,...monthly.map(m=>m.cumCash))),
    }};
}
function sumCohorts(cohorts,activePlans,product){
  let s=0;activePlans.filter(p=>p.product===product).forEach(p=>{s+=sum((cohorts[p.id]||[]).map(c=>c.count));});return s;
}
function aggregate(monthly,view,sy,sm){
  if(view==='monthly')return monthly.map(m=>({...m,key:m.label}));
  if(view==='annual'){
    const groups={};monthly.forEach(m=>{const{year}=addMo(sy,sm,m.t);(groups[year]=groups[year]||[]).push(m);});
    return Object.entries(groups).map(([y,ms])=>aggGroup(ms,String(y)));
  }
  const groups={};monthly.forEach(m=>{const{year,month}=addMo(sy,sm,m.t);const k=`${year} Q${qOf(month)}`;(groups[k]=groups[k]||[]).push(m);});
  return Object.entries(groups).map(([k,ms])=>aggGroup(ms,k));
}
function aggGroup(ms,key){
  const last=ms[ms.length-1];
  return{key,label:key,mrr:last.mrr,arr:last.arr,activeTotal:last.activeTotal,freePool:last.freePool,
    newPaidTotal:sum(ms.map(m=>m.newPaidTotal)),cashCollected:sum(ms.map(m=>m.cashCollected)),
    cashFlow:sum(ms.map(m=>m.cashFlow)),cumCash:last.cumCash,opResult:sum(ms.map(m=>m.opResult)),
    fixedCosts:sum(ms.map(m=>m.fixedCosts)),marketing:sum(ms.map(m=>m.marketing)),
    cac:avg(ms.map(m=>m.cac)),ltvCac:avg(ms.map(m=>m.ltvCac)),churnBlended:avg(ms.map(m=>m.churnBlended)),
    grossMargin:avg(ms.map(m=>m.grossMargin)),regTotal:sum(ms.map(m=>m.regTotal)),arpu:last.arpu,payback:avg(ms.map(m=>m.payback))};
}
 
// ============ MOTOR DE ALERTAS Y RECOMENDACIONES ============
function buildAlerts(proj,actuals,thresholds,milestones){
  const al=[];const m=proj.monthly;if(!m.length)return al;
  const th=thresholds;
  // Buscar último mes con actuals cerrado para evaluar realidad
  const closedKeys=Object.keys(actuals||{}).filter(k=>actuals[k]?.closed);
  const lastClosed=closedKeys.sort().pop();
  const real=lastClosed?actuals[lastClosed]:null;
 
  // Runway / caja
  const cur=m[Math.min(m.length-1,0)];
  const lastCash=m[m.length-1].cumCash;
  const avgBurn=avg(m.slice(0,6).map(x=>x.cashFlow<0?-x.cashFlow:0));
  if(proj.beCumMonth===null)al.push({sev:'warn',icon:'cash',title:'Break-even acumulado no se alcanza en el horizonte',detail:`Caja acumulada al final: ${fARS(lastCash,true)}. Capital necesario: ${fARS(proj.summary.capitalNeeded,true)}.`,action:'Revisar costos fijos (sueldos founders) o levantar capital.'});
  // CAC
  const cacAvg=avg(m.slice(0,6).map(x=>x.cac));
  if(cacAvg>th.cacMax)al.push({sev:'danger',icon:'cac',title:'CAC sobre el máximo tolerable',detail:`CAC promedio ${fARS(cacAvg)} > umbral ${fARS(th.cacMax)}.`,action:'Pausar canal más caro, revisar creativos y segmentación. No subir presupuesto.'});
  // Churn
  const churnAvg=avg(m.slice(0,6).map(x=>x.churnBlended));
  if(churnAvg>th.churnMonthlyMax)al.push({sev:'warn',icon:'churn',title:'Churn blended elevado',detail:`Churn ${fPct(churnAvg)} > umbral ${fPct(th.churnMonthlyMax)}.`,action:'Exit survey, mejorar hooks de uso, cross-sell a trimestral antes del 2do cobro.'});
  // Activación (real)
  if(real?.users?.activations!=null&&real?.users?.registers){
    const actR=real.users.activations/Math.max(1,real.users.registers);
    const min=real.readerActive?th.activationMinPostReader:th.activationMinPreReader;
    if(actR<min)al.push({sev:'danger',icon:'act',title:`Activación real ${fPct(actR)} debajo del umbral`,detail:`Mínimo esperado: ${fPct(min)} (${real.readerActive?'post':'pre'}-lector).`,action:'NO escalar ads. Revisar onboarding, carga manual o lector.'});
  }
  // Check-point M08 Personal
  const m08=m[7];
  if(m08){
    if(m08.activeTotal>=150)al.push({sev:'ok',icon:'rocket',title:'Check-point M08: Personal habilitado',detail:`Pagos activos proyectados M08: ${fNum(m08.activeTotal)} (≥150).`,action:'Lanzar Personal en M09 como planeado.'});
    else if(m08.activeTotal>=100)al.push({sev:'warn',icon:'rocket',title:'Check-point M08: postergar Personal',detail:`Pagos activos proyectados M08: ${fNum(m08.activeTotal)} (100-149).`,action:'Postergar Personal a M12.'});
    else al.push({sev:'danger',icon:'rocket',title:'Check-point M08: NO lanzar Personal',detail:`Pagos activos proyectados M08: ${fNum(m08.activeTotal)} (<100).`,action:'No lanzar Personal año 1. Doblar foco en Inversiones.'});
  }
  // Influencers ROI negativo
  // (se evalúa en Growth con detalle)
  // Forecast vs Real desvío
  if(real&&lastClosed){
    const idx=parseInt(lastClosed.replace('M',''),10)-1;
    const fc=m[idx];
    if(fc&&real.users?.paidNew!=null){
      const dev=(real.users.paidNew-fc.newPaidTotal)/Math.max(1,fc.newPaidTotal);
      if(Math.abs(dev)>th.forecastDeviationMax)al.push({sev:dev<0?'danger':'ok',icon:'fvr',title:`Pagos nuevos ${dev<0?'debajo':'arriba'} del forecast (${fPct(dev,0)})`,detail:`Real ${fNum(real.users.paidNew)} vs forecast ${fNum(fc.newPaidTotal)} en ${lastClosed}.`,action:dev<0?'Revisar campañas y landing antes de subir presupuesto.':'Validar calidad de cohorte; considerar escalar canal ganador.'});
    }
  }
  return al;
}
 
// Recomendaciones del motor (reglas del brief)
function buildRecommendations(proj,actuals,thresholds){
  const recs=[];const th=thresholds;
  const closedKeys=Object.keys(actuals||{}).filter(k=>actuals[k]?.closed);
  const lastClosed=closedKeys.sort().pop();
  const r=lastClosed?actuals[lastClosed]:null;
  if(!r){recs.push({type:'info',rule:'Sin datos reales aún',text:'Cargá y cerrá al menos un mes en Forecast & Actuals para activar recomendaciones basadas en realidad.'});return recs;}
  const u=r.users||{},rev=r.revenue||{},prod=r.product||{};
  const actR=u.registers?u.activations/u.registers:null;
  if(actR!=null){
    if(!r.readerActive&&actR<0.25)recs.push({type:'danger',rule:'Activación <25% pre-lector',text:'No escalar ads. Revisar onboarding, hacer onboarding asistido, simplificar carga inicial.'});
    if(r.readerActive&&actR<0.40)recs.push({type:'warn',rule:'Activación <40% post-lector',text:'Revisar lector, tutorial y calidad de boletos soportados.'});
  }
  if(r.cac!=null&&r.cac>th.cacMax)recs.push({type:'danger',rule:'CAC > máximo 2+ semanas',text:'Pausar o reducir ads, revisar creativos y landing. No aumentar presupuesto.'});
  if(u.churnRate!=null&&u.churnRate>0.15)recs.push({type:'warn',rule:'Churn mensual >15%',text:'Exit survey, revisar recurrencia de valor, reportes mensuales, mejorar hooks de uso.'});
  if(prod.ticketsPerUser!=null&&prod.ticketsPerUser>0.4)recs.push({type:'warn',rule:'Tickets/usuario >0.4',text:'Producto no autoexplicativo. Revisar UX, agregar tooltips/tutoriales.'});
  if(u.freeActive!=null&&u.freeToPayConv!=null&&u.freeToPayConv<0.02&&u.freeActive>500)recs.push({type:'warn',rule:'Pool free crece, conversión <2%',text:'Endurecer límites free, revisar gating, mejorar upsell.'});
  if(recs.length===0)recs.push({type:'ok',rule:'Sin alertas de acción',text:'Las métricas reales del último mes cerrado están dentro de rango. Mantener el plan.'});
  return recs;
}
 
// ============ UI PRIMITIVOS ============
const Card=({children,className='',tone,onClick})=>{
  const t=tone==='danger'?'border-rose-200 bg-rose-50':tone==='warn'?'border-amber-200 bg-amber-50':tone==='ok'?'border-emerald-200 bg-emerald-50':tone==='accent'?'border-stone-300 bg-stone-50':'border-stone-200 bg-white';
  return<div onClick={onClick} className={`rounded-xl border ${t} ${className}`}>{children}</div>;
};
const Tip=({text,children})=>(<span className="group relative inline-flex items-center">{children}<span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-xs px-2 py-1 bg-stone-900 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition z-50">{text}</span></span>);
const KPI=({label,value,sub,tone='default',icon:I,tip,delta})=>{
  const c=tone==='danger'?'text-rose-700':tone==='warn'?'text-amber-700':tone==='ok'?'text-emerald-700':'text-stone-900';
  return(
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">{I&&<I size={13}/>}<span>{label}</span>{tip&&<Tip text={tip}><Info size={11} className="text-stone-400"/></Tip>}</div>
      <div className={`text-xl font-semibold tabular-nums ${c}`}>{value}</div>
      {sub&&<div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>}
      {delta!=null&&<div className={`text-[11px] mt-0.5 ${delta>=0?'text-emerald-600':'text-rose-600'}`}>{delta>=0?'▲':'▼'} {fPct(Math.abs(delta),0)} vs forecast</div>}
    </Card>
  );
};
const NI=({value,onChange,id,onKeyDown,step=1,suffix,placeholder,className=''})=>(
  <div className="relative">
    <input id={id} type="number" inputMode="decimal" value={value??''} step={step} placeholder={placeholder}
      onChange={e=>onChange(e.target.value===''?0:parseFloat(e.target.value))} onKeyDown={onKeyDown}
      className={`w-full px-2 py-1.5 text-sm text-right tabular-nums border border-stone-200 rounded-lg bg-white focus:border-stone-400 focus:outline-none ${suffix?'pr-7':''} ${className}`}/>
    {suffix&&<span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">{suffix}</span>}
  </div>
);
const TI=({value,onChange,placeholder,className=''})=>(<input type="text" value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className={`w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:border-stone-400 focus:outline-none ${className}`}/>);
const TA=({value,onChange,rows=2,placeholder})=>(<textarea value={value??''} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:border-stone-400 focus:outline-none resize-none"/>);
const SI=({value,onChange,options,className=''})=>(<select value={value} onChange={e=>onChange(e.target.value)} className={`px-2 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:border-stone-400 focus:outline-none cursor-pointer ${className}`}>{options.map(o=>typeof o==='string'?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}</select>);
const Toggle=({value,onChange,labels=['No','Sí']})=>(<button onClick={()=>onChange(!value)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${value?'bg-emerald-100 text-emerald-700':'bg-stone-100 text-stone-500'}`}>{value?<Check size={12}/>:<X size={12}/>}{value?labels[1]:labels[0]}</button>);
const Badge=({children,tone='default'})=>{const t=tone==='danger'?'bg-rose-100 text-rose-700':tone==='warn'?'bg-amber-100 text-amber-700':tone==='ok'?'bg-emerald-100 text-emerald-700':tone==='info'?'bg-blue-100 text-blue-700':tone==='purple'?'bg-purple-100 text-purple-700':'bg-stone-100 text-stone-600';return<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${t}`}>{children}</span>;};
const Sem=({state})=>{const map={ok:'🟢',warn:'🟡',danger:'🔴'};return<span>{map[state]||'⚪'}</span>;};
function ConfirmBtn({onConfirm,label,icon:I,confirmText='¿Confirmás?',danger=false}){
  const[c,setC]=useState(false);
  return<button onClick={()=>{if(c){onConfirm();setC(false);}else{setC(true);setTimeout(()=>setC(false),3000);}}} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition ${c?(danger?'bg-rose-600 text-white':'bg-amber-500 text-white'):'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'}`}>{I&&<I size={13}/>}{c?confirmText:label}</button>;
}
const SubTabs=({tabs,active,onChange})=>(
  <div className="flex gap-1 bg-stone-100 rounded-lg p-1 mb-5 overflow-x-auto">
    {tabs.map(t=>(
      <button key={t.id} onClick={()=>onChange(t.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${active===t.id?'bg-white text-stone-900 shadow-sm':'text-stone-500 hover:text-stone-700'}`}>{t.icon&&<t.icon size={13}/>}{t.label}</button>
    ))}
  </div>
);
const SectionTitle=({icon:I,title,desc,right})=>(
  <div className="flex items-start justify-between mb-4 gap-3">
    <div className="flex items-start gap-2.5">
      {I&&<div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center mt-0.5"><I size={15} className="text-stone-600"/></div>}
      <div><h2 className="text-base font-semibold text-stone-900">{title}</h2>{desc&&<p className="text-xs text-stone-500 mt-0.5 max-w-2xl">{desc}</p>}</div>
    </div>
    {right}
  </div>
);
 
// ============ LOGIN ============
function LoginScreen(){
  const[email,setEmail]=useState('');const[password,setPassword]=useState('');
  const[mode,setMode]=useState('login');const[loading,setLoading]=useState(false);
  const[msg,setMsg]=useState(null);const[err,setErr]=useState(null);
  const handle=async(e)=>{
    e.preventDefault();setLoading(true);setErr(null);setMsg(null);
    if(mode==='login'){const{error}=await supabase.auth.signInWithPassword({email,password});if(error)setErr(error.message);}
    else if(mode==='signup'){const{error}=await supabase.auth.signUp({email,password,options:{data:{name:email.split('@')[0]}}});if(error)setErr(error.message);else setMsg('Revisá tu email para confirmar la cuenta.');}
    else{const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});if(error)setErr(error.message);else setMsg('Te enviamos un link de recuperación.');}
    setLoading(false);
  };
  return(
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="bg-white border border-stone-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-white flex items-center justify-center"><Layers size={18}/></div>
          <div><div className="text-base font-medium text-stone-900">ProfitLab OS</div><div className="text-[11px] text-stone-500">Backoffice financiero-operativo</div></div>
        </div>
        <h2 className="text-lg font-medium text-stone-900 mb-1">{mode==='login'?'Iniciar sesión':mode==='signup'?'Crear cuenta':'Recuperar contraseña'}</h2>
        <p className="text-xs text-stone-500 mb-5">Tus datos se guardan de forma segura en la nube.</p>
        <form onSubmit={handle} className="space-y-3">
          <div><label className="block text-xs text-stone-600 mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-400 focus:outline-none"/></div>
          {mode!=='reset'&&(<div><label className="block text-xs text-stone-600 mb-1">Contraseña</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:bg-white focus:border-stone-400 focus:outline-none"/></div>)}
          {err&&(<div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">{err}</div>)}
          {msg&&(<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">{msg}</div>)}
          <button type="submit" disabled={loading} className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-sm font-medium rounded-lg transition">{loading?'Cargando...':mode==='login'?'Entrar':mode==='signup'?'Crear cuenta':'Enviar link'}</button>
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
 
// ============ HEADER + NAV ============
const NAV=[
  {id:'dashboard',label:'Dashboard',icon:Gauge},
  {id:'forecast',label:'Forecast & Actuals',icon:LineIcon},
  {id:'growth',label:'Growth',icon:Megaphone},
  {id:'revenue',label:'Revenue & Plans',icon:DollarSign},
  {id:'costs',label:'Costos & Caja',icon:Wallet},
  {id:'partners',label:'Socios & Franco',icon:HandCoins},
  {id:'roadmap',label:'Roadmap & Decisiones',icon:Flag},
  {id:'investor',label:'Investor View',icon:Eye},
  {id:'config',label:'Configuración',icon:Settings},
];
function Header({scenario,setScenario,productFilter,setProductFilter,vsMode,setVsMode,saving,lastSaved,onLogout,userEmail}){
  return(
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-stone-900 text-white flex items-center justify-center"><Layers size={16}/></div>
          <div><div className="text-[15px] font-medium text-stone-900">ProfitLab OS</div><div className="text-[11px] text-stone-500 -mt-0.5">Operating System · ARS</div></div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-stone-100 rounded-lg p-0.5 text-xs">
            {['conservador','base','optimista'].map(s=>(<button key={s} onClick={()=>setScenario(s)} className={`px-2.5 py-1.5 rounded-md font-medium capitalize transition ${scenario===s?'bg-white text-stone-900 shadow-sm':'text-stone-600'}`}>{s}</button>))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            {saving?<><RefreshCw size={12} className="animate-spin text-amber-600"/><span className="text-amber-600">Guardando</span></>:lastSaved?<><Cloud size={12} className="text-emerald-600"/><span className="text-emerald-600">Guardado {lastSaved.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</span></>:<><CloudOff size={12}/><span>Sin guardar</span></>}
          </div>
          {userEmail&&<button onClick={onLogout} title={`Cerrar sesión (${userEmail})`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-medium rounded-lg"><LogOut size={13}/></button>}
        </div>
      </div>
    </header>
  );
}
function Nav({current,setTab}){
  return(
    <nav className="bg-white border-b border-stone-200 sticky top-[53px] z-20">
      <div className="max-w-[1600px] mx-auto px-4 flex gap-0.5 overflow-x-auto">
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition ${current===n.id?'border-stone-900 text-stone-900':'border-transparent text-stone-500 hover:text-stone-700'}`}><n.icon size={14}/>{n.label}</button>
        ))}
      </div>
    </nav>
  );
}
const VSwitch=({view,setView})=>(
  <div className="flex bg-stone-100 rounded-lg p-0.5 text-xs">
    {[{v:'monthly',l:'Mensual'},{v:'quarterly',l:'Trimestral'},{v:'annual',l:'Anual'}].map(o=>(<button key={o.v} onClick={()=>setView(o.v)} className={`px-2.5 py-1 rounded-md font-medium transition ${view===o.v?'bg-white text-stone-900 shadow-sm':'text-stone-500'}`}>{o.l}</button>))}
  </div>
);
 
// ============ DASHBOARD ============
function DashboardTab({proj,projReal,actuals,state,set}){
  const{scenario,productFilter,view,thresholds}=state;
  const m=proj.monthly;
  const alerts=useMemo(()=>buildAlerts(proj,actuals,thresholds,state.milestones),[proj,actuals,thresholds,state.milestones]);
  const agg=useMemo(()=>aggregate(m,view,state.sy,state.sm),[m,view,state.sy,state.sm]);
  const last=m[m.length-1]||{};
  const beLabel=proj.beMonth!=null?mLabel(state.sy,state.sm,proj.beMonth):'No en horizonte';
  const beCumLabel=proj.beCumMonth!=null?mLabel(state.sy,state.sm,proj.beCumMonth):'No en horizonte';
  const avgBurn=avg(m.slice(0,Math.min(6,m.length)).map(x=>x.cashFlow<0?-x.cashFlow:0));
  const runway=avgBurn>0&&last.cumCash<0?Math.max(0,(last.cumCash+proj.summary.capitalNeeded)/avgBurn):null;
  const sevOrder={danger:0,warn:1,ok:2,info:3};
  const sortedAlerts=[...alerts].sort((a,b)=>sevOrder[a.sev]-sevOrder[b.sev]);
 
  const chartData=agg.map(a=>({name:a.label||a.key,MRR:Math.round(a.mrr),Caja:Math.round(a.cumCash),Activos:Math.round(a.activeTotal)}));
  const productMrr=last.mrrByProduct||{inversiones:0,personal:0,duo:0};
  const pieData=[{name:'Inversiones',value:Math.round(productMrr.inversiones),color:'#0f172a'},{name:'Personal',value:Math.round(productMrr.personal),color:'#3b82f6'},{name:'Dúo',value:Math.round(productMrr.duo),color:'#a855f7'}].filter(d=>d.value>0);
 
  const partners=state.partners||[];
  const francoExp=state.francoExpenses||[];
  const francoTotal=sum(francoExp.filter(e=>e.reimbursable).map(e=>e.amount));
  const francoRecovered=sum(francoExp.map(e=>e.recovered||0));
  const francoPending=francoTotal-francoRecovered;
 
  return(
    <div>
      <SectionTitle icon={Gauge} title="Dashboard" desc="Centro de control. Escenario, vista y producto se ajustan acá y propagan a todo el modelo."
        right={<div className="flex items-center gap-2"><VSwitch view={view} setView={v=>set({view:v})}/><SI value={productFilter} onChange={v=>set({productFilter:v})} options={[{v:'all',l:'Todos los productos'},{v:'inversiones',l:'Inversiones'},{v:'personal',l:'Personal'},{v:'duo',l:'Dúo'}]}/></div>}/>
 
      {/* Alertas */}
      {sortedAlerts.length>0&&(
        <div className="mb-5 grid gap-2">
          {sortedAlerts.slice(0,6).map((a,i)=>(
            <Card key={i} tone={a.sev} className="p-3 flex items-start gap-2.5">
              <div className="mt-0.5">{a.sev==='danger'?<AlertTriangle size={15} className="text-rose-600"/>:a.sev==='warn'?<AlertTriangle size={15} className="text-amber-600"/>:a.sev==='ok'?<CheckCircle2 size={15} className="text-emerald-600"/>:<Info size={15} className="text-blue-600"/>}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-stone-900">{a.title}</div>
                <div className="text-xs text-stone-600 mt-0.5">{a.detail}</div>
                {a.action&&<div className="text-xs text-stone-500 mt-1 flex items-center gap-1"><ArrowRight size={11}/>{a.action}</div>}
              </div>
            </Card>
          ))}
        </div>
      )}
 
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
        <KPI label="MRR actual" value={fARS(last.mrr,true)} icon={TrendingUp} tone="ok" tip="Monthly Recurring Revenue del último mes del horizonte"/>
        <KPI label="ARR" value={fARS(last.arr,true)} icon={TrendingUp} tip="ARR = MRR × 12"/>
        <KPI label="Caja acumulada" value={fARS(last.cumCash,true)} tone={last.cumCash<0?'danger':'ok'} icon={Wallet}/>
        <KPI label="Pagos activos" value={fNum(last.activeTotal)} icon={Users} tone={last.activeTotal>=150?'ok':'warn'}/>
        <KPI label="Pool free" value={fNum(last.freePool)} icon={Users}/>
        <KPI label="Burn mensual" value={fARS(avgBurn,true)} tone="warn" icon={TrendingDown} tip="Promedio de caja negativa de los primeros 6 meses"/>
        <KPI label="Break-even mensual" value={beLabel} icon={Target} tone={proj.beMonth!=null?'ok':'warn'}/>
        <KPI label="Break-even acumulado" value={beCumLabel} icon={Target} tone={proj.beCumMonth!=null?'ok':'danger'}/>
        <KPI label="CAC blended" value={fARS(avg(m.slice(0,6).map(x=>x.cac)))} tone={avg(m.slice(0,6).map(x=>x.cac))>thresholds.cacMax?'danger':'ok'} icon={Target}/>
        <KPI label="LTV / CAC" value={fX(avg(m.slice(0,12).map(x=>x.ltvCac)))} tone={avg(m.slice(0,12).map(x=>x.ltvCac))>=3?'ok':'warn'} icon={Scale}/>
        <KPI label="Payback" value={`${avg(m.slice(0,12).map(x=>x.payback)).toFixed(1)} m`} icon={Clock} tone="ok"/>
        <KPI label="Churn blended" value={fPct(avg(m.slice(0,6).map(x=>x.churnBlended)))} tone={avg(m.slice(0,6).map(x=>x.churnBlended))>thresholds.churnMonthlyMax?'warn':'ok'} icon={TrendingDown}/>
        <KPI label="ARPU" value={fARS(last.arpu)} icon={DollarSign}/>
        <KPI label="Gross margin" value={fPct(last.grossMargin)} tone="ok" icon={Percent}/>
        <KPI label="Capital necesario" value={fARS(proj.summary.capitalNeeded,true)} tone="warn" icon={PiggyBank} tip="Peor punto de caja acumulada (lo que hay que financiar)"/>
        <KPI label="Recupero Franco pend." value={fARS(francoPending,true)} tone={francoPending>0?'warn':'ok'} icon={Receipt} tip="Gastos personales reembolsables aún no recuperados"/>
      </div>
 
      {/* Gráficos */}
      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <Card className="p-4 lg:col-span-2">
          <div className="text-sm font-medium text-stone-900 mb-3">MRR y Caja acumulada</div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ef"/>
              <XAxis dataKey="name" tick={{fontSize:10}} interval="preserveStartEnd"/>
              <YAxis yAxisId="l" tick={{fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`}/>
              <RT formatter={(v,n)=>[fARS(v,true),n]}/>
              <ReferenceLine yAxisId="r" y={0} stroke="#e11d48" strokeDasharray="3 3"/>
              <Bar yAxisId="l" dataKey="MRR" fill="#0f172a" radius={[3,3,0,0]} maxBarSize={28}/>
              <Line yAxisId="r" dataKey="Caja" stroke="#e11d48" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-stone-900 mb-3">MRR por producto</div>
          {pieData.length?(
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={e=>e.name}>{pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><RT formatter={v=>fARS(v,true)}/></PieChart>
            </ResponsiveContainer>
          ):<div className="text-xs text-stone-400 py-12 text-center">Sin datos de productos múltiples aún</div>}
          <div className="mt-2 space-y-1">
            {pieData.map(d=>(<div key={d.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:d.color}}/>{d.name}</span><span className="tabular-nums font-medium">{fARS(d.value,true)}</span></div>))}
          </div>
        </Card>
      </div>
 
      {/* Distribución socios + pagos activos */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-1.5"><HandCoins size={14}/>Distribución de ganancias</div>
          {last.cumNet>0?(
            <div className="space-y-2">
              {partners.map(p=>{
                const elig=last.cumNet>0;const share=elig?last.cumNet*p.sharePct:0;
                return(<div key={p.id} className="flex items-center justify-between text-xs"><span>{p.name} <Badge tone={p.type==='founder'?'info':'purple'}>{fPct(p.sharePct,0)}</Badge></span><span className="tabular-nums font-medium">{fARS(share,true)}</span></div>);
              })}
            </div>
          ):<div className="text-xs text-stone-400 py-4">Resultado neto acumulado negativo. Sin ganancias para distribuir todavía. {state.partners?.find(p=>!p.participatesPastLosses)?.name||'Luis'} no participa de pérdidas previas.</div>}
        </Card>
        <Card className="p-4 lg:col-span-2">
          <div className="text-sm font-medium text-stone-900 mb-3">Evolución pagos activos</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0ef"/><XAxis dataKey="name" tick={{fontSize:10}} interval="preserveStartEnd"/><YAxis tick={{fontSize:10}}/><RT/><Area dataKey="Activos" stroke="#0f172a" fill="#0f172a" fillOpacity={0.08} strokeWidth={2}/><ReferenceLine y={150} stroke="#10b981" strokeDasharray="4 4" label={{value:'150 (Personal)',fontSize:9,fill:'#10b981'}}/></AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
 
// ============ FORECAST & ACTUALS ============
function ForecastActualsTab({proj,state,set,actuals,saveActual,closeMonth,reopenMonth}){
  const[sub,setSub]=useState('forecast');
  const tabs=[{id:'forecast',label:'Forecast mensual',icon:LineIcon},{id:'real',label:'Carga real / cierre',icon:Edit3},{id:'vs',label:'Forecast vs Real',icon:GitCompare},{id:'sens',label:'Sensibilidad',icon:Zap}];
  return(
    <div>
      <SectionTitle icon={LineIcon} title="Forecast & Actuals" desc="Proyectá editando los supuestos, cargá la realidad cuando salgas al mercado, y compará. Los supuestos del forecast son editables por escenario y conviven con la carga de actuals."/>
      <SubTabs tabs={tabs} active={sub} onChange={setSub}/>
      {sub==='forecast'&&<ForecastView proj={proj} state={state} set={set}/>}
      {sub==='real'&&<ActualsView proj={proj} state={state} actuals={actuals} saveActual={saveActual} closeMonth={closeMonth} reopenMonth={reopenMonth}/>}
      {sub==='vs'&&<ForecastVsReal proj={proj} state={state} actuals={actuals}/>}
      {sub==='sens'&&<SensitivityView state={state} baseProj={proj}/>}
    </div>
  );
}
 
function ForecastView({proj,state,set}){
  const m=proj.monthly;
  const[showAssumptions,setShowAssumptions]=useState(true);
  const[showBudget,setShowBudget]=useState(false);
  const sc=state.scenario;
  const scenarios=state.scenarios||buildScenarios();
  const sv=scenarios[sc]||scenVars(sc);
  // editar un supuesto del escenario activo
  const updVar=(key,val)=>{
    const next={...scenarios,[sc]:{...scenarios[sc],[key]:val}};
    set({scenarios:next});
  };
  const updMix=(key,val)=>{
    const cur=scenarios[sc]||scenVars(sc);
    const next={...scenarios,[sc]:{...cur,mix:{...(cur.mix||scenVars(sc).mix),[key]:val}}};
    set({scenarios:next});
  };
  const resetScenario=()=>{set({scenarios:{...scenarios,[sc]:scenVars(sc)}});};
  // ads budget editable
  const adsBudget=state.adsBudget&&state.adsBudget.length?state.adsBudget:buildDefaultAdsBudget();
  const updAds=(idx,val)=>{const next=[...adsBudget];next[idx]=val;set({adsBudget:next});};
  // agrupar supuestos
  const groups={};SCENARIO_VARS.forEach(v=>{(groups[v.grp]=groups[v.grp]||[]).push(v);});
  const mixLabels={invM:'Inv Mensual',invQ:'Inv Trimestral',invA:'Inv Anual',persSoloM:'Pers Solo Mensual',persSoloQ:'Pers Solo Trim',persParejaM:'Pers Pareja Mensual',persParejaQ:'Pers Pareja Trim',duoM:'Dúo Mensual',duoQ:'Dúo Trimestral',duoA:'Dúo Anual'};
  const fmtVal=(v,fmt)=>fmt==='pct'?v*100:v;
  const parseVal=(raw,fmt)=>fmt==='pct'?raw/100:raw;
 
  const rows=[
    {k:'regTotal',label:'Registros totales',fmt:fNum},
    {k:'activations',label:'Activaciones',fmt:fNum},
    {k:'newPaidTotal',label:'Pagos nuevos',fmt:fNum},
    {k:'activeTotal',label:'Pagos activos',fmt:fNum,bold:true},
    {k:'freePool',label:'Pool free',fmt:fNum},
    {k:'mrr',label:'MRR',fmt:v=>fARS(v,true),bold:true},
    {k:'cashCollected',label:'Caja cobrada',fmt:v=>fARS(v,true)},
    {k:'fixedCosts',label:'Costos fijos',fmt:v=>fARS(v,true)},
    {k:'marketing',label:'Marketing',fmt:v=>fARS(v,true)},
    {k:'opResult',label:'Resultado (EBITDA)',fmt:v=>fARS(v,true),bold:true},
    {k:'cumCash',label:'Caja acumulada',fmt:v=>fARS(v,true),bold:true},
    {k:'cac',label:'CAC',fmt:v=>fARS(v)},
    {k:'ltvCac',label:'LTV/CAC',fmt:fX},
  ];
  return(
    <div className="space-y-4">
      {/* Banner */}
      <Card tone="accent" className="p-3 flex items-start gap-2 text-xs text-stone-600">
        <Info size={14} className="mt-0.5 shrink-0"/>
        <div>Estás editando los supuestos del escenario <span className="font-medium capitalize text-stone-800">{sc}</span> (cambialo en el header). Cada cambio recalcula el forecast al instante y se guarda solo. Los precios se editan en Revenue & Plans, los costos en Costos & Caja, los influencers en Growth.</div>
      </Card>
 
      {/* Supuestos editables */}
      <Card className="overflow-hidden">
        <button onClick={()=>setShowAssumptions(!showAssumptions)} className="w-full p-3 flex items-center justify-between hover:bg-stone-50">
          <span className="text-sm font-medium text-stone-900 flex items-center gap-2"><Edit3 size={14}/>Supuestos del forecast · escenario {sc}</span>
          <span className="flex items-center gap-2"><ConfirmBtn onConfirm={resetScenario} label="Reset escenario" icon={Eraser} confirmText="¿Volver al Excel?"/>{showAssumptions?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</span>
        </button>
        {showAssumptions&&(
          <div className="border-t border-stone-100 p-4 space-y-4">
            {Object.entries(groups).map(([grp,vars])=>(
              <div key={grp}>
                <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">{grp}</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {vars.map(v=>(
                    <div key={v.key}>
                      <label className="text-[11px] text-stone-500 block mb-0.5">{v.label}</label>
                      <NI value={fmtVal(sv[v.key]??v.base,v.fmt)} onChange={val=>updVar(v.key,parseVal(val,v.fmt))} suffix={v.fmt==='pct'?'%':v.fmt==='money'||v.fmt==='usd'?'$':v.fmt==='ratio'?'x':''} step={v.fmt==='pct'?0.1:v.fmt==='ratio'?0.05:1}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Mix de planes (% de nuevos pagos)</div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.keys(mixLabels).map(mk=>(
                  <div key={mk}>
                    <label className="text-[11px] text-stone-500 block mb-0.5">{mixLabels[mk]}</label>
                    <NI value={((sv.mix||scenVars(sc).mix)[mk]||0)*100} onChange={val=>updMix(mk,val/100)} suffix="%"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
 
      {/* Presupuesto de ads editable */}
      <Card className="overflow-hidden">
        <button onClick={()=>setShowBudget(!showBudget)} className="w-full p-3 flex items-center justify-between hover:bg-stone-50">
          <span className="text-sm font-medium text-stone-900 flex items-center gap-2"><Megaphone size={14}/>Presupuesto de ads por mes (total)</span>
          {showBudget?<ChevronDown size={16}/>:<ChevronRight size={16}/>}
        </button>
        {showBudget&&(
          <div className="border-t border-stone-100 p-4">
            <p className="text-xs text-stone-500 mb-3">El total de ads escala proporcionalmente los canales pagos (Meta/TikTok/YouTube) para calcular registros y CAC.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {m.map((x,i)=>(
                <div key={i}>
                  <label className="text-[11px] text-stone-500 block mb-0.5">{x.label}</label>
                  <NI value={adsBudget[i]??0} onChange={val=>updAds(i,val)} step={50000}/>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
 
      {/* Tabla de output */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-stone-100 text-sm font-medium text-stone-900">Forecast resultante ({m.length} meses)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-200 bg-stone-50">
              <th className="text-left p-2.5 font-medium text-stone-500 sticky left-0 bg-stone-50 z-10 min-w-[150px]">Métrica</th>
              {m.map(x=>(<th key={x.t} className={`text-right p-2.5 font-medium whitespace-nowrap ${x.readerActive?'text-stone-700':'text-stone-400'}`}>{x.label}{x.t===proj.readerActiveMonth&&<div className="text-[9px] text-emerald-600">lector</div>}{x.t===proj.persLaunch&&<div className="text-[9px] text-purple-600">Personal</div>}</th>))}
            </tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.k} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className={`p-2.5 sticky left-0 bg-white z-10 ${r.bold?'font-medium text-stone-900':'text-stone-600'}`}>{r.label}</td>
                  {m.map(x=>(<td key={x.t} className={`text-right p-2.5 tabular-nums ${r.bold?'font-medium':''} ${(r.k==='opResult'||r.k==='cumCash')&&x[r.k]<0?'text-rose-600':''}`}>{r.fmt(x[r.k])}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
 
const ACTUAL_FIELDS={
  users:[['registers','Registros reales'],['activations','Usuarios activados'],['freeActive','Free activos'],['freeDormant','Free dormidos'],['paidNew','Pagos nuevos'],['churnedOut','Bajas por churn'],['paidActive','Pagos activos finales'],['migrationsDuo','Migraciones a Dúo'],['reactivations','Reactivaciones']],
  revenue:[['grossBillings','Facturación bruta (precio lista)'],['discounts','Descuentos otorgados'],['netBillings','Facturación neta'],['mpFee','Comisión Mercado Pago'],['influencerComm','Comisión influencers'],['cash','Caja real cobrada'],['mrr','MRR final'],['upgrades','Upgrades'],['downgrades','Downgrades'],['churnRevenue','Revenue perdido por churn']],
  costs:[['fixed','Costos fijos reales'],['variable','Costos variables reales'],['ads','Publicidad real'],['tools','Herramientas'],['servers','Servidores'],['support','Soporte'],['oneshot','Gastos one-shot'],['francoExpenses','Gastos personales Franco']],
  product:[['opsLoaded','Operaciones cargadas'],['portfolios','Portafolios creados'],['usersWith1op','Usuarios 1+ operación'],['usersWith5op','Usuarios 5+ operaciones'],['usersWith10op','Usuarios 10+ operaciones'],['usersWithReader','Usuarios que usaron lector'],['readerOpsPct','% operaciones vía lector'],['readerErrors','Errores del lector'],['ticketsCount','Tickets de soporte'],['ticketsPerUser','Tickets por usuario'],['nps','NPS'],['wau','WAU'],['mau','MAU']],
};
function ActualsView({proj,state,actuals,saveActual,closeMonth,reopenMonth}){
  const m=proj.monthly;
  const[selMonth,setSelMonth]=useState(m[0]?.mkey||'M01');
  const cur=actuals[selMonth]||{users:{},revenue:{},costs:{},product:{}};
  const closed=cur.closed;
  const[grp,setGrp]=useState('users');
  const fcMonth=m.find(x=>x.mkey===selMonth);
  const upd=(g,k,v)=>{if(closed)return;const next={...cur,[g]:{...(cur[g]||{}),[k]:v===''?null:parseFloat(v)}};saveActual(selMonth,next);};
  const grpTabs=[{id:'users',label:'Usuarios'},{id:'revenue',label:'Revenue'},{id:'costs',label:'Costos'},{id:'product',label:'Producto'}];
  return(
    <div>
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Mes:</span>
            <SI value={selMonth} onChange={setSelMonth} options={m.map(x=>({v:x.mkey,l:`${x.mkey} · ${x.label}`}))}/>
            {closed?<Badge tone="ok"><Lock size={11}/> Cerrado</Badge>:<Badge tone="warn"><Unlock size={11}/> Abierto</Badge>}
          </div>
          <div className="flex items-center gap-2">
            {closed?<ConfirmBtn onConfirm={()=>reopenMonth(selMonth)} label="Reabrir mes" icon={Unlock} confirmText="¿Reabrir?"/>:<ConfirmBtn onConfirm={()=>closeMonth(selMonth)} label="Cerrar mes" icon={Lock} confirmText="¿Cerrar mes?" danger/>}
          </div>
        </div>
        <p className="text-xs text-stone-500 mt-2">{closed?'Mes cerrado: los datos quedan congelados como realidad y se usan para comparar contra forecast. Reabrí para editar.':'Cargá los datos reales del mes. Cuando termines, cerrá el mes para congelarlos.'}</p>
      </Card>
      <SubTabs tabs={grpTabs} active={grp} onChange={setGrp}/>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="text-left p-3 font-medium text-stone-500">Dato real</th><th className="text-right p-3 font-medium text-stone-500 w-40">Valor real</th><th className="text-right p-3 font-medium text-stone-400 w-40">Forecast</th></tr></thead>
          <tbody>
            {ACTUAL_FIELDS[grp].map(([k,label])=>{
              const fcVal=grp==='users'&&k==='registers'?fcMonth?.regTotal:grp==='users'&&k==='paidNew'?fcMonth?.newPaidTotal:grp==='users'&&k==='paidActive'?fcMonth?.activeTotal:grp==='revenue'&&k==='mrr'?fcMonth?.mrr:grp==='revenue'&&k==='cash'?fcMonth?.cashCollected:grp==='costs'&&k==='fixed'?fcMonth?.fixedCosts:null;
              return(
                <tr key={k} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="p-3 text-stone-700">{label}</td>
                  <td className="p-2"><NI value={cur[grp]?.[k]} onChange={v=>upd(grp,k,v)} className={closed?'bg-stone-100':''}/></td>
                  <td className="p-3 text-right tabular-nums text-stone-400 text-xs">{fcVal!=null?(k==='mrr'||k==='cash'?fARS(fcVal,true):fNum(fcVal)):'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
 
function ForecastVsReal({proj,state,actuals}){
  const m=proj.monthly;
  const closedKeys=Object.keys(actuals).filter(k=>actuals[k]?.closed).sort();
  if(!closedKeys.length)return<Card className="p-8 text-center text-sm text-stone-500"><GitCompare size={28} className="mx-auto mb-2 text-stone-300"/>Todavía no cerraste ningún mes. Cargá datos reales en "Carga real / cierre" y cerrá un mes para ver la comparación.</Card>;
  const metrics=[
    {k:'registers',g:'users',label:'Registros',fc:x=>x.regTotal,fmt:fNum,goodHigh:true},
    {k:'paidNew',g:'users',label:'Pagos nuevos',fc:x=>x.newPaidTotal,fmt:fNum,goodHigh:true},
    {k:'paidActive',g:'users',label:'Pagos activos',fc:x=>x.activeTotal,fmt:fNum,goodHigh:true},
    {k:'mrr',g:'revenue',label:'MRR',fc:x=>x.mrr,fmt:v=>fARS(v,true),goodHigh:true},
    {k:'cash',g:'revenue',label:'Caja cobrada',fc:x=>x.cashCollected,fmt:v=>fARS(v,true),goodHigh:true},
    {k:'fixed',g:'costs',label:'Costos fijos',fc:x=>x.fixedCosts,fmt:v=>fARS(v,true),goodHigh:false},
  ];
  const diag=(dev,goodHigh,label)=>{
    const bad=goodHigh?dev<-0.2:dev>0.2;
    const warn=Math.abs(dev)>0.1;
    if(bad){
      if(label==='Pagos nuevos')return{sev:'danger',txt:'Adquisición debajo de lo esperado',act:'Revisar campañas y landing antes de subir presupuesto.'};
      if(label==='Registros')return{sev:'danger',txt:'Top-of-funnel débil',act:'Revisar creativos y CPC por canal.'};
      if(label==='MRR'||label==='Caja cobrada')return{sev:'danger',txt:'Revenue debajo del plan',act:'Revisar conversión, mix de planes y churn.'};
      if(label==='Costos fijos')return{sev:'danger',txt:'Costos por encima del plan',act:'Revisar gastos no presupuestados.'};
      return{sev:'danger',txt:'Desvío negativo significativo',act:'Investigar causa raíz.'};
    }
    if(warn)return{sev:'warn',txt:'Desvío moderado',act:'Monitorear la próxima semana.'};
    return{sev:'ok',txt:'En línea con el forecast',act:'Mantener.'};
  };
  return(
    <div className="space-y-4">
      {closedKeys.map(mk=>{
        const idx=parseInt(mk.replace('M',''),10)-1;const fc=m[idx];const real=actuals[mk];if(!fc)return null;
        return(
          <Card key={mk} className="p-0 overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between"><span className="text-sm font-medium text-stone-900">{mk} · {fc.label}</span><Badge tone="ok"><Lock size={11}/> Cerrado</Badge></div>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-stone-100 text-stone-500"><th className="text-left p-2.5 font-medium">Métrica</th><th className="text-right p-2.5 font-medium">Forecast</th><th className="text-right p-2.5 font-medium">Real</th><th className="text-right p-2.5 font-medium">Desvío</th><th className="text-center p-2.5 font-medium w-12"></th><th className="text-left p-2.5 font-medium">Diagnóstico / acción</th></tr></thead>
              <tbody>
                {metrics.map(mt=>{
                  const rv=real[mt.g]?.[mt.k];if(rv==null)return null;
                  const fv=mt.fc(fc);const dev=fv?(rv-fv)/fv:0;const d=diag(dev,mt.goodHigh,mt.label);
                  return(
                    <tr key={mt.k} className="border-b border-stone-100">
                      <td className="p-2.5 text-stone-700">{mt.label}</td>
                      <td className="p-2.5 text-right tabular-nums text-stone-500">{mt.fmt(fv)}</td>
                      <td className="p-2.5 text-right tabular-nums font-medium">{mt.fmt(rv)}</td>
                      <td className={`p-2.5 text-right tabular-nums font-medium ${dev<0?'text-rose-600':'text-emerald-600'}`}>{dev>=0?'+':''}{fPct(dev,0)}</td>
                      <td className="p-2.5 text-center"><Sem state={d.sev}/></td>
                      <td className="p-2.5"><div className="text-stone-700">{d.txt}</div><div className="text-stone-400 flex items-center gap-1"><ArrowRight size={10}/>{d.act}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        );
      })}
    </div>
  );
}
 
function SensitivityView({state,baseProj}){
  const levers=[
    {id:'cac',label:'CAC',variants:['−30%','Base','+30%']},
    {id:'churn',label:'Churn',variants:['−30%','Base','+50%']},
    {id:'reader',label:'Lector de boletos',variants:['1 mes antes','A tiempo','2 meses tarde']},
    {id:'personal',label:'Lanzamiento Personal',variants:['M09','M12','No lanzar']},
    {id:'price',label:'Precio Inversión',variants:['$15k','$17k']},
    {id:'discInf',label:'Descuento usuario inf.',variants:['10%','20%','30%']},
  ];
  // Comparativa rápida de escenarios completos
  const scenarios=['conservador','base','optimista'];
  const rows=scenarios.map(sc=>{
    const p=project({...state,scenario:sc,scenarios:state.scenarios,adsBudget:state.adsBudget,costs:state.costs,influencers:state.influencers,channels:state.channels,campaigns:state.campaigns,referral:state.referral,mpFees:state.mpFees,inflation:state.inflation,fx:state.fx,personalLaunch:state.personalLaunch,plans:state.plans});
    const m12=p.monthly[11]||{};
    return{sc,active12:m12.activeTotal,mrr12:m12.mrr,cumCash12:m12.cumCash,cac:avg(p.monthly.slice(0,12).map(x=>x.cac)),ltvCac:avg(p.monthly.slice(0,12).map(x=>x.ltvCac)),payback:avg(p.monthly.slice(0,12).map(x=>x.payback)),be:p.beMonth,capital:p.summary.capitalNeeded};
  });
  return(
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Comparación de escenarios completos (al M12)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-200 text-stone-500"><th className="text-left p-2 font-medium">Escenario</th><th className="text-right p-2 font-medium">Pagos activos</th><th className="text-right p-2 font-medium">MRR</th><th className="text-right p-2 font-medium">Caja acum.</th><th className="text-right p-2 font-medium">CAC</th><th className="text-right p-2 font-medium">LTV/CAC</th><th className="text-right p-2 font-medium">Payback</th><th className="text-right p-2 font-medium">Capital nec.</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.sc} className="border-b border-stone-100">
                  <td className="p-2 font-medium capitalize">{r.sc}</td>
                  <td className="p-2 text-right tabular-nums">{fNum(r.active12)}</td>
                  <td className="p-2 text-right tabular-nums">{fARS(r.mrr12,true)}</td>
                  <td className={`p-2 text-right tabular-nums ${r.cumCash12<0?'text-rose-600':'text-emerald-600'}`}>{fARS(r.cumCash12,true)}</td>
                  <td className="p-2 text-right tabular-nums">{fARS(r.cac)}</td>
                  <td className="p-2 text-right tabular-nums">{fX(r.ltvCac)}</td>
                  <td className="p-2 text-right tabular-nums">{r.payback.toFixed(1)}m</td>
                  <td className="p-2 text-right tabular-nums text-amber-700">{fARS(r.capital,true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-1">Palancas de sensibilidad</div>
        <p className="text-xs text-stone-500 mb-3">Las palancas interactivas con sliders llegan en V4.1. Por ahora, cambiá el escenario en el header para ver el impacto completo arriba.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {levers.map(l=>(<div key={l.id} className="p-3 border border-stone-200 rounded-lg"><div className="text-xs font-medium text-stone-700 mb-1.5">{l.label}</div><div className="flex gap-1 flex-wrap">{l.variants.map(v=>(<span key={v} className="px-2 py-0.5 bg-stone-100 rounded text-[11px] text-stone-500">{v}</span>))}</div></div>))}
        </div>
      </Card>
    </div>
  );
}
 
// ============ GROWTH ============
function GrowthTab({proj,state,set}){
  const[sub,setSub]=useState('influencers');
  const tabs=[{id:'channels',label:'Canales',icon:Radio},{id:'influencers',label:'Influencers',icon:Sparkles},{id:'referrals',label:'Referidos',icon:Gift},{id:'campaigns',label:'Campañas',icon:Megaphone}];
  return(
    <div>
      <SectionTitle icon={Megaphone} title="Growth" desc="Canales, influencers, referidos y campañas. Acá vive el motor de adquisición y su economía."/>
      <SubTabs tabs={tabs} active={sub} onChange={setSub}/>
      {sub==='channels'&&<ChannelsView proj={proj} state={state}/>}
      {sub==='influencers'&&<InfluencersView proj={proj} state={state} set={set}/>}
      {sub==='referrals'&&<ReferralsView state={state} set={set}/>}
      {sub==='campaigns'&&<CampaignsView state={state} set={set}/>}
    </div>
  );
}
 
function ChannelsView({proj,state}){
  const m=proj.monthly;
  const chans=state.channels||DEFAULT_CHANNELS;
  // agregados por canal (primeros 12 meses)
  const data=chans.map(ch=>{
    const regs=sum(m.slice(0,12).map(x=>x.regByChannel?.[ch.id]||0));
    return{...ch,regs};
  });
  const totalReg=sum(data.map(d=>d.regs))||1;
  return(
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Registros por canal (12 meses)</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0ef"/><XAxis type="number" tick={{fontSize:10}}/><YAxis type="category" dataKey="name" tick={{fontSize:11}} width={90}/><RT formatter={v=>fNum(v)}/><Bar dataKey="regs" radius={[0,3,3,0]}>{data.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar></BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-stone-200 bg-stone-50 text-stone-500"><th className="text-left p-3 font-medium">Canal</th><th className="text-left p-3 font-medium">Tipo</th><th className="text-right p-3 font-medium">Registros 12m</th><th className="text-right p-3 font-medium">% mix</th><th className="text-left p-3 font-medium">Estado sugerido</th></tr></thead>
          <tbody>
            {data.map(d=>{
              const pct=d.regs/totalReg;
              const estado=pct>0.35?{l:'Escalar',t:'ok'}:pct>0.1?{l:'Mantener',t:'info'}:pct>0.02?{l:'Optimizar',t:'warn'}:{l:'Revisar',t:'danger'};
              return(<tr key={d.id} className="border-b border-stone-100"><td className="p-3 font-medium flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{background:d.color}}/>{d.name}</td><td className="p-3 text-stone-500 capitalize">{d.type}</td><td className="p-3 text-right tabular-nums">{fNum(d.regs)}</td><td className="p-3 text-right tabular-nums">{fPct(pct,0)}</td><td className="p-3"><Badge tone={estado.t}>{estado.l}</Badge></td></tr>);
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-stone-500">El detalle por canal (CPC, clicks, conversión, CAC, payback, LTV/CAC editables) llega en V4.1. Hoy los registros se calculan desde los presupuestos del Excel y el escenario activo.</p>
    </div>
  );
}
 
// MODELO ECONÓMICO DE INFLUENCER (el corazón del brief)
function influencerEconomics(inf,planPrice=15000){
  // Por mes de actividad de comisión
  const payments=inf.expectedPayments;
  const grossPerMonth=payments*planPrice;
  const discountPerMonth=grossPerMonth*inf.userDiscount;
  const netCollectedPerMonth=grossPerMonth-discountPerMonth;
  const commBase=inf.commissionBase==='collected'?netCollectedPerMonth:grossPerMonth;
  const commissionPerMonth=commBase*inf.commissionPct;
  const feePerMonth=inf.hasFixedFee?(inf.fixedFeeMonthly?inf.fixedFee:0):0;
  // Comisión total durante ventana
  const totalGross=grossPerMonth*inf.commissionMonths;
  const totalDiscount=discountPerMonth*inf.commissionMonths;
  const totalNetCollected=netCollectedPerMonth*inf.commissionMonths;
  const totalCommission=commissionPerMonth*inf.commissionMonths;
  let totalFee=inf.hasFixedFee?(inf.fixedFeeMonthly?inf.fixedFee*inf.commissionMonths:inf.fixedFee):0;
  // Fee recuperable: se descuenta contra comisiones
  let netFee=totalFee;
  if(inf.hasFixedFee&&inf.fixedFeeRecoverable)netFee=Math.max(0,totalFee-totalCommission);
  const totalCost=totalCommission+netFee;
  const revenueNet=totalNetCollected-totalCost;
  const totalPayments=payments*inf.commissionMonths;
  const cacEff=totalPayments>0?totalCost/totalPayments:0;
  const roi=totalCost>0?revenueNet/totalCost:0;
  return{grossPerMonth,discountPerMonth,netCollectedPerMonth,commissionPerMonth,feePerMonth,totalGross,totalDiscount,totalNetCollected,totalCommission,totalFee,netFee,totalCost,revenueNet,totalPayments,cacEff,roi};
}
function influencerRecommendation(eco,cacMax){
  if(eco.cacEff>cacMax)return{l:'Renegociar',t:'danger',why:'CAC efectivo sobre el máximo tolerable'};
  if(eco.roi<0)return{l:'Pausar',t:'danger',why:'ROI negativo'};
  if(eco.roi>3)return{l:'Escalar',t:'ok',why:'ROI alto, economía sana'};
  if(eco.roi>1)return{l:'Mantener',t:'info',why:'ROI positivo razonable'};
  return{l:'Renegociar',t:'warn',why:'ROI bajo'};
}
function InfluencersView({proj,state,set}){
  const infs=state.influencers||[];
  const[expanded,setExpanded]=useState(null);
  const planPrice=15000;
  const upd=(id,patch)=>set({influencers:infs.map(i=>i.id===id?{...i,...patch}:i)});
  const add=()=>set({influencers:[...infs,{id:uid(),name:'Nuevo influencer',platform:'Instagram',niche:'',audience:0,startMonth:0,endMonth:null,code:'',product:'inversiones',hasFixedFee:false,fixedFee:0,fixedFeeMonthly:true,fixedFeeRecoverable:false,userDiscount:0.20,userDiscountMonths:3,commissionPct:0.35,commissionBase:'collected',commissionMonths:3,expectedPayments:3,active:true}]});
  const del=(id)=>set({influencers:infs.filter(i=>i.id!==id)});
  return(
    <div>
      <Card className="p-3 mb-4 bg-stone-50">
        <div className="flex items-start gap-2 text-xs text-stone-600">
          <Info size={14} className="mt-0.5 text-stone-400 shrink-0"/>
          <div><span className="font-medium text-stone-800">Modelo default:</span> sin fee fijo, 20% descuento al usuario por 3 meses, comisión 35% sobre lo <span className="font-medium">efectivamente cobrado</span> (no precio lista) durante 3 meses. Ejemplo: plan $15k − 20% = usuario paga $12k → comisión 35% × $12k = $4.200 → neto ProfitLab $7.800.</div>
        </div>
      </Card>
      <div className="flex justify-end mb-3"><button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"><Plus size={13}/>Agregar influencer</button></div>
      <div className="space-y-2">
        {infs.map(inf=>{
          const eco=influencerEconomics(inf,planPrice);
          const rec=influencerRecommendation(eco,state.thresholds.cacMax);
          const isOpen=expanded===inf.id;
          return(
            <Card key={inf.id} className="overflow-hidden">
              <div className="p-3 flex items-center gap-3 cursor-pointer hover:bg-stone-50" onClick={()=>setExpanded(isOpen?null:inf.id)}>
                <button className="text-stone-400">{isOpen?<ChevronDown size={16}/>:<ChevronRight size={16}/>}</button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium text-stone-900">{inf.name}</span><Badge>{inf.platform}</Badge>{inf.hasFixedFee&&<Badge tone="warn">fee ${fNum(inf.fixedFee)}{inf.fixedFeeRecoverable?' recup.':''}</Badge>}<Badge tone="purple">{fPct(inf.commissionPct,0)} comisión</Badge></div>
                  <div className="text-[11px] text-stone-500 mt-0.5">{inf.expectedPayments} pagos/mes · desc usuario {fPct(inf.userDiscount,0)} · base {inf.commissionBase==='collected'?'cobrado':'lista'}</div>
                </div>
                <div className="text-right hidden sm:block"><div className="text-[11px] text-stone-400">CAC efectivo</div><div className={`text-sm font-semibold tabular-nums ${eco.cacEff>state.thresholds.cacMax?'text-rose-600':'text-stone-900'}`}>{fARS(eco.cacEff)}</div></div>
                <div className="text-right hidden md:block"><div className="text-[11px] text-stone-400">ROI</div><div className={`text-sm font-semibold tabular-nums ${eco.roi<0?'text-rose-600':'text-emerald-600'}`}>{fX(eco.roi)}</div></div>
                <Badge tone={rec.t}>{rec.l}</Badge>
              </div>
              {isOpen&&(
                <div className="border-t border-stone-100 p-4 bg-stone-50/50">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div><label className="text-[11px] text-stone-500">Nombre</label><TI value={inf.name} onChange={v=>upd(inf.id,{name:v})}/></div>
                    <div><label className="text-[11px] text-stone-500">Plataforma</label><SI value={inf.platform} onChange={v=>upd(inf.id,{platform:v})} options={['Instagram','TikTok','YouTube','LinkedIn','Otro']} className="w-full"/></div>
                    <div><label className="text-[11px] text-stone-500">Código / UTM</label><TI value={inf.code} onChange={v=>upd(inf.id,{code:v})}/></div>
                    <div><label className="text-[11px] text-stone-500">Producto</label><SI value={inf.product} onChange={v=>upd(inf.id,{product:v})} options={[{v:'inversiones',l:'Inversiones'},{v:'personal',l:'Personal'},{v:'duo',l:'Dúo'}]} className="w-full"/></div>
                    <div><label className="text-[11px] text-stone-500">Mes inicio</label><NI value={inf.startMonth} onChange={v=>upd(inf.id,{startMonth:v})}/></div>
                    <div><label className="text-[11px] text-stone-500">Pagos esperados/mes</label><NI value={inf.expectedPayments} onChange={v=>upd(inf.id,{expectedPayments:v})}/></div>
                    <div><label className="text-[11px] text-stone-500">Descuento usuario</label><NI value={inf.userDiscount*100} onChange={v=>upd(inf.id,{userDiscount:v/100})} suffix="%"/></div>
                    <div><label className="text-[11px] text-stone-500">Duración desc. (m)</label><NI value={inf.userDiscountMonths} onChange={v=>upd(inf.id,{userDiscountMonths:v})}/></div>
                    <div><label className="text-[11px] text-stone-500">% Comisión</label><NI value={inf.commissionPct*100} onChange={v=>upd(inf.id,{commissionPct:v/100})} suffix="%"/></div>
                    <div><label className="text-[11px] text-stone-500">Base comisión</label><SI value={inf.commissionBase} onChange={v=>upd(inf.id,{commissionBase:v})} options={[{v:'collected',l:'Lo cobrado'},{v:'list',l:'Precio lista'}]} className="w-full"/></div>
                    <div><label className="text-[11px] text-stone-500">Meses comisión</label><NI value={inf.commissionMonths} onChange={v=>upd(inf.id,{commissionMonths:v})}/></div>
                    <div className="flex items-end gap-2"><div className="flex-1"><label className="text-[11px] text-stone-500">Fee fijo</label><Toggle value={inf.hasFixedFee} onChange={v=>upd(inf.id,{hasFixedFee:v})}/></div></div>
                    {inf.hasFixedFee&&<><div><label className="text-[11px] text-stone-500">Monto fee/mes</label><NI value={inf.fixedFee} onChange={v=>upd(inf.id,{fixedFee:v})}/></div><div className="flex items-end"><div><label className="text-[11px] text-stone-500">Recuperable</label><Toggle value={inf.fixedFeeRecoverable} onChange={v=>upd(inf.id,{fixedFeeRecoverable:v})}/></div></div></>}
                  </div>
                  {/* Desglose económico */}
                  <div className="bg-white rounded-lg border border-stone-200 p-3 mb-3">
                    <div className="text-xs font-medium text-stone-700 mb-2">Economía (ventana de {inf.commissionMonths} meses · {inf.expectedPayments} pagos/mes · plan ref. ${fNum(planPrice)})</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><div className="text-stone-400">Facturación bruta</div><div className="font-medium tabular-nums">{fARS(eco.totalGross,true)}</div></div>
                      <div><div className="text-stone-400">Descuento otorgado</div><div className="font-medium tabular-nums text-amber-600">−{fARS(eco.totalDiscount,true)}</div></div>
                      <div><div className="text-stone-400">Neto cobrado</div><div className="font-medium tabular-nums">{fARS(eco.totalNetCollected,true)}</div></div>
                      <div><div className="text-stone-400">Comisión influencer</div><div className="font-medium tabular-nums text-rose-600">−{fARS(eco.totalCommission,true)}</div></div>
                      <div><div className="text-stone-400">Fee fijo {inf.fixedFeeRecoverable?'(recup.)':''}</div><div className="font-medium tabular-nums text-rose-600">−{fARS(eco.netFee,true)}</div></div>
                      <div><div className="text-stone-400">Revenue neto ProfitLab</div><div className="font-medium tabular-nums text-emerald-600">{fARS(eco.revenueNet,true)}</div></div>
                      <div><div className="text-stone-400">CAC efectivo</div><div className="font-medium tabular-nums">{fARS(eco.cacEff)}</div></div>
                      <div><div className="text-stone-400">ROI</div><div className={`font-medium tabular-nums ${eco.roi<0?'text-rose-600':'text-emerald-600'}`}>{fX(eco.roi)}</div></div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-2 text-xs"><Lightbulb size={13} className="text-amber-500"/><span className="text-stone-600">Recomendación: <span className="font-medium">{rec.l}</span> — {rec.why}</span></div>
                  </div>
                  {/* Comparador de alternativas */}
                  <InfluencerComparator inf={inf} planPrice={planPrice} cacMax={state.thresholds.cacMax}/>
                  <div className="flex justify-end mt-3"><ConfirmBtn onConfirm={()=>del(inf.id)} label="Eliminar" icon={Trash2} confirmText="¿Eliminar?" danger/></div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function InfluencerComparator({inf,planPrice,cacMax}){
  const alts=[
    {name:'Performance-only (sin fee)',mod:{hasFixedFee:false,commissionPct:0.35,commissionBase:'collected'}},
    {name:'Comisión alta sin fee',mod:{hasFixedFee:false,commissionPct:0.45,commissionBase:'collected'}},
    {name:'Fee recuperable vs comisiones',mod:{hasFixedFee:true,fixedFee:25000,fixedFeeRecoverable:true,fixedFeeMonthly:true,commissionPct:0.30}},
    {name:'Fee fijo tradicional',mod:{hasFixedFee:true,fixedFee:40000,fixedFeeRecoverable:false,fixedFeeMonthly:true,commissionPct:0.20}},
  ];
  return(
    <div className="bg-white rounded-lg border border-stone-200 p-3">
      <div className="text-xs font-medium text-stone-700 mb-2 flex items-center gap-1.5"><GitCompare size={13}/>Comparador de alternativas de acuerdo</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-stone-100 text-stone-400"><th className="text-left p-1.5 font-medium">Alternativa</th><th className="text-right p-1.5 font-medium">Costo total</th><th className="text-right p-1.5 font-medium">Revenue neto</th><th className="text-right p-1.5 font-medium">CAC efectivo</th><th className="text-right p-1.5 font-medium">ROI</th><th className="text-left p-1.5 font-medium">Veredicto</th></tr></thead>
          <tbody>
            {alts.map(alt=>{
              const eco=influencerEconomics({...inf,...alt.mod},planPrice);
              const rec=influencerRecommendation(eco,cacMax);
              return(<tr key={alt.name} className="border-b border-stone-50"><td className="p-1.5 text-stone-700">{alt.name}</td><td className="p-1.5 text-right tabular-nums">{fARS(eco.totalCost,true)}</td><td className="p-1.5 text-right tabular-nums text-emerald-600">{fARS(eco.revenueNet,true)}</td><td className="p-1.5 text-right tabular-nums">{fARS(eco.cacEff)}</td><td className={`p-1.5 text-right tabular-nums ${eco.roi<0?'text-rose-600':'text-emerald-600'}`}>{fX(eco.roi)}</td><td className="p-1.5"><Badge tone={rec.t}>{rec.l}</Badge></td></tr>);
            })}
            <tr className="border-b border-stone-50 bg-stone-50"><td className="p-1.5 text-stone-700 font-medium">No trabajar con este influencer</td><td className="p-1.5 text-right tabular-nums">$0</td><td className="p-1.5 text-right tabular-nums">$0</td><td className="p-1.5 text-right">—</td><td className="p-1.5 text-right">—</td><td className="p-1.5"><Badge>Baseline</Badge></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
 
function ReferralsView({state,set}){
  const r=state.referral||{enabled:false,referrerBenefit:'1 mes free',referrerBenefitType:'free_month',referredBenefit:'20% off primer mes',durationMonths:1,costPerReferral:15000};
  const upd=(patch)=>set({referral:{...r,...patch}});
  return(
    <Card className="p-5 max-w-2xl">
      <div className="flex items-center justify-between mb-4"><div className="text-sm font-medium text-stone-900">Programa de referidos</div><Toggle value={r.enabled} onChange={v=>upd({enabled:v})} labels={['Inactivo','Activo']}/></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="text-xs text-stone-500">Beneficio para quien refiere</label><TI value={r.referrerBenefit} onChange={v=>upd({referrerBenefit:v})}/></div>
        <div><label className="text-xs text-stone-500">Beneficio para el referido</label><TI value={r.referredBenefit} onChange={v=>upd({referredBenefit:v})}/></div>
        <div><label className="text-xs text-stone-500">Duración beneficio (meses)</label><NI value={r.durationMonths} onChange={v=>upd({durationMonths:v})}/></div>
        <div><label className="text-xs text-stone-500">Costo estimado por referido</label><NI value={r.costPerReferral} onChange={v=>upd({costPerReferral:v})} suffix="$"/></div>
      </div>
      <p className="text-xs text-stone-500 mt-4">En el escenario activo, los referidos representan <span className="font-medium">{fPct(scenVars(state.scenario).refPct,0)}</span> de los pagos nuevos. El tracking real (pagos generados, CAC referido, churn) se carga en Forecast & Actuals cuando el programa esté vivo (roadmap M07).</p>
    </Card>
  );
}
 
function CampaignsView({state,set}){
  const camps=state.campaigns||[];
  const upd=(id,patch)=>set({campaigns:camps.map(c=>c.id===id?{...c,...patch}:c)});
  const add=()=>set({campaigns:[...camps,{id:uid(),name:'Nueva campaña',startMonth:0,endMonth:0,discount:0.2,product:'inversiones',budget:0,expectedPayments:0,conclusion:''}]});
  const del=(id)=>set({campaigns:camps.filter(c=>c.id!==id)});
  return(
    <div>
      <div className="flex justify-end mb-3"><button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"><Plus size={13}/>Agregar campaña</button></div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-stone-200 bg-stone-50 text-stone-500"><th className="text-left p-2.5 font-medium">Campaña</th><th className="text-right p-2.5 font-medium w-20">Mes ini</th><th className="text-right p-2.5 font-medium w-20">Mes fin</th><th className="text-right p-2.5 font-medium w-24">Descuento</th><th className="text-left p-2.5 font-medium w-32">Producto</th><th className="text-right p-2.5 font-medium w-28">Pagos esp.</th><th className="p-2.5 w-10"></th></tr></thead>
          <tbody>
            {camps.length===0&&<tr><td colSpan={7} className="p-6 text-center text-stone-400">Sin campañas. El roadmap sugiere: Founders, Black Friday, Aguinaldo, Año Nuevo/Anual, Referidos, Cross-sell Dúo, Reactivación.</td></tr>}
            {camps.map(c=>(
              <tr key={c.id} className="border-b border-stone-100">
                <td className="p-2"><TI value={c.name} onChange={v=>upd(c.id,{name:v})}/></td>
                <td className="p-2"><NI value={c.startMonth} onChange={v=>upd(c.id,{startMonth:v})}/></td>
                <td className="p-2"><NI value={c.endMonth} onChange={v=>upd(c.id,{endMonth:v})}/></td>
                <td className="p-2"><NI value={c.discount*100} onChange={v=>upd(c.id,{discount:v/100})} suffix="%"/></td>
                <td className="p-2"><SI value={c.product} onChange={v=>upd(c.id,{product:v})} options={[{v:'inversiones',l:'Inversiones'},{v:'personal',l:'Personal'},{v:'duo',l:'Dúo'},{v:'all',l:'Todos'}]} className="w-full"/></td>
                <td className="p-2"><NI value={c.expectedPayments} onChange={v=>upd(c.id,{expectedPayments:v})}/></td>
                <td className="p-2 text-center"><button onClick={()=>del(c.id)} className="text-stone-300 hover:text-rose-500"><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-stone-500 mt-3">El impacto de campañas en el forecast y el tracking de ROI real llegan en V4.1. Por ahora sirve como registro y planificación del calendario promocional.</p>
    </div>
  );
}
 
// ============ REVENUE & PLANS ============
function RevenueTab({proj,state,set}){
  const[sub,setSub]=useState('plans');
  const tabs=[{id:'plans',label:'Planes & Pricing',icon:ListChecks},{id:'mrr',label:'MRR & Caja',icon:DollarSign},{id:'breakdown',label:'Desglose facturación',icon:Receipt}];
  return(
    <div>
      <SectionTitle icon={DollarSign} title="Revenue & Plans" desc="Planes, pricing, MRR, caja y devengado. Los trimestrales/anuales generan caja en el mes de cobro pero devengan mensualmente."/>
      <SubTabs tabs={tabs} active={sub} onChange={setSub}/>
      {sub==='plans'&&<PlansView state={state} set={set} proj={proj}/>}
      {sub==='mrr'&&<MrrCashView proj={proj} state={state}/>}
      {sub==='breakdown'&&<BillingBreakdown proj={proj} state={state}/>}
    </div>
  );
}
function PlansView({state,set,proj}){
  const plans=state.plans||[];
  const upd=(id,patch)=>set({plans:plans.map(p=>p.id===id?{...p,...patch}:p)});
  const last=proj.monthly[proj.monthly.length-1]||{};
  const PROD_LABEL={inversiones:'Inversiones',personal:'Personal',duo:'Dúo'};
  return(
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-xs">
        <thead><tr className="border-b border-stone-200 bg-stone-50 text-stone-500"><th className="text-left p-2.5 font-medium">Plan</th><th className="text-left p-2.5 font-medium">Producto</th><th className="text-right p-2.5 font-medium w-28">Precio</th><th className="text-right p-2.5 font-medium w-20">Dur. (m)</th><th className="text-right p-2.5 font-medium w-24">MRR equiv.</th><th className="text-right p-2.5 font-medium w-20">Lanz. (M)</th><th className="text-right p-2.5 font-medium w-24">Activos</th><th className="text-center p-2.5 font-medium w-20">Activo</th></tr></thead>
        <tbody>
          {plans.map(p=>(
            <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="p-2.5 font-medium text-stone-800">{p.name}</td>
              <td className="p-2.5"><Badge tone={p.product==='inversiones'?'info':p.product==='duo'?'purple':'default'}>{PROD_LABEL[p.product]}</Badge></td>
              <td className="p-2"><NI value={p.price} onChange={v=>upd(p.id,{price:v})}/></td>
              <td className="p-2.5 text-right tabular-nums text-stone-500">{p.duration}</td>
              <td className="p-2.5 text-right tabular-nums">{fARS(p.price/p.duration,true)}</td>
              <td className="p-2"><NI value={p.launchMonth} onChange={v=>upd(p.id,{launchMonth:v})}/></td>
              <td className="p-2.5 text-right tabular-nums font-medium">{fNum(last.activeByPlan?.[p.id])}</td>
              <td className="p-2.5 text-center"><Toggle value={p.active} onChange={v=>upd(p.id,{active:v})}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
function MrrCashView({proj,state}){
  const data=proj.monthly.map(m=>({name:m.label,MRR:Math.round(m.mrr),Caja:Math.round(m.cashCollected),Devengado:Math.round(m.mrr)}));
  return(
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3">MRR vs Caja cobrada</div>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0ef"/><XAxis dataKey="name" tick={{fontSize:10}} interval="preserveStartEnd"/><YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`}/><RT formatter={v=>fARS(v,true)}/><Legend/><Bar dataKey="Caja" fill="#cbd5e1" radius={[3,3,0,0]} maxBarSize={26}/><Line dataKey="MRR" stroke="#0f172a" strokeWidth={2} dot={false}/></ComposedChart>
        </ResponsiveContainer>
        <p className="text-xs text-stone-500 mt-2">La caja cobrada salta en los meses de cobro de planes trimestrales/anuales. El MRR (devengado) es más suave porque reconoce el ingreso mes a mes.</p>
      </Card>
    </div>
  );
}
function BillingBreakdown({proj,state}){
  const m=proj.monthly;
  const rows=[
    {label:'Facturación bruta (precio lista)',k:'grossBillings',sign:1},
    {label:'(−) Descuentos otorgados',k:'discounts',sign:-1,tone:'amber'},
    {label:'Comisión Mercado Pago',k:'mpFee',sign:-1,tone:'rose'},
    {label:'Comisión influencers',k:'influencerComm',sign:-1,tone:'rose'},
    {label:'Caja real cobrada',k:'cashCollected',sign:1,bold:true},
    {label:'MRR (devengado)',k:'mrr',sign:1,bold:true},
  ];
  return(
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="text-left p-2.5 font-medium text-stone-500 sticky left-0 bg-stone-50 min-w-[200px]">Concepto</th>{m.map(x=>(<th key={x.t} className="text-right p-2.5 font-medium text-stone-500 whitespace-nowrap">{x.label}</th>))}</tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.k} className="border-b border-stone-100">
                <td className={`p-2.5 sticky left-0 bg-white ${r.bold?'font-medium text-stone-900':'text-stone-600'}`}>{r.label}</td>
                {m.map(x=>(<td key={x.t} className={`text-right p-2.5 tabular-nums ${r.tone==='amber'?'text-amber-600':r.tone==='rose'?'text-rose-600':''} ${r.bold?'font-medium':''}`}>{fARS(x[r.k],true)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
 
// ============ COSTOS & CAJA ============
function CostsTab({proj,state,set}){
  const[sub,setSub]=useState('costs');
  const tabs=[{id:'costs',label:'Costos',icon:Wallet},{id:'cash',label:'Cash flow',icon:Banknote},{id:'pnl',label:'P&L',icon:BarChart3}];
  return(
    <div>
      <SectionTitle icon={Wallet} title="Costos & Caja" desc="Costos fijos y variables, flujo de caja, P&L y break-even. La caja se separa del devengado."/>
      <SubTabs tabs={tabs} active={sub} onChange={setSub}/>
      {sub==='costs'&&<CostsView state={state} set={set}/>}
      {sub==='cash'&&<CashflowView proj={proj} state={state}/>}
      {sub==='pnl'&&<PnLView proj={proj} state={state}/>}
    </div>
  );
}
function CostsView({state,set}){
  const costs=state.costs||[];
  const upd=(id,patch)=>set({costs:costs.map(c=>c.id===id?{...c,...patch}:c)});
  const add=()=>set({costs:[...costs,{id:uid(),name:'Nuevo costo',category:'Otros',startMonth:0,endMonth:null,amount:0,type:'fixed',inflationAdj:true}]});
  const del=(id)=>set({costs:costs.filter(c=>c.id!==id)});
  const mpFees=state.mpFees||{variablePct:6.29};
  return(
    <div>
      <Card className="p-4 mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2"><span className="text-xs text-stone-500">Comisión Mercado Pago:</span><div className="w-24"><NI value={mpFees.variablePct} onChange={v=>set({mpFees:{...mpFees,variablePct:v}})} suffix="%" step={0.01}/></div></div>
        <div className="flex items-center gap-2"><span className="text-xs text-stone-500">Inflación mensual:</span><div className="w-24"><NI value={state.inflation*100} onChange={v=>set({inflation:v/100})} suffix="%" step={0.1}/></div></div>
        <div className="flex items-center gap-2"><span className="text-xs text-stone-500">TC ARS/USD:</span><div className="w-24"><NI value={state.fx} onChange={v=>set({fx:v})}/></div></div>
      </Card>
      <div className="flex justify-end mb-3"><button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"><Plus size={13}/>Agregar costo</button></div>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-stone-200 bg-stone-50 text-stone-500"><th className="text-left p-2.5 font-medium">Concepto</th><th className="text-left p-2.5 font-medium w-28">Categoría</th><th className="text-right p-2.5 font-medium w-28">Monto base</th><th className="text-right p-2.5 font-medium w-20">Mes ini</th><th className="text-right p-2.5 font-medium w-20">Mes fin</th><th className="text-left p-2.5 font-medium w-24">Tipo</th><th className="text-center p-2.5 font-medium w-16">Inflación</th><th className="p-2.5 w-10"></th></tr></thead>
          <tbody>
            {costs.map(c=>(
              <tr key={c.id} className="border-b border-stone-100">
                <td className="p-2"><TI value={c.name} onChange={v=>upd(c.id,{name:v})}/></td>
                <td className="p-2"><SI value={c.category} onChange={v=>upd(c.id,{category:v})} options={['Sueldos','Infra','Tools','Legal','IA','Marketing','Otros']} className="w-full"/></td>
                <td className="p-2"><NI value={c.amount} onChange={v=>upd(c.id,{amount:v})}/></td>
                <td className="p-2"><NI value={c.startMonth} onChange={v=>upd(c.id,{startMonth:v})}/></td>
                <td className="p-2"><NI value={c.endMonth} onChange={v=>upd(c.id,{endMonth:v===0?null:v})} placeholder="∞"/></td>
                <td className="p-2"><SI value={c.type} onChange={v=>upd(c.id,{type:v})} options={[{v:'fixed',l:'Fijo'},{v:'oneshot',l:'One-shot'}]} className="w-full"/></td>
                <td className="p-2 text-center"><Toggle value={c.inflationAdj} onChange={v=>upd(c.id,{inflationAdj:v})}/></td>
                <td className="p-2 text-center"><button onClick={()=>del(c.id)} className="text-stone-300 hover:text-rose-500"><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
function CashflowView({proj,state}){
  const data=proj.monthly.map(m=>({name:m.label,Flujo:Math.round(m.cashFlow),Acumulada:Math.round(m.cumCash)}));
  const worst=proj.summary.worstCash;
  return(
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Peor mes de caja" value={fARS(worst,true)} tone="danger" icon={TrendingDown}/>
        <KPI label="Capital necesario" value={fARS(proj.summary.capitalNeeded,true)} tone="warn" icon={PiggyBank}/>
        <KPI label="Caja final horizonte" value={fARS(proj.summary.cumCashEnd,true)} tone={proj.summary.cumCashEnd<0?'danger':'ok'} icon={Wallet}/>
        <KPI label="Break-even acum." value={proj.beCumMonth!=null?mLabel(state.sy,state.sm,proj.beCumMonth):'No en horizonte'} icon={Target} tone={proj.beCumMonth!=null?'ok':'danger'}/>
      </div>
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Flujo de caja mensual y acumulado</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0ef"/><XAxis dataKey="name" tick={{fontSize:10}} interval="preserveStartEnd"/><YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`}/><RT formatter={v=>fARS(v,true)}/><Legend/><ReferenceLine y={0} stroke="#94a3b8"/><Bar dataKey="Flujo" radius={[3,3,0,0]} maxBarSize={26}>{data.map((d,i)=><Cell key={i} fill={d.Flujo>=0?'#10b981':'#f43f5e'}/>)}</Bar><Line dataKey="Acumulada" stroke="#0f172a" strokeWidth={2} dot={false}/></ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
function PnLView({proj,state}){
  const m=proj.monthly;
  const rows=[
    {label:'Revenue devengado (MRR)',k:'mrr',bold:true},
    {label:'(−) COGS / costos variables',k:'cogs',neg:true},
    {label:'Gross profit',k:'grossProfit',bold:true},
    {label:'(−) Costos fijos',k:'fixedCosts',neg:true},
    {label:'(−) Marketing',k:'marketing',neg:true},
    {label:'EBITDA',k:'opResult',bold:true},
  ];
  return(
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-200 bg-stone-50"><th className="text-left p-2.5 font-medium text-stone-500 sticky left-0 bg-stone-50 min-w-[200px]">P&L</th>{m.map(x=>(<th key={x.t} className="text-right p-2.5 font-medium text-stone-500 whitespace-nowrap">{x.label}</th>))}</tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.k} className="border-b border-stone-100">
                  <td className={`p-2.5 sticky left-0 bg-white ${r.bold?'font-medium text-stone-900':'text-stone-600'}`}>{r.label}</td>
                  {m.map(x=>(<td key={x.t} className={`text-right p-2.5 tabular-nums ${r.neg?'text-rose-600':''} ${r.bold&&x[r.k]<0?'text-rose-600 font-medium':r.bold?'font-medium':''}`}>{fARS(x[r.k],true)}</td>))}
                </tr>
              ))}
              <tr className="border-b border-stone-100"><td className="p-2.5 sticky left-0 bg-white text-stone-600">Gross margin %</td>{m.map(x=>(<td key={x.t} className="text-right p-2.5 tabular-nums text-stone-500">{fPct(x.grossMargin,0)}</td>))}</tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
 
// ============ SOCIOS & FRANCO ============
// Lógica de distribución: Luis no participa de pérdidas/caja previas.
// Recupero Franco: 4 reglas configurables.
function computeDistribution(proj,state){
  const m=proj.monthly;
  const partners=state.partners||[];
  const francoExp=(state.francoExpenses||[]).filter(e=>e.reimbursable);
  const francoTotal=sum(francoExp.map(e=>e.amount));
  const rule=state.francoRecoveryRule||'before_distribution';
  const pct=(state.francoRecoveryPercent||50)/100;
  let francoRecovered=0;
  let francoRecoveryByMonth=[];
  let cumNet=0;
  const dist=m.map(mo=>{
    const monthNet=mo.opResult;
    cumNet+=monthNet;
    let recoveredThis=0;
    const positiveFlow=Math.max(0,monthNet);
    if(francoRecovered<francoTotal&&positiveFlow>0){
      if(rule==='before_distribution'){recoveredThis=Math.min(positiveFlow,francoTotal-francoRecovered);}
      else if(rule==='percent_of_positive'){recoveredThis=Math.min(positiveFlow*pct,francoTotal-francoRecovered);}
      else if(rule==='after_be'){if(proj.beCumMonth!=null&&mo.t>=proj.beCumMonth)recoveredThis=Math.min(positiveFlow,francoTotal-francoRecovered);}
      // tracking_only: no auto recovery
    }
    francoRecovered+=recoveredThis;
    francoRecoveryByMonth.push({t:mo.t,label:mo.label,recovered:recoveredThis,cumRecovered:francoRecovered});
    // distribuible: resultado positivo del mes menos recupero Franco
    const distributable=Math.max(0,monthNet-recoveredThis);
    const byPartner={};
    partners.forEach(p=>{
      // socio activo este mes?
      const active=mo.t>=(p.activeFromMonth||0);
      // si no participa de pérdidas previas, solo recibe sobre ganancias del mes (no compensar negativos previos)
      let share=0;
      if(active&&distributable>0){
        if(p.participatesPastLosses){share=cumNet>0?Math.min(distributable,Math.max(0,cumNet))*p.sharePct:0;}
        else{share=distributable*p.sharePct;}
      }
      byPartner[p.id]=share;
    });
    return{t:mo.t,label:mo.label,monthNet,cumNet,recoveredThis,distributable,byPartner};
  });
  const recoveryMonth=francoRecoveryByMonth.find(r=>r.cumRecovered>=francoTotal&&francoTotal>0);
  return{dist,francoTotal,francoRecoveredTotal:francoRecovered,francoPending:francoTotal-francoRecovered,recoveryMonth:recoveryMonth?recoveryMonth.label:null,francoRecoveryByMonth};
}
function PartnersTab({proj,state,set,francoExpenses,saveFrancoExpense,delFrancoExpense}){
  const[sub,setSub]=useState('franco');
  const tabs=[{id:'partners',label:'Socios',icon:Users},{id:'franco',label:'Cuenta Franco',icon:Receipt},{id:'distribution',label:'Distribución',icon:HandCoins}];
  return(
    <div>
      <SectionTitle icon={HandCoins} title="Socios & Franco" desc="Participación, activación condicional, distribución de ganancias y recupero de aportes personales de Franco."/>
      <SubTabs tabs={tabs} active={sub} onChange={setSub}/>
      {sub==='partners'&&<PartnersConfig state={state} set={set}/>}
      {sub==='franco'&&<FrancoPanel state={state} set={set} proj={proj} francoExpenses={francoExpenses} saveFrancoExpense={saveFrancoExpense} delFrancoExpense={delFrancoExpense}/>}
      {sub==='distribution'&&<DistributionView proj={proj} state={state}/>}
    </div>
  );
}
function PartnersConfig({state,set}){
  const partners=state.partners||[];
  const upd=(id,patch)=>set({partners:partners.map(p=>p.id===id?{...p,...patch}:p)});
  const add=()=>set({partners:[...partners,{id:uid(),name:'Nuevo socio',sharePct:0,type:'collaborator',joinMonth:0,activeFromMonth:0,participatesPastLosses:false,participatesPastCash:false,notes:''}]});
  const del=(id)=>set({partners:partners.filter(p=>p.id!==id)});
  const totalShare=sum(partners.map(p=>p.sharePct));
  return(
    <div>
      {Math.abs(totalShare-1)>0.001&&<Card tone="warn" className="p-3 mb-4 text-xs text-amber-800 flex items-center gap-2"><AlertTriangle size={14}/>La suma de participaciones es {fPct(totalShare,0)}, debería ser 100%.</Card>}
      <div className="space-y-3">
        {partners.map(p=>(
          <Card key={p.id} className="p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div><label className="text-[11px] text-stone-500">Nombre</label><TI value={p.name} onChange={v=>upd(p.id,{name:v})}/></div>
              <div><label className="text-[11px] text-stone-500">Participación</label><NI value={p.sharePct*100} onChange={v=>upd(p.id,{sharePct:v/100})} suffix="%"/></div>
              <div><label className="text-[11px] text-stone-500">Tipo</label><SI value={p.type} onChange={v=>upd(p.id,{type:v})} options={[{v:'founder',l:'Founder'},{v:'sweat_equity',l:'Sweat equity'},{v:'advisor',l:'Advisor'},{v:'collaborator',l:'Colaborador'},{v:'investor',l:'Inversor'}]} className="w-full"/></div>
              <div><label className="text-[11px] text-stone-500">Activo desde (mes)</label><NI value={p.activeFromMonth} onChange={v=>upd(p.id,{activeFromMonth:v})}/></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2"><Toggle value={p.participatesPastLosses} onChange={v=>upd(p.id,{participatesPastLosses:v})}/><span className="text-xs text-stone-600">Participa de pérdidas anteriores</span></div>
              <div className="flex items-center gap-2"><Toggle value={p.participatesPastCash} onChange={v=>upd(p.id,{participatesPastCash:v})}/><span className="text-xs text-stone-600">Participa de caja acumulada previa</span></div>
            </div>
            <div className="mt-3"><label className="text-[11px] text-stone-500">Notas del acuerdo</label><TA value={p.notes} onChange={v=>upd(p.id,{notes:v})}/></div>
            <div className="flex justify-end mt-2"><ConfirmBtn onConfirm={()=>del(p.id)} label="Eliminar socio" icon={Trash2} confirmText="¿Eliminar?" danger/></div>
          </Card>
        ))}
      </div>
      <button onClick={add} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50"><Plus size={13}/>Agregar socio</button>
      <Card tone="accent" className="p-3 mt-4 text-xs text-stone-600 flex items-start gap-2"><Info size={14} className="mt-0.5 shrink-0"/><div>Ejemplo Luis: 10% participación, "participa de pérdidas anteriores" = No. Así recibe su 10% solo sobre ganancias futuras y no se le descuenta su parte de los meses negativos previos al break-even.</div></Card>
    </div>
  );
}
function FrancoPanel({state,set,proj,francoExpenses,saveFrancoExpense,delFrancoExpense}){
  const exps=francoExpenses||[];
  const[form,setForm]=useState({expense_date:new Date().toISOString().slice(0,10),category:'Infra',amount:0,description:'',reimbursable:true,covered_by:'company',priority:5});
  const dist=useMemo(()=>computeDistribution(proj,{...state,francoExpenses:exps}),[proj,state,exps]);
  const rule=state.francoRecoveryRule||'before_distribution';
  const RULE_OPTS=[
    {v:'before_distribution',l:'A) Recuperar antes de distribuir ganancias'},
    {v:'percent_of_positive',l:'B) Recuperar un % del flujo positivo mensual'},
    {v:'after_be',l:'C) Recuperar después de break-even'},
    {v:'tracking_only',l:'D) No recuperar automáticamente (solo tracking)'},
  ];
  return(
    <div>
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total aportado" value={fARS(dist.francoTotal,true)} icon={HandCoins}/>
        <KPI label="Recuperado" value={fARS(dist.francoRecoveredTotal,true)} tone="ok" icon={CheckCircle2}/>
        <KPI label="Pendiente" value={fARS(dist.francoPending,true)} tone={dist.francoPending>0?'warn':'ok'} icon={Clock}/>
        <KPI label="Recupero completo" value={dist.recoveryMonth||(rule==='tracking_only'?'Solo tracking':'No en horizonte')} icon={Calendar}/>
      </div>
      <Card className="p-4 mb-4">
        <div className="text-sm font-medium text-stone-900 mb-2">Regla de recupero</div>
        <SI value={rule} onChange={v=>set({francoRecoveryRule:v})} options={RULE_OPTS} className="w-full sm:w-auto"/>
        {rule==='percent_of_positive'&&<div className="mt-2 flex items-center gap-2"><span className="text-xs text-stone-500">% del flujo positivo:</span><div className="w-24"><NI value={state.francoRecoveryPercent||50} onChange={v=>set({francoRecoveryPercent:v})} suffix="%"/></div></div>}
        <p className="text-xs text-stone-500 mt-2">{rule==='before_distribution'?'Cada mes positivo, primero se recuperan los gastos de Franco; el resto se distribuye entre socios.':rule==='percent_of_positive'?'Se recupera el % indicado del flujo positivo de cada mes hasta saldar; el resto se distribuye.':rule==='after_be'?'El recupero arranca recién después del break-even acumulado.':'No se recupera automáticamente. Solo se registra el saldo pendiente.'}</p>
      </Card>
      {/* Form alta gasto */}
      <Card className="p-4 mb-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Registrar gasto personal</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div><label className="text-[11px] text-stone-500">Fecha</label><input type="date" value={form.expense_date} onChange={e=>setForm({...form,expense_date:e.target.value})} className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg"/></div>
          <div><label className="text-[11px] text-stone-500">Categoría</label><SI value={form.category} onChange={v=>setForm({...form,category:v})} options={['Infra','Tools','Legal','Marketing','Equipo','Otros']} className="w-full"/></div>
          <div><label className="text-[11px] text-stone-500">Monto</label><NI value={form.amount} onChange={v=>setForm({...form,amount:v})}/></div>
          <div className="lg:col-span-2"><label className="text-[11px] text-stone-500">Descripción</label><TI value={form.description} onChange={v=>setForm({...form,description:v})}/></div>
          <div className="flex items-end"><button onClick={()=>{if(form.amount>0){saveFrancoExpense({...form,id:uid()});setForm({...form,amount:0,description:''});}}} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"><Plus size={13}/>Agregar</button></div>
        </div>
      </Card>
      {/* Lista gastos */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-stone-200 bg-stone-50 text-stone-500"><th className="text-left p-2.5 font-medium">Fecha</th><th className="text-left p-2.5 font-medium">Categoría</th><th className="text-left p-2.5 font-medium">Descripción</th><th className="text-right p-2.5 font-medium">Monto</th><th className="text-center p-2.5 font-medium">Reembolsable</th><th className="text-right p-2.5 font-medium">Recuperado</th><th className="p-2.5 w-10"></th></tr></thead>
          <tbody>
            {exps.length===0&&<tr><td colSpan={7} className="p-6 text-center text-stone-400">Sin gastos registrados. Agregá tus aportes personales arriba.</td></tr>}
            {exps.map(e=>(
              <tr key={e.id} className="border-b border-stone-100">
                <td className="p-2.5 text-stone-600">{e.expense_date}</td>
                <td className="p-2.5"><Badge>{e.category}</Badge></td>
                <td className="p-2.5 text-stone-700">{e.description||'—'}</td>
                <td className="p-2.5 text-right tabular-nums font-medium">{fARS(e.amount,true)}</td>
                <td className="p-2.5 text-center">{e.reimbursable?<Check size={14} className="inline text-emerald-600"/>:<X size={14} className="inline text-stone-300"/>}</td>
                <td className="p-2.5 text-right tabular-nums text-emerald-600">{fARS(e.recovered||0,true)}</td>
                <td className="p-2.5 text-center"><button onClick={()=>delFrancoExpense(e.id)} className="text-stone-300 hover:text-rose-500"><Trash2 size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
function DistributionView({proj,state}){
  const dist=useMemo(()=>computeDistribution(proj,state),[proj,state]);
  const partners=state.partners||[];
  const m=dist.dist;
  const last=m[m.length-1]||{};
  const totalByPartner={};partners.forEach(p=>{totalByPartner[p.id]=sum(m.map(x=>x.byPartner[p.id]||0));});
  return(
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <KPI label="Resultado neto acumulado" value={fARS(last.cumNet,true)} tone={last.cumNet<0?'danger':'ok'} icon={BarChart3}/>
        <KPI label="Recuperado por Franco" value={fARS(dist.francoRecoveredTotal,true)} tone="ok" icon={Receipt}/>
        <KPI label="Total distribuido a socios" value={fARS(sum(Object.values(totalByPartner)),true)} icon={HandCoins}/>
      </div>
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Distribución acumulada por socio</div>
        {sum(Object.values(totalByPartner))>0?(
          <div className="space-y-2">
            {partners.map(p=>(<div key={p.id} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2">{p.name}<Badge tone={p.type==='founder'?'info':'purple'}>{fPct(p.sharePct,0)}</Badge>{!p.participatesPastLosses&&<Badge tone="warn">solo ganancias futuras</Badge>}</span><span className="tabular-nums font-medium">{fARS(totalByPartner[p.id],true)}</span></div>))}
          </div>
        ):<div className="text-sm text-stone-400 py-4">Todavía no hay resultado distribuible (resultado neto acumulado negativo). Los socios que no participan de pérdidas previas empezarán a recibir su parte recién cuando haya ganancias del mes.</div>}
      </Card>
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-stone-200 bg-stone-50 text-stone-500"><th className="text-left p-2.5 font-medium sticky left-0 bg-stone-50">Mes</th><th className="text-right p-2.5 font-medium">Resultado mes</th><th className="text-right p-2.5 font-medium">Recupero Franco</th><th className="text-right p-2.5 font-medium">Distribuible</th>{partners.map(p=>(<th key={p.id} className="text-right p-2.5 font-medium">{p.name}</th>))}</tr></thead>
            <tbody>
              {m.filter(x=>x.t%2===0||x.distributable>0).map(x=>(
                <tr key={x.t} className="border-b border-stone-100">
                  <td className="p-2.5 sticky left-0 bg-white text-stone-600">{x.label}</td>
                  <td className={`p-2.5 text-right tabular-nums ${x.monthNet<0?'text-rose-600':'text-emerald-600'}`}>{fARS(x.monthNet,true)}</td>
                  <td className="p-2.5 text-right tabular-nums text-blue-600">{x.recoveredThis>0?fARS(x.recoveredThis,true):'—'}</td>
                  <td className="p-2.5 text-right tabular-nums">{fARS(x.distributable,true)}</td>
                  {partners.map(p=>(<td key={p.id} className="p-2.5 text-right tabular-nums">{x.byPartner[p.id]>0?fARS(x.byPartner[p.id],true):'—'}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
 
// ============ ROADMAP & DECISIONES ============
function RoadmapTab({proj,state,set,actuals,decisions,saveDecision,delDecision}){
  const[sub,setSub]=useState('roadmap');
  const tabs=[{id:'roadmap',label:'Roadmap',icon:Flag},{id:'recs',label:'Acciones recomendadas',icon:Lightbulb},{id:'decisions',label:'Decision Log',icon:ClipboardList}];
  return(
    <div>
      <SectionTitle icon={Flag} title="Roadmap & Decisiones" desc="Hitos del año conectados con su impacto, motor de acciones según datos reales, y registro de decisiones para revisión futura."/>
      <SubTabs tabs={tabs} active={sub} onChange={setSub}/>
      {sub==='roadmap'&&<RoadmapView proj={proj} state={state} set={set}/>}
      {sub==='recs'&&<RecommendationsView proj={proj} state={state} actuals={actuals}/>}
      {sub==='decisions'&&<DecisionLog decisions={decisions} saveDecision={saveDecision} delDecision={delDecision}/>}
    </div>
  );
}
function RoadmapView({proj,state,set}){
  const milestones=state.milestones||[];
  const m=proj.monthly;
  const upd=(id,patch)=>set({milestones:milestones.map(x=>x.id===id?{...x,...patch}:x)});
  const STATUS={planned:{l:'Planeado',t:'default'},in_progress:{l:'En curso',t:'info'},done:{l:'Hecho',t:'ok'},delayed:{l:'Atrasado',t:'danger'}};
  return(
    <div className="space-y-2">
      {milestones.map(ms=>{
        const fcMonth=m[ms.month];
        const st=STATUS[ms.status]||STATUS.planned;
        return(
          <Card key={ms.id} className="p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 text-xs font-semibold text-stone-600">{mKey(ms.month)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium text-stone-900">{ms.name}</span><Badge>{fcMonth?fcMonth.label:`Mes ${ms.month+1}`}</Badge></div>
                  <div className="text-xs text-stone-500 mt-1"><span className="font-medium text-stone-600">KPI objetivo:</span> {ms.kpi}</div>
                  <div className="text-xs text-stone-500 mt-0.5"><span className="font-medium text-stone-600">Impacto:</span> {ms.expectedImpact}</div>
                  {ms.risk&&<div className="text-xs text-amber-600 mt-0.5 flex items-start gap-1"><ShieldAlert size={11} className="mt-0.5 shrink-0"/>{ms.risk}</div>}
                  {ms.action&&<div className="text-xs text-stone-500 mt-0.5 flex items-start gap-1"><ArrowRight size={11} className="mt-0.5 shrink-0"/>{ms.action}</div>}
                  {fcMonth&&<div className="text-[11px] text-stone-400 mt-1.5">Forecast en este mes: {fNum(fcMonth.activeTotal)} pagos activos · MRR {fARS(fcMonth.mrr,true)}</div>}
                </div>
              </div>
              <SI value={ms.status} onChange={v=>upd(ms.id,{status:v})} options={Object.entries(STATUS).map(([v,o])=>({v,l:o.l}))}/>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
function RecommendationsView({proj,state,actuals}){
  const recs=useMemo(()=>buildRecommendations(proj,actuals,state.thresholds),[proj,actuals,state.thresholds]);
  const RULES=[
    {cond:'Activación <25% pre-lector',act:'No escalar ads · onboarding asistido · simplificar carga'},
    {cond:'Activación <40% post-lector',act:'Revisar lector · tutorial · calidad de boletos'},
    {cond:'CAC >$60k por 2+ semanas',act:'Pausar/reducir ads · revisar creativos y landing'},
    {cond:'Churn mensual >15%',act:'Exit survey · reportes mensuales · hooks de uso'},
    {cond:'Tickets/usuario >0.4',act:'Revisar UX · tooltips · tutoriales'},
    {cond:'Pool free crece + conversión <2%',act:'Endurecer límites free · revisar gating · upsell'},
    {cond:'Pagos activos M08 ≥150',act:'Lanzar Personal en M09'},
    {cond:'Pagos activos M08 100-149',act:'Postergar Personal a M12'},
    {cond:'Pagos activos M08 <100',act:'No lanzar Personal año 1 · foco Inversiones'},
    {cond:'Influencer ROI negativo',act:'Pausar · renegociar comisión · quitar fee · solo performance'},
  ];
  return(
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-1.5"><Zap size={14} className="text-amber-500"/>Recomendaciones activas (según último mes cerrado)</div>
        <div className="space-y-2">
          {recs.map((r,i)=>(
            <div key={i} className={`p-3 rounded-lg border flex items-start gap-2.5 ${r.type==='danger'?'border-rose-200 bg-rose-50':r.type==='warn'?'border-amber-200 bg-amber-50':r.type==='ok'?'border-emerald-200 bg-emerald-50':'border-stone-200 bg-stone-50'}`}>
              {r.type==='danger'?<AlertTriangle size={15} className="text-rose-600 mt-0.5"/>:r.type==='warn'?<AlertTriangle size={15} className="text-amber-600 mt-0.5"/>:r.type==='ok'?<CheckCircle2 size={15} className="text-emerald-600 mt-0.5"/>:<Info size={15} className="text-stone-500 mt-0.5"/>}
              <div><div className="text-[13px] font-medium text-stone-900">{r.rule}</div><div className="text-xs text-stone-600 mt-0.5">{r.text}</div></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Reglas del motor</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {RULES.map((r,i)=>(<div key={i} className="p-2.5 border border-stone-200 rounded-lg text-xs"><div className="font-medium text-stone-700">Si: {r.cond}</div><div className="text-stone-500 mt-0.5 flex items-start gap-1"><ArrowRight size={10} className="mt-0.5 shrink-0"/>{r.act}</div></div>))}
        </div>
      </Card>
    </div>
  );
}
function DecisionLog({decisions,saveDecision,delDecision}){
  const[form,setForm]=useState(null);
  const blank={decision_date:new Date().toISOString().slice(0,10),decision:'',context:'',trigger_metric:'',alternatives:'',chosen:'',owner_person:'Franco',expected_result:'',review_date:'',status:'active'};
  return(
    <div>
      <div className="flex justify-end mb-3"><button onClick={()=>setForm(form?null:blank)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800"><Plus size={13}/>{form?'Cancelar':'Nueva decisión'}</button></div>
      {form&&(
        <Card className="p-4 mb-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-[11px] text-stone-500">Fecha</label><input type="date" value={form.decision_date} onChange={e=>setForm({...form,decision_date:e.target.value})} className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg"/></div>
            <div><label className="text-[11px] text-stone-500">Responsable</label><TI value={form.owner_person} onChange={v=>setForm({...form,owner_person:v})}/></div>
            <div className="sm:col-span-2"><label className="text-[11px] text-stone-500">Decisión</label><TI value={form.decision} onChange={v=>setForm({...form,decision:v})}/></div>
            <div><label className="text-[11px] text-stone-500">Contexto</label><TA value={form.context} onChange={v=>setForm({...form,context:v})}/></div>
            <div><label className="text-[11px] text-stone-500">Métrica que la disparó</label><TI value={form.trigger_metric} onChange={v=>setForm({...form,trigger_metric:v})}/></div>
            <div><label className="text-[11px] text-stone-500">Alternativas consideradas</label><TA value={form.alternatives} onChange={v=>setForm({...form,alternatives:v})}/></div>
            <div><label className="text-[11px] text-stone-500">Resultado esperado</label><TA value={form.expected_result} onChange={v=>setForm({...form,expected_result:v})}/></div>
            <div><label className="text-[11px] text-stone-500">Fecha de revisión</label><input type="date" value={form.review_date} onChange={e=>setForm({...form,review_date:e.target.value})} className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg"/></div>
          </div>
          <div className="flex justify-end mt-3"><button onClick={()=>{if(form.decision){saveDecision({...form,id:uid()});setForm(null);}}} className="px-4 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800">Guardar decisión</button></div>
        </Card>
      )}
      <div className="space-y-2">
        {decisions.length===0&&<Card className="p-8 text-center text-sm text-stone-400"><ClipboardList size={28} className="mx-auto mb-2 text-stone-300"/>Sin decisiones registradas. El roadmap define 5 decisiones críticas del año — registralas acá con su criterio numérico.</Card>}
        {decisions.map(d=>(
          <Card key={d.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><span className="text-sm font-medium text-stone-900">{d.decision}</span><Badge tone={d.status==='active'?'info':d.status==='reviewed'?'ok':'default'}>{d.status}</Badge><span className="text-[11px] text-stone-400">{d.decision_date}</span></div>
                {d.context&&<div className="text-xs text-stone-500 mt-1">{d.context}</div>}
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[11px] text-stone-500">
                  {d.trigger_metric&&<div><span className="text-stone-400">Disparador:</span> {d.trigger_metric}</div>}
                  {d.owner_person&&<div><span className="text-stone-400">Responsable:</span> {d.owner_person}</div>}
                  {d.expected_result&&<div className="sm:col-span-2"><span className="text-stone-400">Resultado esperado:</span> {d.expected_result}</div>}
                  {d.review_date&&<div><span className="text-stone-400">Revisión:</span> {d.review_date}</div>}
                </div>
              </div>
              <button onClick={()=>delDecision(d.id)} className="text-stone-300 hover:text-rose-500"><Trash2 size={14}/></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
 
// ============ INVESTOR VIEW ============
function InvestorTab({proj,state,set}){
  const m=proj.monthly;const last=m[m.length-1]||{};
  const m12=m[11]||last;
  const val=state.valuation||{multConservative:3,multBase:5,multOptimistic:8,stageDiscount:0.30,capitalToRaise:0,targetDilution:0.15};
  const upd=(patch)=>set({valuation:{...val,...patch}});
  const arr=last.arr||0;const arr12=m12.arr||0;
  const growth=m.length>1?(m[Math.min(11,m.length-1)].mrr/Math.max(1,m[0].mrr)):0;
  const valConservative=arr*val.multConservative*(1-val.stageDiscount);
  const valBase=arr*val.multBase*(1-val.stageDiscount);
  const valOptimistic=arr*val.multOptimistic*(1-val.stageDiscount);
  const capital=val.capitalToRaise*state.fx;
  const postMoney=valBase+capital;
  const dilution=postMoney>0?capital/postMoney:0;
  return(
    <div>
      <SectionTitle icon={Eye} title="Investor View" desc="Vista resumida para socios e inversores: métricas clave, riesgos, próximos hitos y valuación por escenarios."/>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
        <KPI label="MRR actual" value={fARS(last.mrr,true)} icon={TrendingUp} tone="ok"/>
        <KPI label="ARR" value={fARS(arr,true)} icon={TrendingUp}/>
        <KPI label="MRR proyectado 12m" value={fARS(m12.mrr,true)} icon={Target}/>
        <KPI label="Crecimiento (M1→M12)" value={fX(growth)} icon={Activity}/>
        <KPI label="Pagos activos" value={fNum(last.activeTotal)} icon={Users}/>
        <KPI label="Gross margin" value={fPct(last.grossMargin)} icon={Percent} tone="ok"/>
        <KPI label="Churn blended" value={fPct(avg(m.slice(0,6).map(x=>x.churnBlended)))} icon={TrendingDown}/>
        <KPI label="CAC blended" value={fARS(avg(m.slice(0,6).map(x=>x.cac)))} icon={Target}/>
        <KPI label="LTV/CAC" value={fX(avg(m.slice(0,12).map(x=>x.ltvCac)))} tone="ok" icon={Scale}/>
        <KPI label="Payback" value={`${avg(m.slice(0,12).map(x=>x.payback)).toFixed(1)} m`} icon={Clock}/>
        <KPI label="Capital necesario" value={fARS(proj.summary.capitalNeeded,true)} tone="warn" icon={PiggyBank}/>
        <KPI label="Break-even acum." value={proj.beCumMonth!=null?mLabel(state.sy,state.sm,proj.beCumMonth):'Fuera horizonte'} icon={Target}/>
      </div>
 
      <Card className="p-5 mb-5">
        <div className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-1.5"><Scale size={15}/>Valuación por escenarios (múltiplo de ARR)</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div><label className="text-[11px] text-stone-500">Múltiplo conservador</label><NI value={val.multConservative} onChange={v=>upd({multConservative:v})} suffix="x" step={0.5}/></div>
          <div><label className="text-[11px] text-stone-500">Múltiplo base</label><NI value={val.multBase} onChange={v=>upd({multBase:v})} suffix="x" step={0.5}/></div>
          <div><label className="text-[11px] text-stone-500">Múltiplo optimista</label><NI value={val.multOptimistic} onChange={v=>upd({multOptimistic:v})} suffix="x" step={0.5}/></div>
          <div><label className="text-[11px] text-stone-500">Descuento por etapa</label><NI value={val.stageDiscount*100} onChange={v=>upd({stageDiscount:v/100})} suffix="%"/></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Card tone="default" className="p-4"><div className="text-xs text-stone-500">Conservador ({val.multConservative}x)</div><div className="text-lg font-semibold tabular-nums mt-1">{fARS(valConservative,true)}</div><div className="text-[11px] text-stone-400">≈ USD {fNum(valConservative/state.fx)}</div></Card>
          <Card tone="accent" className="p-4"><div className="text-xs text-stone-500">Base ({val.multBase}x)</div><div className="text-lg font-semibold tabular-nums mt-1">{fARS(valBase,true)}</div><div className="text-[11px] text-stone-400">≈ USD {fNum(valBase/state.fx)}</div></Card>
          <Card tone="ok" className="p-4"><div className="text-xs text-stone-500">Optimista ({val.multOptimistic}x)</div><div className="text-lg font-semibold tabular-nums mt-1">{fARS(valOptimistic,true)}</div><div className="text-[11px] text-stone-400">≈ USD {fNum(valOptimistic/state.fx)}</div></Card>
        </div>
      </Card>
 
      <Card className="p-5 mb-5">
        <div className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-1.5"><PiggyBank size={15}/>Ronda de inversión (sobre valuación base)</div>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div><label className="text-[11px] text-stone-500">Capital a levantar (USD)</label><NI value={val.capitalToRaise} onChange={v=>upd({capitalToRaise:v})} suffix="USD"/></div>
          <div><label className="text-[11px] text-stone-500">Pre-money (base)</label><div className="px-2 py-1.5 text-sm bg-stone-50 rounded-lg tabular-nums">{fARS(valBase,true)}</div></div>
          <div><label className="text-[11px] text-stone-500">Dilución estimada</label><div className="px-2 py-1.5 text-sm bg-stone-50 rounded-lg tabular-nums">{fPct(dilution,1)}</div></div>
        </div>
        {capital>0&&<p className="text-xs text-stone-500">Con USD {fNum(val.capitalToRaise)} ({fARS(capital,true)}) sobre pre-money {fARS(valBase,true)}: post-money {fARS(postMoney,true)}, dilución {fPct(dilution,1)}.</p>}
      </Card>
 
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4"><div className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-1.5"><ShieldAlert size={14}/>Principales riesgos</div><ul className="space-y-1.5 text-xs text-stone-600">
          <li className="flex gap-2"><span className="text-amber-500">•</span>Lector de boletos es el cuello de botella del año (Q4 2026). Atraso = todo el plan se corre 3-6 meses.</li>
          <li className="flex gap-2"><span className="text-amber-500">•</span>Sueldos founders ($2.4M/mes desde día 1) hacen que la caja acumulada no llegue a positiva en el horizonte base.</li>
          <li className="flex gap-2"><span className="text-amber-500">•</span>Concentración de adquisición en pocos canales pagos.</li>
          <li className="flex gap-2"><span className="text-amber-500">•</span>Personal sin validación previa (check-point M08 ≥150 pagos).</li>
        </ul></Card>
        <Card className="p-4"><div className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-1.5"><Rocket size={14}/>Próximos hitos</div><ul className="space-y-1.5 text-xs text-stone-600">
          {(state.milestones||[]).slice(0,5).map(ms=>(<li key={ms.id} className="flex gap-2"><span className="text-emerald-500">•</span>{mKey(ms.month)} · {ms.name}</li>))}
        </ul></Card>
      </div>
    </div>
  );
}
 
// ============ CONFIGURACIÓN ============
function ConfigTab({state,set,exportJSON,exportCSV,importJSON,resetAll,snapshots,restoreSnapshot}){
  const fileRef=useRef();
  return(
    <div>
      <SectionTitle icon={Settings} title="Configuración" desc="Horizonte, exportaciones, backups versionados y umbrales del motor de alertas."/>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-stone-900 mb-3">Horizonte y arranque</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] text-stone-500">Horizonte</label><SI value={state.hm} onChange={v=>set({hm:parseInt(v)})} options={HORIZONS.map(h=>({v:h.v,l:h.l}))} className="w-full"/></div>
            <div><label className="text-[11px] text-stone-500">Lanzamiento Personal</label><SI value={state.personalLaunch} onChange={v=>set({personalLaunch:v})} options={[{v:'yes',l:'Sí (M09)'},{v:'postpone',l:'Postergar (M12)'},{v:'no',l:'No lanzar año 1'}]} className="w-full"/></div>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">El modelo arranca en Agosto 2026 (M01). Máximo 24 meses por default.</p>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-stone-900 mb-3">Umbrales del motor de alertas</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] text-stone-500">CAC máximo</label><NI value={state.thresholds.cacMax} onChange={v=>set({thresholds:{...state.thresholds,cacMax:v}})}/></div>
            <div><label className="text-[11px] text-stone-500">Churn mensual máx</label><NI value={state.thresholds.churnMonthlyMax*100} onChange={v=>set({thresholds:{...state.thresholds,churnMonthlyMax:v/100}})} suffix="%"/></div>
            <div><label className="text-[11px] text-stone-500">Activación mín post-lector</label><NI value={state.thresholds.activationMinPostReader*100} onChange={v=>set({thresholds:{...state.thresholds,activationMinPostReader:v/100}})} suffix="%"/></div>
            <div><label className="text-[11px] text-stone-500">Desvío forecast máx</label><NI value={state.thresholds.forecastDeviationMax*100} onChange={v=>set({thresholds:{...state.thresholds,forecastDeviationMax:v/100}})} suffix="%"/></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-stone-900 mb-3">Exportar / Importar</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportJSON} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50"><FileJson size={13}/>Exportar JSON</button>
            <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50"><Download size={13}/>Exportar CSV</button>
            <button onClick={()=>fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50"><Upload size={13}/>Importar JSON</button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=ev=>{try{importJSON(JSON.parse(ev.target.result));}catch{alert('JSON inválido');}};r.readAsText(f);}}}/>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-stone-900 mb-3">Backups versionados</div>
          {snapshots&&snapshots.length>0?(
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {snapshots.map(s=>(<div key={s.id} className="flex items-center justify-between text-xs p-2 bg-stone-50 rounded-lg"><span className="text-stone-600">{new Date(s.created_at).toLocaleString('es-AR')}</span><ConfirmBtn onConfirm={()=>restoreSnapshot(s)} label="Restaurar" icon={RefreshCw} confirmText="¿Restaurar?"/></div>))}
            </div>
          ):<p className="text-xs text-stone-400">Se crea un snapshot automático cada vez que guardás. Aparecen acá los últimos 20.</p>}
        </Card>
        <Card tone="danger" className="p-4 lg:col-span-2">
          <div className="text-sm font-medium text-rose-900 mb-1">Zona peligrosa</div>
          <p className="text-xs text-rose-700 mb-3">Restablecer borra toda la configuración local y vuelve a los valores del Excel. Los datos reales (actuals cerrados, gastos Franco, decisiones) en la nube no se tocan.</p>
          <ConfirmBtn onConfirm={resetAll} label="Restablecer a valores del Excel" icon={Eraser} confirmText="¿Seguro? Esto resetea la config" danger/>
        </Card>
      </div>
      <Card tone="accent" className="p-4 mt-4">
        <div className="text-xs text-stone-600 space-y-1">
          <div className="font-medium text-stone-800 mb-1">Estado de migración a backend</div>
          <div>✓ Forecast, config, planes, costos, influencers, socios → guardado en Supabase (JSONB del workspace)</div>
          <div>✓ Actuals cerrados, gastos Franco, decisiones → tablas dedicadas en Supabase (listas para normalizar)</div>
          <div>✓ Multi-usuario con RLS · backups versionados · auto-guardado</div>
        </div>
      </Card>
    </div>
  );
}
 
// ============ CSV / JSON EXPORT ============
function buildCSV(monthly){
  const headers=['Mes','Registros','Activaciones','Pagos nuevos','Pagos activos','Pool free','MRR','ARR','Caja cobrada','Costos fijos','Marketing','EBITDA','Caja acum','CAC','LTV/CAC','Churn'];
  const rows=monthly.map(m=>[m.label,Math.round(m.regTotal),Math.round(m.activations),Math.round(m.newPaidTotal),Math.round(m.activeTotal),Math.round(m.freePool),Math.round(m.mrr),Math.round(m.arr),Math.round(m.cashCollected),Math.round(m.fixedCosts),Math.round(m.marketing),Math.round(m.opResult),Math.round(m.cumCash),Math.round(m.cac),m.ltvCac.toFixed(2),(m.churnBlended*100).toFixed(1)+'%']);
  return[headers,...rows].map(r=>r.join(',')).join('\n');
}
function dl(content,name,type){const b=new Blob([content],{type});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);}
 
// ============ ESTADO DEFAULT ============
function buildDefaultState(){
  return{
    sy:2026,sm:7,hm:24,scenario:'base',view:'monthly',productFilter:'all',tab:'dashboard',
    inflation:0.025,fx:1500,personalLaunch:'yes',
    scenarios:buildScenarios(),adsBudget:buildDefaultAdsBudget(),
    plans:DEFAULT_PLANS,influencers:DEFAULT_INFLUENCERS,channels:DEFAULT_CHANNELS,costs:DEFAULT_COSTS,
    campaigns:[],referral:{enabled:false,referrerBenefit:'1 mes free Inversión',referredBenefit:'20% off primer mes',durationMonths:1,costPerReferral:15000},
    mpFees:{variablePct:6.29},
    partners:DEFAULT_PARTNERS,francoRecoveryRule:'before_distribution',francoRecoveryPercent:50,
    milestones:DEFAULT_MILESTONES,
    thresholds:{cacMax:60000,churnMonthlyMax:0.15,churnQuarterlyMax:0.07,activationMinPreReader:0.25,activationMinPostReader:0.40,runwayMonths:3,forecastDeviationMax:0.20,ticketsPerUserMax:0.4,freeRatio:0.20},
    valuation:{multConservative:3,multBase:5,multOptimistic:8,stageDiscount:0.30,capitalToRaise:0,targetDilution:0.15},
  };
}
 
// ============ APP ROOT ============
export default function App(){
  const[session,setSession]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[workspaceId,setWorkspaceId]=useState(null);
  const[state,setState]=useState(buildDefaultState);
  const[saving,setSaving]=useState(false);
  const[lastSaved,setLastSaved]=useState(null);
  const[actuals,setActuals]=useState({});
  const[francoExpenses,setFrancoExpenses]=useState([]);
  const[decisions,setDecisions]=useState([]);
  const[snapshots,setSnapshots]=useState([]);
  const[loaded,setLoaded]=useState(false);
  const saveTimer=useRef(null);
  const skipSave=useRef(true);
 
  // Auth
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setAuthLoading(false);});
    const{data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return()=>sub.subscription.unsubscribe();
  },[]);
 
  // Cargar workspace + datos
  useEffect(()=>{
    if(!session){setLoaded(false);return;}
    (async()=>{
      const uid_=session.user.id;
      let{data:ws}=await supabase.from('profitlab_workspaces').select('*').eq('owner_id',uid_).order('created_at',{ascending:true}).limit(1).maybeSingle();
      if(!ws){const{data:nw}=await supabase.from('profitlab_workspaces').insert({owner_id:uid_,name:'ProfitLab',app_state:buildDefaultState()}).select().single();ws=nw;}
      if(ws){
        setWorkspaceId(ws.id);
        if(ws.app_state&&Object.keys(ws.app_state).length)setState({...buildDefaultState(),...ws.app_state});
        // actuals
        const{data:acts}=await supabase.from('profitlab_actuals').select('*').eq('workspace_id',ws.id);
        const am={};(acts||[]).forEach(a=>{am[a.month_key]={...a.data,closed:a.closed,closedAt:a.closed_at,_id:a.id};});setActuals(am);
        // franco
        const{data:fe}=await supabase.from('profitlab_franco_expenses').select('*').eq('workspace_id',ws.id).order('expense_date',{ascending:false});
        setFrancoExpenses((fe||[]).map(e=>({...e,id:e.id})));
        // decisions
        const{data:dec}=await supabase.from('profitlab_decisions').select('*').eq('workspace_id',ws.id).order('decision_date',{ascending:false});
        setDecisions((dec||[]).map(d=>({...d,id:d.id})));
        // snapshots
        const{data:snaps}=await supabase.from('profitlab_snapshots').select('*').eq('workspace_id',ws.id).order('created_at',{ascending:false}).limit(20);
        setSnapshots(snaps||[]);
      }
      skipSave.current=true;setLoaded(true);
    })();
  },[session]);
 
  // Auto-save workspace (debounced)
  useEffect(()=>{
    if(!loaded||!workspaceId)return;
    if(skipSave.current){skipSave.current=false;return;}
    setSaving(true);
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      await supabase.from('profitlab_workspaces').update({app_state:state}).eq('id',workspaceId);
      setSaving(false);setLastSaved(new Date());
    },1500);
    return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};
  },[state,loaded,workspaceId]);
 
  const set=useCallback((patch)=>setState(s=>({...s,...patch})),[]);
 
  // Proyección
  const proj=useMemo(()=>project({plans:state.plans,costs:state.costs,influencers:state.influencers,channels:state.channels,campaigns:state.campaigns,referral:state.referral,mpFees:state.mpFees,scenario:state.scenario,scenarios:state.scenarios,adsBudget:state.adsBudget,sy:state.sy,sm:state.sm,hm:state.hm,inflation:state.inflation,fx:state.fx,personalLaunch:state.personalLaunch}),[state]);
 
  // Actuals handlers
  const saveActual=useCallback(async(mk,data)=>{
    setActuals(a=>({...a,[mk]:{...data}}));
    if(!workspaceId)return;
    const existing=actuals[mk]?._id;
    const payload={owner_id:session.user.id,workspace_id:workspaceId,month_key:mk,data:{users:data.users,revenue:data.revenue,costs:data.costs,product:data.product},closed:data.closed||false};
    if(existing){await supabase.from('profitlab_actuals').update(payload).eq('id',existing);}
    else{const{data:ins}=await supabase.from('profitlab_actuals').upsert(payload,{onConflict:'workspace_id,month_key'}).select().single();if(ins)setActuals(a=>({...a,[mk]:{...a[mk],_id:ins.id}}));}
  },[workspaceId,session,actuals]);
  const closeMonth=useCallback(async(mk)=>{
    const cur=actuals[mk]||{};const next={...cur,closed:true,closedAt:new Date().toISOString()};
    setActuals(a=>({...a,[mk]:next}));
    if(workspaceId){const payload={owner_id:session.user.id,workspace_id:workspaceId,month_key:mk,data:{users:cur.users,revenue:cur.revenue,costs:cur.costs,product:cur.product},closed:true,closed_at:new Date().toISOString()};await supabase.from('profitlab_actuals').upsert(payload,{onConflict:'workspace_id,month_key'});}
  },[actuals,workspaceId,session]);
  const reopenMonth=useCallback(async(mk)=>{
    setActuals(a=>({...a,[mk]:{...a[mk],closed:false}}));
    if(workspaceId&&actuals[mk]?._id)await supabase.from('profitlab_actuals').update({closed:false,reopened_at:new Date().toISOString()}).eq('id',actuals[mk]._id);
  },[actuals,workspaceId]);
 
  // Franco handlers
  const saveFrancoExpense=useCallback(async(exp)=>{
    setFrancoExpenses(l=>[{...exp},...l]);
    if(workspaceId){const{data}=await supabase.from('profitlab_franco_expenses').insert({owner_id:session.user.id,workspace_id:workspaceId,expense_date:exp.expense_date,category:exp.category,amount:exp.amount,description:exp.description,reimbursable:exp.reimbursable,covered_by:exp.covered_by||'company',priority:exp.priority||5,recovered:0}).select().single();if(data)setFrancoExpenses(l=>l.map(e=>e.id===exp.id?{...e,id:data.id}:e));}
  },[workspaceId,session]);
  const delFrancoExpense=useCallback(async(id)=>{
    setFrancoExpenses(l=>l.filter(e=>e.id!==id));
    if(workspaceId)await supabase.from('profitlab_franco_expenses').delete().eq('id',id);
  },[workspaceId]);
 
  // Decision handlers
  const saveDecision=useCallback(async(dec)=>{
    setDecisions(l=>[{...dec},...l]);
    if(workspaceId){const{data}=await supabase.from('profitlab_decisions').insert({owner_id:session.user.id,workspace_id:workspaceId,decision_date:dec.decision_date,decision:dec.decision,context:dec.context,trigger_metric:dec.trigger_metric,alternatives:dec.alternatives,chosen:dec.chosen||dec.decision,owner_person:dec.owner_person,expected_result:dec.expected_result,review_date:dec.review_date||null,status:dec.status||'active'}).select().single();if(data)setDecisions(l=>l.map(d=>d.id===dec.id?{...d,id:data.id}:d));}
  },[workspaceId,session]);
  const delDecision=useCallback(async(id)=>{
    setDecisions(l=>l.filter(d=>d.id!==id));
    if(workspaceId)await supabase.from('profitlab_decisions').delete().eq('id',id);
  },[workspaceId]);
 
  // Export / import / reset / restore
  const exportJSON=()=>dl(JSON.stringify({state,actuals,francoExpenses,decisions},null,2),`profitlab_backup_${new Date().toISOString().slice(0,10)}.json`,'application/json');
  const exportCSV=()=>dl(buildCSV(proj.monthly),`profitlab_${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8;');
  const importJSON=(obj)=>{if(obj.state)setState({...buildDefaultState(),...obj.state});else setState({...buildDefaultState(),...obj});};
  const resetAll=()=>setState(buildDefaultState());
  const restoreSnapshot=(s)=>{if(s.app_state)setState({...buildDefaultState(),...s.app_state});};
  const logout=async()=>{await supabase.auth.signOut();setSession(null);};
 
  if(authLoading)return<div className="min-h-screen bg-stone-50 flex items-center justify-center"><RefreshCw className="animate-spin text-stone-400" size={24}/></div>;
  if(!session)return<LoginScreen/>;
  if(!loaded)return<div className="min-h-screen bg-stone-50 flex items-center justify-center"><div className="text-center"><RefreshCw className="animate-spin text-stone-400 mx-auto mb-2" size={24}/><div className="text-sm text-stone-500">Cargando tu workspace...</div></div></div>;
 
  return(
    <div className="min-h-screen bg-stone-50">
      <Header scenario={state.scenario} setScenario={v=>set({scenario:v})} saving={saving} lastSaved={lastSaved} onLogout={logout} userEmail={session.user.email}/>
      <Nav current={state.tab} setTab={v=>set({tab:v})}/>
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {state.tab==='dashboard'&&<DashboardTab proj={proj} actuals={actuals} state={state} set={set}/>}
        {state.tab==='forecast'&&<ForecastActualsTab proj={proj} state={state} set={set} actuals={actuals} saveActual={saveActual} closeMonth={closeMonth} reopenMonth={reopenMonth}/>}
        {state.tab==='growth'&&<GrowthTab proj={proj} state={state} set={set}/>}
        {state.tab==='revenue'&&<RevenueTab proj={proj} state={state} set={set}/>}
        {state.tab==='costs'&&<CostsTab proj={proj} state={state} set={set}/>}
        {state.tab==='partners'&&<PartnersTab proj={proj} state={state} set={set} francoExpenses={francoExpenses} saveFrancoExpense={saveFrancoExpense} delFrancoExpense={delFrancoExpense}/>}
        {state.tab==='roadmap'&&<RoadmapTab proj={proj} state={state} set={set} actuals={actuals} decisions={decisions} saveDecision={saveDecision} delDecision={delDecision}/>}
        {state.tab==='investor'&&<InvestorTab proj={proj} state={state} set={set}/>}
        {state.tab==='config'&&<ConfigTab state={state} set={set} exportJSON={exportJSON} exportCSV={exportCSV} importJSON={importJSON} resetAll={resetAll} snapshots={snapshots} restoreSnapshot={restoreSnapshot}/>}
      </main>
      <footer className="max-w-[1600px] mx-auto px-6 py-4 text-[11px] text-stone-400 border-t border-stone-200 mt-8">ProfitLab OS · Backoffice financiero-operativo · Datos en la nube (Supabase) · {session.user.email}</footer>
    </div>
  );
}
