"use client";

import { LanguageProvider, LanguageControls, useLanguage, localize } from "./language";
import Motion from "./motion";
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

const base_navItems = [
  ["Обзор", "hero"],
  ["О проекте", "about"],
  ["Воздух", "air"],
  ["Транспорт", "transport"],
  ["Районы", "districts"],
  ["Поведение", "behavior"],
  ["Источники", "sources"],
] as const;
const base_metrics = [
  { value: "2.2M", title: "Население", source: "Бюро статистики", icon: "◎" },
  { value: "112", title: "Средний AQI", source: "IQAir 2024", icon: "≋" },
  { value: "42%", title: "Общ. транспорт", source: "Акимат Алматы", icon: "↔" },
  { value: "6.8", unit: "м²", title: "Зелени / чел", source: "Городские данные", icon: "⌁" },
  { value: "8.5%", title: "Переработка", source: "Оценка", icon: "↻" },
  { value: "4.2", unit: "т", title: "CO₂ / чел", source: "Синтетическая оценка", icon: "△" },
  { value: "47/100", title: "ESG-индекс", source: "Композитный индекс", icon: "◫" },
];

const base_heroWords = ["ALMATY", "AIR", "MOBILITY", "DISTRICTS", "FUTURE"];
const base_months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const base_districts = [
  { name: "Алмалинский", total: 60, e: 52, s: 68, g: 61 },
  { name: "Бостандыкский", total: 56, e: 48, s: 62, g: 58 },
  { name: "Медеуский", total: 60, e: 55, s: 65, g: 60 },
  { name: "Ауэзовский", total: 43, e: 35, s: 45, g: 50 },
  { name: "Алатауский", total: 37, e: 30, s: 38, g: 42 },
  { name: "Турксибский", total: 41, e: 32, s: 42, g: 48 },
  { name: "Жетысуский", total: 46, e: 38, s: 48, g: 52 },
  { name: "Наурызбайский", total: 42, e: 42, s: 40, g: 45 },
];

const base_behaviors = [
  { title: "Сортировка отходов", aware: 72, action: 18, code: "01" },
  { title: "Экономия воды", aware: 85, action: 45, code: "02" },
  { title: "Общ. транспорт", aware: 68, action: 42, code: "03" },
  { title: "Энергосбережение", aware: 80, action: 38, code: "04" },
  { title: "Покупка эко-товаров", aware: 55, action: 12, code: "05" },
];

const base_sources = [
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
    base_navItems.forEach(([, id]) => {
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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chart = new ChartJS<TType>(canvasRef.current, reducedMotion ? ({...config, options: {...config.options, animation: false}} as ChartConfiguration<TType>) : config);
    return () => chart.destroy();
  }, [config]);
  return <canvas ref={canvasRef} role="img" aria-label={label} />;
}

function Header() {
const { t } = useLanguage();
const navItems = localize(base_navItems, t);

  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a
          className="wordmark mountain-wordmark"
          href="#hero"
          aria-label={t("ESG Almaty — наверх")}
      >
        <svg
            viewBox="0 0 86 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
          <path d="M3 34 24 14 33 22 49 5 82 34" />
          <path d="m16 23 8-9 8 8" />
          <path d="m39 16 10-11 10 10" />
          <path d="m30 34 19-20 10 12 8-5" />
        </svg>

        <span>ESG ALMATY</span>
      </a>
      <button className="menu-button" aria-label={open ? t("Закрыть меню") : t("Открыть меню")} aria-expanded={open} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      <nav className={open ? "nav-open" : ""} aria-label={t("Основная навигация")}>
        {navItems.map(([label, id]) => <a key={id} href={`#${id}`} className={active === id ? "active" : ""} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <LanguageControls /><a className="header-score" href="#numbers"><span>ESG</span> 47</a>
    </header>
  );
}

function Hero() {
  const { language, t } = useLanguage();

  const heroWords = localize(base_heroWords, t);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setWordIndex((index) => (index + 1) % base_heroWords.length);
    }, 2100);

    return () => window.clearInterval(timer);
  }, []);

  const copy = {
    ru: {
      eyebrow: "ГОРОД · ДАННЫЕ · БУДУЩЕЕ",
      city: "Алматы.",
      title: "Город, который можно понять.",
      description:
          "Исследуйте экологию, транспорт и качество городской среды через данные.",
      analytics: "Исследовать город",
      about: "О проекте",
      caption:
          "Более зелёный, комфортный и открытый город для будущих поколений.",
    },
    en: {
      eyebrow: "CITY · DATA · FUTURE",
      city: "Almaty.",
      title: "A city you can understand.",
      description:
          "Explore the environment, transport and quality of urban life through data.",
      analytics: "Explore the city",
      about: "About the project",
      caption:
          "A greener, more welcoming city for future generations.",
    },
    kk: {
      eyebrow: "ҚАЛА · ДЕРЕКТЕР · БОЛАШАҚ",
      city: "Алматы.",
      title: "Түсінуге болатын қала.",
      description:
          "Экологияны, көлікті және қалалық ортаның сапасын деректер арқылы зерттеңіз.",
      analytics: "Қаланы зерттеу",
      about: "Жоба туралы",
      caption:
          "Болашақ ұрпақ үшін жасыл, жайлы және ашық қала.",
    },
  }[language];

  return (
      <section className="hero photo-hero" id="hero">
        <div className="photo-hero-background" aria-hidden="true" />

        <div className="photo-hero-content">
          <p className="photo-hero-eyebrow mono">
            {copy.eyebrow}
          </p>

          <h1 className="photo-hero-title">
            <span>{copy.city}</span>
            {copy.title}
          </h1>

          <p className="photo-hero-description">
            {copy.description}
          </p>

          <div className="hero-actions">
            <a className="primary-action" href="#numbers">
              {copy.analytics}
              <span aria-hidden="true">↗</span>
            </a>

            <a className="secondary-action" href="#about">
              {copy.about}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <p className="photo-hero-topic mono" aria-hidden="true">
            ESG /
            <span key={`${language}-${wordIndex}`}>
            {heroWords[wordIndex]}
          </span>
          </p>
        </div>

        <div className="photo-hero-caption">
          <span className="photo-hero-caption-dot" aria-hidden="true" />
          <p>{copy.caption}</p>
        </div>
      </section>
  );
}
function OverviewTopics() {
  const { language } = useLanguage();

  const copy = {
    ru: {
      label: "Направления исследования",
      cards: [
        {
          title: "Качество воздуха",
          text: "Сезонность, динамика и факторы загрязнения воздуха Алматы.",
          action: "Исследовать воздух",
        },
        {
          title: "Городская мобильность",
          text: "Как передвигается город и меняется пассажиропоток.",
          action: "Изучить транспорт",
        },
        {
          title: "Развитие районов",
          text: "Сравнение районов по экологическим и социальным показателям.",
          action: "Сравнить районы",
        },
      ],
    },
    en: {
      label: "Explore the topics",
      cards: [
        {
          title: "Air quality",
          text: "Seasonal patterns, trends and factors affecting Almaty's air.",
          action: "Explore air quality",
        },
        {
          title: "Urban mobility",
          text: "How the city moves and how passenger traffic changes.",
          action: "Explore transport",
        },
        {
          title: "District development",
          text: "Compare environmental and social indicators across districts.",
          action: "Compare districts",
        },
      ],
    },
    kk: {
      label: "Зерттеу бағыттары",
      cards: [
        {
          title: "Ауа сапасы",
          text: "Алматы ауасының маусымдық өзгерістері мен ластану факторлары.",
          action: "Ауа сапасын зерттеу",
        },
        {
          title: "Қалалық ұтқырлық",
          text: "Қала тұрғындарының қозғалысы және жолаушылар ағынының өзгеруі.",
          action: "Көлікті зерттеу",
        },
        {
          title: "Аудандардың дамуы",
          text: "Аудандардың экологиялық және әлеуметтік көрсеткіштерін салыстыру.",
          action: "Аудандарды салыстыру",
        },
      ],
    },
  }[language];

  const destinations = ["air", "transport", "districts"];

  const icons = [
    <>
      <path d="M3 12h17a4 4 0 1 0-4-4" />
      <path d="M3 18h24a4 4 0 1 1-4 4" />
      <path d="M3 24h10" />
    </>,
    <>
      <rect x="7" y="4" width="20" height="23" rx="5" />
      <path d="M7 17h20M11 9h12M11 27v3M23 27v3" />
      <path d="M11 22h1M22 22h1" />
    </>,
    <>
      <path d="M5 29V15h9v14M14 29V5h12v24M3 29h27" />
      <path d="M9 19v2M9 24v2M18 10h1M22 10h1" />
      <path d="M18 15h1M22 15h1M18 20h1M22 20h1" />
    </>,
  ];

  return (
      <section className="overview-topics" aria-label={copy.label}>
        <div className="section-shell overview-topic-grid">
          {copy.cards.map((card, index) => (
              <a
                  key={destinations[index]}
                  href={`#${destinations[index]}`}
                  className={`overview-topic-card topic-${destinations[index]}`}
              >
                <div className="overview-topic-photo" aria-hidden="true" />

                <div className="overview-topic-heading">
                  <svg
                      viewBox="0 0 34 34"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                  >
                    {icons[index]}
                  </svg>

                  <h2>{card.title}</h2>

                  <span className="overview-topic-arrow" aria-hidden="true">
                ↗
              </span>
                </div>

                <p>{card.text}</p>

                <span className="overview-topic-action">
              {card.action}
                  <span aria-hidden="true">→</span>
            </span>
              </a>
          ))}
        </div>
      </section>
  );
}

