"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import dictionary from "./translations.json";
type Language = "ru" | "en" | "kk";
type Translate = (text: string) => string;
const copy = {
 ru: { choose: "Выберите язык", intro: "Ваш город. Ваш язык. Новый взгляд на Алматы.", change: "Изменить язык", note: "Выбор сохранится на этом устройстве", explore: "Исследовать город", data: "Учебный проект · Не мониторинг в реальном времени" },
 en: { choose: "Choose your language", intro: "Your city. Your language. A fresh perspective on Almaty.", change: "Change language", note: "Your choice is saved on this device", explore: "Explore the city", data: "Educational project · Not a live monitoring service" },
 kk: { choose: "Тілді таңдаңыз", intro: "Сіздің қалаңыз. Сіздің тіліңіз. Алматыға жаңа көзқарас.", change: "Тілді өзгерту", note: "Таңдауыңыз осы құрылғыда сақталады", explore: "Қаланы зерттеу", data: "Оқу жобасы · Нақты уақыттағы мониторинг емес" },
};
const languages: { id: Language; code: string; name: string; sub: string }[] = [{id:"ru",code:"RU",name:"Русский",sub:"Продолжить на русском"},{id:"en",code:"EN",name:"English",sub:"Continue in English"},{id:"kk",code:"KZ",name:"Қазақша",sub:"Қазақ тілінде жалғастыру"}];
const Context = createContext<{language: Language; t: Translate; words: typeof copy.ru; choose: (l: Language)=>void; reopen: ()=>void}>({language:"ru",t:s=>s,words:copy.ru,choose:()=>{},reopen:()=>{}});
export function useLanguage(){return useContext(Context);}
export function localize<T>(value:T,t:Translate):T { if(typeof value==="string")return t(value) as T;if(Array.isArray(value))return value.map(v=>localize(v,t)) as T;if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v,t)])) as T;return value; }
export function LanguageProvider({children}:{children:React.ReactNode}){
 const [language,setLanguage]=useState<Language>("ru"); const [ready,setReady]=useState(false);const dialog=useRef<HTMLDialogElement>(null);const returnFocus=useRef<HTMLElement|null>(null);
 const t=useCallback((text:string)=>language==="ru"?({ALMATY:"АЛМАТЫ",AIR:"ВОЗДУХ",MOBILITY:"ДВИЖЕНИЕ",DISTRICTS:"РАЙОНЫ",FUTURE:"БУДУЩЕЕ"} as Record<string,string>)[text]??text:(dictionary as Record<string,{en:string;kk:string}>)[text]?.[language]??text,[language]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{let saved:string|null=null;try{saved=localStorage.getItem("esg-language");}catch{}if(saved==="ru"||saved==="en"||saved==="kk")setLanguage(saved);else dialog.current?.showModal();setReady(true);});return()=>cancelAnimationFrame(frame);},[]);
 useEffect(()=>{document.documentElement.lang=language;document.title=language==="ru"?"ESG Almaty — город в данных":language==="kk"?"ESG Almaty — деректердегі қала":"ESG Almaty — a city in data";},[language]);
 const choose=(l:Language)=>{setLanguage(l);try{localStorage.setItem("esg-language",l);}catch{}dialog.current?.close();returnFocus.current?.focus();};
 const reopen=()=>{returnFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();};
 return <Context.Provider value={{language,t,words:copy[language],choose,reopen}}><div className={ready?"app-ready":"app-loading"}>{children}</div><dialog ref={dialog} className="language-dialog" aria-labelledby="language-title" onCancel={e=>{if(!ready)e.preventDefault();}}><div className="language-art" aria-hidden="true"><span>43.2389° N · 76.8897° E</span><div className="language-orbit"/><b>ESG<br/><em>ALMATY</em></b><small>PEOPLE · PLANET · PROGRESS</small></div><div className="language-content"><p className="eyebrow">WELCOME / ДОБРО ПОЖАЛОВАТЬ / ҚОШ КЕЛДІҢІЗ</p><h2 id="language-title">{copy[language].choose}</h2><p>{copy[language].intro}</p><div className="language-options">{languages.map(l=><button autoFocus={l.id===language} key={l.id} onClick={()=>choose(l.id)}><span className="language-code">{l.code}</span><span><strong>{l.name}</strong><small>{l.sub}</small></span><i>↗</i></button>)}</div><p className="language-note">{copy[language].note}</p></div></dialog></Context.Provider>;
}
export function LanguageControls(){const {language,choose,words}=useLanguage();return <div className="language-switch" role="group" aria-label={words.change}>{languages.map(l=><button key={l.id} aria-pressed={language===l.id} lang={l.id} onClick={()=>choose(l.id)}>{l.code}</button>)}</div>;}
export function HeroActions(){const {words,reopen}=useLanguage();return <><div className="hero-actions"><a className="primary-action" href="#numbers">{words.explore}<span>↗</span></a><button className="secondary-action" onClick={reopen}>{words.change}<span>◎</span></button></div><p className="data-note">{words.data}</p></>;}
