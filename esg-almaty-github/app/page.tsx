"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartConfiguration,
  ChartType,
  DoughnutController,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
);

const navItems = [
  ["Обзор", "hero"],
  ["Воздух", "air"],
  ["Транспорт", "transport"],
  ["Районы", "districts"],
  ["Поведение", "behavior"],
  ["О проекте", "about"],
  ["Источники", "sources"],
] as const;

const metrics = [
  { value: "2.2M", title: "Население", source: "Bureau of Statistics", icon: "◎" },
  { value: "112", title: "Средний AQI", source: "IQAir 2024", icon: "≋" },
  { value: "42%", title: "Общ. транспорт", source: "Акимат Алматы", icon: "↔" },
  { value: "6.8", unit: "м²", title: "Зелени / чел", source: "Городские данные", icon: "⌁" },
  { value: "8.5%", title: "Переработка", source: "Оценка", icon: "↻" },
  { value: "4.2", unit: "т", title: "CO₂ / чел", source: "Синтетическая оценка", icon: "△" },
  { value: "47/100", title: "ESG score", source: "Композитный индекс", icon: "◫" },
];

const heroWords = ["ALMATY", "AIR", "MOBILITY", "DISTRICTS", "FUTURE"];
const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const districts = [
  { name: "Алмалинский", total: 60, e: 52, s: 68, g: 61 },
  { name: "Бостандыкский", total: 56, e: 48, s: 62, g: 58 },
  { name: "Медеуский", total: 60, e: 55, s: 65, g: 60 },
  { name: "Ауэзовский", total: 43, e: 35, s: 45, g: 50 },
  { name: "Алатауский", total: 37, e: 30, s: 38, g: 42 },
  { name: "Турксибский", total: 41, e: 32, s: 42, g: 48 },
  { name: "Жетысуский", total: 46, e: 38, s: 48, g: 52 },
  { name: "Наурызбайский", total: 42, e: 42, s: 40, g: 45 },
];

const behaviors = [
  { title: "Сортировка отходов", aware: 72, action: 18, code: "01" },
  { title: "Экономия воды", aware: 85, action: 45, code: "02" },
  { title: "Общ. транспорт", aware: 68, action: 42, code: "03" },
  { title: "Энергосбережение", aware: 80, action: 38, code: "04" },
  { title: "Покупка эко-товаров", aware: 55, action: 12, code: "05" },
];

const sources = [
  { title: "IQAir — качество воздуха в Алматы", domain: "iqair.com", text: "Текущий AQI, концентрация PM2.5, прогноз и историческая динамика непосредственно для города Алматы.", url: "https://www.iqair.com/air-quality/kazakhstan/almaty-oblysy/almaty" },
  { title: "Казгидромет — экологические бюллетени", domain: "kazhydromet.kz", text: "Ежемесячные официальные бюллетени по состоянию окружающей среды Алматы, Алматинской области и области Жетісу.", url: "https://www.kazhydromet.kz/ru/ecology/ezhemesyachnyy-informacionnyy-byulleten-o-sostoyanii-okruzhayuschey-sredy" },
  { title: "Бюро национальной статистики РК", domain: "stat.gov.kz", text: "Профильная статистика окружающей среды: выбросы, отходы, водные ресурсы и природоохранные расходы.", url: "https://stat.gov.kz/ru/industries/environment/stat-eco/" },
  { title: "Открытые данные Республики Казахстан", domain: "data.egov.kz", text: "Государственный каталог машиночитаемых наборов данных центральных и местных исполнительных органов.", url: "https://data.egov.kz/" },
  { title: "UNDP Kazakhstan — устойчивое развитие", domain: "undp.org", text: "Официальный раздел ПРООН о реализации Целей устойчивого развития и национальных приоритетах Казахстана.", url: "https://www.undp.org/kazakhstan/sustainable-development" },
  { title: "Алматинский метрополитен — пассажиропоток", domain: "metroalmaty.kz", text: "Официальные данные о росте пассажиропотока метро и увеличении провозной способности городской сети.", url: "https://metroalmaty.kz/ru/news/interval-v-5-minut-v-metropolitene-almaty-zapushhen-dopolnitelnyi-sostav" },
  { title: "WHO — загрязнение атмосферного воздуха", domain: "who.int", text: "Актуальная справка ВОЗ о загрязнении воздуха, PM2.5, рисках для здоровья и мерах снижения воздействия.", url: "https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health" },
];