function OverviewAnalytics() {
  const { language, t } = useLanguage();
  const months = localize(base_months, t);
  const districts = localize(base_districts, t);
  const [districtIndex, setDistrictIndex] = useState(0);

  const copy = {
    ru: {
      air: "Качество воздуха в Алматы",
      subtitle: "Среднемесячный PM2.5 · 2024",
      districts: "Показатели районов",
      select: "Выберите район",
      score: "Общий ESG-индекс",
      environment: "Экология",
      social: "Социальная среда",
      governance: "Управление",
      details: "Подробнее",
      note: "Данные проекта · Не онлайн-мониторинг",
    },
    en: {
      air: "Air quality in Almaty",
      subtitle: "Monthly average PM2.5 · 2024",
      districts: "District indicators",
      select: "Choose a district",
      score: "Overall ESG index",
      environment: "Environment",
      social: "Social conditions",
      governance: "Governance",
      details: "Explore",
      note: "Project data · Not live monitoring",
    },
    kk: {
      air: "Алматыдағы ауа сапасы",
      subtitle: "Айлық орташа PM2.5 · 2024",
      districts: "Аудан көрсеткіштері",
      select: "Ауданды таңдаңыз",
      score: "Жалпы ESG индексі",
      environment: "Экология",
      social: "Әлеуметтік орта",
      governance: "Басқару",
      details: "Толығырақ",
      note: "Жоба деректері · Онлайн мониторинг емес",
    },
  }[language];

  const district = districts[districtIndex];

  const airConfig: ChartConfiguration<"line"> = {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "PM2.5 μg/m³",
          data: [85, 78, 52, 30, 18, 13, 11, 14, 22, 45, 68, 90],
          borderColor: "#b1e0b7",
          backgroundColor: "rgba(146, 207, 158, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: "#c1ebc7",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#173a28",
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#afc7b7",
            font: { size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(188, 221, 199, 0.1)",
          },
          ticks: {
            color: "#afc7b7",
            font: { size: 10 },
          },
        },
      },
    },
  };

  const indicators = [
    { label: copy.environment, value: district.e, key: "e" },
    { label: copy.social, value: district.s, key: "s" },
    { label: copy.governance, value: district.g, key: "g" },
  ];

  return (
      <section className="overview-analytics">
        <div className="section-shell overview-analytics-grid">
          <article className="overview-analytics-panel">
            <div className="overview-analytics-heading">
              <div>
                <h2>{copy.air}</h2>
                <p>{copy.subtitle}</p>
              </div>

              <a href="#air">
                {copy.details}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="overview-preview-chart">
              <ChartCanvas
                  config={airConfig}
                  label={`${copy.air}. ${copy.subtitle}. μg/m³`}
              />
            </div>

            <p className="overview-analytics-note">
              {copy.note}
            </p>
          </article>

          <article className="overview-analytics-panel">
            <div className="overview-analytics-heading">
              <h2>{copy.districts}</h2>

              <a href="#districts">
                {copy.details}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <label className="overview-district-select">
              <span>{copy.select}</span>

              <select
                  value={districtIndex}
                  onChange={(event) =>
                      setDistrictIndex(Number(event.target.value))
                  }
              >
                {districts.map((item, index) => (
                    <option value={index} key={index}>
                      {item.name}
                    </option>
                ))}
              </select>
            </label>

            <div className="overview-district-summary">
              <div
                  className="overview-score-ring"
                  style={{
                    background: `conic-gradient(
                  #a6dfb6 ${district.total}%,
                  #294535 0
                )`,
                  }}
                  aria-label={`${copy.score}: ${district.total}/100`}
              >
                <div aria-hidden="true">
                  <strong>{district.total}</strong>
                  <span>/ 100</span>
                </div>
              </div>

              <div className="overview-district-values">
                {indicators.map((item) => (
                    <div key={item.key}>
                      <span>{item.label}</span>
                      <b>{item.value}</b>
                    </div>
                ))}
              </div>
            </div>

            <p className="overview-analytics-note">
              {copy.score} · {copy.note}
            </p>
          </article>
        </div>
      </section>
  );
}

function Introduction() {
  const { language } = useLanguage();

  const copy = {
    ru: {
      eyebrow: "УСТОЙЧИВЫЙ АЛМАТЫ СЕГОДНЯ И ЗАВТРА",
      title: "Данные о городе.",
      accent: "Смысл для людей.",
      description:
          "ESG ALMATY — аналитический проект об устойчивом развитии Алматы. Мы объединяем данные об экологии, городской мобильности, развитии районов и экопривычках, чтобы помочь лучше понять город и принимать осознанные решения.",
      note: "Больше данных. Больше возможностей для города.",
      cards: [
        {
          title: "Экология",
          text: "Изучаем качество воздуха и экологические показатели городской среды.",
        },
        {
          title: "Городская среда",
          text: "Анализируем мобильность, доступность и различия между районами.",
        },
        {
          title: "Открытые данные",
          text: "Объединяем источники и превращаем данные в понятные визуализации.",
        },
      ],
    },
    en: {
      eyebrow: "A SUSTAINABLE ALMATY, TODAY AND TOMORROW",
      title: "City data.",
      accent: "Human meaning.",
      description:
          "ESG ALMATY is an analytical project about Almaty's sustainable development. We bring together data on the environment, urban mobility, districts and everyday eco habits to help people understand the city and make informed decisions.",
      note: "More data. More possibilities for the city.",
      cards: [
        {
          title: "Environment",
          text: "Explore air quality and environmental indicators across the city.",
        },
        {
          title: "Urban life",
          text: "Understand mobility, accessibility and differences between districts.",
        },
        {
          title: "Open data",
          text: "Connect sources and turn data into clear visual explanations.",
        },
      ],
    },
    kk: {
      eyebrow: "БҮГІНГІ ЖӘНЕ ЕРТЕҢГІ ТҰРАҚТЫ АЛМАТЫ",
      title: "Қала туралы деректер.",
      accent: "Адамдар үшін мағына.",
      description:
          "ESG ALMATY — Алматының тұрақты дамуы туралы талдамалық жоба. Қаланы жақсырақ түсінуге және саналы шешім қабылдауға көмектесу үшін экология, қалалық ұтқырлық, аудандардың дамуы мен экологиялық әдеттер туралы деректерді біріктіреміз.",
      note: "Көбірек дерек. Қала үшін көбірек мүмкіндік.",
      cards: [
        {
          title: "Экология",
          text: "Ауа сапасы мен қалалық ортаның экологиялық көрсеткіштерін зерттейміз.",
        },
        {
          title: "Қалалық орта",
          text: "Ұтқырлықты, қолжетімділікті және аудандардың айырмашылықтарын талдаймыз.",
        },
        {
          title: "Ашық деректер",
          text: "Дереккөздерді біріктіріп, түсінікті визуализациялар жасаймыз.",
        },
      ],
    },
  }[language];

  const links = ["air", "transport", "sources"];
  const symbols = ["E", "S", "G"];

  return (
      <section className="about-introduction reveal" id="about">
        <div className="about-panorama">
          <div className="section-shell">
            <div className="about-panorama-copy">
              <p className="about-eyebrow mono">{copy.eyebrow}</p>

              <h2>
                {copy.title}
                <span>{copy.accent}</span>
              </h2>

              <p className="about-description">
                {copy.description}
              </p>

              <p className="about-note mono">{copy.note}</p>
            </div>
          </div>
        </div>

        <div className="section-shell about-pillar-grid">
          {copy.cards.map((card, index) => (
              <a
                  key={links[index]}
                  href={`#${links[index]}`}
                  className={`about-pillar about-pillar-${index + 1}`}
              >
            <span className="about-pillar-symbol mono">
              {symbols[index]}
            </span>

                <h3>{card.title}</h3>
                <p>{card.text}</p>

                <span className="about-pillar-arrow" aria-hidden="true">
              →
            </span>
              </a>
          ))}
        </div>
      </section>
  );
}

function Metrics() {
const { t } = useLanguage();
const metrics = localize(base_metrics, t);

  return (
    <section className="metrics-section reveal" id="numbers"><div className="section-shell">
      <div className="section-heading"><div><p className="section-kicker mono"><span>01</span> {t("КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ")}</p><h2>{t("Город")}<br /><em>{t("одним взглядом")}</em></h2></div><p>{t("Семь показателей дают быстрый срез устойчивого развития Алматы — от качества воздуха до итогового ESG-индекса.")}</p></div>
      <div className="metric-grid">{metrics.map((metric, index) => <article className={`metric-card ${index === metrics.length - 1 ? "score-card" : ""}`} key={metric.title}><div className="metric-top"><span className="metric-icon" aria-hidden="true">{metric.icon}</span><span className="mono">0{index + 1}</span></div><div><div className="metric-value">{metric.value}<small>{metric.unit}</small></div><h3>{metric.title}</h3></div><p className="mono">{metric.source}</p></article>)}</div>
    </div></section>
  );
}

function AirFactors() {
  const { language } = useLanguage();

  const copy = {
    ru: {
      title: "Что влияет на воздух?",
      subtitle: "Основные факторы загрязнения в Алматы",
      note: "Качественное объяснение · Доли источников не рассчитаны",
      factors: [
        {
          title: "Отопление",
          text: "Сжигание топлива для отопления может увеличивать загрязнение в холодный период.",
        },
        {
          title: "Транспорт",
          text: "Автомобильные выбросы влияют на качество воздуха, особенно вдоль загруженных дорог.",
        },
        {
          title: "Погодные условия",
          text: "Слабый ветер и температурные инверсии затрудняют рассеивание загрязняющих веществ.",
        },
      ],
      action: "Посмотреть источники",
    },
    en: {
      title: "What affects the air?",
      subtitle: "Key factors behind air pollution in Almaty",
      note: "Qualitative explanation · Source shares are not calculated",
      factors: [
        {
          title: "Heating",
          text: "Burning fuel for heating can increase pollution during colder months.",
        },
        {
          title: "Transport",
          text: "Vehicle emissions affect air quality, particularly along busy roads.",
        },
        {
          title: "Weather conditions",
          text: "Low wind speeds and temperature inversions limit the dispersion of pollutants.",
        },
      ],
      action: "Explore the sources",
    },
    kk: {
      title: "Ауа сапасына не әсер етеді?",
      subtitle: "Алматыдағы ауа ластануының негізгі факторлары",
      note: "Сапалық түсіндірме · Ластану көздерінің үлесі есептелмеген",
      factors: [
        {
          title: "Жылыту",
          text: "Жылыту үшін отын жағу суық мезгілде ауаның ластануын арттыруы мүмкін.",
        },
        {
          title: "Көлік",
          text: "Автокөлік шығарындылары, әсіресе көлік қозғалысы көп жолдарда, ауа сапасына әсер етеді.",
        },
        {
          title: "Ауа райы",
          text: "Әлсіз жел мен температуралық инверсиялар ластаушы заттардың таралуын қиындатады.",
        },
      ],
      action: "Дереккөздерді қарау",
    },
  }[language];

  const icons = [
    <>
      <path d="m4 11 8-7 8 7" />
      <path d="M6 10v10h12V10M10 20v-6h4v6" />
    </>,
    <>
      <path d="m5 9 2-5h10l2 5" />
      <rect x="3" y="9" width="18" height="9" rx="2" />
      <path d="M6 18v3M18 18v3M6 13h2M16 13h2" />
    </>,
    <>
      <path d="M3 10h12a3 3 0 1 0-3-3" />
      <path d="M3 14h15a3 3 0 1 1-3 3" />
      <path d="M3 18h5" />
    </>,
  ];

  return (
      <article className="air-factors">
        <div className="air-factors-content">
          <h3>{copy.title}</h3>
          <p className="air-factors-subtitle">{copy.subtitle}</p>

          <div className="air-factors-list">
            {copy.factors.map((factor, index) => (
                <div className="air-factor" key={index}>
              <span className="air-factor-icon" aria-hidden="true">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                  {icons[index]}
                </svg>
              </span>

                  <div>
                    <h4>{factor.title}</h4>
                    <p>{factor.text}</p>
                  </div>
                </div>
            ))}
          </div>

          <p className="air-factors-note">{copy.note}</p>

          <a className="air-factors-link" href="#sources">
            {copy.action}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </article>
  );
}