function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.25, 0.5] },
    );
    navItems.forEach(([, id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

function ChartCanvas<TType extends ChartType>({ config, label }: { config: ChartConfiguration<TType>; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const chart = new ChartJS<TType>(canvasRef.current, config);
    return () => chart.destroy();
  }, [config]);
  return <canvas ref={canvasRef} role="img" aria-label={label} />;
}

function Header() {
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href="#hero" aria-label="ESG Almaty — наверх"><span>ESG</span><i />ALMATY</a>
      <button className="menu-button" aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      <nav className={open ? "nav-open" : ""} aria-label="Основная навигация">
        {navItems.map(([label, id]) => <a key={id} href={`#${id}`} className={active === id ? "active" : ""} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <a className="header-score" href="#numbers"><span>ESG</span> 47</a>
    </header>
  );
}

function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setWordIndex((index) => (index + 1) % heroWords.length), 2100);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="hero" id="hero">
      <div className="dot-field" aria-hidden="true" />
      <div className="hero-meta mono"><span>ПРОИЗВОДСТВЕННАЯ ПРАКТИКА · КБТУ · 2026</span><span>43.2389° N · 76.8897° E</span></div>
      <div className="hero-copy">
        <p className="eyebrow"><span /> ГОРОД В ДАННЫХ</p>
        <h1><span>ESG</span><strong key={heroWords[wordIndex]}>{heroWords[wordIndex]}</strong></h1>
        <div className="hero-lower">
          <p>Мониторинг устойчивого развития<br />крупнейшего города Центральной Азии</p>
          <div className="esg-legend mono"><span>E · Environmental</span><span>S · Social</span><span>G · Governance</span></div>
        </div>
      </div>
      <a className="scroll-cue mono" href="#intro"><span>SCROLL</span><i /></a>
      <div className="marquee" aria-label="Темы проекта"><div>AIR QUALITY <b>•</b> TRANSPORT <b>•</b> DISTRICTS <b>•</b> RECYCLING <b>•</b> SUSTAINABILITY <b>•</b> GREEN CITY <b>•</b>&nbsp;</div><div aria-hidden="true">AIR QUALITY <b>•</b> TRANSPORT <b>•</b> DISTRICTS <b>•</b> RECYCLING <b>•</b> SUSTAINABILITY <b>•</b> GREEN CITY <b>•</b>&nbsp;</div></div>
    </section>
  );
}

function Introduction() {
  return (
    <section className="intro dark-section reveal" id="intro">
      <div className="section-shell intro-grid">
        <div><p className="section-kicker mono"><span>00</span> О ПРОЕКТЕ</p><h2>Понимать город.<br /><em>Менять будущее.</em></h2></div>
        <div className="intro-body">
          <p className="lead">ESG Almaty объединяет экологические, социальные и управленческие показатели в одну открытую картину города.</p>
          <p>Проект переводит разрозненные данные в понятные сигналы: где качество среды улучшается, какие решения работают и на что городу стоит обратить внимание.</p>
          <div className="dimension-list">
            <div><b>E</b><span><strong>Environmental</strong>Воздух, выбросы и зелёная инфраструктура</span></div>
            <div><b>S</b><span><strong>Social</strong>Мобильность, доступность и качество жизни</span></div>
            <div><b>G</b><span><strong>Governance</strong>Открытые данные и управленческие решения</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section className="metrics-section reveal" id="numbers"><div className="section-shell">
      <div className="section-heading"><div><p className="section-kicker mono"><span>01</span> КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ</p><h2>Город<br /><em>одним взглядом</em></h2></div><p>Семь показателей дают быстрый срез устойчивого развития Алматы — от качества воздуха до итогового ESG-индекса.</p></div>
      <div className="metric-grid">{metrics.map((metric, index) => <article className={`metric-card ${index === metrics.length - 1 ? "score-card" : ""}`} key={metric.title}><div className="metric-top"><span className="metric-icon" aria-hidden="true">{metric.icon}</span><span className="mono">0{index + 1}</span></div><div><div className="metric-value">{metric.value}<small>{metric.unit}</small></div><h3>{metric.title}</h3></div><p className="mono">{metric.source}</p></article>)}</div>
    </div></section>
  );
}