function AirSection() {
  const { language, t } = useLanguage();

  const airCopy = {
    ru: {
      eyebrow: "ЧИСТЫЙ ВОЗДУХ — ЗДОРОВЫЙ ГОРОД",
      title: "Чем дышит Алматы?",
      subtitle: "Сезонность, динамика и изменения качества воздуха.",
      description:
          "Исследуйте, как меняется загрязнение в течение года и какие тенденции видны в исторических данных.",
      note: "Учебная аналитика · Исторические данные проекта",
    },
    en: {
      eyebrow: "CLEAN AIR — A HEALTHIER CITY",
      title: "What does Almaty breathe?",
      subtitle: "Seasonal patterns, trends and changes in air quality.",
      description:
          "Explore how pollution changes throughout the year and discover trends in the project's historical data.",
      note: "Educational analysis · Historical project data",
    },
    kk: {
      eyebrow: "ТАЗА АУА — САЛАМАТТЫ ҚАЛА",
      title: "Алматы қандай ауамен тыныстайды?",
      subtitle: "Ауа сапасының маусымдық өзгерістері мен динамикасы.",
      description:
          "Ластану деңгейінің жыл бойы қалай өзгеретінін және тарихи деректердегі үрдістерді зерттеңіз.",
      note: "Оқу талдауы · Жобаның тарихи деректері",
    },
  }[language];const months = localize(base_months, t);

  const gridColor = "rgba(188, 221, 199, 0.12)";
  const tickColor = "#b8cbbf";
  const airConfig: ChartConfiguration = { type: "bar", data: { labels: months, datasets: [
        {
          label: "PM2.5 μg/m³",
          data: [85, 78, 52, 30, 18, 13, 11, 14, 22, 45, 68, 90],
          backgroundColor: months.map((_, i) =>
              i > 4 && i < 8
                  ? "rgba(148, 215, 174, 0.85)"
                  : "rgba(237, 183, 103, 0.85)"
          ),
          borderRadius: 7,
          borderSkipped: false,
        },
    { type: "line", label: t("Норма ВОЗ"), data: Array(12).fill(15), borderColor: "#df655e", borderDash: [7, 7], pointRadius: 0, borderWidth: 2 },
  ] }, options: { responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, interaction: { intersect: false, mode: "index" }, plugins: { legend: { labels: { color: tickColor, usePointStyle: true, boxWidth: 8 } }, tooltip: { backgroundColor: "#061820", padding: 12 } }, scales: { x: { grid: { display: false }, ticks: { color: tickColor } }, y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } } } } };
  const yearlyConfig: ChartConfiguration = { type: "line", data: { labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"], datasets: [{ label: t("Среднегодовой PM2.5"), data: [58, 42, 50, 48, 46, 44, 43], borderColor: "#a9dfbb",
        backgroundColor: "rgba(139, 205, 161, 0.18)",
        pointBackgroundColor: "#c2edcd",
        pointRadius: 4, }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tickColor, usePointStyle: true } }, tooltip: { backgroundColor: "#061820", padding: 12 } }, scales: { x: { grid: { display: false }, ticks: { color: tickColor } }, y: { min: 30, grid: { color: gridColor }, ticks: { color: tickColor } } } } };
  return (
      <section
          className="data-section dark-section reveal air-reference"
          id="air"
      >
        <div className="air-reference-hero">
          <div className="section-shell">
            <div className="air-reference-copy">
              <p className="air-reference-eyebrow mono">
                {airCopy.eyebrow}
              </p>

              <h2>{airCopy.title}</h2>

              <p className="air-reference-subtitle">
                {airCopy.subtitle}
              </p>

              <p className="air-reference-description">
                {airCopy.description}
              </p>

              <span className="air-reference-note">
          <span aria-hidden="true">ⓘ</span>
                {airCopy.note}
        </span>
            </div>
          </div>
        </div>

        <div className="section-shell">
      <p className="section-kicker mono"><span>02</span> {t("КАЧЕСТВО ВОЗДУХА")}</p>
      <div className="data-row"><div className="data-copy"><h2>{t("Зимой PM2.5")}<br />{t("превышает норму")}<br />{t("ВОЗ в")} <em>{t("5–6 раз")}</em></h2><p>{t("Алматы расположен в котловине у подножия гор. Температурные инверсии зимой задерживают загрязнение, создавая одну из самых острых экологических проблем региона.")}</p><div className="source-badge"><b>{t("Источник данных")}</b><span>{t("IQAir · КазГидроМет")}</span></div></div><div className="chart-panel"><div className="chart-panel-head"><span className="mono">{t("СРЕДНЕМЕСЯЧНЫЙ PM2.5 · 2024")}</span><b>μg/m³</b></div><div className="chart-wrap"><ChartCanvas config={airConfig} label={t("Среднемесячный уровень PM2.5 в Алматы")} /></div></div></div>
      <div className="data-row reverse"><div className="chart-panel"><div className="chart-panel-head"><span className="mono">{t("ДИНАМИКА · 2019–2025")}</span><b>−26%</b></div><div className="chart-wrap"><ChartCanvas config={yearlyConfig} label={t("Динамика среднегодового PM2.5")} /></div></div><div className="data-copy compact"><h2>{t("Тренд")}<br /><em>{t("улучшается")}</em></h2><p>{t("С 2019 года среднегодовой PM2.5 снижается. Исключение — 2020, когда COVID-локдаун резко сократил выбросы, но эффект был временным.")}</p></div></div>
          <AirFactors />
        </div></section>
  );
}

function MobilityDetails() {
  const { language } = useLanguage();

  const copy = {
    ru: {
      label: "Направления городской мобильности",
      cards: [
        {
          title: "Удобные пересадки",
          text: "Связанные маршруты и понятная информация помогают планировать поездки с пересадками.",
          action: "Посмотреть источники",
        },
        {
          title: "Доступность остановок",
          text: "Безопасные подходы и удобные остановки делают общественный транспорт доступнее.",
          action: "Изучить районы",
        },
        {
          title: "Устойчивая мобильность",
          text: "Общественный транспорт, пешие и велосипедные поездки расширяют выбор городских маршрутов.",
          action: "Изучить экопривычки",
        },
      ],
    },
    en: {
      label: "Urban mobility priorities",
      cards: [
        {
          title: "Convenient connections",
          text: "Connected routes and clear information help people plan journeys with transfers.",
          action: "Explore sources",
        },
        {
          title: "Accessible stops",
          text: "Safe approaches and convenient stops make public transport more accessible.",
          action: "Explore districts",
        },
        {
          title: "Sustainable mobility",
          text: "Public transport, walking and cycling expand the choice of urban routes.",
          action: "Explore eco habits",
        },
      ],
    },
    kk: {
      label: "Қалалық ұтқырлық бағыттары",
      cards: [
        {
          title: "Ыңғайлы ауысып міну",
          text: "Байланысқан маршруттар мен түсінікті ақпарат ауысып мінетін сапарларды жоспарлауға көмектеседі.",
          action: "Дереккөздерді қарау",
        },
        {
          title: "Қолжетімді аялдамалар",
          text: "Қауіпсіз жаяу жолдар мен ыңғайлы аялдамалар қоғамдық көліктің қолжетімділігін арттырады.",
          action: "Аудандарды зерттеу",
        },
        {
          title: "Тұрақты ұтқырлық",
          text: "Қоғамдық көлік, жаяу жүру және велосипед қалалық маршруттарды таңдау мүмкіндігін кеңейтеді.",
          action: "Экоәдеттерді зерттеу",
        },
      ],
    },
  }[language];

  const destinations = ["sources", "districts", "behavior"];
  const symbols = ["↔", "◎", "↗"];

  return (
      <div
          className="mobility-detail-grid"
          role="group"
          aria-label={copy.label}
      >
        {copy.cards.map((card, index) => (
            <a
                className={`mobility-detail-card mobility-detail-${index + 1}`}
                href={`#${destinations[index]}`}
                key={destinations[index]}
            >
              <div className="mobility-detail-photo" aria-hidden="true" />

              <div className="mobility-detail-body">
                <div className="mobility-detail-heading">
                  <span aria-hidden="true">{symbols[index]}</span>
                  <h3>{card.title}</h3>
                </div>

                <p>{card.text}</p>

                <span className="mobility-detail-link">
              {card.action}
                  <span aria-hidden="true">→</span>
            </span>
              </div>
            </a>
        ))}
      </div>
  );
}

function TransportSection() {
  const { language, t } = useLanguage();
  const months = localize(base_months, t);

  const copy = {
    ru: {
      eyebrow: "УСТОЙЧИВЫЙ ГОРОД",
      title: "Город в движении",
      subtitle:
          "Как передвигаются жители и меняется пассажиропоток",
      description:
          "Исследуем общественный транспорт, городские поездки и сезонные изменения нагрузки.",
      note: "Исторические данные проекта · Не онлайн-мониторинг",
      public: "Общественный транспорт",
      car: "Личный автомобиль",
      walking: "Пешие поездки",
      share: "доля поездок в данных проекта",
      modes: "Как передвигаются жители",
      monthly: "Пассажиропоток по месяцам",
      trips: "поездок",
    },
    en: {
      eyebrow: "A SUSTAINABLE CITY",
      title: "A city in motion",
      subtitle:
          "How residents travel and passenger traffic changes",
      description:
          "Explore public transport, urban travel and seasonal changes in demand.",
      note: "Historical project data · Not live monitoring",
      public: "Public transport",
      car: "Private car",
      walking: "Walking",
      share: "share of trips in the project data",
      modes: "How residents travel",
      monthly: "Monthly passenger traffic",
      trips: "of trips",
    },
    kk: {
      eyebrow: "ТҰРАҚТЫ ҚАЛА",
      title: "Қозғалыстағы қала",
      subtitle:
          "Тұрғындар қалай қатынайды және жолаушылар ағыны қалай өзгереді",
      description:
          "Қоғамдық көлікті, қалалық сапарларды және маусымдық жүктеме өзгерістерін зерттеңіз.",
      note: "Жобаның тарихи деректері · Онлайн мониторинг емес",
      public: "Қоғамдық көлік",
      car: "Жеке автокөлік",
      walking: "Жаяу сапарлар",
      share: "жоба деректеріндегі сапарлар үлесі",
      modes: "Тұрғындар қалай қатынайды",
      monthly: "Ай сайынғы жолаушылар ағыны",
      trips: "сапарлар",
    },
  }[language];

  const shares = [45, 42, 8, 2, 3];

  const transportConfig: ChartConfiguration<"doughnut"> = {
    type: "doughnut",
    data: {
      labels: [
        t("Личный автомобиль"),
        t("Общественный транспорт"),
        t("Пешком"),
        t("Велосипед"),
        t("Такси / райдшеринг"),
      ],
      datasets: [
        {
          data: shares,
          backgroundColor: [
            "#eee6cb",
            "#78bd8c",
            "#b2dfc3",
            "#f2bf69",
            "#718d7b",
          ],
          borderColor: "#0c2419",
          borderWidth: 4,
          hoverOffset: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#c8d9ce",
            usePointStyle: true,
            padding: 18,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "#173a28",
          padding: 12,
          callbacks: {
            label: (item) => `${item.label}: ${item.raw}%`,
          },
        },
      },
    },
  };

  const ridershipConfig: ChartConfiguration<"bar"> = {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: t("Автобус"),
          data: [28, 27, 30, 32, 34, 31, 26, 25, 33, 35, 32, 29],
          backgroundColor: "#78bd8c",
          borderRadius: 3,
        },
        {
          label: t("Метро"),
          data: [6, 5, 7, 7, 6, 7, 6, 5, 6, 7, 7, 6],
          backgroundColor: "#efbc68",
          borderRadius: 3,
        },
        {
          label: "BRT",
          data: [2, 3, 2, 3, 4, 2, 2, 2, 4, 4, 3, 3],
          backgroundColor: "#b8d9c1",
          borderRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          labels: {
            color: "#c8d9ce",
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "#173a28",
          padding: 12,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: "#b8cbbf" },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: "rgba(188, 221, 199, 0.1)" },
          ticks: { color: "#b8cbbf" },
          title: {
            display: true,
            text: t("млн пассажиров"),
            color: "#b8cbbf",
          },
        },
      },
    },
  };

  const stats = [
    { value: shares[1], title: copy.public, symbol: "↔" },
    { value: shares[0], title: copy.car, symbol: "→" },
    { value: shares[2], title: copy.walking, symbol: "↗" },
  ];

  return (
      <section
          className="mobility-reference reveal"
          id="transport"
      >
        <div className="section-shell">
          <div className="mobility-hero">
            <div className="mobility-hero-copy">
              <p className="mobility-eyebrow mono">
                {copy.eyebrow}
              </p>

              <h2>{copy.title}</h2>

              <h3>{copy.subtitle}</h3>

              <p className="mobility-description">
                {copy.description}
              </p>

              <span className="mobility-note">
              {copy.note}
            </span>
            </div>
          </div>

          <div className="mobility-stats">
            {stats.map((stat) => (
                <article className="mobility-stat" key={stat.title}>
              <span
                  className="mobility-stat-icon"
                  aria-hidden="true"
              >
                {stat.symbol}
              </span>

                  <div>
                    <h3>{stat.title}</h3>
                    <strong>{stat.value}%</strong>
                    <p>{copy.share}</p>
                  </div>
                </article>
            ))}
          </div>

          <div className="mobility-charts">
            <article className="chart-panel">
              <h3 className="mobility-panel-title">
                {copy.modes}
              </h3>

              <div className="chart-wrap mobility-donut">
                <ChartCanvas
                    config={transportConfig}
                    label={t("Распределение поездок по видам транспорта")}
                />

                <div className="mobility-donut-center" aria-hidden="true">
                  <strong>
                    {shares.reduce((sum, value) => sum + value, 0)}%
                  </strong>
                  <span>{copy.trips}</span>
                </div>
              </div>
            </article>

            <article className="chart-panel">
              <h3 className="mobility-panel-title">
                {copy.monthly}
              </h3>

              <div className="chart-wrap">
                <ChartCanvas
                    config={ridershipConfig}
                    label={t("Ежемесячный пассажиропоток")}
                />
              </div>
            </article>
          </div>

          <MobilityDetails />
        </div>
      </section>
  );
}

function DistrictMap() {
  const { language, t } = useLanguage();
  const districts = localize(base_districts, t);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const copy = {
    ru: {
      title: "Районы Алматы",
      note: "Схема для сравнения · Не географические границы",
      instruction: "Выберите район на схеме",
      total: "Общий ESG-индекс",
      environment: "Экология",
      social: "Социальная среда",
      governance: "Управление",
      scale: "Шкала проекта: 0–100",
    },
    en: {
      title: "Almaty districts",
      note: "Comparison diagram · Not geographic boundaries",
      instruction: "Select a district on the diagram",
      total: "Overall ESG index",
      environment: "Environment",
      social: "Social conditions",
      governance: "Governance",
      scale: "Project scale: 0–100",
    },
    kk: {
      title: "Алматы аудандары",
      note: "Салыстыру сызбасы · Географиялық шекаралар емес",
      instruction: "Сызбадан ауданды таңдаңыз",
      total: "Жалпы ESG индексі",
      environment: "Экология",
      social: "Әлеуметтік орта",
      governance: "Басқару",
      scale: "Жоба шкаласы: 0–100",
    },
  }[language];

  // Indices correspond to the existing base_districts array.
  const shapes = [
    {
      index: 0,
      points: "250,190 370,190 390,275 280,310 225,255",
      x: 307,
      y: 245,
    },
    {
      index: 1,
      points: "280,310 390,275 455,345 400,445 270,425 225,355",
      x: 340,
      y: 365,
    },
    {
      index: 2,
      points: "455,345 545,320 590,410 525,485 400,445",
      x: 500,
      y: 410,
    },
    {
      index: 3,
      points: "140,210 250,190 225,255 280,310 225,355 120,315 95,260",
      x: 175,
      y: 277,
    },
    {
      index: 4,
      points: "175,85 290,60 345,125 370,190 250,190 140,210 125,145",
      x: 245,
      y: 143,
    },
    {
      index: 5,
      points: "445,90 545,125 590,220 545,320 455,345 390,275 370,190",
      x: 490,
      y: 225,
    },
    {
      index: 6,
      points: "345,125 365,55 445,90 370,190",
      x: 388,
      y: 125,
    },
    {
      index: 7,
      points: "120,315 225,355 270,425 200,465 80,435 45,370",
      x: 150,
      y: 398,
    },
  ];

  const selected = districts[selectedIndex];

  const indicators = [
    { label: copy.environment, value: selected.e, key: "e" },
    { label: copy.social, value: selected.s, key: "s" },
    { label: copy.governance, value: selected.g, key: "g" },
  ];

  return (
      <div className="district-map-panel">
        <div className="district-map-heading">
          <h3>{copy.title}</h3>
          <p>{copy.note}</p>
        </div>

        <div className="district-map-layout">
          <div className="district-map-canvas">
            <p className="district-map-instruction">
              {copy.instruction}
            </p>

            <svg
                viewBox="0 0 650 520"
                className="district-map-svg"
                role="group"
                aria-label={`${copy.title}. ${copy.note}`}
            >
              {shapes.map((shape) => {
                const district = districts[shape.index];
                const active = selectedIndex === shape.index;

                return (
                    <g
                        key={shape.index}
                        role="button"
                        tabIndex={0}
                        aria-pressed={active}
                        aria-label={`${district.name}: ${district.total}/100`}
                        className={
                          active
                              ? "district-map-region is-selected"
                              : "district-map-region"
                        }
                        onClick={() => setSelectedIndex(shape.index)}
                        onKeyDown={(event) => {
                          if (
                              event.key === "Enter" ||
                              event.key === " "
                          ) {
                            event.preventDefault();
                            setSelectedIndex(shape.index);
                          }
                        }}
                    >
                      <polygon points={shape.points} />

                      <text
                          x={shape.x}
                          y={shape.y}
                          textAnchor="middle"
                          aria-hidden="true"
                      >
                        {district.name}
                      </text>

                      <text
                          x={shape.x}
                          y={shape.y + 21}
                          textAnchor="middle"
                          className="district-map-score"
                          aria-hidden="true"
                      >
                        {district.total}
                      </text>
                    </g>
                );
              })}
            </svg>
          </div>

          <div className="district-map-detail">
            <div
                className="district-map-selection"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
              <p className="mono">{copy.total}</p>
              <h4>{selected.name}</h4>

              <div className="district-map-total">
                <strong>{selected.total}</strong>
                <span>/ 100</span>
              </div>
            </div>

            <div className="district-indicators">
              {indicators.map((item) => (
                  <div
                      className={`district-indicator indicator-${item.key}`}
                      key={item.key}
                  >
                    <span>{item.label}</span>

                    <div
                        className="district-indicator-track"
                        aria-hidden="true"
                    >
                      <div style={{ width: `${item.value}%` }} />
                    </div>

                    <b>{item.value}</b>
                  </div>
              ))}
            </div>

            <p className="district-map-scale">{copy.scale}</p>
          </div>
        </div>
      </div>
  );
}