function AirSection() {
  const gridColor = "rgba(6,24,32,.09)";
  const tickColor = "#72807d";
  const airConfig: ChartConfiguration = { type: "bar", data: { labels: months, datasets: [
    { label: "PM2.5 μg/m³", data: [85, 78, 52, 30, 18, 13, 11, 14, 22, 45, 68, 90], backgroundColor: months.map((_, i) => i > 4 && i < 8 ? "rgba(53,191,205,.72)" : "rgba(85,191,82,.78)"), borderRadius: 7, borderSkipped: false },
    { type: "line", label: "Норма ВОЗ", data: Array(12).fill(15), borderColor: "#df655e", borderDash: [7, 7], pointRadius: 0, borderWidth: 2 },
  ] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, interaction: { intersect: false, mode: "index" }, plugins: { legend: { labels: { color: tickColor, usePointStyle: true, boxWidth: 8 } }, tooltip: { backgroundColor: "#061820", padding: 12 } }, scales: { x: { grid: { display: false }, ticks: { color: tickColor } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } } } } };
  const yearlyConfig: ChartConfiguration = { type: "line", data: { labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"], datasets: [{ label: "Среднегодовой PM2.5", data: [58, 42, 50, 48, 46, 44, 43], borderColor: "#55BF52", backgroundColor: "rgba(85,191,82,.12)", fill: true, tension: .38, pointRadius: 4, pointBackgroundColor: "#55BF52" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tickColor, usePointStyle: true } }, tooltip: { backgroundColor: "#061820", padding: 12 } }, scales: { x: { grid: { display: false }, ticks: { color: tickColor } }, y: { min: 30, grid: { color: gridColor }, ticks: { color: tickColor } } } } };
  return (
    <section className="data-section dark-section reveal" id="air"><div className="section-shell">
      <p className="section-kicker mono"><span>02</span> КАЧЕСТВО ВОЗДУХА</p>
      <div className="data-row"><div className="data-copy"><h2>Зимой PM2.5<br />превышает норму<br />ВОЗ в <em>5–6 раз</em></h2><p>Алматы расположен в котловине у подножия гор. Температурные инверсии зимой задерживают загрязнение, создавая одну из самых острых экологических проблем региона.</p><div className="source-badge"><b>REAL DATA</b><span>IQAir · КазГидроМет</span></div></div><div className="chart-panel"><div className="chart-panel-head"><span className="mono">СРЕДНЕМЕСЯЧНЫЙ PM2.5 · 2024</span><b>μg/m³</b></div><div className="chart-wrap"><ChartCanvas config={airConfig} label="Среднемесячный уровень PM2.5 в Алматы" /></div></div></div>
      <div className="data-row reverse"><div className="chart-panel"><div className="chart-panel-head"><span className="mono">ДИНАМИКА · 2019–2025</span><b>−26%</b></div><div className="chart-wrap"><ChartCanvas config={yearlyConfig} label="Динамика среднегодового PM2.5" /></div></div><div className="data-copy compact"><h2>Тренд<br /><em>улучшается</em></h2><p>С 2019 года среднегодовой PM2.5 снижается. Исключение — 2020, когда COVID-локдаун резко сократил выбросы, но эффект был временным.</p></div></div>
    </div></section>
  );
}

function TransportSection() {
  const transportConfig: ChartConfiguration<"doughnut"> = { type: "doughnut", data: { labels: ["Личный автомобиль", "Общественный транспорт", "Пешком", "Велосипед", "Такси / райдшеринг"], datasets: [{ data: [45, 42, 8, 2, 3], backgroundColor: ["#29383d", "#55BF52", "#35BFCD", "#7b6bd6", "#d3a33d"], borderColor: "#fff", borderWidth: 4, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "67%", plugins: { legend: { position: "bottom", labels: { color: "#66736f", usePointStyle: true, padding: 16, font: { size: 10 } } }, tooltip: { backgroundColor: "#061820", padding: 12, callbacks: { label: (item) => ` ${item.label}: ${item.raw}%` } } } } };
  const ridershipConfig: ChartConfiguration = { type: "bar", data: { labels: months, datasets: [
    { label: "Автобус", data: [28, 27, 30, 32, 34, 31, 26, 25, 33, 35, 32, 29], backgroundColor: "#55BF52", borderRadius: 4 },
    { label: "Метро", data: [6, 5, 7, 7, 6, 7, 6, 5, 6, 7, 7, 6], backgroundColor: "#35BFCD", borderRadius: 4 },
    { label: "BRT", data: [2, 3, 2, 3, 4, 2, 2, 2, 4, 4, 3, 3], backgroundColor: "#7b6bd6", borderRadius: 4 },
  ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { legend: { labels: { color: "#72807d", usePointStyle: true } }, tooltip: { backgroundColor: "#061820", padding: 12 } }, scales: { x: { stacked: true, grid: { display: false }, ticks: { color: "#72807d" } }, y: { stacked: true, grid: { color: "rgba(6,24,32,.09)" }, ticks: { color: "#72807d" }, title: { display: true, text: "млн пассажиров", color: "#72807d" } } } } };
  return (
    <section className="data-section transport-section reveal" id="transport"><div className="section-shell">
      <p className="section-kicker mono"><span>03</span> ТРАНСПОРТ</p>
      <div className="data-row"><div className="data-copy"><h2><em>42%</em><br />на общественном<br />транспорте</h2><p>Почти половина поездок совершается на общественном транспорте. Но 45% по-прежнему приходится на личные автомобили — главный источник выбросов.</p><div className="source-badge"><b>REAL DATA</b><span>Акимат Алматы</span></div></div><div className="chart-panel"><div className="chart-panel-head"><span className="mono">СТРУКТУРА ПОЕЗДОК</span><b>100%</b></div><div className="chart-wrap donut"><ChartCanvas config={transportConfig} label="Распределение поездок по видам транспорта" /><span className="donut-label"><b>42%</b>общественный<br />транспорт</span></div></div></div>
      <div className="data-row reverse"><div className="chart-panel"><div className="chart-panel-head"><span className="mono">ПАССАЖИРОПОТОК · ПО МЕСЯЦАМ</span><b>+8%</b></div><div className="chart-wrap"><ChartCanvas config={ridershipConfig} label="Ежемесячный пассажиропоток" /></div></div><div className="data-copy compact"><h2>Пассажиро-<br />поток <em>растёт</em></h2><p>Автобусы перевозят ~30 млн пассажиров в месяц. Метро и BRT дополняют сеть. Летом нагрузка снижается на 15–20%.</p></div></div>
    </div></section>
  );
}

function DistrictsSection() {
  const districtConfig: ChartConfiguration = {
    type: "bar",
    data: {
      labels: districts.map((district) => district.name.replace("ский", ".")),
      datasets: [
        { label: "E", data: districts.map((district) => district.e), backgroundColor: "#55BF52", borderRadius: 5 },
        { label: "S", data: districts.map((district) => district.s), backgroundColor: "#35BFCD", borderRadius: 5 },
        { label: "G", data: districts.map((district) => district.g), backgroundColor: "#29383D", borderRadius: 5 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#65726e", usePointStyle: true } }, tooltip: { backgroundColor: "#061820", padding: 12 } },
      scales: { x: { grid: { display: false }, ticks: { color: "#65726e", font: { size: 9 } } }, y: { beginAtZero: true, max: 80, grid: { color: "rgba(6,24,32,.08)" }, ticks: { color: "#65726e" } } },
    },
  };
  return (
    <section className="districts-section reveal" id="districts"><div className="section-shell">
      <div className="section-heading"><div><p className="section-kicker mono"><span>04</span> ESG ПО РАЙОНАМ</p><h2>Один город.<br /><em>Разный прогресс.</em></h2></div><p>Социальные показатели лидируют, но экологическая устойчивость заметно различается между районами Алматы.</p></div>
      <div className="district-grid">
        {districts.map((district, index) => <article className="district-card" key={district.name} tabIndex={0} aria-label={`${district.name}: общий балл ${district.total}, E ${district.e}, S ${district.s}, G ${district.g}`}>
          <div className="district-head"><span className="mono">0{index + 1}</span><b>{district.total}</b></div><h3>{district.name}</h3>
          <div className="score-bars">
            <div><span className="mono">E · {district.e}</span><i><b style={{ width: `${district.e}%` }} /></i></div>
            <div><span className="mono">S · {district.s}</span><i><b style={{ width: `${district.s}%` }} /></i></div>
            <div><span className="mono">G · {district.g}</span><i><b style={{ width: `${district.g}%` }} /></i></div>
          </div>
        </article>)}
      </div>
      <div className="district-chart chart-panel"><div className="chart-panel-head"><span className="mono">СРАВНЕНИЕ E / S / G</span><b>8 РАЙОНОВ</b></div><div className="chart-wrap"><ChartCanvas config={districtConfig} label="Сравнение ESG-показателей районов Алматы" /></div></div>
    </div></section>
  );
}

function BehaviorSection() {
  const barrierConfig: ChartConfiguration = {
    type: "bar",
    data: { labels: ["Нет инфраструктуры", "Дорого", "Неудобно", "Не вижу смысла", "Нет информации"], datasets: [{ label: "% респондентов", data: [35, 28, 20, 10, 7], backgroundColor: ["#55BF52", "#70CB68", "#8BD67E", "#A6E094", "#C1EAAA"], borderRadius: 8, borderSkipped: false }] },
    options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#061820", padding: 12 } }, scales: { y: { grid: { display: false }, ticks: { color: "#65726e", font: { size: 10 } } }, x: { max: 40, grid: { color: "rgba(6,24,32,.08)" }, ticks: { color: "#65726e", callback: (value) => `${value}%` } } } },
  };
  return (
    <section className="behavior-section dark-section reveal" id="behavior"><div className="section-shell">
      <div className="behavior-heading"><p className="section-kicker mono"><span>05</span> ЭКОЛОГИЧЕСКОЕ ПОВЕДЕНИЕ</p><h2>Знают, но<br /><em>не делают</em></h2><p className="mono">Синтетический опрос N=800 по паттернам ПРООН</p></div>
      <div className="behavior-grid">{behaviors.map((item) => <article className="behavior-card" key={item.title}>
        <div className="behavior-card-top"><span className="mono">{item.code}</span><i>↗</i></div><h3>{item.title}</h3>
        <div className="behavior-numbers"><span><b>{item.aware}</b><small>знают</small></span><em>VS</em><span><b>{item.action}</b><small>делают</small></span></div>
        <div className="dual-bars" aria-label={`Осведомлены ${item.aware} процентов, действуют ${item.action} процентов`}><i><b style={{ width: `${item.aware}%` }} /></i><i><b style={{ width: `${item.action}%` }} /></i></div>
      </article>)}</div>
      <div className="barrier-row"><div className="chart-panel"><div className="chart-panel-head"><span className="mono">ПОЧЕМУ НЕ ДЕЙСТВУЮТ</span><b>N=800</b></div><div className="chart-wrap"><ChartCanvas config={barrierConfig} label="Основные барьеры экологического поведения" /></div></div><div className="data-copy"><h2>Главный барьер —<br /><em>инфраструктура</em></h2><p>35% респондентов указали отсутствие инфраструктуры как основную причину. Это управляемый фактор, который можно решить на уровне города.</p></div></div>
    </div></section>
  );
}

function AboutSection() {
  const profile = [["КУРС", "4"], ["ID СТУДЕНТА", "22B031601"], ["ПРОГРАММА", "Информационные Системы"], ["ТЕЛЕФОН", "+7 700 052 29 79"], ["ПРАКТИКА", "02.02.2026 – 27.03.2026"], ["ОРГАНИЗАЦИЯ", "ESG Campus"]];
  const stack = [["BACKEND", "Python · Flask · pandas"], ["FRONTEND", "HTML · CSS · Chart.js"], ["АНАЛИЗ", "pandas · matplotlib"], ["ДАННЫЕ", "JSON · Open Data"]];
  return (
    <section className="about-section reveal" id="about"><div className="section-shell">
      <p className="section-kicker mono"><span>06</span> О ПРОЕКТЕ</p>
      <div className="author-row"><div className="monogram" aria-hidden="true">ША</div><div><span className="mono">АВТОР ПРОЕКТА</span><h2>Абдуллаев<br /><em>Шахзод</em></h2></div></div>
      <div className="about-grid"><div className="profile-grid">{profile.map(([label, value]) => <div key={label}><span className="mono">{label}</span><b>{value}</b></div>)}</div><div className="stack-card"><p className="mono">ТЕХНОЛОГИЧЕСКИЙ СТЕК</p>{stack.map(([label, value]) => <div key={label}><span className="mono">{label}</span><b>{value}</b></div>)}</div></div>
      <div className="architecture"><div className="architecture-head"><p className="mono">АРХИТЕКТУРА ДАННЫХ</p><span>От источника до интерфейса</span></div><div className="flow"><div><span>01</span><b>Данные</b><small>JSON · Open Data</small></div><i>→</i><div><span>02</span><b>Анализ</b><small>pandas · matplotlib</small></div><i>→</i><div><span>03</span><b>Backend</b><small>Flask · REST API</small></div><i>→</i><div><span>04</span><b>Frontend</b><small>Chart.js · CSS</small></div></div></div>
    </div></section>
  );
}

function SourcesSection() {
  return (
    <section className="sources-section reveal" id="sources"><div className="section-shell">
      <div className="section-heading"><div><p className="section-kicker mono"><span>07</span> ИСТОЧНИКИ</p><h2>Данные,<br /><em>которым доверяют.</em></h2></div><p>Все первичные источники открыты для проверки. Ссылки ведут на официальные порталы и международные организации.</p></div>
      <div className="source-grid">{sources.map((source, index) => <a className="source-card" key={source.title} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${source.title}, открыть официальный источник в новой вкладке`}><div className="source-card-top"><span className="mono">{String(index + 1).padStart(2, "0")}</span><b className="mono">ПРОВЕРЕНО</b><i aria-hidden="true">↗</i></div><h3>{source.title}</h3><span className="source-domain mono">{source.domain}</span><p>{source.text}</p><div>ОТКРЫТЬ ОФИЦИАЛЬНЫЙ ИСТОЧНИК <span>↗</span></div></a>)}</div>
    </div></section>
  );
}

function Footer() {
  return <footer><div className="section-shell"><div className="footer-top"><div><a className="footer-wordmark" href="#hero">ESG <span>ALMATY</span></a><p>Мониторинг устойчивого развития<br />крупнейшего города Центральной Азии.</p></div><nav aria-label="Навигация в подвале">{navItems.slice(0, 4).map(([label, id]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav><div className="footer-author"><span className="mono">АВТОР · КБТУ · 2026</span><b>Абдуллаев Шахзод</b><a href="#hero">Наверх ↑</a></div></div><div className="footer-bottom mono"><span>© 2026 ESG ALMATY</span><span>EDUCATIONAL PROJECT · REAL DATA SOURCES</span></div></div></footer>;
}

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .08 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return <><Header /><main><Hero /><Introduction /><Metrics /><AirSection /><TransportSection /><DistrictsSection /><BehaviorSection /><AboutSection /><SourcesSection /></main><Footer /></>;
}