function DistrictComparison() {
  const { language, t } = useLanguage();
  const districts = localize(base_districts, t);

  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(1);

  const copy = {
    ru: {
      title: "Сравните районы",
      first: "Первый район",
      second: "Второй район",
      total: "Общий ESG-индекс",
      environment: "Экология",
      social: "Социальная среда",
      governance: "Управление",
      note: "Показатели проекта · Шкала от 0 до 100",
    },
    en: {
      title: "Compare districts",
      first: "First district",
      second: "Second district",
      total: "Overall ESG index",
      environment: "Environment",
      social: "Social conditions",
      governance: "Governance",
      note: "Project indicators · Scale from 0 to 100",
    },
    kk: {
      title: "Аудандарды салыстырыңыз",
      first: "Бірінші аудан",
      second: "Екінші аудан",
      total: "Жалпы ESG индексі",
      environment: "Экология",
      social: "Әлеуметтік орта",
      governance: "Басқару",
      note: "Жоба көрсеткіштері · 0–100 шкаласы",
    },
  }[language];

  const indicators = [
    { key: "e", label: copy.environment },
    { key: "s", label: copy.social },
    { key: "g", label: copy.governance },
  ] as const;

  const selected = [
    districts[firstIndex],
    districts[secondIndex],
  ];

  return (
      <div className="district-comparison">
        <div className="district-comparison-heading">
          <h3>{copy.title}</h3>
          <p>{copy.note}</p>
        </div>

        <div className="district-selectors">
          <label>
            <span>{copy.first}</span>

            <select
                value={firstIndex}
                onChange={(event) =>
                    setFirstIndex(Number(event.target.value))
                }
            >
              {districts.map((district, index) => (
                  <option key={index} value={index}>
                    {district.name}
                  </option>
              ))}
            </select>
          </label>

          <label>
            <span>{copy.second}</span>

            <select
                value={secondIndex}
                onChange={(event) =>
                    setSecondIndex(Number(event.target.value))
                }
            >
              {districts.map((district, index) => (
                  <option key={index} value={index}>
                    {district.name}
                  </option>
              ))}
            </select>
          </label>
        </div>

        <div className="district-comparison-grid">
          {selected.map((district, index) => (
              <article
                  className="district-comparison-card"
                  key={`${index}-${firstIndex}-${secondIndex}`}
              >
                <div className="district-comparison-card-head">
                  <h4>{district.name}</h4>
                  <strong>{district.total}</strong>
                </div>

                <p className="district-total-label">
                  {copy.total}
                </p>

                <div className="district-indicators">
                  {indicators.map((indicator) => (
                      <div
                          className={`district-indicator indicator-${indicator.key}`}
                          key={indicator.key}
                      >
                        <span>{indicator.label}</span>

                        <div
                            className="district-indicator-track"
                            aria-hidden="true"
                        >
                          <div
                              style={{
                                width: `${district[indicator.key]}%`,
                              }}
                          />
                        </div>

                        <b>{district[indicator.key]}</b>
                      </div>
                  ))}
                </div>
              </article>
          ))}
        </div>
      </div>
  );
}

function DistrictsSection() {
const { t } = useLanguage();
const districts = localize(base_districts, t);

  const districtConfig: ChartConfiguration = {
    type: "bar",
    data: {
      labels: districts.map((district) => district.name),
      datasets: [
        { label: "E", data: districts.map((district) => district.e), backgroundColor: "#a3ddba", borderRadius: 5 },
        { label: "S", data: districts.map((district) => district.s), backgroundColor: "#eee6cb", borderRadius: 5 },
        { label: "G", data: districts.map((district) => district.g), backgroundColor: "#efbc68", borderRadius: 5 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#b8cbbf", usePointStyle: true } }, tooltip: { backgroundColor: "#061820", padding: 12 } },
      scales: { x: { grid: { display: false }, ticks: { color: "#b8cbbf", font: { size: 9 } } }, y: { beginAtZero: true, max: 80, grid: { color: "rgba(188,221,199,.12)" }, ticks: { color: "#b8cbbf" } } },
    },
  };
  return (
    <section className="districts-section reveal" id="districts"><div className="section-shell">
      <div className="section-heading"><div><p className="section-kicker mono"><span>04</span> {t("ESG ПО РАЙОНАМ")}</p><h2>{t("Один город.")}<br /><em>{t("Разный прогресс.")}</em></h2></div><p>{t("Социальные показатели лидируют, но экологическая устойчивость заметно различается между районами Алматы.")}</p></div>
      <DistrictMap />
      <DistrictComparison />
      <div className="district-grid">
        {districts.map((district, index) => <article className="district-card" key={district.name} tabIndex={0} aria-label={`${district.name}${t(": общий балл")} ${district.total}, E ${district.e}, S ${district.s}, G ${district.g}`}>
          <div className="district-head"><span className="mono">0{index + 1}</span><b>{district.total}</b></div><h3>{district.name}</h3>
          <div className="score-bars">
            <div><span className="mono">E · {district.e}</span><i><b style={{ width: `${district.e}%` }} /></i></div>
            <div><span className="mono">S · {district.s}</span><i><b style={{ width: `${district.s}%` }} /></i></div>
            <div><span className="mono">G · {district.g}</span><i><b style={{ width: `${district.g}%` }} /></i></div>
          </div>
        </article>)}
      </div>
      <div className="district-chart chart-panel"><div className="chart-panel-head"><span className="mono">{t("СРАВНЕНИЕ E / S / G")}</span><b>{t("8 РАЙОНОВ")}</b></div><div className="chart-wrap"><ChartCanvas config={districtConfig} label={t("Сравнение ESG-показателей районов Алматы")} /></div></div>
    </div></section>
  );
}

function EcoActionCards() {
  const { language } = useLanguage();

  const copy = {
    ru: {
      label: "Экопривычки на каждый день",
      cards: [
        {
          title: "Сортировать проще",
          description:
              "Проверяйте местные правила приёма и отделяйте подходящие материалы от смешанных отходов.",
          action: "Изучить источники",
        },
        {
          title: "Выбирать многоразовое",
          description:
              "Берите с собой многоразовую бутылку, кружку или сумку вместо одноразовых вещей.",
          action: "Изучить источники",
        },
        {
          title: "Менять маршрут",
          description:
              "Изучайте общественный транспорт и выбирайте удобные способы передвижения.",
          action: "Изучить транспорт",
        },
      ],
    },
    en: {
      label: "Everyday eco habits",
      cards: [
        {
          title: "Make sorting easier",
          description:
              "Check local collection rules and separate accepted materials from mixed waste.",
          action: "Explore sources",
        },
        {
          title: "Choose reusable",
          description:
              "Carry a reusable bottle, cup or shopping bag instead of disposable items.",
          action: "Explore sources",
        },
        {
          title: "Rethink your route",
          description:
              "Explore public transport and discover convenient ways to travel.",
          action: "Explore transport",
        },
      ],
    },
    kk: {
      label: "Күнделікті экологиялық әдеттер",
      cards: [
        {
          title: "Сұрыптауды жеңілдету",
          description:
              "Жергілікті қабылдау ережелерін тексеріп, жарамды материалдарды аралас қалдықтардан бөліңіз.",
          action: "Дереккөздерді қарау",
        },
        {
          title: "Көп рет қолданылатынды таңдау",
          description:
              "Бір реттік заттардың орнына өзіңізбен бірге көп рет қолданылатын бөтелке, кесе немесе сөмке алып жүріңіз.",
          action: "Дереккөздерді қарау",
        },
        {
          title: "Бағытты өзгерту",
          description:
              "Қоғамдық көлікті зерттеп, қатынаудың ыңғайлы тәсілдерін таңдаңыз.",
          action: "Көлікті зерттеу",
        },
      ],
    },
  }[language];

  const destinations = ["sources", "sources", "transport"];
  const themes = ["recycling", "reuse", "mobility"];

  return (
      <div className="eco-action-grid" role="group" aria-label={copy.label}>
        {copy.cards.map((card, index) => (
            <a
                className={`eco-action-card eco-action-${themes[index]}`}
                href={`#${destinations[index]}`}
                key={themes[index]}
            >
              <div className="eco-action-photo" aria-hidden="true" />

              <div className="eco-action-body">
                <div className="eco-action-heading">
                  <h3>{card.title}</h3>
                  <span aria-hidden="true">↗</span>
                </div>

                <p>{card.description}</p>

                <span className="eco-action-link">
              {card.action}
                  <span aria-hidden="true">→</span>
            </span>
              </div>
            </a>
        ))}
      </div>
  );
}

function BehaviorSection() {
  const { language, t } = useLanguage();
  const behaviors = localize(base_behaviors, t);

  const copy = {
    ru: {
      eyebrow: "ГОРОД НАЧИНАЕТСЯ С ЛЮДЕЙ",
      title: "Знаем больше.",
      accent: "Делаем каждый день.",
      description:
          "Экологическая осведомлённость и реальные привычки жителей.",
      comparison: "Знания и действия",
      barriers: "Что мешает действовать?",
      note: "Иллюстративные данные · Синтетический опрос N=800",
      takeaway:
          "Знания не всегда превращаются в действия. Доступная инфраструктура и понятная информация помогают сократить этот разрыв.",
    },
    en: {
      eyebrow: "A CITY STARTS WITH PEOPLE",
      title: "Know more.",
      accent: "Act every day.",
      description:
          "Environmental awareness and residents' everyday habits.",
      comparison: "Knowledge and action",
      barriers: "What prevents action?",
      note: "Illustrative data · Synthetic survey N=800",
      takeaway:
          "Knowledge does not always lead to action. Accessible infrastructure and clear information can help close this gap.",
    },
    kk: {
      eyebrow: "ҚАЛА АДАМДАРДАН БАСТАЛАДЫ",
      title: "Көбірек білеміз.",
      accent: "Күн сайын әрекет етеміз.",
      description:
          "Тұрғындардың экологиялық сауаттылығы мен күнделікті әдеттері.",
      comparison: "Білім және әрекет",
      barriers: "Әрекет етуге не кедергі?",
      note: "Көрнекі деректер · Синтетикалық сауалнама N=800",
      takeaway:
          "Білім әрдайым әрекетке айнала бермейді. Қолжетімді инфрақұрылым мен түсінікті ақпарат бұл алшақтықты азайтуға көмектеседі.",
    },
  }[language];

  const knowledgeConfig: ChartConfiguration<"bar"> = {
    type: "bar",
    data: {
      labels: behaviors.map((item) => item.title),
      datasets: [
        {
          label: t("знают"),
          data: behaviors.map((item) => item.aware),
          backgroundColor: "#b5dfb9",
          borderRadius: 4,
        },
        {
          label: t("делают"),
          data: behaviors.map((item) => item.action),
          backgroundColor: "#389b7a",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          labels: {
            color: "#c8d9ce",
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "#173a28",
          padding: 12,
          callbacks: {
            label: (item) =>
                `${item.dataset.label}: ${item.raw}%`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#c0d2c5",
            font: { size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: "rgba(188, 221, 199, 0.1)",
          },
          ticks: {
            color: "#b8cbbf",
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  };

  const barrierConfig: ChartConfiguration<"bar"> = {
    type: "bar",
    data: {
      labels: [
        t("Нет инфраструктуры"),
        t("Дорого"),
        t("Неудобно"),
        t("Не вижу смысла"),
        t("Нет информации"),
      ],
      datasets: [
        {
          label: t("% респондентов"),
          data: [35, 28, 20, 10, 7],
          backgroundColor: [
            "#efbc68",
            "#b9dcae",
            "#9bcda9",
            "#77ba98",
            "#4f9c7b",
          ],
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#173a28",
          padding: 12,
          callbacks: {
            label: (item) => `${item.raw}%`,
          },
        },
      },
      scales: {
        y: {
          grid: { display: false },
          ticks: {
            color: "#c0d2c5",
            font: { size: 11 },
          },
        },
        x: {
          beginAtZero: true,
          max: 40,
          grid: {
            color: "rgba(188, 221, 199, 0.1)",
          },
          ticks: {
            color: "#b8cbbf",
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  };

  return (
      <section className="eco-reference reveal" id="behavior">
        <div className="section-shell">
          <div className="eco-hero">
            <div className="eco-hero-copy">
              <p className="eco-eyebrow mono">
                {copy.eyebrow}
              </p>

              <h2>
                {copy.title}
                <span>{copy.accent}</span>
              </h2>

              <p className="eco-description">
                {copy.description}
              </p>

              <span className="eco-data-note">
              {copy.note}
            </span>
            </div>

            <div className="eco-hero-photo" aria-hidden="true" />
          </div>

          <div className="eco-chart-grid">
            <article className="chart-panel">
              <h3>{copy.comparison}</h3>
              <p className="eco-panel-note">{copy.note}</p>

              <div className="chart-wrap">
                <ChartCanvas
                    config={knowledgeConfig}
                    label={copy.comparison}
                />
              </div>
            </article>

            <article className="chart-panel">
              <h3>{copy.barriers}</h3>
              <p className="eco-panel-note">{copy.note}</p>

              <div className="chart-wrap">
                <ChartCanvas
                    config={barrierConfig}
                    label={copy.barriers}
                />
              </div>
            </article>
          </div>

          <div className="eco-takeaway">
            <span aria-hidden="true">↗</span>
            <p>{copy.takeaway}</p>
          </div>
          <EcoActionCards />
        </div>
      </section>
  );
}

function AboutSection() {
const { t } = useLanguage();


  const profile = [[t("КУРС"), "4"], [t("ID СТУДЕНТА"), "22B031601"], [t("ПРОГРАММА"), t("Информационные Системы")], [t("ТЕЛЕФОН"), "+7 700 052 29 79"], [t("ПРАКТИКА"), "02.02.2026 – 27.03.2026"], [t("ОРГАНИЗАЦИЯ"), "ESG Campus"]];
  const stack = [["BACKEND", "Next.js · React · TypeScript"], ["FRONTEND", "CSS · Chart.js · SVG"], [t("АНАЛИЗ"), "pandas · matplotlib"], [t("ДАННЫЕ"), "JSON · Open Data"]];
  return (
    <section className="about-section reveal" id="author"><div className="section-shell">
      <p className="section-kicker mono"><span>06</span> {t("О ПРОЕКТЕ")}</p>
      <div className="author-row"><div className="monogram" aria-hidden="true">{t("ША")}</div><div><span className="mono">{t("АВТОР ПРОЕКТА")}</span><h2>{t("Абдуллаев")}<br /><em>{t("Шахзод")}</em></h2></div></div>
      <div className="about-grid"><div className="profile-grid">{profile.map(([label, value]) => <div key={label}><span className="mono">{label}</span><b>{value}</b></div>)}</div><div className="stack-card"><p className="mono">{t("ТЕХНОЛОГИЧЕСКИЙ СТЕК")}</p>{stack.map(([label, value]) => <div key={label}><span className="mono">{label}</span><b>{value}</b></div>)}</div></div>
      <div className="architecture"><div className="architecture-head"><p className="mono">{t("АРХИТЕКТУРА ДАННЫХ")}</p><span>{t("От источника до интерфейса")}</span></div><div className="flow"><div><span>01</span><b>{t("Данные")}</b><small>JSON · Open Data</small></div><i>→</i><div><span>02</span><b>{t("Анализ")}</b><small>pandas · matplotlib</small></div><i>→</i><div><span>03</span><b>Backend</b><small>Next.js · React</small></div><i>→</i><div><span>04</span><b>Frontend</b><small>Chart.js · CSS</small></div></div></div>
    </div></section>
  );
}

function SourcesSection() {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const copy = {
    ru: {
      title: "Открытые источники.",
      accent: "Прозрачная аналитика.",
      description:
          "Городские, национальные и международные источники, использованные в проекте. Проверяйте периоды наблюдений, единицы измерения и методологию в первоисточниках.",
      search: "Найти источник",
      all: "Все",
      environment: "Экология",
      statistics: "Статистика",
      transport: "Транспорт",
      open: "Открыть источник",
      external: "Откроется в новой вкладке",
      empty: "Источники не найдены.",
      reset: "Сбросить поиск",
    },
    en: {
      title: "Open sources.",
      accent: "Transparent analysis.",
      description:
          "City, national and international sources used in the project. Check observation periods, units and methodology in the original publications.",
      search: "Find a source",
      all: "All",
      environment: "Environment",
      statistics: "Statistics",
      transport: "Transport",
      open: "Open source",
      external: "Opens in a new tab",
      empty: "No sources found.",
      reset: "Clear search",
    },
    kk: {
      title: "Ашық дереккөздер.",
      accent: "Ашық талдау.",
      description:
          "Жобада пайдаланылған қалалық, ұлттық және халықаралық дереккөздер. Бақылау кезеңдерін, өлшем бірліктерін және әдістемені бастапқы жарияланымдардан тексеріңіз.",
      search: "Дереккөзді іздеу",
      all: "Барлығы",
      environment: "Экология",
      statistics: "Статистика",
      transport: "Көлік",
      open: "Дереккөзді ашу",
      external: "Жаңа қойындыда ашылады",
      empty: "Дереккөздер табылмады.",
      reset: "Іздеуді тазалау",
    },
  }[language];

  const categories = [
    { id: "all", label: copy.all },
    { id: "environment", label: copy.environment },
    { id: "statistics", label: copy.statistics },
    { id: "transport", label: copy.transport },
  ];

  const categoryByDomain: Record<string, string> = {
    "iqair.com": "environment",
    "kazhydromet.kz": "environment",
    "stat.gov.kz": "statistics",
    "data.egov.kz": "statistics",
    "undp.org": "environment",
    "metroalmaty.kz": "transport",
    "who.int": "environment",
  };

  const sources = localize(base_sources, t).map((source) => ({
    ...source,
    category: categoryByDomain[source.domain] ?? "environment",
  }));

  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredSources = sources.filter((source) => {
    const matchesCategory =
        category === "all" || source.category === category;

    const matchesQuery =
        `${source.title} ${source.text} ${source.domain}`
            .toLocaleLowerCase()
            .includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  return (
      <section className="sources-directory reveal" id="sources">
        <div className="sources-directory-hero">
          <div className="section-shell">
            <div className="sources-directory-copy">
              <h2>
                {copy.title}
                <span>{copy.accent}</span>
              </h2>

              <p>{copy.description}</p>
            </div>
          </div>
        </div>

        <div className="section-shell">
          <div className="sources-directory-tools">
            <label className="sources-search">
              <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden="true"
              >
                <circle cx="10" cy="10" r="6" />
                <path d="m15 15 5 5" />
              </svg>

              <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.search}
                  aria-label={copy.search}
              />
            </label>

            <div
                className="sources-category-filters"
                role="group"
                aria-label={copy.title}
            >
              {categories.map((item) => (
                  <button
                      type="button"
                      key={item.id}
                      aria-pressed={category === item.id}
                      onClick={() => setCategory(item.id)}
                  >
                    {item.label}
                  </button>
              ))}
            </div>
          </div>

          <p
              className="sources-result-count mono"
              role="status"
              aria-live="polite"
              aria-atomic="true"
          >
            {copy.all}: {filteredSources.length} / {sources.length}
          </p>

          <div className="sources-directory-grid">
            {filteredSources.map((source) => (
                <a
                    className={`directory-card directory-${source.category}`}
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${source.title}. ${copy.external}`}
                >
                  <div className="directory-card-heading">
                <span className="directory-source-mark" aria-hidden="true">
                  {source.domain.slice(0, 2).toUpperCase()}
                </span>

                    <div>
                      <h3>{source.title}</h3>

                      <span className="directory-category">
                    {
                      categories.find(
                          (item) => item.id === source.category
                      )?.label
                    }
                  </span>
                    </div>
                  </div>

                  <p>{source.text}</p>

                  <span className="directory-domain mono">
                {source.domain}
              </span>

                  <div className="directory-card-action">
                    <span>{copy.open}</span>
                    <span aria-hidden="true">↗</span>
                  </div>
                </a>
            ))}
          </div>

          {filteredSources.length === 0 && (
              <div className="sources-empty">
                <p>{copy.empty}</p>

                <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                >
                  {copy.reset}
                  <span aria-hidden="true">↻</span>
                </button>
              </div>
          )}
        </div>
      </section>
  );
}

function Footer() {
  const { language, t } = useLanguage();
  const navItems = localize(base_navItems, t);

  const copy = {
    ru: {
      tagline: "Город. Люди. Устойчивое будущее.",
      note: "Учебный проект · Исторические и иллюстративные данные",
      navigation: "Навигация в подвале",
      top: "Наверх",
      author: "Автор проекта",
    },
    en: {
      tagline: "City. People. A sustainable future.",
      note: "Educational project · Historical and illustrative data",
      navigation: "Footer navigation",
      top: "Back to top",
      author: "Project author",
    },
    kk: {
      tagline: "Қала. Адамдар. Тұрақты болашақ.",
      note: "Оқу жобасы · Тарихи және көрнекі деректер",
      navigation: "Төменгі навигация",
      top: "Жоғарыға",
      author: "Жоба авторы",
    },
  }[language];

  return (
      <footer className="reference-footer">
        <div className="section-shell">
          <div className="reference-footer-main">
            <a
                className="reference-footer-brand"
                href="#hero"
                aria-label={`ESG Almaty — ${copy.top}`}
            >
              <svg
                  viewBox="0 0 86 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
              >
                <path d="M3 34 24 14 33 22 49 5 82 34" />
                <path d="m16 23 8-9 8 8" />
                <path d="m39 16 10-11 10 10" />
                <path d="m30 34 19-20 10 12 8-5" />
              </svg>

              <span>ESG ALMATY</span>
            </a>

            <p className="reference-footer-tagline">
              {copy.tagline}
            </p>

            <a className="reference-back-top" href="#hero">
              {copy.top}
              <span aria-hidden="true">↑</span>
            </a>
          </div>

          <nav
              className="reference-footer-nav"
              aria-label={copy.navigation}
          >
            {navItems.map(([label, id]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
            ))}
          </nav>

          <div className="reference-footer-bottom">
            <span>© 2026 ESG ALMATY</span>

            <span>
            {copy.author}: {t("Абдуллаев Шахзод")}
          </span>

            <span>{copy.note}</span>
          </div>
        </div>
      </footer>
  );
}
function Dashboard() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .08 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return (
      <>
        <Motion />
        <Header />

        <main>
          <Hero />
          <OverviewTopics />
          <OverviewAnalytics />
          <Metrics />
          <Introduction />
          <AboutSection />

          <AirSection />
          <TransportSection />
          <DistrictsSection />
          <BehaviorSection />
          <SourcesSection />
        </main>

        <Footer />
      </>
  );
}

export default function Home() { return <LanguageProvider><Dashboard /></LanguageProvider>; }
export {
  Header,
  Footer,
  Hero,
  OverviewTopics,
  OverviewAnalytics,
  Metrics,
  Introduction,
  AboutSection,
  AirSection,
  TransportSection,
  DistrictsSection,
  BehaviorSection,
  SourcesSection,
};