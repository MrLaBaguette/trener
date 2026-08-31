import React, { useState, useMemo, useEffect, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   REJESTR PROJEKTU — aplikacja właściwa.
   Zamykanie tygodnia i pamiętanie, co zadziałało.
   ══════════════════════════════════════════════════════════ */

let MILESTONES = [
  { date: "2026-08-01", weight: 96.0 },
  { date: "2026-09-01", weight: 96.0 },
  { date: "2026-12-31", weight: 90.0 },
  { date: "2027-03-28", weight: 90.0 },
  { date: "2027-07-25", weight: 82.0 },
];

let PHASES = [
  { from: "2026-08-01", to: "2026-09-01", label: "kalibracja", tone: 0 },
  { from: "2026-09-01", to: "2026-12-31", label: "faza 1 · deficyt", tone: 1 },
  { from: "2026-12-31", to: "2027-03-28", label: "faza 2 · blok ciężki", tone: 2 },
  { from: "2027-03-28", to: "2027-07-25", label: "faza 3 · dopięcie", tone: 1 },
];

const TARGET = 82.0;
let PLAN_KCAL = 2400;
const KCAL_PER_KG = 7700;

const dOf = (s) => d(s);
/* ══════════════════════════════════════════════════════════
   TRWAŁOŚĆ DANYCH

   Trzy warstwy, w tej kolejności:
   1. localStorage — natychmiastowy zapis przy każdej zmianie
   2. repozytorium danych na GitHubie — synchronizacja między urządzeniami
   3. eksport i import JSON — koło ratunkowe, gdy zawiodą dwie pierwsze

   Klucz i token nigdy nie trafiają do repozytorium z kodem.
   Siedzą w localStorage tej przeglądarki i nigdzie indziej.
   ══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════════════
   KONTEKST TRENERA

   Skrót plików projektu, który dostaje model. Trzymany tutaj, a nie
   po stronie modelu, żeby zmiana planu na przeglądzie oznaczała podmianę
   tego bloku razem z rejestr.jsx — i żeby nigdy nie było dwóch wersji
   prawdy o tempie deficytu.

   Arytmetyki tu nie ma. Liczby wylicza kod i podaje gotowe.
   ══════════════════════════════════════════════════════════ */

const KONTEKST_TRENERA = `
Jesteś Ronnie — trener personalny i specjalista przygotowania motorycznego.
Odpowiadasz na cotygodniowy raport. Piszesz po polsku.

TON. Rzeczowy i bezpośredni, z charakterem Ronniego Colemana na wierzchu.
Merytoryka nigdy nie ustępuje miejsca hałasowi. Maksymalnie jeden okrzyk na
odpowiedź, na początku albo na końcu, nie w środku wywodu. Nie w każdej
odpowiedzi — mniej więcej co trzecia.

Repertuar: "Yeah buddy!", "Lightweight baby!", "Ain't nothin' but a peanut",
"Nothin' to it but to do it". Warianty polskie, rzadziej: "Tak kolego!",
"Lekka Waga Dziecko", "To nic tylko fistaszek", "Pozostaje to zrobić".
Wersji polskiej i angielskiej nie łączysz w jednej wiadomości.
"Lightweight baby" wyłącznie przy celowo lekkim ciężarze.
"Nothin' to it but to do it" gdy się waha albo szuka wymówki.

CISZA OBOWIĄZKOWA — zero okrzyków, gdy w raporcie jest: ból pleców lub
kontuzja, astma i duszności, złe wyniki skanu, spadek masy beztłuszczowej,
przemęczenie, zarwane noce albo tydzień, w którym mu nie szło.

Nie podszywasz się pod prawdziwego Ronniego Colemana: nie wymyślasz jego
wypowiedzi, nie opowiadasz jego historii, nie mówisz w jego imieniu.

ZASADY NADRZĘDNE
- Nie pytasz o log treningu ani o obciążenia. Zakładasz, że ich nie znasz.
- Krótko. Bez motywacyjnego wstępu i bez streszczania tego, co przed chwilą
  napisałeś. Trzy do pięciu akapitów maksimum.
- Nie improwizujesz alternatywnych programów. Jeśli uważasz, że plan wymaga
  zmiany, mówisz to wprost i proponujesz przegląd cyklu.
- Nie diagnozujesz. Przy bólu ostrym, promieniującym lub trwającym ponad
  tydzień odsyłasz do fizjoterapeuty i proponujesz obejście na ten czas.
- Opuszczona sesja to przesunięcie kolejki, nie zaległość.
- Nie dokładasz objętości "bo można". 10–12 serii roboczych na partię tygodniowo.

KONTEKST ZAWODNIKA
185 cm, start projektu 95,8 kg, cel 13% tkanki tłuszczowej przy 82 kg do
25 lipca 2027. DEXA 10.06.2026: 25,7% tłuszczu, 71,3 kg masy beztłuszczowej.
FFMI ok. 20,8 — mięśnie są zbudowane, zadanie to ich odsłonięcie i obrona.

Dziecko urodzone w czerwcu 2026. Sen 5–6 h, przerywany, bez drzemek. To jest
zmienna sterująca całym planem: przy tym samym deficycie restrykcja snu
przesuwa skład ubytku w stronę tkanki beztłuszczowej.

Astma, pojemność płuc obniżona o ok. 30%, FEV1 70% normy bez leków.
Tętno NIE jest u niego miarodajnym wskaźnikiem intensywności — sterowanie
testem mowy. Basen tolerowany najlepiej i jest głównym środkiem kondycyjnym.
Boks to najbardziej ryzykowna pozycja w planie.

Nawykowe zwichnięcie stawu skokowego. Okresowy ból dołu pleców i łopatki,
źródło głównie nerwowe plus noszenie dziecka; protokół to dwa dni przerwy
i fizjoterapeuta. Przedramiona są limiterem w podciąganiu — plecy w paskach.

Cykl 1 (wrzesień–październik): 4 wyjścia — 2 × FBW + basen + kalistenika
albo boks. Zero serii do upadku na bojach. Po zarwanej nocy sesja zostaje,
schodzi jedna seria z każdego ćwiczenia — nie przełamujemy się.

REGUŁY, KTÓRE MUSISZ RESPEKTOWAĆ
- Dwa tygodnie regresu siły z rzędu przy komplecie sesji oznaczają powrót
  do tempa 0,28 kg/tydzień, niezależnie od tego, co pokazuje waga.
- Kolejność ustępstw przy obsunięciu: najpierw termin, potem tempo,
  a NIGDY białko i sen.
- Deficyt robimy jedzeniem i krokami, nie dokładaniem treningu.
- Pojedynczy odczyt wagi nic nie znaczy. Komentujesz wyłącznie średnią.

CZEGO NIE WOLNO CI ROBIĆ
- Nie zmyślaj szczegółów, których nie ma w raporcie. Nie masz logu sesji ani
  obciążeń — nie pisz, jak wypadły kolejne serie, bo tego nie widzisz.
- Sen jest podany jako ocena jakości w skali 1–5, NIE jako liczba godzin.
  Nigdy nie przeliczaj tej cyfry na godziny.
- Aktywności są podane jako liczba tygodni, w których wystąpiły, NIE jako
  liczba sesji. Nie wyciągaj z tego wniosków o częstotliwości.
- Nie proponuj umówienia badania, które jest już w kalendarzu.
- Marsz i kroki nie są mierzone. Nie oceniaj ich ilości.
- Jeśli czegoś potrzebujesz, a nie ma tego w raporcie, powiedz wprost, że tego
  nie widzisz. To jest lepsze niż domysł podany jako fakt.

FORMAT ODPOWIEDZI
Zwykły tekst, akapity oddzielone pustą linią. Bez nagłówków i bez list
punktowanych. To ma się czytać jak wiadomość od trenera, nie jak raport.
`;

/* ══════════════════════════════════════════════════════════
   CZYTNIK MARKDOWNU

   Jeden mechanizm dla przepisów z vaulta i dla raportów z badań.
   Format wymusza SZABLON-PRZEPISU.md, więc parser może być prosty —
   ale gdy plik odbiega od szablonu, mówi czego nie znalazł zamiast
   po cichu wstawić zero.
   ══════════════════════════════════════════════════════════ */

function czytajFrontmatter(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, reszta: txt };
  const fm = {};
  let klucz = null;
  m[1].split("\n").forEach((l) => {
    const lista = l.match(/^\s+-\s+(.*)$/);
    if (lista && klucz) { (fm[klucz] = fm[klucz] || []).push(lista[1].trim()); return; }
    const para = l.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (para) { klucz = para[1]; if (para[2].trim()) fm[klucz] = para[2].trim(); }
  });
  return { fm, reszta: txt.slice(m[0].length) };
}

/* Tabela makro ma sztywną kolejność kolumn: Kcal, Fat, Carbs, Fiber, Sugar,
   Protein. Czytamy pierwszy wiersz danych pod nagłówkiem. */
function czytajMakro(txt) {
  const sekcja = txt.split(/^##\s+Macros\s*$/m)[1];
  if (!sekcja) return null;
  const wiersze = sekcja.split("\n").filter((l) => l.trim().startsWith("|"));
  const dane = wiersze.filter((l) => !/^\|[\s\-|:]+\|$/.test(l.trim()) && !/Kcal/i.test(l));
  if (!dane.length) return null;
  const k = dane[0].split("|").map((x) => x.trim()).filter((x, i, a) => i > 0 && i < a.length - 1);
  const n = (v) => {
    const x = parseFloat(String(v).replace("~", "").replace(",", "."));
    return Number.isNaN(x) ? null : x;
  };
  return { kcal: n(k[0]), t: n(k[1]), w: n(k[2]), bl: n(k[3]), cukier: n(k[4]), b: n(k[5]) };
}

function czytajPrzepis(txt) {
  const { fm, reszta } = czytajFrontmatter(txt);
  const tytul = (reszta.match(/^#\s+Recipe:\s*(.+)$/m) || [])[1]
    || (fm.aliases && fm.aliases[0] || "").replace(/^Recipe\s*-\s*/, "")
    || "Bez tytułu";
  const porcje = parseInt((reszta.match(/Liczba porcji:\s*(\d+)/) || [])[1], 10) || null;
  const ocena = parseFloat((reszta.match(/^Rating:\s*_?(\d+(?:[.,]\d+)?)/m) || [])[1]) || null;
  const zona = parseFloat((reszta.match(/^Rating żony:\s*_?(\d+(?:[.,]\d+)?)/m) || [])[1]) || null;
  const makro = czytajMakro(reszta);
  const tagi = fm.tags || [];
  const posilek = (tagi.find((t) => t.startsWith("meal/")) || "meal/lunch").split("/")[1];

  const braki = [];
  if (!porcje) braki.push("liczba porcji");
  if (!makro) braki.push("tabela makro");
  else {
    if (makro.b == null) braki.push("białko");
    if (makro.bl == null) braki.push("błonnik");
  }

  return {
    tytul, porcje, ocena, zona, makro, tagi, posilek, braki,
    mealprep: tagi.includes("cookbook/mealprep"),
    tresc: txt,
  };
}

/* Progi wejścia do jadłospisu z ZYWIENIE.md. Obiad i kolacja mają ten sam
   próg, podwieczorek niższy — ciężar białkowy idzie na posiłek główny. */
const PROGI = {
  lunch:     { b: 40, bl: 6, nazwa: "obiad" },
  dinner:    { b: 40, bl: 6, nazwa: "kolacja" },
  breakfast: { b: 20, bl: 4, nazwa: "śniadanie" },
  snack:     { b: 20, bl: 4, nazwa: "podwieczorek" },
};

/* Makro liczone zawsze z całości, nigdy z poprzedniego podziału — inaczej
   przy kilku zmianach porcji narastałby błąd zaokrągleń. */
function przelicz(makro, porcjeZrodlo, porcjeCel) {
  if (!makro || !porcjeZrodlo || !porcjeCel) return makro;
  const f = porcjeZrodlo / porcjeCel;
  const r = (v) => (v == null ? null : Math.round(v * f * 10) / 10);
  return { kcal: r(makro.kcal) == null ? null : Math.round(makro.kcal * f),
    t: r(makro.t), w: r(makro.w), bl: r(makro.bl), cukier: r(makro.cukier), b: r(makro.b) };
}

/* Zapis oceny i liczby porcji z powrotem do treści pliku, żeby eksport
   do vaulta nie rozjechał się z tym, co widać w apce. */
function wstawDoMarkdownu(txt, { ocena, zona, porcje, makro }) {
  let out = txt;
  if (ocena != null) out = out.replace(/^Rating:.*$/m, `Rating: _${ocena}/10_`);
  if (zona != null) out = out.replace(/^Rating żony:.*$/m, `Rating żony: _${zona}/10_`);
  if (porcje) out = out.replace(/^Liczba porcji:.*$/m, `Liczba porcji: ${porcje}`);
  if (makro) {
    const w = `| ${makro.kcal ?? ""}   | ${makro.t ?? ""}   | ${makro.w ?? ""}    | ${makro.bl ?? ""}      | ${makro.cukier ?? ""}      | ${makro.b ?? ""}       | **Portion** |`;
    out = out.replace(/^\|[^|\n]*\|[^|\n]*\|[^|\n]*\|[^|\n]*\|[^|\n]*\|[^|\n]*\|\s*\*\*Portion\*\*\s*\|$/m, w);
  }
  return out;
}

/* ── Renderer ──────────────────────────────────────────────
   Podzbiór markdownu, który faktycznie występuje w vaulcie: nagłówki,
   listy z checkboxami, listy numerowane, tabele, pogrubienia, kursywa.
   Nie budujemy pełnego parsera dla formatu, który sami kontrolujemy. */

function inline(t) {
  const kawalki = [];
  let reszta = t, klucz = 0;
  const wzor = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/;
  while (true) {
    const m = reszta.match(wzor);
    if (!m) { if (reszta) kawalki.push(reszta); break; }
    if (m.index > 0) kawalki.push(reszta.slice(0, m.index));
    const s = m[0];
    if (s.startsWith("**")) kawalki.push(<b key={klucz++}>{s.slice(2, -2)}</b>);
    else if (s.startsWith("`")) kawalki.push(<code key={klucz++}>{s.slice(1, -1)}</code>);
    else kawalki.push(<i key={klucz++}>{s.slice(1, -1)}</i>);
    reszta = reszta.slice(m.index + s.length);
  }
  return kawalki;
}

function Markdown({ tekst }) {
  const { reszta } = czytajFrontmatter(tekst);
  const linie = reszta.split("\n");
  const bloki = [];
  let i = 0, klucz = 0;

  while (i < linie.length) {
    const l = linie[i];

    if (/^\s*$/.test(l)) { i++; continue; }

    const nag = l.match(/^(#{1,4})\s+(.*)$/);
    if (nag) {
      const H = "h" + Math.min(6, nag[1].length + 2);
      bloki.push(React.createElement(H, { key: klucz++, className: "md-h" }, inline(nag[2])));
      i++; continue;
    }

    if (/^---+\s*$/.test(l)) { bloki.push(<hr key={klucz++} className="md-hr" />); i++; continue; }

    if (l.trim().startsWith("|")) {
      const wiersze = [];
      while (i < linie.length && linie[i].trim().startsWith("|")) { wiersze.push(linie[i]); i++; }
      const komorki = (w) => w.split("|").slice(1, -1).map((x) => x.trim());
      const dane = wiersze.filter((w) => !/^\|[\s\-|:]+\|\s*$/.test(w));
      bloki.push(
        <div className="md-tblwrap" key={klucz++}>
          <table className="tbl md-tbl">
            <thead><tr>{komorki(dane[0]).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            <tbody>{dane.slice(1).map((w, j) => (
              <tr key={j}>{komorki(w).map((c, k) => <td key={k}>{inline(c)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      );
      continue;
    }

    if (/^\s*-\s+\[[ x]\]/.test(l)) {
      const poz = [];
      while (i < linie.length && /^\s*-\s+\[[ x]\]/.test(linie[i])) {
        poz.push(linie[i].replace(/^\s*-\s+\[[ x]\]\s*/, "")); i++;
      }
      bloki.push(
        <ul className="md-check" key={klucz++}>
          {poz.map((p, j) => <li key={j}><span className="md-box" />{inline(p)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(l)) {
      const poz = [];
      while (i < linie.length && /^\s*[-*]\s+/.test(linie[i])) {
        poz.push(linie[i].replace(/^\s*[-*]\s+/, "")); i++;
      }
      bloki.push(<ul className="md-ul" key={klucz++}>{poz.map((p, j) => <li key={j}>{inline(p)}</li>)}</ul>);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(l)) {
      const poz = [];
      while (i < linie.length && /^\s*\d+\.\s+/.test(linie[i])) {
        poz.push(linie[i].replace(/^\s*\d+\.\s+/, "")); i++;
      }
      bloki.push(<ol className="md-ol" key={klucz++}>{poz.map((p, j) => <li key={j}>{inline(p)}</li>)}</ol>);
      continue;
    }

    if (/^>\s?/.test(l)) {
      const poz = [];
      while (i < linie.length && /^>\s?/.test(linie[i])) { poz.push(linie[i].replace(/^>\s?/, "")); i++; }
      bloki.push(<blockquote className="md-q" key={klucz++}>{inline(poz.join(" "))}</blockquote>);
      continue;
    }

    const akapit = [];
    while (i < linie.length && !/^\s*$/.test(linie[i]) && !/^[#>|-]/.test(linie[i])
           && !/^\s*\d+\.\s+/.test(linie[i])) { akapit.push(linie[i]); i++; }
    if (akapit.length) bloki.push(<p className="md-p" key={klucz++}>{inline(akapit.join(" "))}</p>);
    else i++;
  }

  return <div className="md">{bloki}</div>;
}

/* ── Raporty z badań ───────────────────────────────────────
   Format definiowany w czacie przy generowaniu raportu. Nagłówek mówi,
   czego dotyczy plik, tabela niesie wyniki. Import zawsze pokazuje podgląd
   przed zapisem — nic nie wchodzi do apki po cichu.
   ────────────────────────────────────────────────────────── */

function czytajRaport(txt) {
  const { fm, reszta } = czytajFrontmatter(txt);
  const rodzaj = (fm.typ || "").toLowerCase()
    || (/spirometr/i.test(reszta) ? "spirometria"
      : /DEXA|tkank[ai] tłuszczow/i.test(reszta) ? "dexa"
      : /hemoglobin|cholesterol|leukocyt/i.test(reszta) ? "krew" : "");
  const data = fm.date || (reszta.match(/\b(20\d\d-\d\d-\d\d)\b/) || [])[1] || null;

  const wiersze = reszta.split("\n").filter((l) => l.trim().startsWith("|"));
  const dane = wiersze.filter((w) => !/^\|[\s\-|:]+\|\s*$/.test(w.trim()));
  const pozycje = dane.slice(1).map((w) => {
    const k = w.split("|").slice(1, -1).map((x) => x.trim());
    return { nazwa: k[0], wynik: k[1], zakres: k[2] || "", uwaga: k[3] || "" };
  }).filter((p) => p.nazwa && p.wynik);

  const grupa = fm.grupa || (reszta.match(/^##\s+(.+)$/m) || [])[1] || null;
  return { rodzaj, data, grupa, pozycje, tresc: txt, braki: !rodzaj ? ["rodzaj badania"] : [] };
}

const SCHEMA = 2;
const KLUCZ = "rejestr:v2";
const KLUCZ_USTAWIENIA = "rejestr:ustawienia";

/* Odczyt bywa zablokowany (tryb prywatny, wyłączone ciasteczka).
   Wtedy apka działa dalej, tylko bez pamięci — zamiast wywalać się przy starcie. */
function odczytaj(klucz, domyslne) {
  try {
    const s = localStorage.getItem(klucz);
    if (!s) return domyslne;
    const o = JSON.parse(s);
    return o == null ? domyslne : o;
  } catch (e) {
    return domyslne;
  }
}

function zapisz(klucz, wartosc) {
  try {
    localStorage.setItem(klucz, JSON.stringify(wartosc));
    return true;
  } catch (e) {
    return false;
  }
}

/* Stan trzymany w jednym worku pod jednym kluczem. Osobne klucze na każdą
   sekcję oznaczałyby kilkanaście zapisów przy każdej zmianie i rozjazd
   przy synchronizacji — worek zapisuje się atomowo. */
function wczytajStan() {
  const s = odczytaj(KLUCZ, null);
  if (!s || s.schema !== SCHEMA) return null;
  return s.dane || null;
}

/* ── Synchronizacja przez GitHub ───────────────────────────
   Osobne repozytorium, prywatne, wyłącznie na dane. Nigdy to samo,
   w którym leży kod — kod jest publiczny, pomiary nie.

   Git trzyma historię każdego zapisu, więc pomyłkowe nadpisanie
   da się cofnąć z poziomu strony repozytorium.
   ────────────────────────────────────────────────────────── */

const GH_PLIK = "rejestr.json";

function ghNaglowki(token) {
  return {
    "Authorization": "Bearer " + token,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/* Base64 z obsługą polskich znaków. btoa sam w sobie przewraca się na "ł". */
function doBase64(txt) {
  const bajty = new TextEncoder().encode(txt);
  let bin = "";
  bajty.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin);
}
function zBase64(b64) {
  const bin = atob(b64.replace(/\s/g, ""));
  const bajty = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bajty);
}

async function ghPobierz(ust) {
  if (!ust.token || !ust.repo) throw new Error("Brak tokenu albo nazwy repozytorium");
  const url = `https://api.github.com/repos/${ust.repo}/contents/${GH_PLIK}`;
  const r = await fetch(url, { headers: ghNaglowki(ust.token) });
  if (r.status === 404) return { dane: null, sha: null };
  if (r.status === 401) throw new Error("Token odrzucony. Sprawdź, czy nie wygasł.");
  if (!r.ok) throw new Error("GitHub odpowiedział błędem " + r.status);
  const j = await r.json();
  return { dane: JSON.parse(zBase64(j.content)), sha: j.sha };
}

/* sha jest zabezpieczeniem przed cichym nadpisaniem. Jeśli w międzyczasie
   zapisało inne urządzenie, GitHub zwraca 409 i apka pyta, zamiast kasować. */
async function ghZapisz(ust, dane, sha) {
  const url = `https://api.github.com/repos/${ust.repo}/contents/${GH_PLIK}`;
  const body = {
    message: "Rejestr — " + new Date().toISOString().slice(0, 16).replace("T", " "),
    content: doBase64(JSON.stringify(dane, null, 2)),
  };
  if (sha) body.sha = sha;
  const r = await fetch(url, {
    method: "PUT",
    headers: { ...ghNaglowki(ust.token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.status === 409 || r.status === 422)
    throw new Error("KONFLIKT");
  if (!r.ok) throw new Error("Zapis nie przeszedł, błąd " + r.status);
  const j = await r.json();
  return j.content.sha;
}

/* ── Ustawienia ────────────────────────────────────────────
   Wszystko, co dotąd było zakute w kodzie i wymagało mojej pomocy,
   żeby to zmienić: tempo deficytu, granice faz, kalorie planowane.
   ROADMAP przewiduje zmianę tych liczb na przeglądzie — muszą być
   dostępne bez przepisywania pliku.
   ────────────────────────────────────────────────────────── */

const USTAWIENIA_DOM = {
  klucz: "",
  repo: "",
  token: "",
  pin: "",
  ciemny: false,
  planKcal: 2400,
  autosync: true,
  kamienie: [
    { date: "2026-09-01", weight: 95.8 },
    { date: "2026-12-31", weight: 90.0 },
    { date: "2027-03-28", weight: 90.0 },
    { date: "2027-07-25", weight: 82.0 },
  ],
  fazy: [
    { from: "2026-08-01", to: "2026-09-01", label: "kalibracja", tone: 0, tempo: 0 },
    { from: "2026-09-01", to: "2026-11-01", label: "cykl 1 · FBW + sporty", tone: 1, tempo: 0.40 },
    { from: "2026-11-01", to: "2027-01-04", label: "cykl 2 · PPL", tone: 1, tempo: 0.35 },
    { from: "2027-01-04", to: "2027-03-28", label: "cykl 3 · blok ciężki", tone: 2, tempo: 0 },
    { from: "2027-03-28", to: "2027-07-25", label: "cykl 4 · dopięcie", tone: 1, tempo: 0.50 },
  ],
};

/* ── Wykrywanie sytuacji wymagających decyzji ──────────────
   Liczy kod, nie model. Reguły pochodzą wprost z ROADMAP i instrukcji
   projektu, więc muszą dawać ten sam wynik za każdym razem — model
   dostaje gotowe flagi i tylko je opisuje.
   ────────────────────────────────────────────────────────── */

function wykryjSygnaly(entries, ustawienia, wydarzenia, dzis) {
  const f = [];
  const n = entries.length;
  if (!n) return f;
  const ost = entries[n - 1];

  /* Reguła nadrzędna nad tempem: dwa tygodnie regresu z rzędu przy
     komplecie sesji oznaczają powrót do 0,28 — niezależnie od wagi. */
  if (n >= 2) {
    const a = entries[n - 2], b = entries[n - 1];
    if (a.sila <= 2 && b.sila <= 2 && a.fbw >= 2 && b.fbw >= 2)
      f.push({ kod: "regres-sily", waga: "ostrzezenie",
        tekst: "Dwa tygodnie regresu siły z rzędu przy komplecie sesji.",
        akcja: "tempo-028" });
  }

  /* Waga płaska mimo deklarowanego deficytu — sygnał dietetyka. */
  if (n >= 3) {
    const w = entries.slice(-3);
    const czynne = w.filter((e) => !e.poza);
    if (czynne.length === 3 && Math.abs(w[2].weight - w[0].weight) < 0.15)
      f.push({ kod: "waga-stoi", waga: "uwaga",
        tekst: "Trend wagi płaski trzeci tydzień przy deklarowanym deficycie.",
        akcja: null });
  }

  /* Deficyt powyżej 600 kcal jest pilniejszy od pozostałych sygnałów —
     przy śnie 5–6 h grozi utratą masy beztłuszczowej. */
  if (n >= 4) {
    const w = entries.slice(-4).filter((e) => !e.poza);
    if (w.length >= 3) {
      const tyg = (dOf(w[w.length - 1].date) - dOf(w[0].date)) / 6048e5;
      const kg = (w[w.length - 1].weight - w[0].weight) / (tyg || 1);
      const deficyt = -(kg * 7700) / 7;
      if (deficyt > 600)
        f.push({ kod: "deficyt-gleboki", waga: "ostrzezenie",
          tekst: `Realny deficyt około ${Math.round(deficyt)} kcal dziennie.`,
          akcja: null });
      const cel = tempoWFazie(ost.date, ustawienia);
      if (cel > 0 && Math.abs(-kg) > 0 && Math.abs(-kg - cel) > 0.18)
        f.push({ kod: "tempo-odchylenie", waga: "uwaga",
          tekst: `Tempo ${(-kg).toFixed(2)} kg/tydz. przy założonych ${cel.toFixed(2)}.`,
          akcja: null });
    }
  }

  /* Sen. Trzy tygodnie poprawy to dźwignia z ROADMAP — wolno przyspieszyć. */
  if (n >= 3) {
    const s = entries.slice(-3);
    if (s.every((e) => e.sleep >= 4))
      f.push({ kod: "sen-lepszy", waga: "informacja",
        tekst: "Sen 4/5 lub lepszy trzeci tydzień z rzędu.",
        akcja: "tempo-w-gore" });
    if (s.every((e) => e.sleep <= 1))
      f.push({ kod: "sen-gorszy", waga: "ostrzezenie",
        tekst: "Sen 1/5 trzeci tydzień z rzędu.",
        akcja: "tempo-028" });
  }

  /* Kalendarz: zaległości i kolizje. */
  const zalegle = wydarzenia.filter(
    (w) => !w.zrobione && dOf(w.d) < dOf(dzis) - 14 * 864e5
  );
  zalegle.forEach((w) =>
    f.push({ kod: "zalegle", waga: "uwaga",
      tekst: `„${w.n}" zaległe od ${w.d}.`, akcja: "kalendarz", id: w.id }));

  const bliskie = wydarzenia.filter(
    (w) => !w.zrobione && dOf(w.d) >= dOf(dzis) && dOf(w.d) <= dOf(dzis) + 10 * 864e5
  );
  bliskie.forEach((w) => {
    if (w.t === "test" && ost.sleep <= 1)
      f.push({ kod: "test-po-nieprzespanych", waga: "uwaga",
        tekst: `„${w.n}" wypada po tygodniu ze snem 1/5 — wynik powie o śnie, nie o formie.`,
        akcja: "kalendarz", id: w.id });
    if (w.t === "badanie" && /DEXA/i.test(w.n))
      f.push({ kod: "dexa-blisko", waga: "informacja",
        tekst: `${w.n} — dzień wcześniej bez treningu, ta sama pora dnia co poprzednio.`,
        akcja: null });
  });

  return f;
}

function tempoWFazie(dateStr, ust) {
  const f = (ust.fazy || []).find((p) => dOf(dateStr) >= dOf(p.from) && dOf(dateStr) < dOf(p.to));
  return f ? (f.tempo || 0) : 0;
}



/* Terminy z KALENDARZ.md. Horyzont: 30 dni do przodu.
   Pozycje zaległe pokazują się zawsze, niezależnie od horyzontu —
   przeterminowany obowiązek nie może zniknąć tylko dlatego, że minął.
   W wersji produkcyjnej stan i filtr liczą się z dat. */
/* Miniatury — pojedyncze klatki z bazy animacji, 300 px, WebP.
   27 pozycji, komplet 234 kB. Wbudowane w plik, bo artefakty blokują
   zewnętrzne obrazy; w prawdziwej apce pójdą normalnym adresem z CDN.
   Deadhang to klatka zerowa podciągania — czyli dokładnie pozycja zwisu. */
/* Miniatury ćwiczeń — pliki w folderze img/ obok index.html.
   Pojedyncze klatki z bazy animacji, 300 px, WebP.
   W artefakcie się nie załadują (blokada domen), na GitHub Pages tak. */
const MINI_BASE = "./img/";
const MINI = Object.fromEntries(
  ["allahy", "bulgary", "deadhang", "facepull", "farmer", "kolana", "modlitewnik", "ohp", "ohpMasz", "podciaganie", "prostowanieNog", "przysiad", "rdl", "rozpietki", "sciaganie", "skos", "skosMasz", "suwnica", "tricepsKlek", "uginanieMasz", "uginanieNog", "wioslowanie", "wioslowanieMasz", "wyciskanie", "wyciskanieMasz", "wznosHantel", "wznosy"].map((n) => [n, MINI_BASE + n + ".webp"])
);


/* ── PLANY TRENINGOWE ─────────────────────────────────────────
   Trzymamy plan i AKTUALNE obciążenie na ćwiczenie — jedną liczbę,
   zmienianą wtedy, gdy faktycznie rośnie. Dziennik sesji zostaje
   w Fitness Online; tutaj interesuje nas stan, nie każdy trening. */
const CYKLE = [
  {
    id: "obecny", nazwa: "Plan maszynowy", okres: "do 31.08.2026", status: "aktualny",
    opis: "5 sesji, maszyny. Domykany kalibracją kalorii, bez zmian w treningu.",
    sesje: [
      { l: "A", n: "Push", cw: [
        { img: "wyciskanieMasz", n: "Wyciskanie na maszynie", s: "4 × 8–10", c: 60, j: "kg" },
        { img: "ohpMasz", n: "Wyciskanie żołnierskie, maszyna", s: "3 × 10–12", c: 40, j: "kg" },
        { img: "rozpietki", n: "Rozpiętki na bramie", s: "3 × 12–15", c: 20, j: "kg" },
        { img: "tricepsKlek", n: "Wyprost zza głowy w klęku", s: "klaster 15-8-5", c: 25, j: "kg" },
      ]},
      { l: "B", n: "Pull", cw: [
        { img: "sciaganie", n: "Ściąganie drążka", s: "4 × 8–10", c: 70, j: "kg" },
        { img: "wioslowanieMasz", n: "Wiosłowanie na maszynie", s: "3 × 10–12", c: 60, j: "kg" },
        { img: "uginanieMasz", n: "Uginanie na maszynie", s: "klaster 15-8-5", c: 30, j: "kg" },
      ]},
      { l: "C", n: "Legs", cw: [
        { img: "suwnica", n: "Suwnica", s: "klaster 15-8-5", c: 140, j: "kg" },
        { img: "prostowanieNog", n: "Prostowanie nóg", s: "klaster 15-8-5", c: 50, j: "kg" },
        { img: "uginanieNog", n: "Uginanie nóg leżąc", s: "3 × 10–12", c: 45, j: "kg" },
      ]},
      { l: "D", n: "Chest & Back", cw: [
        { img: "skosMasz", n: "Wyciskanie skos, maszyna", s: "4 × 8–10", c: 50, j: "kg" },
        { img: "sciaganie", n: "Ściąganie wąsko", s: "3 × 10–12", c: 65, j: "kg" },
      ]},
      { l: "E", n: "Delt & Arms", cw: [
        { img: "wznosHantel", n: "Wznos jednorącz", s: "klaster 15-8-5", c: 10, j: "kg" },
        { img: "facepull", n: "Face pull", s: "3 × 12–15", c: 25, j: "kg" },
      ]},
    ],
  },
  {
    id: "c1", nazwa: "Cykl 1 · FBW + sporty", okres: "1.09 – 31.10.2026", status: "przyszly",
    opis: "4 wyjścia: 2 × FBW + basen + kalistenika/boks. Deficyt 0,28 kg/tydz. Zero serii do upadku na bojach.",
    sesje: [
      { l: "A", n: "FBW A", cw: [
        { img: "przysiad", n: "Przysiad (goblet → sztanga)", s: "3 × 6–10", r: 2, c: null, j: "kg" },
        { img: "wyciskanie", n: "Wyciskanie hantli, ławka płaska", s: "3 × 8–12", r: 2, c: null, j: "kg" },
        { img: "wioslowanie", n: "Wiosłowanie jednorącz", s: "3 × 8–12", r: 2, c: null, j: "kg" },
        { img: "ohp", n: "OHP", s: "3 × 8–12", r: 2, c: null, j: "kg" },
        { img: "farmer", n: "Farmer walk", s: "3 × 40 m", c: null, j: "kg" },
        { img: "allahy", n: "Allahy", s: "3 × 8–12", c: null, j: "kg" },
        { img: "wznosy", n: "Wznosy bokiem na wyciągu", s: "klaster 15-8-5", c: null, j: "kg" },
        { img: "deadhang", n: "Deadhang", s: "2 × 30 s", c: null, j: "s" },
      ]},
      { l: "B", n: "FBW B", cw: [
        { img: "rdl", n: "RDL lub bułgary (naprzemiennie)", s: "3 × 8–10", r: 2, c: null, j: "kg" },
        { img: "podciaganie", n: "Podciąganie (paski)", s: "3 × maks−2", c: null, j: "powt." },
        { img: "skos", n: "Wyciskanie hantli, skos", s: "3 × 8–12", r: 2, c: null, j: "kg" },
        { img: "facepull", n: "Face pull", s: "3 × 12–15", r: 2, c: null, j: "kg" },
        { img: "kolana", n: "Unoszenie kolan w zwisie", s: "3 × 8–12", c: null, j: "powt." },
        { img: "deadhang", n: "Deadhang", s: "30 s", c: null, j: "s" },
        { img: "modlitewnik", n: "Modlitewnik", s: "klaster 15-8-5", c: null, j: "kg" },
      ]},
    ],
  },
  {
    id: "c2", nazwa: "Cykl 2 · PPL + sport", okres: "1.11 – 31.12.2026", status: "przyszly",
    opis: "3 × PPL + 1 sport. Deficyt 0,35 kg/tydz. Szczegóły na przeglądzie pod koniec października.",
    sesje: [],
  },
  {
    id: "c3", nazwa: "Cykl 3 · blok ciężki", okres: "4.01 – 28.03.2027", status: "przyszly",
    opis: "5 sesji siłowych, zero sportu. Utrzymanie kaloryczne. Boje 4–6 powtórzeń przy RIR 2 — nie schodzimy do RIR 1 przy tym śnie.",
    sesje: [],
  },
  {
    id: "c4", nazwa: "Cykl 4 · dopięcie", okres: "29.03 – 25.07.2027", status: "przyszly",
    opis: "Te same ćwiczenia i ciężary co w bloku ciężkim, serie ścięte z trzech do dwóch. IV–V: 5 sesji. VI–VII: 3 sesje + basen.",
    sesje: [],
  },
];

/* Historia zmian obciążenia — jeden wpis na zmianę, nie na sesję. */
const HISTORIA_START = {
  "Suwnica": [{ d: "2026-06-02", c: 120 }, { d: "2026-07-08", c: 130 }, { d: "2026-08-04", c: 140 }],
  "Ściąganie drążka": [{ d: "2026-06-10", c: 60 }, { d: "2026-07-15", c: 65 }, { d: "2026-08-09", c: 70 }],
  "Wyciskanie na maszynie": [{ d: "2026-06-15", c: 52.5 }, { d: "2026-07-20", c: 57.5 }, { d: "2026-08-11", c: 60 }],
};

/* Nawigacja dwupoziomowa: sekcja -> podzakładka.
   Osiem pozycji w jednym rzędzie przestało się mieścić. */
const SEKCJE = [
  { id: "dziennik", n: "Dziennik", pod: [
    { k: "wpis", l: "Wpis tygodnia" },
    { k: "dziennik", l: "Historia" },
  ]},
  { id: "plan", n: "Plan", pod: [
    { k: "plan", l: "Plan treningowy" },
    { k: "kalendarz", l: "Kalendarz" },
  ]},
  { id: "kuchnia", n: "Kuchnia", pod: [
    { k: "kuchnia", l: "Cookbook" },
    { k: "kalk", l: "Kalkulator makro" },
  ]},
  { id: "staty", n: "Statystyki", pod: [
    { k: "staty", l: "Postęp" },
    { k: "pomiary", l: "Pomiary" },
  ]},
];

const AGENDA_HORYZONT = 30;
const AGENDA = [
  { id: 1, co: "Kontrola snu → decyzja o tempie deficytu", kiedy: "zaległe od 3 dni", stan: "zalegle",
    czemu: "od tego zależy, czy można przyspieszyć" },
  { id: 2, co: "Pomiar wymiarów ciała", kiedy: "1 listopada", stan: "teraz",
    czemu: "co miesiąc · obwody schodzą uczciwiej niż waga" },
  { id: 3, co: "Test sprawnościowy #3 + przegląd cyklu", kiedy: "za 3 tygodnie", stan: "wkrotce",
    czemu: "co 8 tygodni · hollow, podciągnięcia, dipy" },
];

/* Wydarzenia projektu. typ steruje kolorem: pomiar, test, badanie, faza, wyjazd. */
const WYDARZENIA_INIT = [
  { d: "2026-08-13", t: "badanie", n: "Badania krwi — baseline" },
  { d: "2026-08-22", t: "badanie", n: "Spirometria — baseline" },
  { d: "2026-09-05", t: "test", n: "Test sprawnościowy #1" },
  { d: "2026-08-31", t: "faza", n: "Start bety — pliki do projektu" },

  { d: "2026-09-06", t: "faza", n: "Dzień bez treningu — przed DEXA" },
  { d: "2026-09-01", t: "faza", n: "Cykl 1 · FBW + sporty · podmiana PLAN.md" },
  { d: "2026-09-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2026-09-07", t: "badanie", n: "DEXA #2 — baseline przed deficytem" },
  { d: "2026-09-22", t: "wyjazd", n: "Góry 22–27.09 — utrzymanie, 1 × FBW, stabilizator" },

  { d: "2026-10-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2026-10-01", t: "faza", n: "4 dni w biurze — start mealprepów" },
  { d: "2026-11-01", t: "faza", n: "Cykl 2 · 3 × PPL + 1 sport" },
  { d: "2026-10-24", t: "test", n: "Test sprawnościowy #2" },
  { d: "2026-10-26", t: "faza", n: "Przegląd cyklu · powrót na 80%" },

  { d: "2026-11-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2026-11-15", t: "faza", n: "Kontrola snu → tempo deficytu" },
  { d: "2026-11-20", t: "faza", n: "Decyzja o Londynie" },

  { d: "2026-12-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2026-12-18", t: "badanie", n: "DEXA #3" },
  { d: "2026-12-19", t: "test", n: "Test sprawnościowy #3" },
  { d: "2026-12-21", t: "badanie", n: "Odstawić Seretide — 24 h przed spirometrią" },
  { d: "2026-12-22", t: "badanie", n: "Spirometria — kontrola (24 h bez leków)" },
  { d: "2026-12-21", t: "badanie", n: "Kontrola krwi" },
  { d: "2026-12-24", t: "wyjazd", n: "Święta — bez ważenia do 2 stycznia" },
  { d: "2026-12-31", t: "faza", n: "Koniec cyklu 2 · cel 90,0 kg" },

  { d: "2027-01-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2027-01-04", t: "faza", n: "Cykl 3 · blok ciężki · 5 sesji, zero sportu" },

  { d: "2027-02-01", t: "pomiar", n: "Wymiary ciała" },
  
  { d: "2027-02-27", t: "test", n: "Test sprawnościowy #4" },


  { d: "2027-03-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2027-03-28", t: "wyjazd", n: "Wielkanoc — na utrzymaniu, blok kończy się tego dnia" },
  { d: "2027-03-29", t: "faza", n: "Cykl 4 · dopięcie · 0,50 kg/tydz" },

  { d: "2027-04-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2027-04-10", t: "badanie", n: "DEXA #4" },
  { d: "2027-04-11", t: "test", n: "Test sprawnościowy #5" },


  { d: "2027-05-01", t: "pomiar", n: "Wymiary ciała" },

  { d: "2027-06-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2027-06-01", t: "faza", n: "Zejście do 3 sesji + basen" },
  { d: "2027-06-05", t: "test", n: "Test sprawnościowy #6" },
  { d: "2027-07-01", t: "pomiar", n: "Wymiary ciała" },
  { d: "2027-07-17", t: "badanie", n: "DEXA #5 — pomiar końcowy" },
  { d: "2027-07-25", t: "faza", n: "Cel: 82 kg · 13% tłuszczu" },
];

const DZIENNE_INIT = {};

const MIESIACE = ["styczeń","luty","marzec","kwiecień","maj","czerwiec",
  "lipiec","sierpień","wrzesień","październik","listopad","grudzień"];
const DNI_SKR = ["Pn","Wt","Śr","Cz","Pt","So","Nd"];

/** Siatka miesiąca od poniedziałku, z dopełnieniem sąsiednich miesięcy. */
function siatka(rok, mies) {
  const pierwszy = new Date(rok, mies, 1);
  const offset = (pierwszy.getDay() + 6) % 7;
  const dni = [];
  for (let i = 0; i < 42; i++) {
    const dt = new Date(rok, mies, 1 - offset + i);
    dni.push({
      dt,
      iso: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
      obcy: dt.getMonth() !== mies,
      niedziela: dt.getDay() === 0,
    });
  }
  return dni.slice(0, dni.slice(35).some((x) => !x.obcy) ? 42 : 35);
}

const SILA = ["regres", "lekki regres", "stagnacja", "lekki progres", "progres"];

/* ── ziarno stanu przy pierwszym uruchomieniu ─────────────── */
const ENTRIES_INIT = [];

const COMMENTS_INIT = {};

const TESTY_INIT = [];

const CARDIO_INIT = [];

const SPIRO_INIT = [];

/* Baseline 05.05.2026 (ALAB / ENEL-MED Łódź). flaga: null = w normie,
   "prog" = na granicy zakresu, "gora" = przy górnej granicy. */
const KREW_INIT = [];

const KREW_BRAKI_INIT = [];

const WYMIARY_INIT = [];

const MIARY = [
  ["biceps", "Biceps"], ["klatka", "Klatka"], ["talia", "Talia"], ["pas", "Pas"],
  ["biodra", "Biodra"], ["udo", "Udo"], ["lydka", "Łydka"],
];

const SCANS_INIT = [];

const DANIA_INIT = [];

/* ── narzędzia ────────────────────────────────────────────── */
const d = (s) => new Date(s + "T00:00:00").getTime();
const num = (v, p = 1) =>
  v === null || v === undefined || Number.isNaN(v) ? "—" : v.toFixed(p).replace(".", ",");
const signed = (v, p = 1) => {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const t = Math.abs(v).toFixed(p).replace(".", ",");
  return parseFloat(t.replace(",", ".")) === 0 ? "0" + (p ? "," + "0".repeat(p) : "") : (v > 0 ? "+" : "−") + t;
};

function planAt(dateStr) {
  const t = d(dateStr);
  if (t <= d(MILESTONES[0].date)) return MILESTONES[0].weight;
  const last = MILESTONES[MILESTONES.length - 1];
  if (t >= d(last.date)) return last.weight;
  for (let i = 0; i < MILESTONES.length - 1; i++) {
    const a = MILESTONES[i], b = MILESTONES[i + 1];
    if (t >= d(a.date) && t <= d(b.date)) {
      const r = (t - d(a.date)) / (d(b.date) - d(a.date));
      return a.weight + (b.weight - a.weight) * r;
    }
  }
  return last.weight;
}
/** Średnia z pól dziennych. Puste i niepoprawne wpisy są pomijane,
 *  więc brak pomiaru nie zaniża wyniku. */
function srednia(arr) {
  const v = arr
    .map((x) => parseFloat(String(x).replace(",", ".")))
    .filter((x) => !Number.isNaN(x));
  return v.length ? { avg: v.reduce((a, b) => a + b, 0) / v.length, n: v.length } : { avg: null, n: 0 };
}

/* Wpis domyka niedzielę. Jeśli dziś jest niedziela, bierzemy dziś. */
function ostatniaNiedziela() {
  const t = new Date();
  t.setDate(t.getDate() - t.getDay());
  return t.toISOString().slice(0, 10);
}

const DNI = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

const phaseAt = (s) => PHASES.find((p) => d(s) >= d(p.from) && d(s) < d(p.to)) || PHASES[0];

export default function Mockup() {
  /* ── Stan trwały ────────────────────────────────────────
     Wszystko poniżej było wcześniej stałą w kodzie. Nazwy zostały te same,
     więc miejsca użycia się nie zmieniły — zmieniło się to, że dane
     przeżywają odświeżenie strony. */
  const zapisany = useRef(wczytajStan()).current;
  const z = (nazwa, dom) => (zapisany && zapisany[nazwa] !== undefined ? zapisany[nazwa] : dom);

  const [ustawienia, setUstawienia] = useState(() =>
    ({ ...USTAWIENIA_DOM, ...odczytaj(KLUCZ_USTAWIENIA, {}) }));

  const [ENTRIES, setEntries]     = useState(() => z("entries", ENTRIES_INIT));
  const [COMMENTS, setComments]   = useState(() => z("comments", COMMENTS_INIT));
  const [WYMIARY, setWymiary]     = useState(() => z("wymiary", WYMIARY_INIT));
  const [TESTY, setTesty]         = useState(() => z("testy", TESTY_INIT));
  const [CARDIO, setCardio]       = useState(() => z("cardio", CARDIO_INIT));
  const [SPIRO, setSpiro]         = useState(() => z("spiro", SPIRO_INIT));
  const [KREW, setKrew]           = useState(() => z("krew", KREW_INIT));
  const [KREW_BRAKI, setKrewBraki]= useState(() => z("krewBraki", KREW_BRAKI_INIT));
  const [SCANS, setScans]         = useState(() => z("skany", SCANS_INIT));
  const [DANIA, setDania]         = useState(() => z("dania", DANIA_INIT));
  const [DZIENNE, setDzienne]     = useState(() => z("dzienne", DZIENNE_INIT));
  const [WYDARZENIA, setWydarzenia] = useState(() =>
    z("wydarzenia", WYDARZENIA_INIT.map((w, i) => ({ ...w, id: i + 1, zrobione: false }))));

  /* Fazy i kamienie milowe czytają funkcje modułowe. Podmieniamy je przy
     każdej zmianie ustawień, żeby wykres planu i prognoza liczyły się
     z aktualnego tempa, a nie z wartości wpisanej w kod. */
  MILESTONES = ustawienia.kamienie;
  PHASES = ustawienia.fazy;
  PLAN_KCAL = ustawienia.planKcal;

  const [tab, setTab] = useState("wpis");
  /* Pola formularza tygodniowego. W mockupie były narysowane na sztywno —
     tutaj muszą trzymać wartość, bo z nich powstaje rekord tygodnia. */
  const [sen, setSen] = useState(3);
  const [fbw, setFbw] = useState(2);
  const [sila, setSila] = useState(2);
  const [akty, setAkty] = useState([]);
  const [cheaty, setCheaty] = useState(0);
  const [notatka, setNotatka] = useState("");
  const [poza, setPoza] = useState(false);
  const [wymForm, setWymForm] = useState(() => ({ date: new Date().toISOString().slice(0, 10), masa: "" }));
  const [openWeek, setOpenWeek] = useState(null);
  const [filtr, setFiltr] = useState("wszystko");
  const [stage, setStage] = useState("form");
  const [kom, setKom] = useState("");
  const [skopiowane, setSkopiowane] = useState(false);
  const [podglad, setPodglad] = useState(false);
  const [waga, setWaga] = useState("");
  const [kcal, setKcal] = useState("");
  const [dniWaga, setDniWaga] = useState(["","","","","","",""]);
  const [dniKcal, setDniKcal] = useState(["","","","","","",""]);
  const [openWaga, setOpenWaga] = useState(false);
  const [openKcal, setOpenKcal] = useState(false);
  const [dark, setDark] = useState(() => !!odczytaj(KLUCZ_USTAWIENIA, {}).ciemny);
  const [expOpen, setExpOpen] = useState(false);
  const [setOpen, setSetOpen] = useState(false);
  const [odblokowany, setOdblokowany] = useState(false);
  const [pinWpis, setPinWpis] = useState("");
  const [ev, setEv] = useState(null);
  const [dataWpisu, setDataWpisu] = useState(() => ostatniaNiedziela());
  const [pas, setPas] = useState("");
  const [imp, setImp] = useState(null);
  const [impW, setImpW] = useState(null);
  const [impBlad, setImpBlad] = useState(null);
  const [pod, setPod] = useState("wymiary");
  const [cyklId, setCyklId] = useState("obecny");
  const [sesjaL, setSesjaL] = useState("A");
  const [ciezary, setCiezary] = useState(() => {
    const o = {};
    CYKLE.forEach((c) => c.sesje.forEach((se) => se.cw.forEach((x) => {
      if (x.c != null) o[x.n] = x.c;
    })));
    return o;
  });
  const [historia, setHistoria] = useState(HISTORIA_START);
  const [rozwin, setRozwin] = useState(null);
  const [opis, setOpis] = useState("");
  const [wynik, setWynik] = useState(null);
  const [liczy, setLiczy] = useState(false);
  const [bladAI, setBladAI] = useState(null);
  const [porcje, setPorcje] = useState("1");
  const [nazwa, setNazwa] = useState("");
  const [zapisane, setZapisane] = useState([]);

  /* ── Zapis ──────────────────────────────────────────────
     Jeden worek, jeden zapis. Osobne klucze na sekcję dawałyby kilkanaście
     zapisów przy każdej zmianie i rozjazd przy synchronizacji. */
  const stanDoZapisu = useMemo(() => ({
    entries: ENTRIES, comments: COMMENTS, wymiary: WYMIARY, testy: TESTY,
    cardio: CARDIO, spiro: SPIRO, krew: KREW, krewBraki: KREW_BRAKI,
    skany: SCANS, dania: DANIA, dzienne: DZIENNE, wydarzenia: WYDARZENIA,
    ciezary, historia, zapisane,
  }), [ENTRIES, COMMENTS, WYMIARY, TESTY, CARDIO, SPIRO, KREW, KREW_BRAKI,
       SCANS, DANIA, DZIENNE, WYDARZENIA, ciezary, historia, zapisane]);

  const [zapisBlad, setZapisBlad] = useState(null);
  const pierwszy = useRef(true);

  const [zapisano, setZapisano] = useState(null);
  const pierwszyZapis = useRef(true);

  useEffect(() => {
    /* Pierwsze uruchomienie to stan właśnie wczytany z pamięci, nie zmiana.
       Zapis w tym momencie odświeżałby znacznik czasu i urządzenie zawsze
       wyglądałoby na nowsze od repozytorium — przez co nigdy nie wiedziałoby,
       że powinno pobrać dane z drugiego sprzętu. */
    if (pierwszyZapis.current) {
      pierwszyZapis.current = false;
      setZapisano((odczytaj(KLUCZ, {}) || {}).zapis || null);
      return;
    }
    const teraz = new Date().toISOString();
    const ok = zapisz(KLUCZ, { schema: SCHEMA, zapis: teraz, dane: stanDoZapisu });
    setZapisBlad(ok ? null : "Przeglądarka nie pozwala zapisywać danych. Wyjdź z trybu prywatnego albo zezwól na pamięć lokalną — inaczej nic się nie zachowa.");
    if (ok) { setZapisano(teraz); wyslijWTle(); }
  }, [stanDoZapisu]);

  useEffect(() => { zapisz(KLUCZ_USTAWIENIA, ustawienia); }, [ustawienia]);

  /* ── Synchronizacja ─────────────────────────────────────
     sha ostatniego pobrania trzymamy po to, żeby wykryć zapis z innego
     urządzenia. Bez tego dwa telefony po cichu kasowałyby sobie dane. */
  const [sync, setSync] = useState({ stan: "bezczynny", kiedy: null, blad: null, sha: null });

  function wgrajStan(dane) {
    if (!dane) return;
    if (dane.entries) setEntries(dane.entries);
    if (dane.comments) setComments(dane.comments);
    if (dane.wymiary) setWymiary(dane.wymiary);
    if (dane.testy) setTesty(dane.testy);
    if (dane.cardio) setCardio(dane.cardio);
    if (dane.spiro) setSpiro(dane.spiro);
    if (dane.krew) setKrew(dane.krew);
    if (dane.krewBraki) setKrewBraki(dane.krewBraki);
    if (dane.skany) setScans(dane.skany);
    if (dane.dania) setDania(dane.dania);
    if (dane.dzienne) setDzienne(dane.dzienne);
    if (dane.wydarzenia) setWydarzenia(dane.wydarzenia);
    if (dane.ciezary) setCiezary(dane.ciezary);
    if (dane.historia) setHistoria(dane.historia);
    if (dane.zapisane) setZapisane(dane.zapisane);
  }

  async function synchronizuj(kierunek, auto) {
    if (kierunek === "wyslij" && auto && !zgodne) return;
    if (!ustawienia.token || !ustawienia.repo) {
      setSync({ ...sync, stan: "blad", blad: "Uzupełnij repozytorium i token w Ustawieniach." });
      return;
    }
    setSync({ ...sync, stan: "pracuje", blad: null });
    try {
      if (kierunek === "pobierz") {
        const { dane, sha } = await ghPobierz(ustawienia);
        if (!dane) {
          setSync({ stan: "gotowe", kiedy: new Date().toISOString(), blad: "W repozytorium nie ma jeszcze pliku — wyślij dane z tego urządzenia.", sha: null });
          return;
        }
        /* Pobranie nadpisuje pamięć urządzenia, więc musi sprawdzić, co jest
           nowsze. Bez tego pobranie przy starcie kasuje pomiar wpisany po
           ostatniej wysyłce — i robi to po cichu. */
        const lokalny = (odczytaj(KLUCZ, {}) || {}).zapis || "";
        const zdalny = dane.zapis || "";
        if (lokalny && zdalny && lokalny > zdalny) {
          if (auto) {
            setSync({ stan: "gotowe", kiedy: new Date().toISOString(), sha,
              blad: "Dane na tym urządzeniu są nowsze niż w repozytorium — nic nie pobrałem. Kliknij „Wyślij stąd”, żeby je wysłać." });
            return;
          }
          const zgoda = window.confirm(
            "Na tym urządzeniu masz nowsze dane niż w repozytorium.\n\n" +
            "OK — pobierz mimo to i porzuć zmiany zrobione tutaj.\nAnuluj — zostaw jak jest."
          );
          if (!zgoda) { setSync({ ...sync, stan: "bezczynny", sha }); return; }
        }
        wgrajStan(dane.dane || dane);
        setZgodne(true);
        setSync({ stan: "gotowe", kiedy: new Date().toISOString(), blad: null, sha });
      } else {
        let sha = sync.sha;
        if (sha == null) {
          const p = await ghPobierz(ustawienia);
          sha = p.sha;
          /* Zdalny plik nowszy od naszego ostatniego pobrania — nie nadpisujemy
             po cichu, tylko pytamy. To jedyny moment, w którym da się stracić dane. */
          if (p.dane && p.dane.zapis && zapisany && p.dane.zapis > (odczytaj(KLUCZ, {}).zapis || "")) {
            const zgoda = window.confirm(
              "W repozytorium są nowsze dane niż na tym urządzeniu.\n\n" +
              "OK — nadpisz je tym, co masz tutaj.\nAnuluj — najpierw pobierz zdalne."
            );
            if (!zgoda) { setSync({ ...sync, stan: "bezczynny" }); return; }
          }
        }
        /* Wysyłka uboższego stanu to najczęstsza droga do utraty danych:
           urządzenie otwarte pierwszy raz kasuje dorobek z drugiego. */
        if (sync.zdalneLiczby) {
          const tu = (stanDoZapisu.entries || []).length + (stanDoZapisu.wymiary || []).length
                   + (stanDoZapisu.dania || []).length + (stanDoZapisu.skany || []).length;
          if (tu < sync.zdalneLiczby) {
            if (auto) { setZgodne(false); setZdalneNowsze(true); setSync({ ...sync, stan: "bezczynny" }); return; }
            const zgoda = window.confirm(
              "W repozytorium jest więcej danych niż na tym urządzeniu.\n\n" +
              "Wysłanie je zastąpi. Na pewno?"
            );
            if (!zgoda) { setSync({ ...sync, stan: "bezczynny" }); return; }
          }
        }
        const nowe = await ghZapisz(ustawienia, { schema: SCHEMA, zapis: new Date().toISOString(), dane: stanDoZapisu }, sha);
        setZgodne(true);
        setSync({ stan: "gotowe", kiedy: new Date().toISOString(), blad: null, sha: nowe, zdalneLiczby: null });
      }
    } catch (e) {
      if (e.message === "KONFLIKT") { setZgodne(false); setZdalneNowsze(true); }
      setSync({ ...sync, stan: "blad", blad: e.message === "KONFLIKT"
        ? "Ktoś zapisał w międzyczasie. Pobierz zdalne dane i spróbuj ponownie."
        : e.message });
    }
  }

  /* Przy starcie tylko sprawdzamy, czy zdalne są nowsze — i mówimy o tym.
     Automatyczne pobieranie kasowałoby pracę zrobioną na tym urządzeniu,
     a to jedyna operacja w apce zdolna zniszczyć dane. */
  const [zdalneNowsze, setZdalneNowsze] = useState(false);

  useEffect(() => {
    if (!pierwszy.current) return;
    pierwszy.current = false;
    if (!ustawienia.autosync || !ustawienia.token || !ustawienia.repo) return;
    ghPobierz(ustawienia).then(({ dane, sha }) => {
      setSync((p) => ({ ...p, sha }));
      const lokalny = (odczytaj(KLUCZ, {}) || {}).zapis || "";
      const dd = dane && (dane.dane || dane);
      if (dd) {
        const ile = (dd.entries || []).length + (dd.wymiary || []).length
                  + (dd.dania || []).length + (dd.skany || []).length;
        setSync((p) => ({ ...p, sha, zdalneLiczby: ile }));
      }
      /* Zdalne nowsze — urządzenie zostaje w tyle i nie ma prawa wysyłać,
         dopóki człowiek nie zdecyduje. W przeciwnym razie jest zgodne
         i od tej chwili wysyła samo. */
      if (dane && dane.zapis && (!lokalny || dane.zapis > lokalny)) setZdalneNowsze(true);
      else setZgodne(true);
    }).catch(() => {});
  }, []);

  /* ── Wysyłka automatyczna z bramką ──────────────────────
     Problemem nigdy nie była automatyczność, tylko wysyłanie przez
     urządzenie, które nie wie, co leży na serwerze. Telefon otwarty
     pierwszy raz miał uboższą pamięć i nadpisywał nią dorobek z komputera.

     Stąd warunek: urządzenie wysyła samo dopiero po tym, jak w tej sesji
     potwierdziło, że jest zgodne ze zdalnym albo od niego nowsze.
     Dopóki na górze wisi pasek „zdalne są nowsze", automat śpi. */
  const [zgodne, setZgodne] = useState(false);
  const wyslijPozniej = useRef(null);

  const czeka = useRef(false);

  function wyslijWTle() {
    if (!ustawienia.autosync || !ustawienia.token || !ustawienia.repo) return;
    if (!zgodne) return;
    czeka.current = true;
    clearTimeout(wyslijPozniej.current);
    wyslijPozniej.current = setTimeout(() => {
      czeka.current = false;
      synchronizuj("wyslij", true);
    }, 2000);
  }

  /* Odświeżenie albo zamknięcie karty w oknie oczekiwania ucinało wysyłkę.
     Przy wyjściu domykamy ją natychmiast, bez czekania na odpowiedź. */
  useEffect(() => {
    const domknij = () => {
      if (!czeka.current) return;
      clearTimeout(wyslijPozniej.current);
      czeka.current = false;
      try {
        fetch(`https://api.github.com/repos/${ustawienia.repo}/contents/${GH_PLIK}`, {
          method: "PUT", keepalive: true,
          headers: { ...ghNaglowki(ustawienia.token), "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Rejestr — zamknięcie karty",
            content: doBase64(JSON.stringify({ schema: SCHEMA, zapis: new Date().toISOString(), dane: stanDoZapisu }, null, 2)),
            sha: sync.sha || undefined,
          }),
        });
      } catch (e) { /* przy zamykaniu nie ma komu pokazać błędu */ }
    };
    window.addEventListener("pagehide", domknij);
    window.addEventListener("beforeunload", domknij);
    return () => {
      window.removeEventListener("pagehide", domknij);
      window.removeEventListener("beforeunload", domknij);
    };
  }, [stanDoZapisu, ustawienia, sync.sha]);

  /* ── Zapis tygodnia ─────────────────────────────────────
     Wpis z tą samą datą nadpisuje poprzedni zamiast tworzyć duplikat —
     poprawka po fakcie jest częstsza niż drugi wpis w tym samym tygodniu. */
  function zapiszTydzien() {
    const w = liczba(waga);
    if (w == null) { window.alert("Bez wagi tydzień nie ma czego zapisać."); return; }
    const rekord = {
      id: Date.now(),
      date: dataWpisu,
      weight: w,
      waist: liczba(pas),
      sleep: sen,
      fbw,
      sila: sila + 1,
      acts: akty,
      kcal: Math.round(liczba(kcal) || 0),
      cheats: cheaty,
      note: notatka,
      poza,
    };
    setEntries((prev) => {
      const bez = prev.filter((e) => e.date !== dataWpisu);
      return [...bez, rekord].sort((a, b) => (a.date < b.date ? -1 : 1));
    });

    /* Dni z panelu siedmiodniowego zasilają kalendarz. Puste pola pomijamy,
       żeby brak ważenia nie zapisał się jako zero. */
    const start = d(dataWpisu) - 6 * 864e5;
    const nowe = { ...DZIENNE };
    for (let i = 0; i < 7; i++) {
      const dzien = new Date(start + i * 864e5).toISOString().slice(0, 10);
      const wg = liczba(dniWaga[i]);
      const kc = liczba(dniKcal[i]);
      if (wg != null || kc != null)
        nowe[dzien] = { waga: wg, kcal: kc == null ? null : Math.round(kc) };
    }
    setDzienne(nowe);
    setStage("domkniecie");
  }

  function zapiszKomentarz() {
    if (!kom.trim()) return;
    setComments({ ...COMMENTS, [dataWpisu]: kom });
    setStage("gotowe");
  }

  /* Wyczyszczenie formularza pod kolejny tydzień. Obciążenia, dane i ustawienia
     zostają — kasujemy tylko to, co dotyczy jednego wpisu. */
  function nowyTydzien() {
    setWaga(""); setKcal(""); setPas("");
    setDniWaga(["","","","","","",""]);
    setDniKcal(["","","","","","",""]);
    setSen(3); setFbw(2); setSila(2); setAkty([]); setCheaty(0);
    setNotatka(""); setPoza(false); setKom(""); setSkopiowane(false);
    setImp(null); setImpW(null); setImpBlad(null);
    setStage("form");
    const n = new Date(d(dataWpisu) + 7 * 864e5);
    setDataWpisu(n.toISOString().slice(0, 10));
  }

  /* Usunięcie wpisu zabiera też komentarz — jeden tydzień to jeden rekord.
     Dane dzienne z importu CSV zostają, bo należą do kalendarza. */
  function usunTydzien(data) {
    if (!window.confirm(`Usunąć wpis z ${data} razem z komentarzem?`)) return;
    setEntries((prev) => prev.filter((e) => e.date !== data));
    setComments((prev) => { const k = { ...prev }; delete k[data]; return k; });
    setOpenWeek(null);
  }

  /* Poprawka po fakcie: wpis wraca do formularza, a zapis go nadpisze,
     bo zapiszTydzien dopasowuje po dacie. */
  function wczytajTydzien(e) {
    setDataWpisu(e.date);
    setWaga(num(e.weight)); setPas(e.waist == null ? "" : String(e.waist));
    setKcal(e.kcal ? String(e.kcal) : "");
    setSen(e.sleep); setFbw(e.fbw); setSila(Math.max(0, e.sila - 1));
    setAkty(e.acts || []); setCheaty(e.cheats || 0);
    setNotatka(e.note || ""); setPoza(!!e.poza);
    setKom(COMMENTS[e.date] || ""); setSkopiowane(false);
    setStage("form"); setTab("wpis");
  }

  /* ── Kuchnia ────────────────────────────────────────────
     Przepis żyje w trzech miejscach: vault, PRZEPISY.md i tutaj.
     Źródłem prawdy jest vault — apka jest podglądem i miejscem szybkiej
     poprawki tuż po ugotowaniu, po której eksportujesz plik z powrotem. */
  const [otwarte, setOtwarte] = useState(null);
  const [edycja, setEdycja] = useState(null);
  const [roboczy, setRoboczy] = useState("");
  const [mdBlad, setMdBlad] = useState(null);

  function wgrajPrzepisy(pliki) {
    setMdBlad(null);
    Array.from(pliki || []).forEach((plik) => {
      const r = new FileReader();
      r.onload = () => {
        const p = czytajPrzepis(r.result);
        if (p.braki.length)
          setMdBlad(`W pliku „${plik.name}" nie znalazłem: ${p.braki.join(", ")}. Uzupełnij ręcznie po wgraniu.`);
        const rek = {
          id: Date.now() + Math.random(),
          nazwa: p.tytul,
          bialko: p.makro ? p.makro.b : null,
          blonnik: p.makro ? p.makro.bl : null,
          makro: p.makro,
          makroBaza: p.makro,
          porcje: p.porcje,
          porcjeBaza: p.porcje,
          posilek: p.posilek,
          ocena: p.ocena,
          zona: p.zona,
          status: p.ocena ? "vault" : "kuchnia",
          data: null,
          zmiany: "",
          plik: plik.name,
          tresc: r.result,
        };
        setDania((prev) => [...prev.filter((x) => x.nazwa !== rek.nazwa), rek]);
      };
      r.readAsText(plik);
    });
  }

  function zmienDanie(id, zmiana) {
    setDania((prev) => prev.map((x) => (x.id === id ? { ...x, ...zmiana } : x)));
  }

  function usunDanie(id) {
    if (!window.confirm("Usunąć to danie z apki? Plik w vaulcie zostaje.")) return;
    setDania((prev) => prev.filter((x) => x.id !== id));
    if (otwarte === id) setOtwarte(null);
  }

  function ocenDanie(id, pole, v) {
    const x = v === "" ? null : Math.max(0, Math.min(10, parseFloat(String(v).replace(",", "."))));
    setDania((prev) => prev.map((dd) => {
      if (dd.id !== id) return dd;
      const nowe = { ...dd, [pole]: Number.isNaN(x) ? null : x };
      if (nowe.tresc) nowe.tresc = wstawDoMarkdownu(nowe.tresc,
        { ocena: nowe.ocena, zona: nowe.zona, porcje: nowe.porcje, makro: nowe.makro });
      return nowe;
    }));
  }

  /* Przy zmianie podziału makro liczy się z całości, nie z poprzedniej porcji —
     inaczej po kilku zmianach narastałby błąd zaokrągleń. */
  function zmienPorcje(x, delta) {
    const nowe = Math.max(1, (x.porcje || 1) + delta);
    const makro = przelicz(x.makroBaza || x.makro, x.porcjeBaza || x.porcje, nowe);
    setDania((prev) => prev.map((dd) => {
      if (dd.id !== x.id) return dd;
      const r = { ...dd, porcje: nowe, makro, bialko: makro ? makro.b : dd.bialko,
        blonnik: makro ? makro.bl : dd.blonnik };
      if (r.tresc) r.tresc = wstawDoMarkdownu(r.tresc,
        { ocena: r.ocena, zona: r.zona, porcje: nowe, makro });
      return r;
    }));
  }

  /* Kontrola progów z ZYWIENIE.md. Dokładnie ten problem wyszedł przy curry:
     podział na sześć porcji zamiast pięciu zbił białko o gram poniżej progu. */
  function progAlarm(x) {
    const p = PROGI[x.posilek] || PROGI.lunch;
    const m = x.makro;
    if (!m) return null;
    const braki = [];
    if (m.b != null && m.b < p.b) braki.push(`białko ${num(m.b)} g przy progu ${p.b}`);
    if (m.bl != null && m.bl < p.bl) braki.push(`błonnik ${num(m.bl)} g przy progu ${p.bl}`);
    return braki.length ? `Poniżej progu na ${p.nazwa}: ${braki.join(", ")}` : null;
  }

  function edytujDanie(x) { setEdycja(x.id); setRoboczy(x.tresc); setOtwarte(x.id); }

  function zapiszEdycje(id) {
    const p = czytajPrzepis(roboczy);
    setDania((prev) => prev.map((x) => (x.id === id ? {
      ...x, tresc: roboczy, nazwa: p.tytul, porcje: p.porcje, porcjeBaza: p.porcje,
      makro: p.makro, makroBaza: p.makro, posilek: p.posilek,
      bialko: p.makro ? p.makro.b : x.bialko, blonnik: p.makro ? p.makro.bl : x.blonnik,
      ocena: p.ocena ?? x.ocena, zona: p.zona ?? x.zona,
    } : x)));
    setEdycja(null);
  }

  function eksportujPrzepis(x) {
    const blob = new Blob([x.tresc], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = x.plik || (x.nazwa + ".md");
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ── Raporty z badań ────────────────────────────────────
     Krew i spirometria to dwadzieścia pozycji z zakresami — przepisywanie
     ręczne to kwadrans i realne ryzyko literówki w wartości, która potem
     psuje porównanie. Podgląd przed zapisem jest obowiązkowy. */
  const [raportPodglad, setRaportPodglad] = useState(null);
  const [testForm, setTestForm] = useState(() =>
    ({ date: new Date().toISOString().slice(0, 10), hollow: "", pull: "", dip: "" }));
  const [skladForm, setSkladForm] = useState(() =>
    ({ date: new Date().toISOString().slice(0, 10), kind: "DEXA", weight: "", fat: "", lean: "" }));

  /* Masa przy teście bierze się z ostatniego tygodnia — siła względem masy
     ciała jest tu jedyną wartościową liczbą, a wpisywanie jej ręcznie
     drugi raz byłoby okazją do rozjazdu. */
  function zapiszTest() {
    const p = parseInt(testForm.pull, 10);
    if (Number.isNaN(p)) { window.alert("Bez podciągnięć test nie ma treści."); return; }
    setTesty((prev) => [...prev.filter((x) => x.date !== testForm.date), {
      id: Date.now(), date: testForm.date,
      hollow: parseInt(testForm.hollow, 10) || 0, pull: p,
      dip: parseInt(testForm.dip, 10) || 0,
      masa: pusty ? null : latest.weight,
    }].sort((a, b) => (a.date < b.date ? -1 : 1)));
    setTestForm({ date: new Date().toISOString().slice(0, 10), hollow: "", pull: "", dip: "" });
  }

  function zapiszSklad() {
    const w = liczba(skladForm.weight), f = liczba(skladForm.fat), l = liczba(skladForm.lean);
    if (f == null || l == null) { window.alert("Procent tłuszczu i masa beztłuszczowa są konieczne."); return; }
    setScans((prev) => [...prev.filter((x) => !(x.date === skladForm.date && x.kind === skladForm.kind)), {
      id: Date.now(), date: skladForm.date, kind: skladForm.kind, weight: w, fat: f, lean: l,
    }].sort((a, b) => (a.date < b.date ? -1 : 1)));
    setSkladForm({ date: new Date().toISOString().slice(0, 10), kind: "DEXA", weight: "", fat: "", lean: "" });
  }

  function wgrajRaport(plik) {
    const r = new FileReader();
    r.onload = () => {
      const rp = czytajRaport(r.result);
      if (!rp.pozycje.length) { window.alert("Nie znalazłem w pliku tabeli z wynikami."); return; }
      setRaportPodglad(rp);
    };
    r.readAsText(plik);
  }

  function zatwierdzRaport() {
    const rp = raportPodglad;
    const data = rp.data || new Date().toISOString().slice(0, 10);
    if (rp.rodzaj === "krew") {
      /* Widok grupuje wyniki po pobraniu, nie po parametrze — porównanie
         majowego z grudniowym ma sens tylko w obrębie jednego dnia. */
      const jednostka = (w) => (String(w).match(/[\d,.]+\s*(.*)$/) || [])[1] || "";
      const wartosc = (w) => (String(w).match(/^[\d,.]+/) || [""])[0];
      const grupa = {
        grupa: rp.grupa || "Pobranie " + data,
        data,
        poz: rp.pozycje.map((p) => ({
          n: p.nazwa, w: wartosc(p.wynik), j: jednostka(p.wynik),
          ref: p.zakres, uwaga: p.uwaga,
          flaga: /granic|podwyższ|obniż|nisk|wysok/i.test(p.uwaga) ? "uwaga" : null,
        })),
      };
      setKrew((prev) => [...prev.filter((g) => g.data !== data), grupa]
        .sort((a, b) => (a.data < b.data ? -1 : 1)));
    } else if (rp.rodzaj === "spirometria") {
      /* Spirometria trzyma jeden wiersz na badanie, nie na parametr —
         wartości odniesienia dla grudnia to FEV1, FVC i ich stosunek. */
      const licz = (n) => {
        const p = rp.pozycje.find((x) => new RegExp("^" + n, "i").test(x.nazwa));
        return p ? parseFloat(String(p.wynik).replace(",", ".")) : null;
      };
      const fev1 = licz("FEV1(?!/)"), fvc = licz("FVC");
      const wiersz = {
        id: Date.now(), date: data, fev1, fvc,
        ratio: licz("FEV1/FVC") ?? (fev1 && fvc ? Math.round((fev1 / fvc) * 1000) / 10 : null),
        norma: licz("% normy") ?? null,
      };
      setSpiro((prev) => [...prev.filter((x) => x.date !== data), wiersz]
        .sort((a, b) => (a.date < b.date ? -1 : 1)));
    } else if (rp.rodzaj === "dexa") {
      const w = (n) => {
        const p = rp.pozycje.find((x) => new RegExp(n, "i").test(x.nazwa));
        return p ? parseFloat(String(p.wynik).replace(",", ".")) : null;
      };
      setScans((prev) => [...prev, { id: Date.now(), date: data, kind: "DEXA",
        weight: w("suma|masa całkowita|waga"), fat: w("procent|% tłuszcz"), lean: w("beztłuszczow") }]);
    }
    setRaportPodglad(null);
  }

  /* ── Wydarzenia ─────────────────────────────────────────
     Odhaczenie zdejmuje pozycję z panelu „Nadchodzące". Bez tego zaległy
     obowiązek zostaje tam na zawsze i panel przestaje cokolwiek znaczyć. */
  function otworzEv(w) { setEv({ ...w }); }

  function zapiszEv() {
    if (!ev.n.trim()) { window.alert("Wydarzenie bez nazwy nic nie powie."); return; }
    setWydarzenia((prev) => ev.id
      ? prev.map((w) => (w.id === ev.id ? { ...ev } : w))
      : [...prev, { ...ev, id: Date.now(), zrobione: false }]);
    setEv(null);
  }

  function usunEv(id) {
    if (!window.confirm("Usunąć to wydarzenie?")) return;
    setWydarzenia((prev) => prev.filter((w) => w.id !== id));
    setEv(null);
  }

  function odhaczEv(id) {
    setWydarzenia((prev) => prev.map((w) => (w.id === id ? { ...w, zrobione: !w.zrobione } : w)));
    setEv(null);
  }

  /* Tempo zmieniamy w fazie, w której jesteśmy dzisiaj — a nie globalnie,
     bo blok ciężki ma z założenia zero i nie wolno go ruszyć przypadkiem. */
  function ustawTempo(v) {
    const dzis = new Date().toISOString().slice(0, 10);
    const fazy = ustawienia.fazy.map((f) =>
      (d(dzis) >= d(f.from) && d(dzis) < d(f.to)) ? { ...f, tempo: v } : f);
    setUstawienia({ ...ustawienia, fazy });
  }

  function zmienFaze(i, pole, wartosc) {
    const f = ustawienia.fazy.map((x, j) => (j === i ? { ...x, [pole]: wartosc } : x));
    setUstawienia({ ...ustawienia, fazy: f });
  }

  function usunWymiar(data) {
    if (!window.confirm(`Usunąć pomiar z ${data}?`)) return;
    setWymiary((prev) => prev.filter((w) => w.date !== data));
  }

  /* Wczytanie do formularza; zapis nadpisze wpis o tej samej dacie. */
  function wczytajWymiar(w) {
    const f = { date: w.date, masa: num(w.masa) };
    MIARY.forEach(([k]) => { f[k] = w[k] == null ? "" : num(w[k], 1); });
    setWymForm(f);
  }

  const ostWym = WYMIARY.length ? WYMIARY[WYMIARY.length - 1] : null;

  /* Pomiar wymiarów. Puste pole oznacza „nie mierzyłem" i dziedziczy wartość
     z poprzedniego pomiaru — inaczej brak jednej pozycji zerowałby wiersz. */
  function zapiszWymiar() {
    const m = liczba(wymForm.masa);
    if (m == null) { window.alert("Bez wagi przy pomiarze wiersz nie ma odniesienia."); return; }
    const rek = { id: Date.now(), date: wymForm.date, masa: m };
    MIARY.forEach(([k]) => {
      const v = liczba(wymForm[k]);
      rek[k] = v != null ? v : (ostWym ? ostWym[k] : null);
    });
    setWymiary((prev) => [...prev.filter((x) => x.date !== rek.date), rek]
      .sort((a, b) => (a.date < b.date ? -1 : 1)));
    setWymForm({ date: new Date().toISOString().slice(0, 10), masa: "" });
  }

  /* ── Odzyskiwanie danych ────────────────────────────────
     Dwie drogi, bo przy ratowaniu danych jedna to za mało: plik i wklejenie
     treści. Wklejanie działa nawet wtedy, gdy plik ma złe rozszerzenie
     albo system nie pozwala go wybrać. */
  const [impStan, setImpStan] = useState(null);
  const [wklejka, setWklejka] = useState("");

  function policzStan(dd) {
    if (!dd) return null;
    return {
      tygodnie: (dd.entries || []).length,
      wymiary: (dd.wymiary || []).length,
      dania: (dd.dania || []).length,
      skany: (dd.skany || []).length,
      makro: (dd.zapisane || []).length,
      wydarzenia: (dd.wydarzenia || []).length,
      cwiczenia: Object.keys(dd.ciezary || {}).length,
    };
  }

  function przygotujImport(tekst, skad) {
    try {
      const czysty = String(tekst).trim();
      if (!czysty) { setImpStan({ blad: "Pusto — nic nie wczytałem." }); return; }
      const o = JSON.parse(czysty);
      const dd = o.dane || o;
      if (!dd || typeof dd !== "object" || !policzStan(dd)) {
        setImpStan({ blad: "Plik jest poprawnym JSON-em, ale nie wygląda na eksport tej apki." });
        return;
      }
      setImpStan({ dane: dd, licz: policzStan(dd), zapis: o.zapis || null, skad });
    } catch (e) {
      setImpStan({ blad: "Nie udało się odczytać: " + e.message +
        ". Jeśli kopiowałeś z GitHuba, upewnij się, że była to wersja „Raw” i całość, od pierwszego { do ostatniego }." });
    }
  }

  function importujJSON(plik) {
    const r = new FileReader();
    r.onload = () => przygotujImport(r.result, plik.name);
    r.onerror = () => setImpStan({ blad: "Nie udało się otworzyć pliku." });
    r.readAsText(plik);
  }

  function zatwierdzImport() {
    wgrajStan(impStan.dane);
    setImpStan(null);
    setWklejka("");
  }

  function zapiszWynik() {
    if (!wynik || !wynik.razem) return;
    const p1 = Math.max(1, parseFloat(String(porcje).replace(",", ".")) || 1);
    const r = wynik.razem;
    setZapisane([{
      id: Date.now(),
      nazwa: nazwa.trim() || opis.slice(0, 40) + (opis.length > 40 ? "…" : ""),
      data: dataWpisu, porcje: p1, opis,
      razem: { kcal: r.kcal / p1, b: r.b / p1, w: r.w / p1, t: r.t / p1, bl: r.bl / p1 },
    }, ...zapisane]);
    setNazwa("");
  }

  /* Szacowanie makro przez model. Kontekst ograniczony do produktów
     i reguł liczenia — zero wiedzy o roadmapie, planie czy tempie.
     Dzięki temu nic się tu nie dubluje i nic się nie zestarzeje. */
  async function policzMakro() {
    if (!opis.trim() || liczy) return;
    setLiczy(true); setBladAI(null); setWynik(null);
    const system = `Jesteś kalkulatorem makroskładników dla polskiego użytkownika.
Zwracasz WYŁĄCZNIE obiekt JSON, bez komentarza, bez znaczników markdown.

Format:
{"pozycje":[{"nazwa":"...","gramatura":"...","kcal":0,"b":0,"w":0,"t":0,"bl":0}],
 "razem":{"kcal":0,"b":0,"w":0,"t":0,"bl":0},
 "uwagi":"jedno zdanie o największej niepewności szacunku"}

Liczysz ZAWSZE dla CAŁOŚCI opisanych składników, nigdy na porcję.
Podział na porcje wykonuje aplikacja — ignoruj wzmianki o liczbie porcji w opisie.

ZASADY:
- Przy niepewności bierz wartość ŚRODKOWĄ przedziału, nigdy maksymalną ani minimalnej.
- Kontrola: kcal musi się zgadzać z b*4 + w*4 + t*9 (±3%). Jeśli nie, popraw makro.
- Produkty polskie: skyr Piątnica, twaróg półtłusty, tatar wołowy, mleko protein+ Łaciate,
  płatki błonnikowe Granex, chia, kasza pęczak i gryczana, ciecierzyca.
- Mięso z grilla domyślnie bez skóry, chyba że napisano inaczej.
- Spring rolls = papier ryżowy, niesmażone. Sajgonki = smażone.
- Piwa bezalkoholowe pszeniczne: ~110-130 kcal na 500 ml, sporo cukrów resztkowych.
- Błonnik podawaj zawsze, także gdy jest bliski zeru.`;
    try {
      /* Poza Claude.ai autoryzacja nie dokłada się sama. Klucz idzie z ustawień,
         nagłówek anthropic-dangerous-direct-browser-access jest warunkiem
         wywołania z przeglądarki — bez niego przeglądarka zablokuje odpowiedź. */
      if (!ustawienia.klucz) {
        setBladAI("Brak klucza API. Wpisz go w Ustawieniach.");
        setLiczy(false);
        return;
      }
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ustawienia.klucz,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: opis }],
        }),
      });
      const d = await r.json();
      const txt = (d.content || []).map((x) => x.text || "").join("");
      const czyste = txt.replace(/```json|```/g, "").trim();
      setWynik(JSON.parse(czyste));
    } catch (e) {
      setBladAI("Nie udało się policzyć. Spróbuj ponownie albo opisz krócej.");
    } finally {
      setLiczy(false);
    }
  }

  /* Zmiana obciążenia zapisuje się do historii tylko wtedy, gdy liczba
     faktycznie się różni — przeglądanie pola nic nie tworzy. */
  function ustawCiezar(nazwa, wartosc) {
    setCiezary({ ...ciezary, [nazwa]: wartosc });
  }
  function zatwierdzCiezar(nazwa) {
    const v = parseFloat(String(ciezary[nazwa]).replace(",", "."));
    if (Number.isNaN(v)) return;
    const h = historia[nazwa] || [];
    if (h.length && h[h.length - 1].c === v) return;
    setHistoria({ ...historia, [nazwa]: [...h, { d: dataWpisu, c: v }] });
  }

  /* Wczytanie pliku tylko go podgląda — nic nie nadpisuje bez potwierdzenia. */
  function wczytajPlik(e) {
    const plik = e.target.files && e.target.files[0];
    if (!plik) return;
    setImpBlad(null);
    const r = new FileReader();
    r.onerror = () => setImpBlad("Nie udało się odczytać pliku.");
    r.onload = () => {
      try {
        const tekst = String(r.result);
        if (rozpoznajCsv(tekst) === "waga") {
          setImpW(parsujCsvWaga(tekst));
        } else {
          setImp(parsujCsv(tekst));
        }
      } catch (err) {
        setImpBlad(err.message);
      }
    };
    r.readAsText(plik, "utf-8");
    e.target.value = "";
  }

  function zastosujImportWagi() {
    if (!impW || !impW.length) return;
    const wg = {};
    impW.forEach((d) => { wg[d.data] = d.waga; });
    const nowe = DNI.map((_, i) => {
      const iso = isoDnia(dataWpisu, i);
      return wg[iso] != null ? num(wg[iso], 1) : "";
    });
    if (nowe.some(Boolean)) {
      setDniWaga(nowe);
      const a = srednia(nowe);
      if (a.n) setWaga(num(a.avg, 1));
    } else {
      setWaga(num(impW.reduce((s2, x) => s2 + x.waga, 0) / impW.length, 1));
    }
    setOpenWaga(true);
    setImpW(null);
  }

  /* Dopiero to wpisuje dane do formularza. Dni z pliku trafiają
     na właściwe miejsca tygodnia; jeśli daty nie pasują, wpisujemy
     samą średnią, żeby import nie przepadł. */
  function zastosujImport() {
    if (!imp || !imp.length) return;
    const wg = {};
    imp.forEach((d) => { wg[d.data] = d; });
    const nowe = DNI.map((_, i) => {
      const iso = isoDnia(dataWpisu, i);
      return wg[iso] ? String(Math.round(wg[iso].kcal)) : "";
    });
    if (nowe.some(Boolean)) {
      setDniKcal(nowe);
      const a = srednia(nowe);
      if (a.n) setKcal(String(Math.round(a.avg)));
    } else {
      setKcal(String(Math.round(imp.reduce((s, x) => s + x.kcal, 0) / imp.length)));
    }
    setOpenKcal(true);
    setImp(null);
  }

  const avgWaga = srednia(dniWaga);
  const avgKcal = srednia(dniKcal);

  function setDzien(ktore, i, v) {
    const src = ktore === "waga" ? dniWaga : dniKcal;
    const next = src.map((x, j) => (j === i ? v : x));
    if (ktore === "waga") {
      setDniWaga(next);
      const a = srednia(next);
      if (a.n) setWaga(num(a.avg, 1));
    } else {
      setDniKcal(next);
      const a = srednia(next);
      if (a.n) setKcal(String(Math.round(a.avg)));
    }
  }

  const series = useMemo(() =>
    ENTRIES.map((e, i) => {
      const win = ENTRIES.slice(Math.max(0, i - 2), i + 1);
      return { ...e, trend: win.reduce((s, x) => s + x.weight, 0) / win.length };
    }), [ENTRIES]);

  /* Przy pustym rejestrze nie ma jeszcze czego uśredniać. Zamiast wywracać
     widok, podstawiamy punkt startowy z ustawień. */
  const pusty = series.length === 0;
  const latest = pusty
    ? { date: ustawienia.kamienie[0].date, weight: ustawienia.kamienie[0].weight,
        trend: ustawienia.kamienie[0].weight, waist: null, kcal: 0, cheats: 0,
        sleep: 3, fbw: 0, sila: 3, acts: [] }
    : series[series.length - 1];
  const plan = planAt(latest.date);
  const variance = latest.trend - plan;
  const phase = phaseAt(latest.date);
  const weekNo = Math.round((d(latest.date) - d("2026-09-01")) / 6048e5) + 1;
  const czasPct = (weekNo / 44) * 100;
  const celPct = ((96 - latest.trend) / (96 - TARGET)) * 100;
  const przewaga = celPct - czasPct;

  /* Różnice względem ostatniego zapisanego tygodnia — liczone na żywo,
     żeby było widać skutek wpisu jeszcze przed zapisaniem. */
  const poprzedni = pusty ? null : series[series.length - 1];
  const liczba = (v) => {
    const x = parseFloat(String(v).replace(",", "."));
    return Number.isNaN(x) ? null : x;
  };
  const liveDelta = (() => {
    const w = liczba(waga);
    return w == null || !poprzedni ? null : w - poprzedni.weight;
  })();
  const liveDeltaPas = (() => {
    const p2 = liczba(pas);
    return p2 == null || !poprzedni || !poprzedni.waist ? null : p2 - poprzedni.waist;
  })();

  const balance = useMemo(() => {
    const czynne = series.filter((e) => !e.poza);
    const win = czynne.slice(-4);
    if (win.length < 2)
      return { realDeficit: 0, intake: 0, maintenance: 0, vsPlan: 0, cheats: 0, n: win.length };
    const weeks = (d(win[win.length - 1].date) - d(win[0].date)) / 6048e5;
    const kgPerWeek = (win[win.length - 1].trend - win[0].trend) / weeks;
    const realDeficit = -(kgPerWeek * KCAL_PER_KG) / 7;
    const intake = win.reduce((s, e) => s + e.kcal, 0) / win.length;
    return { realDeficit, intake, maintenance: intake + realDeficit, vsPlan: intake - PLAN_KCAL,
      cheats: win.reduce((s, e) => s + e.cheats, 0), n: win.length };
  }, [series, ustawienia]);

  /* ── Cel makro na dziś ──────────────────────────────────
     Białko i tłuszcz są podłogami z ZYWIENIE.md, nie procentami z kalorii —
     przy spadającej wadze procenty zjechałyby razem z nią, a te dwie
     wartości mają zostać. Deficyt robimy na węglowodanach, więc to one
     są resztą po odjęciu dwóch pozostałych. */
  const cel = useMemo(() => {
    const masa = pusty ? ustawienia.kamienie[0].weight : latest.trend;
    const bialko = Math.max(Math.round(masa * 2.1), Math.round(masa * 1.6));
    const tluszcz = Math.max(70, Math.round((ustawienia.planKcal * 0.25) / 9));
    const wegle = Math.max(0, Math.round((ustawienia.planKcal - bialko * 4 - tluszcz * 9) / 4));
    return { bialko, tluszcz, wegle, blonnik: 38 };
  }, [latest, pusty, ustawienia]);

  /* ── Raport tygodniowy ──────────────────────────────────
     Dotąd był stałą z danymi przykładowymi, więc przycisk „Kopiuj raport"
     kopiował cudzy tydzień. Teraz składa się z tego, co faktycznie zapisane. */
  const raport = useMemo(() => {
    if (pusty) return "Brak zapisanych tygodni.";
    const L = [];
    const tyg = Math.round((d(latest.date) - d(ustawienia.kamienie[0].date)) / 6048e5) + 1;
    L.push(`PRZEGLĄD — ${latest.date}`);
    L.push(`Tydzień projektu: ${tyg}  ·  ${phaseAt(latest.date).label}`);
    L.push("");
    L.push(`Waga (trend 3-tyg.): ${num(latest.trend)} kg`);
    L.push(`Plan na dziś: ${num(planAt(latest.date))} kg`);
    L.push(`Odchylenie: ${variance >= 0 ? "+" : "−"}${num(Math.abs(variance))} kg`);
    L.push(`Ostatni pomiar surowy: ${num(latest.weight)} kg`);
    L.push(`Od startu: ${num(latest.trend - ustawienia.kamienie[0].weight)} kg`);
    L.push("");
    if (latest.waist) L.push(`Pas: ${num(latest.waist)} cm`);
    const ost4 = series.slice(-4);
    const sr = (f) => ost4.reduce((a, e) => a + f(e), 0) / ost4.length;
    /* Jednostki i skale wypisane wprost. Bez tego „2,5 / 5" bywa czytane
       jako godziny snu — to nie jest błąd czytającego, tylko raportu. */
    L.push(`Sen — subiektywna ocena jakości w skali 1–5, gdzie 1 to noc rozbita: ${sr((e) => e.sleep).toFixed(1)}`);
    L.push(`  (liczby godzin nie mierzymy; wyjściowo jest to 5–6 h z przerwami)`);
    L.push(`Sesje FBW na tydzień: ${sr((e) => e.fbw).toFixed(1)}`);
    L.push(`Progres siły: ${SILA[Math.max(0, Math.min(4, latest.sila - 1))]}`);
    const licznik = {};
    ost4.forEach((e) => (e.acts || []).forEach((a) => { licznik[a] = (licznik[a] || 0) + 1; }));
    const akt = Object.entries(licznik)
      .map(([a, n]) => `${a} — w ${n} z ${ost4.length} tyg.`).join("; ");
    L.push(`Aktywności poza FBW (liczba tygodni, w których wystąpiły, NIE liczba sesji): ${akt || "brak zaznaczonych"}`);
    L.push("");
    if (balance.n >= 2) {
      L.push(`BILANS ENERGETYCZNY (${balance.n} tyg.)`);
      L.push(`  Zjedzone: ${Math.round(balance.intake)} kcal/dzień`);
      L.push(`  Plan: ${ustawienia.planKcal} kcal/dzień (${balance.vsPlan >= 0 ? "+" : "−"}${Math.abs(Math.round(balance.vsPlan))})`);
      L.push(`  Utrzymanie wyliczone z wagi: ${Math.round(balance.maintenance)} kcal/dzień`);
      L.push(`  Realny deficyt: ${Math.round(balance.realDeficit)} kcal/dzień`);
      L.push(`  Cel makro: białko ${cel.bialko} g · tłuszcz min. ${cel.tluszcz} g · węgle ${cel.wegle} g · błonnik ${cel.blonnik} g`);
      L.push(`  Cheat meale: ${balance.cheats}`);
      L.push("");
    }
    if (SCANS.length) {
      const sc = SCANS[SCANS.length - 1];
      L.push(`Ostatni skan: ${sc.kind} ${sc.date} — ${num(sc.fat)}% tłuszczu, ${num(sc.lean)} kg LBM`);
    }
    const notatki = series.slice(-3).filter((e) => e.note);
    if (notatki.length) {
      L.push("");
      L.push("NOTATKI");
      notatki.forEach((e) => L.push(`  ${e.date}: ${e.note}`));
    }

    /* Terminy z kalendarza. Bez nich trener doradza umówienie badania,
       które jest już umówione — i wygląda, jakby nie czytał. */
    const dzis = new Date().toISOString().slice(0, 10);
    const blisko = (WYDARZENIA || [])
      .filter((w) => !w.zrobione && d(w.d) >= d(dzis) && d(w.d) <= d(dzis) + 28 * 864e5)
      .sort((a, b) => (a.d < b.d ? -1 : 1));
    L.push("");
    L.push("W KALENDARZU NA NAJBLIŻSZE 4 TYGODNIE (już zaplanowane, nie proponuj umawiania)");
    if (blisko.length) blisko.forEach((w) => L.push(`  ${w.d} — ${w.n}`));
    else L.push("  nic zaplanowanego");

    L.push("");
    L.push("CZEGO W TYCH DANYCH NIE MA — nie zgaduj i nie komentuj:");
    L.push("  · logu sesji, obciążeń, liczby serii ani powtórzeń");
    L.push("  · przebiegu pojedynczych treningów i tego, jak wypadły kolejne serie");
    L.push("  · liczby kroków i marszu — nie są mierzone");
    L.push("  · liczby sesji poszczególnych aktywności");

    return L.join("\n");
  }, [series, latest, balance, ustawienia, SCANS, WYDARZENIA, pusty, variance, cel]);

  /* Sygnały liczy kod, nie model — reguły z ROADMAP muszą dawać ten sam
     wynik za każdym razem. Model dostaje gotowe flagi i tylko je opisuje. */
  const sygnaly = useMemo(
    () => wykryjSygnaly(ENTRIES, ustawienia, WYDARZENIA, new Date().toISOString().slice(0, 10)),
    [ENTRIES, ustawienia, WYDARZENIA]
  );

  const [pyta, setPyta] = useState(false);
  const [bladTrenera, setBladTrenera] = useState(null);

  async function zapytajTrenera() {
    if (!ustawienia.klucz) { setBladTrenera("Brak klucza API. Wpisz go w Ustawieniach."); return; }
    setPyta(true);
    setBladTrenera(null);
    try {
      const flagi = sygnaly.length
        ? "\n\nWYKRYTE SYGNAŁY (policzone przez aplikację, nie szacuj ich sam):\n" +
          sygnaly.map((f) => `- [${f.waga}] ${f.tekst}`).join("\n")
        : "\n\nWYKRYTE SYGNAŁY: brak.";
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ustawienia.klucz,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: KONTEKST_TRENERA,
          messages: [{ role: "user", content: raport + flagi }],
        }),
      });
      if (!r.ok) throw new Error("API odpowiedziało błędem " + r.status);
      const j = await r.json();
      const txt = (j.content || []).map((c) => (c.type === "text" ? c.text : "")).join("\n").trim();
      if (!txt) throw new Error("Pusta odpowiedź.");
      setKom(txt);
      setSkopiowane(true);
    } catch (e) {
      setBladTrenera(e.message);
    }
    setPyta(false);
  }


  const [mies, setMies] = useState(() => { const t = new Date(); return { r: t.getFullYear(), m: t.getMonth() }; });
  const dniMies = useMemo(() => siatka(mies.r, mies.m), [mies]);
  const wpisyWg = useMemo(() => {
    const o = {}; series.forEach((e) => { o[e.date] = e; }); return o;
  }, [series]);

  const chart = useMemo(() => {
    const W = 720, H = 250, ML = 38, MR = 12, MT = 14, MB = 26;
    const x0 = d("2026-08-01"), x1 = d("2027-07-25");
    const yMin = 80, yMax = 97.5;
    const px = (t) => ML + ((t - x0) / (x1 - x0)) * (W - ML - MR);
    const py = (w) => MT + ((yMax - w) / (yMax - yMin)) * (H - MT - MB);
    const planPts = [];
    for (let t = x0; t <= x1; t += 6048e5 * 2)
      planPts.push(`${px(t)},${py(planAt(new Date(t).toISOString().slice(0, 10)))}`);
    return { W, H, ML, MR, MT, MB, px, py, planPts,
      actual: series.map((e) => ({ x: px(d(e.date)), y: py(e.weight) })),
      trend: series.map((e) => `${px(d(e.date))},${py(e.trend)}`) };
  }, [series]);

  const dania = DANIA.filter((x) =>
    filtr === "wszystko" ? true :
    filtr === "sprawdzone" ? x.ocena >= 7 :
    filtr === "wtoku" ? ["kuchnia", "propozycja"].includes(x.status) : true);

  if (ustawienia.pin && !odblokowany) {
    return (
      <div className={"rej" + (dark ? " dark" : "")}>
        <style>{CSS}</style>
        <div className="pinbox">
          <b>Rejestr projektu</b>
          <input className="ust-in short" type="password" inputMode="numeric" maxLength={4}
                 autoFocus placeholder="PIN" value={pinWpis}
                 onChange={(e) => {
                   const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                   setPinWpis(v);
                   if (v === ustawienia.pin) setOdblokowany(true);
                 }} />
          {pinWpis.length === 4 && pinWpis !== ustawienia.pin && <em>Nie ten PIN.</em>}
        </div>
      </div>
    );
  }

  return (
    <div className={"rej" + (dark ? " dark" : "")}>
      <style>{CSS}</style>

      {zdalneNowsze && (
        <div className="zdalne">
          <span>W repozytorium są nowsze dane niż na tym urządzeniu — prawdopodobnie z drugiego sprzętu.</span>
          <button className="mini" onClick={() => { setZdalneNowsze(false); synchronizuj("pobierz"); }}>Pobierz je</button>
          <button className="mini ghost" onClick={() => setZdalneNowsze(false)}>Zostaw</button>
        </div>
      )}

      <div className="mockbar">
        <span>
          {zapisano ? `zapisano ${String(zapisano).slice(11, 16)}` : "brak zapisu"}
          {ustawienia.token && ustawienia.repo &&
            (sync.stan === "pracuje" ? " · wysyłam…"
              : sync.blad ? " · " + sync.blad
              : zgodne ? (sync.kiedy ? ` · github ${String(sync.kiedy).slice(11, 16)}` : " · wysyła sama")
              : " · automat wstrzymany")}
        </span>
        <button className="themebtn" onClick={() => setDark(!dark)}>
          {dark ? "tryb jasny" : "tryb ciemny"}
        </button>
      </div>

      <header className="head">
        <div className="eyebrow">
          <span>Rejestr projektu</span><span className="dot" />
          <span>tydzień {weekNo} z 44</span><span className="dot" />
          <span>{phase.label}</span>
        </div>
        <div className="ledger cztery">
          <div className="col">
            <span className="lbl">Wykonanie</span>
            <span className="big">{num(latest.trend)}<em>kg</em></span>
            <span className="sub">trend z 3 tygodni</span>
          </div>
          <div className="col">
            <span className="lbl">Plan</span>
            <span className="big quiet">{num(plan)}<em>kg</em></span>
            <span className="sub">wg roadmapy</span>
          </div>
          <div className={"col var " + (variance <= 0.3 ? "ok" : "off")}>
            <span className="lbl">Odchylenie</span>
            <span className="big">{signed(variance)}<em>kg</em></span>
            <span className="sub">{variance <= 0.3 ? "w planie" : "powyżej planu"}</span>
          </div>
          <div className="col">
            <span className="lbl">Cel dzienny</span>
            <span className="big">{ustawienia.planKcal}<em>kcal</em></span>
            <span className="sub makro">
              B {cel.bialko} g · T {cel.tluszcz} g · W {cel.wegle} g
              <em className="makro-blon">błonnik {cel.blonnik} g</em>
            </span>
          </div>
        </div>
        <div className="progress">
          <div className="rings">
            <Ring pct={czasPct} label="czas" tone="t-plan"
                  hint={`Tydzień ${weekNo} z 44`} />
            <Ring pct={celPct} label="cel" tone="t-act"
                  hint={`${num(96 - latest.trend)} kg z 14 kg do zgubienia`} />
          </div>
          <div className="barwrap">
            <div className="bar">
              <div className="bar-fill" style={{ width: `${celPct}%` }} />
            </div>
            <div className="bar-meta"><span>96,0 kg — start</span><span>82,0 kg — cel 13%</span></div>
            <p className="pnote">
              {variance == null
                ? "Brak danych do porównania."
                : Math.abs(variance) <= 0.3
                ? "Waga idzie zgodnie z planem."
                : variance < 0
                ? `Jesteś ${num(-variance)} kg przed planem.`
                : `Jesteś ${num(variance)} kg za planem. W bloku ciężkim to normalne — plan zakłada tam utrzymanie wagi.`}
            </p>
          </div>
        </div>
      </header>

      <nav className="tabs">
        {SEKCJE.map((se) => {
          const akt = se.pod.some((x) => x.k === tab);
          return (
            <button key={se.id} className={akt ? "tab on" : "tab"}
                    onClick={() => setTab(se.pod[0].k)}>{se.n}</button>
          );
        })}
      </nav>

      {(() => {
        const se = SEKCJE.find((x) => x.pod.some((y) => y.k === tab));
        if (!se || se.pod.length < 2) return null;
        return (
          <nav className="subnav">
            {se.pod.map((x) => (
              <button key={x.k} className={tab === x.k ? "snav on" : "snav"}
                      onClick={() => setTab(x.k)}>{x.l}</button>
            ))}
          </nav>
        );
      })()}

      {/* ── WPIS ── */}
      {tab === "wpis" && (
        <section className="panel agenda">
          <div className="bal-head">
            <span>Nadchodzące</span>
            <span className="tiny-note">z kalendarza projektu</span>
          </div>
          <ul className="ag-list">
            {AGENDA.map((a) => (
              <li key={a.id} className={"ag " + a.stan}>
                <span className="ag-dot" />
                <span className="ag-body">
                  <b>{a.co}</b>
                  <em>{a.czemu}</em>
                </span>
                <span className="ag-when">{a.kiedy}</span>
              </li>
            ))}
          </ul>
          <p className="ag-foot">Widok obejmuje {AGENDA_HORYZONT} dni. Dalsze terminy w zakładce Kalendarz.</p>
        </section>
      )}

      {tab === "wpis" && (
        <section className="panel form">
          <div className="prefill">
            <span>Ostatni wpis: 2026-10-25 · 94,0 kg</span>
            <button className="ghost">Jak w zeszłym tygodniu</button>
          </div>
          <div className="row top">
            <label>Data
              <input type="date" value={dataWpisu}
                     onChange={(e) => setDataWpisu(e.target.value || dataWpisu)} />
              <span className="dlbl">
                {nazwaDnia(dataWpisu)}
                {dataWpisu !== "2026-11-01" && <em className="wstecz"> · wpis wsteczny</em>}
              </span>
            </label>
            <label>Waga (kg)
              <input value={waga} onChange={(e) => setWaga(e.target.value)} />
              <span className="minirow">
                <button className="mini" onClick={() => setOpenWaga(!openWaga)}>
                  {openWaga ? "zwiń tydzień" : "policz z 7 dni"}
                </button>
                <span className="mini-sep">·</span>
                <label className="mini imp-lbl">
                  wczytaj CSV
                  <input type="file" accept=".csv,text/csv" className="imp-in" onChange={wczytajPlik} />
                </label>
              </span>
              {liveDelta != null && (
                <span className={"delta " + (liveDelta <= 0 ? "good" : "warn")}>
                  {signed(liveDelta)} kg od ostatniego
                </span>
              )}
            </label>
            <label>Pas (cm)
              <input value={pas} onChange={(e) => setPas(e.target.value)} />
              {liveDeltaPas != null && (
                <span className={"delta " + (liveDeltaPas <= 0 ? "good" : "warn")}>
                  {signed(liveDeltaPas, 1)} cm od ostatniego
                </span>
              )}
            </label>
          </div>

          {impW && (
            <div className="impbox">
              <b>Wczytano {impW.length} {impW.length === 1 ? "pomiar" : impW.length < 5 ? "pomiary" : "pomiarów"} wagi.</b>
              <table className="tbl imp-tbl">
                <thead><tr><th>Data</th><th>Waga</th><th>Δ</th></tr></thead>
                <tbody>
                  {impW.map((x, i) => {
                    const dv = i > 0 ? x.waga - impW[i - 1].waga : null;
                    return (
                      <tr key={x.data}>
                        <td>{x.data}</td>
                        <td className="n strong">{num(x.waga)}</td>
                        <td className={"n " + (dv == null ? "quiet" : dv <= 0 ? "good" : "warn")}>
                          {dv == null ? "—" : signed(dv)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="deltarow">
                    <td>średnia</td>
                    <td className="n">{num(impW.reduce((a, x) => a + x.waga, 0) / impW.length)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
              <div className="imp-akcje">
                <button className="primary" onClick={zastosujImportWagi}>Wpisz do formularza</button>
                <button className="ghost" onClick={() => setImpW(null)}>Odrzuć</button>
              </div>
              <p className="note">Średnia tygodniowa jest odporniejsza od pojedynczego odczytu — waga potrafi skakać o kilogram z dnia na dzień przez sól i wodę.</p>
            </div>
          )}

          {openWaga && (
            <Tydzien wartosci={dniWaga} jednostka="kg" krok="0,1" koniec={dataWpisu}
                     wynik={avgWaga} format={(v) => num(v, 1) + " kg"}
                     onChange={(i, v) => setDzien("waga", i, v)} />
          )}

          <div className="frow">
            <span className="fkey">Sen <em>1 fatalny · 5 dobry</em></span>
            <div className="fval"><div className="pips">
              {[1,2,3,4,5].map((n) => (
                <button key={n} className={n===sen?"pip on":"pip"}
                        onClick={() => setSen(n)}>{n}</button>))}
            </div></div>
          </div>

          <div className="frow">
            <span className="fkey">FBW <em>minimum: 2</em></span>
            <div className="fval"><div className="pips">
              {[0,1,2,3,4].map((n) => (
                <button key={n} className={n===fbw?"pip on":"pip"}
                        onClick={() => setFbw(n)}>{n}</button>))}
            </div></div>
          </div>

          <div className="frow hi">
            <span className="fkey">Progres siły <em>stagnacja = sukces na deficycie</em></span>
            <div className="fval">
              <div className="scale">
                {SILA.map((s, i) => (
                  <button key={s} className={i === sila ? "sc on" : "sc"}
                          onClick={() => setSila(i)}>
                    <i className={`m m${i}`} /><span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="frow">
            <span className="fkey">Aktywności</span>
            <div className="fval"><div className="chips">
              {["Basen","Kalistenika","Bieg","Boks","Squash","Marsz"].map((a) => (
                <button key={a} className={akty.includes(a)?"chip on":"chip"}
                        onClick={() => setAkty(akty.includes(a) ? akty.filter((x) => x !== a) : [...akty, a])}>{a}</button>
              ))}
            </div></div>
          </div>

          <div className="frow">
            <span className="fkey">Kalorie <em>plan: {ustawienia.planKcal}/d</em></span>
            <div className="fval kcal">
              <input value={kcal} onChange={(e) => setKcal(e.target.value)} />
              <span className="unit">kcal/dzień średnio</span>
              <button className="mini" onClick={() => setOpenKcal(!openKcal)}>
                {openKcal ? "zwiń tydzień" : "policz z 7 dni"}
              </button>
              <label className="mini imp-lbl">
                wczytaj CSV
                <input type="file" accept=".csv,text/csv" className="imp-in"
                       onChange={wczytajPlik} />
              </label>
              {(() => {
                /* Różnica liczy się z wpisywanej wartości, tak jak przy wadze
                   i pasie. Średnia z czterech tygodni ma swoje miejsce
                   w Postępie — tutaj byłaby wyrwana z kontekstu. */
                const k = liczba(kcal);
                if (k == null) return <span className="delta quiet">— vs plan</span>;
                const dv = Math.round(k - ustawienia.planKcal);
                return (
                  <span className={"delta " + (dv <= 0 ? "good" : "warn")}>
                    {dv === 0 ? "0" : signed(dv, 0)} vs plan
                  </span>
                );
              })()}
            </div>
          </div>

          {impBlad && (
            <div className="impbox err">
              <b>Nie udało się wczytać.</b> {impBlad}
            </div>
          )}

          {imp && (
            <div className="impbox">
              <b>Wczytano {imp.length} {imp.length === 1 ? "dzień" : imp.length < 5 ? "dni" : "dni"} z pliku.</b>
              <table className="tbl imp-tbl">
                <thead><tr><th>Data</th><th>kcal</th><th>B</th><th>W</th><th>T</th><th>Bł</th><th>pos.</th></tr></thead>
                <tbody>
                  {imp.map((x) => (
                    <tr key={x.data}>
                      <td>{x.data}</td>
                      <td className="n strong">{Math.round(x.kcal)}</td>
                      <td className="n">{Math.round(x.bialko)}</td>
                      <td className="n">{Math.round(x.wegle)}</td>
                      <td className="n">{Math.round(x.tluszcz)}</td>
                      <td className="n">{Math.round(x.blonnik)}</td>
                      <td className="n quiet">{x.posilki}</td>
                    </tr>
                  ))}
                  <tr className="deltarow">
                    <td>średnia</td>
                    {["kcal","bialko","wegle","tluszcz","blonnik"].map((k) => (
                      <td key={k} className="n">{Math.round(imp.reduce((a,x)=>a+x[k],0)/imp.length)}</td>
                    ))}
                    <td />
                  </tr>
                </tbody>
              </table>
              <div className="imp-akcje">
                <button className="primary" onClick={zastosujImport}>Wpisz do formularza</button>
                <button className="ghost" onClick={() => setImp(null)}>Odrzuć</button>
              </div>
              <p className="note">Kolumny sodu i cholesterolu pominięte — baza produktów ma tam błędne wartości. Dni bez wpisu w pliku zostają puste i nie wchodzą do średniej.</p>
            </div>
          )}

          {openKcal && (
            <Tydzien wartosci={dniKcal} jednostka="kcal" krok="10" koniec={dataWpisu}
                     wynik={avgKcal} format={(v) => Math.round(v) + " kcal"}
                     onChange={(i, v) => setDzien("kcal", i, v)} />
          )}

          <div className="frow">
            <span className="fkey">Bilans <em>tygodnie nietypowe</em></span>
            <div className="fval">
              <button className={poza ? "wyklucz on" : "wyklucz"} onClick={() => setPoza(!poza)}>
                <span className="box" />
                Wyłącz ten tydzień z wyliczania kalorii utrzymania
              </button>
              <p className="hintline">Święta, wyjazd, choroba — waga nie odzwierciedla wtedy bilansu energetycznego i zafałszowałaby szacunek na kolejne miesiące.</p>
            </div>
          </div>

          <div className="frow last">
            <span className="fkey">Notatka <em>opcjonalnie</em></span>
            <div className="fval"><textarea rows={2} value={notatka}
              placeholder="Co warto zapamiętać z tego tygodnia."
              onChange={(e) => setNotatka(e.target.value)} /></div>
          </div>

          <div className="actions">
            <button className="primary" onClick={zapiszTydzien}>Zapisz tydzień</button>
            {stage !== "form" && <span className="ready">Zapisano</span>}
          </div>

          {stage !== "form" && (
            <div className="closing">
              <div className="cl-head">
                <span>Domknij tydzień</span>
                <span className={"cl-state " + (stage === "gotowe" ? "done" : "")}>
                  {stage === "gotowe" ? "domknięty" : "otwarty"}
                </span>
              </div>

              {sygnaly.length > 0 && (
                <div className="sygbox">
                  <span className="cap">Wykryte w danych</span>
                  {sygnaly.map((f, i) => (
                    <div key={i} className={"syg s-" + f.waga}>
                      <span className="syg-txt">{f.tekst}</span>
                      {f.akcja === "tempo-028" && (
                        <button className="mini" onClick={() => ustawTempo(0.28)}>Zejdź na 0,28</button>
                      )}
                      {f.akcja === "tempo-w-gore" && (
                        <button className="mini" onClick={() => ustawTempo(0.40)}>Podnieś na 0,40</button>
                      )}
                      {f.akcja === "kalendarz" && (
                        <button className="mini" onClick={() => { setTab("kalendarz");
                          const w = WYDARZENIA.find((x) => x.id === f.id); if (w) otworzEv(w); }}>
                          Otwórz w kalendarzu</button>
                      )}
                    </div>
                  ))}
                  <p className="note">Sygnały liczy aplikacja z twoich danych, nie model. Nic nie zmienia się samo — przycisk jest jedynym sposobem.</p>
                </div>
              )}

              <div className="cl-step">
                <span className="cl-num">1</span>
                <div className="cl-body">
                  <p className="cl-lbl">Poproś Ronniego o komentarz do tego tygodnia.</p>
                  <div className="cl-btns">
                    <button className="primary" onClick={zapytajTrenera} disabled={pyta}>
                      {pyta ? "Ronnie czyta…" : "Zapytaj Ronniego"}
                    </button>
                    <button className="ghost" onClick={() => {
                      try { navigator.clipboard.writeText(raport); } catch (e) {}
                      setSkopiowane(true);
                    }}>
                      {skopiowane ? "Skopiowano" : "Kopiuj do czatu"}
                    </button>
                    <button className="ghost" onClick={() => setPodglad(!podglad)}>
                      {podglad ? "Ukryj raport" : "Podgląd raportu"}
                    </button>
                  </div>
                  {bladTrenera && <div className="impbox err"><b>Nie wyszło:</b> {bladTrenera}</div>}
                  <p className="note">Trudniejszy tydzień — kontuzja, coś nie gra, chcesz drążyć — kopiuj do czatu. Tam Ronnie ma komplet plików i dietetyka obok.</p>
                  {podglad && <pre className="report">{raport}</pre>}
                </div>
              </div>

              <div className={"cl-step " + (skopiowane ? "" : "dim")}>
                <span className="cl-num">2</span>
                <div className="cl-body">
                  <p className="cl-lbl">Odpowiedź Ronniego — trafi do Dziennika jako komentarz tego tygodnia.</p>
                  {stage === "gotowe" ? (
                    <div className="jcom">
                      <span className="jcomlbl">Ronnie</span>
                      {kom.split("\n\n").map((x, i) => <p key={i}>{x}</p>)}
                    </div>
                  ) : (
                    <>
                      <textarea rows={5} className="cl-ta" value={kom}
                                onChange={(e) => setKom(e.target.value)}
                                placeholder="Wklej tutaj odpowiedź Ronniego z czatu…" />
                      <button className="primary" disabled={!kom.trim()}
                              onClick={zapiszKomentarz}>Zapisz komentarz</button>
                    </>
                  )}
                </div>
              </div>

              {stage === "gotowe" && (
                <div className="imp-akcje">
                  <p className="note">Tydzień domknięty. Znajdziesz go w Dzienniku pod datą {dataWpisu}.</p>
                  <button className="ghost" onClick={nowyTydzien}>Wyczyść pod kolejny tydzień</button>
                  {ustawienia.token && ustawienia.repo && (
                    <button className="ghost" onClick={() => synchronizuj("wyslij")}>Wyślij na GitHub</button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}


      {/* ── PLAN ── */}
      {tab === "plan" && (() => {
        const cykl = CYKLE.find((c) => c.id === cyklId) || CYKLE[0];
        const sesja = cykl.sesje.find((x) => x.l === sesjaL) || cykl.sesje[0];
        return (
          <section className="panel">
            <div className="subtabs">
              {CYKLE.map((c) => (
                <button key={c.id}
                  className={"subtab" + (cyklId === c.id ? " on" : "") + (c.status === "aktualny" ? " biezacy" : "")}
                  onClick={() => { setCyklId(c.id); setSesjaL("A"); setRozwin(null); }}>
                  {c.nazwa.split(" · ")[0]}
                </button>
              ))}
            </div>

            <div className="cyklhead">
              <div>
                <b>{cykl.nazwa}</b>
                <em>{cykl.okres}</em>
              </div>
              <span className={"cstan c-" + cykl.status}>
                {cykl.status === "aktualny" ? "w trakcie" : "zaplanowany"}
              </span>
            </div>
            <p className="pdesc">{cykl.opis}</p>

            {cykl.sesje.length === 0 ? (
              <div className="pempty">
                <p>Szczegóły sesji jeszcze nierozpisane.</p>
                <p className="note">Plan powstaje na przeglądzie cyklu, na podstawie tego, jak wypadł poprzedni blok. Rozpisywanie go dziś byłoby zgadywaniem.</p>
              </div>
            ) : (
              <>
                <div className="seslist">
                  {cykl.sesje.map((se) => (
                    <button key={se.l}
                      className={"sesbtn" + (sesjaL === se.l ? " on" : "")}
                      onClick={() => setSesjaL(se.l)}>
                      <b>{se.l}</b><span>{se.n}</span>
                    </button>
                  ))}
                </div>

                <div className="cwlist">
                  {sesja && sesja.cw.map((x) => {
                    const h = historia[x.n] || [];
                    const otw = rozwin === x.n;
                    const poprz = h.length > 1 ? h[h.length - 2].c : null;
                    const teraz = h.length ? h[h.length - 1].c : null;
                    return (
                      <div key={x.n} className={"cw" + (otw ? " open" : "")}>
                        <div className="cw-main">
                          {x.img && MINI[x.img] ? (
                            <img className="cw-img" src={MINI[x.img]} alt="" loading="lazy"
                                 onError={(e) => { e.target.style.visibility = "hidden"; }} />
                          ) : (
                            <span className="cw-img pusty" />
                          )}
                          <div className="cw-txt">
                            <b>{x.n}</b>
                            <em>{x.s}{x.r != null ? ` · RIR ${x.r}` : ""}</em>
                          </div>
                          <div className="cw-wt">
                            <input inputMode="decimal" placeholder="—"
                              value={ciezary[x.n] != null ? String(ciezary[x.n]).replace(".", ",") : ""}
                              onChange={(e) => ustawCiezar(x.n, e.target.value)}
                              onBlur={() => zatwierdzCiezar(x.n)} />
                            <span className="cw-j">{x.j}</span>
                          </div>
                          <button className="cw-hist" onClick={() => setRozwin(otw ? null : x.n)}
                            title="historia obciążenia">
                            {h.length ? h.length : "–"}
                          </button>
                        </div>
                        {teraz != null && poprz != null && (
                          <span className="cw-delta">{signed(teraz - poprz, 1)} {x.j} od {h[h.length - 1].d}</span>
                        )}
                        {otw && (
                          <div className="cw-h">
                            {h.length === 0 ? (
                              <span className="empty small">Brak zapisanych zmian. Wpisz obciążenie, a pierwsza wartość zapisze się sama.</span>
                            ) : (
                              <table className="tbl">
                                <thead><tr><th>Data</th><th>Obciążenie</th><th>Zmiana</th></tr></thead>
                                <tbody>
                                  {h.map((z, i) => (
                                    <tr key={z.d + i}>
                                      <td>{z.d}</td>
                                      <td className="n strong">{num(z.c, 1)} {x.j}</td>
                                      <td className={"n " + (i > 0 && z.c > h[i-1].c ? "good" : "quiet")}>
                                        {i > 0 ? signed(z.c - h[i-1].c, 1) : "start"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="note">Obciążenie zapisuje się do historii dopiero przy zmianie wartości — jedna liczba na ćwiczenie, nie log z każdej sesji. Dziennik treningowy zostaje w Fitness Online.</p>
              </>
            )}
          </section>
        );
      })()}


      {/* ── KALKULATOR MAKRO ── */}
      {tab === "kalk" && (
        <section className="panel">
          <div className="bal-head">
            <span>Kalkulator makro</span>
            <span className="tiny-note">do quick addów</span>
          </div>

          <p className="pdesc">Opisz, co zjadłeś — im dokładniej z gramaturą, tym lepiej.
            Wynik wpisujesz do apki żywieniowej jako quick add. Kalkulator nie zna twojego planu
            ani tempa: liczy wyłącznie makro.</p>

          <div className="kalk-grid">
            <textarea className="kalk-in" rows={9} value={opis}
              onChange={(e) => setOpis(e.target.value)}
              placeholder="np. trzy udźce z kurczaka bez skóry, dwa poliki wołowe, szaszłyk z chudego mięsa, warzywa z grilla z oliwą" />

            <div className="kalk-side">
              <label className="kalk-fld">
                <span className="cap">Nazwa <em>opcjonalnie</em></span>
                <input value={nazwa} onChange={(e) => setNazwa(e.target.value)}
                       placeholder="np. Grill u Marka" />
              </label>

              <div className="kalk-fld">
                <span className="cap">Porcje</span>
                <div className="pquick">
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n}
                      className={parseFloat(porcje) === n ? "pq on" : "pq"}
                      onClick={() => setPorcje(String(n))}>{n}</button>
                  ))}
                  <input className="pq-other" inputMode="decimal" value={porcje}
                         onChange={(e) => setPorcje(e.target.value)} placeholder="inna" />
                </div>
                <em className="pinfo">
                  {(parseFloat(porcje) || 1) === 1
                    ? "Wynik dla całości."
                    : `Wynik dzielony na ${porcje}.`}
                </em>
              </div>

              <div className="kalk-btns">
                <button className="primary" onClick={policzMakro} disabled={liczy || !opis.trim()}>
                  {liczy ? "Liczę…" : "Policz makro"}
                </button>
                {(wynik || bladAI) && (
                  <button className="ghost" onClick={() => { setWynik(null); setBladAI(null); setOpis(""); setNazwa(""); }}>
                    Wyczyść
                  </button>
                )}
              </div>
            </div>
          </div>

          {bladAI && <div className="impbox err"><b>Błąd.</b> {bladAI}</div>}

          {wynik && (() => {
            const p1 = Math.max(1, parseFloat(String(porcje).replace(",", ".")) || 1);
            return (
            <div className="impbox">
              <div className="tblwrap">
                <table className="tbl">
                  <thead><tr><th>Pozycja</th><th>kcal</th><th>B</th><th>W</th><th>T</th><th>Bł</th></tr></thead>
                  <tbody>
                    {(wynik.pozycje || []).map((x, i) => (
                      <tr key={i}>
                        <td className="kn">{x.nazwa}
                          {x.gramatura && <span className="kuw">{x.gramatura}</span>}</td>
                        <td className="n">{Math.round(x.kcal)}</td>
                        <td className="n">{Math.round(x.b)}</td>
                        <td className="n">{Math.round(x.w)}</td>
                        <td className="n">{Math.round(x.t)}</td>
                        <td className="n">{Math.round(x.bl)}</td>
                      </tr>
                    ))}
                    {wynik.razem && (
                      <tr className={p1 > 1 ? "" : "deltarow"}>
                        <td>{p1 > 1 ? "całość" : "razem"}</td>
                        <td className={"n " + (p1 > 1 ? "quiet" : "strong")}>{Math.round(wynik.razem.kcal)}</td>
                        <td className={"n " + (p1 > 1 ? "quiet" : "strong")}>{Math.round(wynik.razem.b)}</td>
                        <td className="n quiet">{Math.round(wynik.razem.w)}</td>
                        <td className="n quiet">{Math.round(wynik.razem.t)}</td>
                        <td className="n quiet">{Math.round(wynik.razem.bl)}</td>
                      </tr>
                    )}
                    {wynik.razem && p1 > 1 && (
                      <tr className="deltarow">
                        <td>na porcję ({num(p1, p1 % 1 ? 1 : 0)})</td>
                        <td className="n strong">{Math.round(wynik.razem.kcal / p1)}</td>
                        <td className="n strong">{Math.round(wynik.razem.b / p1)}</td>
                        <td className="n">{Math.round(wynik.razem.w / p1)}</td>
                        <td className="n">{Math.round(wynik.razem.t / p1)}</td>
                        <td className="n">{Math.round(wynik.razem.bl / p1)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {wynik.razem && (() => {
                const z = wynik.razem.b * 4 + wynik.razem.w * 4 + wynik.razem.t * 9;
                const odch = Math.abs(z - wynik.razem.kcal) / (wynik.razem.kcal || 1) * 100;
                return (
                  <p className={"kalk-kontrola " + (odch <= 5 ? "ok" : "zla")}>
                    Kontrola: makro daje {Math.round(z)} kcal wobec podanych {Math.round(wynik.razem.kcal)}
                    {odch <= 5 ? " — zgadza się." : " — rozjazd, sprawdź przed wpisaniem."}
                  </p>
                );
              })()}

              {wynik.uwagi && <p className="note">{wynik.uwagi}</p>}

              {wynik.razem && p1 > 1 && (() => {
                const b = wynik.razem.b / p1, bl = wynik.razem.bl / p1;
                const okB = b >= 40, okBl = bl >= 6;
                return (
                  <p className={"kalk-progi " + (okB && okBl ? "ok" : "zla")}>
                    Progi obiadowe na porcję: białko {Math.round(b)} g {okB ? "✓" : "(min. 40)"} ·
                    błonnik {Math.round(bl)} g {okBl ? "✓" : "(min. 6)"}
                  </p>
                );
              })()}

              <div className="imp-akcje">
                <button className="ghost" onClick={zapiszWynik}>Zapisz w historii</button>
              </div>

              <p className="note">Wartości są szacunkiem środkowym, nie maksymalnym. Błonnik wpisz do apki osobno — quick add go nie przyjmuje.</p>
            </div>
            );
          })()}

        </section>
      )}

      {tab === "kalk" && zapisane.length > 0 && (
        <section className="panel">
          <div className="zapisy">
              <div className="bal-head">
                <span>Historia</span>
                <span className="tiny-note">{zapisane.length} {zapisane.length === 1 ? "pozycja" : "pozycji"}</span>
              </div>
              {zapisane.map((z) => (
                <article key={z.id} className="zap">
                  <button className="zap-head" onClick={() => setRozwin(rozwin === "z" + z.id ? null : "z" + z.id)}>
                    <span className="zap-txt">
                      <b>{z.nazwa}</b>
                      <em>{z.data}{z.porcje > 1 ? ` · na porcję z ${num(z.porcje, z.porcje % 1 ? 1 : 0)}` : ""}</em>
                    </span>
                    <span className="zap-kcal">{Math.round(z.razem.kcal)}<i>kcal</i></span>
                  </button>
                  {rozwin === "z" + z.id && (
                    <div className="zap-body">
                      <div className="jgrid">
                        <span><em>białko</em>{Math.round(z.razem.b)} g</span>
                        <span><em>węgle</em>{Math.round(z.razem.w)} g</span>
                        <span><em>tłuszcz</em>{Math.round(z.razem.t)} g</span>
                        <span><em>błonnik</em>{Math.round(z.razem.bl)} g</span>
                      </div>
                      <p className="zap-opis">{z.opis}</p>
                      <button className="ghost tiny" onClick={() => { setOpis(z.opis); setPorcje(String(z.porcje)); setNazwa(z.nazwa); setWynik(null); }}>
                        Wczytaj do kalkulatora
                      </button>
                    </div>
                  )}
                </article>
              ))}
          </div>
        </section>
      )}

      {/* ── STATYSTYKI ── */}
      {tab === "staty" && (
        <>
          <section className="panel">
            <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="chart">
              {PHASES.map((p, i) => (
                <rect key={i} x={chart.px(d(p.from))} y={chart.MT}
                      width={chart.px(d(p.to)) - chart.px(d(p.from))}
                      height={chart.H - chart.MT - chart.MB} className={`band band-${p.tone}`} />
              ))}
              {[82,85,88,91,94,97].map((w) => (
                <g key={w}>
                  <line x1={chart.ML} x2={chart.W-chart.MR} y1={chart.py(w)} y2={chart.py(w)} className="grid" />
                  <text x={chart.ML-7} y={chart.py(w)+3.5} className="ytick">{w}</text>
                </g>
              ))}
              <line x1={chart.ML} x2={chart.W-chart.MR} y1={chart.py(TARGET)} y2={chart.py(TARGET)} className="target" />
              <polyline points={chart.planPts.join(" ")} className="planline" />
              <polyline points={chart.trend.join(" ")} className="trendline" />
              {chart.actual.map((p, i) => <rect key={i} x={p.x-2.5} y={p.y-2.5} width="5" height="5" className="pt" />)}
              {["2026-09-01","2026-12-31","2027-03-31","2027-06-15"].map((s) => (
                <text key={s} x={chart.px(d(s))} y={chart.H-8} className="xtick" textAnchor="middle">
                  {s.slice(2,7).replace("-","/")}</text>
              ))}
            </svg>
            <div className="legend">
              <span><i className="k-plan" />plan</span><span><i className="k-trend" />trend</span>
              <span><i className="k-pt" />pomiar</span><span><i className="k-target" />cel 13%</span>
            </div>
          </section>

          <section className="panel">
            <div className="bal-head"><span>Bilans energetyczny</span>
              <button className="ghost tiny" onClick={() => { setTab("wpis"); setSetOpen(true); }}>plan: {ustawienia.planKcal} kcal/d · zmień</button></div>
            <div className="ledger">
              <div className="col"><span className="lbl">Zjedzone</span>
                <span className="mid">{Math.round(balance.intake)}<em>kcal/d</em></span>
                <span className="sub">{signed(balance.vsPlan,0)} vs plan</span></div>
              <div className="col"><span className="lbl">Utrzymanie</span>
                <span className="mid quiet">{Math.round(balance.maintenance)}<em>kcal/d</em></span>
                <span className="sub">wyliczone z wagi</span></div>
              <div className="col var ok"><span className="lbl">Realny deficyt</span>
                <span className="mid">{Math.round(balance.realDeficit)}<em>kcal/d</em></span>
                <span className="sub">z trendu {balance.n} tygodni</span></div>
            </div>
            <p className="note">Deficyt w zakresie docelowym. Liczba utrzymania obok jest twoim punktem odniesienia — używaj jej zamiast kalkulatorów.</p>
          </section>

          <section className="panel">
            <div className="bal-head"><span>Siła — ostatnie 8 tygodni</span></div>
            <div className="silabar">
              {series.map((e) => (
                <div key={e.id} className="silacol" title={`${e.date} · ${SILA[e.sila-1]}`}>
                  <div className={`silafill s${e.sila-1}`} style={{ height: `${e.sila*20}%` }} />
                  <span className="silax">{e.date.slice(8)}/{e.date.slice(5,7)}</span>
                </div>
              ))}
            </div>
            <p className="note">Dwa tygodnie regresu z rzędu przy komplecie sesji to sygnał, że deficyt jest za głęboki — niezależnie od tego, jak spada waga.</p>
          </section>

          {TESTY.length >= 2 && (
          <section className="panel">
            <div className="bal-head"><span>Siła względem masy ciała</span>
              <span className="tiny-note">z testów co 8 tygodni</span></div>
            <div className="ledger">
              <div className="col"><span className="lbl">Podciągnięcia</span>
                <span className="mid">{TESTY[TESTY.length-1].pull}<em>powt.</em></span>
                <span className="sub">{signed(TESTY[TESTY.length-1].pull - TESTY[0].pull, 0)} od baseline</span></div>
              <div className="col"><span className="lbl">Dipy</span>
                <span className="mid">{TESTY[TESTY.length-1].dip}<em>powt.</em></span>
                <span className="sub">{signed(TESTY[TESTY.length-1].dip - TESTY[0].dip, 0)} od baseline</span></div>
              <div className="col var ok"><span className="lbl">Masa w tym czasie</span>
                <span className="mid">{signed(TESTY[TESTY.length-1].masa - TESTY[0].masa)}<em>kg</em></span>
                <span className="sub">siła w górę przy niższej masie</span></div>
            </div>
            <p className="note">Wzrost powtórzeń przy spadającej masie to najmocniejszy dowód, że deficyt zdejmuje tłuszcz, a nie mięśnie. Gdyby powtórzenia stały mimo redukcji — sygnał do zwolnienia.</p>
          </section>
          )}

          {SCANS.length > 0 && (() => {
            const sc = SCANS[SCANS.length - 1];
            const pierwszy = SCANS[0];
            const wiecej = SCANS.length > 1;
            return (
              <section className="panel">
                <div className="bal-head"><span>Skład ciała</span>
                  <span className="tiny-note">pełna historia w zakładce Pomiary</span></div>
                <div className="ledger">
                  <div className="col"><span className="lbl">Tłuszcz</span>
                    <span className="mid">{num(sc.fat)}<em>%</em></span>
                    <span className="sub">{wiecej ? `${signed(sc.fat - pierwszy.fat)} od ${pierwszy.date}` : "pierwszy pomiar"}</span></div>
                  <div className="col"><span className="lbl">Masa beztłuszczowa</span>
                    <span className="mid quiet">{num(sc.lean)}<em>kg</em></span>
                    <span className="sub">{wiecej ? `${signed(sc.lean - pierwszy.lean)} od ${pierwszy.date}` : "punkt odniesienia"}</span></div>
                  <div className="col var ok"><span className="lbl">Cel</span>
                    <span className="mid">13<em>%</em></span>
                    <span className="sub">zostało {num(sc.fat - 13)} pkt</span></div>
                </div>
                <p className="note">DEXA nie służy do potwierdzania, że waga spada — tylko do sprawdzenia, czy schodzi tłuszcz czy mięśnie. Spadek masy beztłuszczowej o więcej niż 1 kg to sygnał do zwolnienia tempa.</p>
              </section>
            );
          })()}
        </>
      )}


      {/* ── POMIARY ── */}
      {tab === "pomiary" && (
        <section className="panel">
          <nav className="subtabs">
            {[["wymiary","Wymiary"],["sprawnosc","Sprawność"],["cardio","Cardio"],
              ["spiro","Spirometria"],["krew","Krew"],["sklad","Skład ciała"]].map(([k,l]) => (
              <button key={k} className={pod===k?"subtab on":"subtab"} onClick={()=>setPod(k)}>{l}</button>
            ))}
          </nav>

          {(pod === "krew" || pod === "spiro" || pod === "sklad") && (
            <div className="rapbox">
              <label className="ghost imp-lbl">Wgraj raport .md
                <input type="file" accept=".md,text/markdown" className="imp-in"
                       onChange={(e) => e.target.files[0] && wgrajRaport(e.target.files[0])} />
              </label>
              <span className="tiny-note">Raport przygotowany w czacie z PDF-a. Import pokazuje podgląd przed zapisem.</span>
            </div>
          )}

          {raportPodglad && (
            <div className="impbox">
              <b>Wczytano: {raportPodglad.rodzaj || "nieznany rodzaj"} · {raportPodglad.data || "bez daty"} · {raportPodglad.pozycje.length} pozycji</b>
              <table className="tbl imp-tbl">
                <thead><tr><th>Badanie</th><th>Wynik</th><th>Zakres</th><th>Uwaga</th></tr></thead>
                <tbody>{raportPodglad.pozycje.map((p, i) => (
                  <tr key={i}><td>{p.nazwa}</td><td className="n">{p.wynik}</td>
                    <td className="n">{p.zakres}</td><td>{p.uwaga}</td></tr>
                ))}</tbody>
              </table>
              <div className="imp-akcje">
                <button className="primary" onClick={zatwierdzRaport}
                        disabled={!raportPodglad.rodzaj}>Zapisz w apce</button>
                <button className="ghost" onClick={() => setRaportPodglad(null)}>Odrzuć</button>
              </div>
              {!raportPodglad.rodzaj && <p className="note">Nie rozpoznałem rodzaju badania. Dopisz w nagłówku pliku <code>typ: krew</code>, <code>typ: spirometria</code> albo <code>typ: dexa</code>.</p>}
            </div>
          )}

          {pod === "sprawnosc" && (
            <>
              <p className="pdesc">Kolejność sztywna: hollow hold, 15 min przerwy, podciągnięcia,
                15 min przerwy, dipy. Magnezja za każdym razem. Co 8 tygodni, przed przeglądem cyklu.</p>
              <div className="prow">
                <label>Data<input type="date" value={testForm.date}
                  onChange={(e) => setTestForm({ ...testForm, date: e.target.value })} /></label>
                <label>Hollow hold (s)<input value={testForm.hollow} inputMode="numeric"
                  onChange={(e) => setTestForm({ ...testForm, hollow: e.target.value })} /></label>
                <label>Podciągnięcia<input value={testForm.pull} inputMode="numeric"
                  onChange={(e) => setTestForm({ ...testForm, pull: e.target.value })} /></label>
                <label>Dipy<input value={testForm.dip} inputMode="numeric"
                  onChange={(e) => setTestForm({ ...testForm, dip: e.target.value })} /></label>
              </div>
              <button className="primary" onClick={zapiszTest}>Zapisz test</button>
              <table className="tbl">
                <thead><tr><th>Data</th><th>Masa</th><th>Hollow</th><th>Podciągnięcia</th><th>Dipy</th><th>Δ podc.</th></tr></thead>
                <tbody>
                  {TESTY.map((t,i,a) => {
                    const dp = i>0 ? t.pull - a[i-1].pull : null;
                    return (<tr key={t.id}>
                      <td>{t.date}</td><td className="n">{num(t.masa)}</td>
                      <td className="n">{t.hollow} s</td><td className="n strong">{t.pull}</td>
                      <td className="n">{t.dip}</td>
                      <td className={"n " + (dp!=null && dp<0 ? "warn":"good")}>{dp!=null?signed(dp,0):"—"}</td>
                    </tr>);
                  })}
                </tbody>
              </table>
              <p className="note">Podciągnięcia rosną i od siły, i od ubytku masy. Jeśli stoją mimo redukcji, to sygnał utraty mięśni — szybszy niż DEXA.</p>
            </>
          )}

          {pod === "cardio" && (
            <>
              <p className="pdesc">Osobny dzień od testu siłowego. Basen 400 m stylem dowolnym,
                marsz na stałej trasie 3 km. Tętno spoczynkowe jako średnia tygodnia.</p>
              <div className="prow">
                <label>Data<input type="date" defaultValue="2026-12-20" /></label>
                <label>Basen 400 m<input placeholder="9:12" /></label>
                <label>Marsz 3 km<input placeholder="25:20" /></label>
                <label>Tętno spocz.<input placeholder="58" /></label>
              </div>
              <button className="primary">Zapisz test</button>
              <table className="tbl">
                <thead><tr><th>Data</th><th>Basen 400 m</th><th>Marsz 3 km</th><th>Tętno spocz.</th></tr></thead>
                <tbody>{CARDIO.map((c)=>(
                  <tr key={c.id}><td>{c.date}</td><td className="n">{c.plyw}</td>
                    <td className="n">{c.marsz}</td><td className="n">{c.hr}</td></tr>))}
                </tbody>
              </table>
              <p className="note">Przy astmie tętno nie jest miarodajnym wskaźnikiem intensywności — tu służy wyłącznie jako trend spoczynkowy.</p>
            </>
          )}

          {pod === "wymiary" && (
            <>
              <p className="pdesc">Raz w miesiącu, rano, na czczo, przed treningiem. Zawsze ta sama strona ciała
                i ta sama wysokość pomiaru. <b>Talia</b> to najwęższe miejsce, <b>pas</b> na wysokości pępka —
                to dwa różne obwody i nie zamieniamy ich miejscami.</p>
              <div className="prow">
                <label>Data<input type="date" value={wymForm.date}
                  onChange={(e) => setWymForm({ ...wymForm, date: e.target.value })} /></label>
                <label>Waga (kg)
                  <input value={wymForm.masa} inputMode="decimal"
                    placeholder={ostWym ? num(ostWym.masa) : ""}
                    onChange={(e) => setWymForm({ ...wymForm, masa: e.target.value })} /></label>
                {MIARY.map(([k, l]) => (
                  <label key={k}>{l} (cm)
                    <input value={wymForm[k] || ""} inputMode="decimal"
                      placeholder={ostWym ? String(ostWym[k]).replace(".", ",") : ""}
                      onChange={(e) => setWymForm({ ...wymForm, [k]: e.target.value })} /></label>
                ))}
              </div>
              <button className="primary" onClick={zapiszWymiar}>Zapisz pomiar</button>
              <div className="tblwrap">
                <table className="tbl">
                  <thead><tr><th>Data</th><th>Waga</th>{MIARY.map(([k,l]) => <th key={k}>{l}</th>)}<th /></tr></thead>
                  <tbody>
                    {WYMIARY.map((w) => (
                      <tr key={w.id}><td>{w.date}</td>
                        <td className="n strong">{num(w.masa)}</td>
                        {MIARY.map(([k]) => <td key={k} className="n">{num(w[k], 1)}</td>)}
                        <td className="n wact">
                          <button className="mini" title="Wczytaj do formularza"
                                  onClick={() => wczytajWymiar(w)}>edytuj</button>
                          <button className="mini ghost" title="Usuń pomiar"
                                  onClick={() => usunWymiar(w.date)}>usuń</button>
                        </td></tr>
                    ))}
                    {WYMIARY.length >= 2 && (
                    <tr className="deltarow"><td>zmiana</td>
                      {[["masa"], ...MIARY].map(([k]) => {
                        const dv = WYMIARY[WYMIARY.length-1][k] - WYMIARY[0][k];
                        return <td key={k} className={"n " + (dv < 0 ? "good" : dv > 0 ? "warn" : "")}>
                          {dv === 0 ? "—" : signed(dv, 1)}</td>;
                      })}
                      <td />
                    </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="note">Waga przy pomiarze jest tu po to, żeby obwody dało się czytać we właściwej skali — pas mniejszy o 2 cm przy tej samej masie znaczy co innego niż przy 2 kg mniej. Na redukcji obwody kończyn powinny stać, a pas i talia schodzić.</p>
            </>
          )}

          {pod === "spiro" && (
            <>
              <p className="pdesc">Baseline sierpień 2026, kontrola po sześciu miesiącach.
                Sprawdza, czy basen i boks cokolwiek zmieniły w wydolności oddechowej.</p>
              <div className="prow">
                <label>Data<input type="date" /></label>
                <label>FEV1 (l)<input placeholder="2,9" /></label>
                <label>FVC (l)<input placeholder="4,1" /></label>
                <label>FEV1/FVC (%)<input placeholder="71" /></label>
              </div>
              <button className="primary">Zapisz wynik</button>
              <table className="tbl">
                <thead><tr><th>Data</th><th>FEV1</th><th>FVC</th><th>FEV1/FVC</th><th>% normy</th></tr></thead>
                <tbody>{SPIRO.map((x)=>(
                  <tr key={x.id}><td>{x.date}</td><td className="n">{num(x.fev1)} l</td>
                    <td className="n">{num(x.fvc)} l</td><td className="n">{x.ratio}%</td>
                    <td className="n">{x.norma}%</td></tr>))}
                </tbody>
              </table>
              <p className="note">Wyniki interpretuje lekarz prowadzący astmę. Tu trzymamy je wyłącznie do porównania w czasie.</p>
            </>
          )}

          {pod === "krew" && (
            <>
              <p className="pdesc">Baseline z 5 maja 2026, pobranie na czczo. Kolejna kontrola w grudniu,
                razem z DEXA. Interpretacja należy do lekarza — tu trzymamy wyniki wyłącznie do porównania w czasie.</p>

              <div className="prow">
                <label>Data<input type="date" /></label>
                <label>Badanie<input placeholder="Witamina D (25-OH)" /></label>
                <label>Wynik<input placeholder="28,4" /></label>
                <label>Jednostka<input placeholder="ng/mL" /></label>
              </div>
              <button className="primary">Dodaj wynik</button>

              {KREW.map((g) => (
                <div key={g.grupa} className="krewgrp">
                  <div className="krewhead"><span>{g.grupa}</span><em>{g.data}</em></div>
                  <table className="tbl">
                    <tbody>
                      {g.poz.map((x) => (
                        <tr key={x.n} className={x.flaga ? "f-" + x.flaga : ""}>
                          <td className="kn">{x.n}
                            {x.uwaga && <span className="kuw">{x.uwaga}</span>}</td>
                          <td className="n strong">{x.w}</td>
                          <td className="n ku">{x.j}</td>
                          <td className="n quiet kref">{x.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              <div className="krewgrp">
                <div className="krewhead"><span>Nieoznaczone</span><em>plan uzupełnienia</em></div>
                <ul className="ag-list">
                  {KREW_BRAKI.map((b) => (
                    <li key={b.n} className="ag wkrotce">
                      <span className="ag-dot" />
                      <span className="ag-body"><b>{b.n}</b><em>{b.czemu}</em></span>
                      <span className="ag-when">{b.kiedy}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="note">Dwie wartości na granicy zakresu są podświetlone. Żadna nie wymaga działania sama w sobie — obie służą jako punkt odniesienia dla kontroli grudniowej.</p>
            </>
          )}

          {pod === "sklad" && (
            <>
              <p className="pdesc">DEXA co około cztery miesiące — grudzień, kwiecień, czerwiec.
                Waga analityczna co 2–4 tygodnie, wyłącznie do trendu. Nie sprawdzamy tu, czy waga spada,
                tylko czy spada tłuszcz czy mięśnie.</p>
              <div className="metoda">
                <span className="cap">Metoda</span>
                <div className="mchips">
                  {["DEXA", "Waga analityczna"].map((m) => (
                    <button key={m} className={skladForm.kind === m ? "chipm on" : "chipm"}
                            onClick={() => setSkladForm({ ...skladForm, kind: m })}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="prow">
                <label>Data<input type="date" value={skladForm.date}
                  onChange={(e) => setSkladForm({ ...skladForm, date: e.target.value })} /></label>
                <label>Waga (kg)<input value={skladForm.weight} inputMode="decimal"
                  onChange={(e) => setSkladForm({ ...skladForm, weight: e.target.value })} /></label>
                <label>Tłuszcz (%)<input value={skladForm.fat} inputMode="decimal"
                  onChange={(e) => setSkladForm({ ...skladForm, fat: e.target.value })} /></label>
                <label>LBM (kg)<input value={skladForm.lean} inputMode="decimal"
                  onChange={(e) => setSkladForm({ ...skladForm, lean: e.target.value })} /></label>
              </div>
              <button className="primary" onClick={zapiszSklad}>Zapisz pomiar</button>
              <table className="tbl">
                <thead><tr><th>Data</th><th>Metoda</th><th>% tł.</th><th>LBM</th><th>Δ LBM</th></tr></thead>
                <tbody>{SCANS.map((x,i)=>{
                  const dl = i>0 ? x.lean - SCANS[i-1].lean : null;
                  return (<tr key={x.id}><td>{x.date}</td><td>{x.kind}</td>
                    <td className="n">{num(x.fat)}</td><td className="n">{num(x.lean)}</td>
                    <td className={"n " + (dl!=null && dl<-1 ? "warn":"good")}>{dl!=null?signed(dl):"—"}</td></tr>);
                })}</tbody>
              </table>
              <p className="note">Spadek masy beztłuszczowej o więcej niż 1 kg między skanami to sygnał, żeby zwolnić deficyt.</p>
            </>
          )}
        </section>
      )}


      {/* ── KALENDARZ ── */}
      {tab === "kalendarz" && (
        <section className="panel">
          <div className="kalnav">
            <button className="navbtn" onClick={() => setMies(przesun(mies, -1))}>‹</button>
            <span className="kaltyt">
              <b>{MIESIACE[mies.m]}</b> {mies.r}
              <em>{phaseAt(`${mies.r}-${String(mies.m + 1).padStart(2, "0")}-15`).label}</em>
            </span>
            <button className="navbtn" onClick={() => setMies(przesun(mies, 1))}>›</button>
          </div>

          <div className="kalhead">
            {DNI_SKR.map((x) => <span key={x}>{x}</span>)}
          </div>

          <div className="kalgrid">
            {dniMies.map((dz) => {
              const ev = WYDARZENIA.filter((w) => w.d === dz.iso);
              const wpis = wpisyWg[dz.iso];
              const dz1 = DZIENNE[dz.iso];
              const prog = dz.niedziela && !dz.obcy && !wpis && !dz1 && variance != null
                ? planAt(dz.iso) + variance : null;
              const waga = wpis ? wpis.weight : dz1 ? dz1.waga : null;
              return (
                <div key={dz.iso} className={"kd" + (dz.obcy ? " obcy" : "") + (dz.niedziela ? " nd" : "")}>
                  <span className="kd-n">{dz.dt.getDate()}</span>
                  {waga != null && (
                    <span className={"kd-kg " + (wpis ? "wyk" : "dzien")}>{num(waga)}</span>
                  )}
                  {prog != null && <span className="kd-kg prog">{num(prog)}</span>}
                  {dz1 && dz1.kcal != null && <span className="kd-kcal">{dz1.kcal}</span>}
                  {ev.map((w, i) => (
                    <button key={w.id || i}
                            className={"kd-ev e-" + w.t + (w.zrobione ? " zrob" : "")}
                            title={`${w.n} — kliknij, aby edytować`}
                            onClick={() => otworzEv(w)}>{w.n}</button>
                  ))}
                  {!dz.obcy && (
                    <button className="kd-add" title="Dodaj wydarzenie"
                            onClick={() => otworzEv({ d: dz.iso, t: "pomiar", n: "" })}>+</button>
                  )}
                </div>
              );
            })}
          </div>

          {ev && (
            <div className="evbox">
              <div className="prow">
                <label>Data<input type="date" value={ev.d}
                  onChange={(e) => setEv({ ...ev, d: e.target.value })} /></label>
                <label>Kategoria
                  <select value={ev.t} onChange={(e) => setEv({ ...ev, t: e.target.value })}>
                    <option value="pomiar">pomiar</option>
                    <option value="test">test</option>
                    <option value="badanie">badanie</option>
                    <option value="faza">faza</option>
                    <option value="wyjazd">wyjazd</option>
                  </select></label>
              </div>
              <label className="evnazwa">Nazwa
                <input value={ev.n} placeholder="Co to jest"
                       onChange={(e) => setEv({ ...ev, n: e.target.value })} /></label>
              <label className="evnazwa">Po co <em>zobaczysz to za pół roku, gdy sama nazwa nic nie powie</em>
                <input value={ev.po || ""} placeholder="np. baseline przed deficytem"
                       onChange={(e) => setEv({ ...ev, po: e.target.value })} /></label>
              <div className="imp-akcje">
                <button className="primary" onClick={zapiszEv}>Zapisz</button>
                {ev.id && (
                  <button className="ghost" onClick={() => odhaczEv(ev.id)}>
                    {ev.zrobione ? "Cofnij odhaczenie" : "Odhacz jako zrobione"}
                  </button>
                )}
                {ev.id && <button className="ghost" onClick={() => pobierzIcs([ev], slug(ev.n) + ".ics")}>Pobierz .ics</button>}
                {ev.id && <button className="ghost del" onClick={() => usunEv(ev.id)}>Usuń</button>}
                <button className="ghost" onClick={() => setEv(null)}>Zamknij</button>
              </div>
            </div>
          )}

          <div className="kalexp">
            <span className="cap">Eksport do kalendarza</span>
            <div className="kalexp-btns">
              <button className="ghost" onClick={() => {
                const pref = `${mies.r}-${String(mies.m + 1).padStart(2, "0")}`;
                pobierzIcs(WYDARZENIA.filter((w) => w.d.startsWith(pref)), `projekt-${pref}.ics`);
              }}>Ten miesiąc</button>
              <button className="ghost" onClick={() => {
                const dzis = "2026-11-01";
                pobierzIcs(WYDARZENIA.filter((w) => w.d >= dzis), "projekt-pozostale.ics");
              }}>Wszystkie pozostałe</button>
              <button className="ghost" onClick={() => pobierzIcs(WYDARZENIA, "projekt-caly.ics")}>
                Cały projekt
              </button>
            </div>
            <p className="note">Wszystko o 9:00. Pomiary przypominają dzień i godzinę przed, badania oraz testy — tydzień i dzień przed. Pojedyncze wydarzenie pobierzesz klikając je w siatce.</p>
          </div>

          <div className="kallegend kl-dane">
            <span><b className="lg-wyk">94,0</b> waga tygodniowa</span>
            <span><b className="lg-dzien">95,1</b> waga dzienna</span>
            <span><b className="lg-kcal">2340</b> kcal</span>
          </div>

          <div className="kallegend">
            <span><i className="e-pomiar" />pomiar</span>
            <span><i className="e-test" />test</span>
            <span><i className="e-badanie" />badanie</span>
            <span><i className="e-faza" />faza / decyzja</span>
            <span><i className="e-wyjazd" />wyjazd</span>
          </div>

          <p className="note">
            Liczba w niedzielę to waga zamykająca tydzień: złota, gdy wpis już jest,
            ciemna, gdy to prognoza. Prognoza trzyma kształt roadmapy przesunięty
            o twoje bieżące odchylenie ({signed(variance)} kg) i przelicza się przy każdym nowym wpisie.
          </p>
        </section>
      )}

      {/* ── DZIENNIK ── */}
      {tab === "dziennik" && (
        <section className="panel">
          <div className="bal-head"><span>Dziennik tygodni</span><span className="tiny-note">{series.length === 1 ? "1 wpis" : series.length + " wpisów"}</span></div>
          <div className="journal">
            {[...series].reverse().map((e) => {
              const open = openWeek === e.date;
              const kom = COMMENTS[e.date];
              return (
                <article key={e.id} className={"jitem " + (open ? "open" : "")}>
                  <button className="jhead" onClick={() => setOpenWeek(open ? null : e.date)}>
                    <span className="jdate">{e.date}</span>
                    <span className="jstats">
                      <b>{num(e.weight)}</b> kg
                      <i className={`m m${e.sila-1}`} />
                      <span className="jmeta">sen {e.sleep} · FBW {e.fbw}</span>
                    </span>
                    <span className={"jflag " + (kom ? "has" : "")}>{kom ? "Ronnie" : "—"}</span>
                  </button>
                  {open && (
                    <div className="jbody">
                      <div className="jgrid">
                        <span><em>waga</em>{num(e.weight)} kg</span>
                        <span><em>pas</em>{e.waist} cm</span>
                        <span><em>siła</em>{SILA[e.sila-1]}</span>
                        <span><em>kalorie</em>{e.kcal}</span>
                        <span><em>aktywności</em>{e.acts.join(", ")}</span>
                        <span><em>cheat</em>{e.cheats}</span>
                      </div>
                      {e.note && <p className="jnote">„{e.note}"</p>}
                      <div className="jact">
                        <button className="ghost tiny" onClick={() => wczytajTydzien(e)}>Wczytaj do formularza</button>
                        <button className="ghost tiny del" onClick={() => usunTydzien(e.date)}>Usuń wpis</button>
                      </div>
                      {kom ? (
                        <div className="jcom">
                          <span className="jcomlbl">Ronnie</span>
                          {kom.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                      ) : (
                        <div className="jcom empty-com">
                          <span className="jcomlbl">Ronnie</span>
                          <p>Brak komentarza. Wklej odpowiedź z czatu, żeby zamknąć tydzień.</p>
                          <button className="ghost">Wklej komentarz</button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── KUCHNIA ── */}
      {tab === "kuchnia" && (
        <section className="panel">
          <div className="bal-head">
            <span>Kuchnia</span>
            <span className="filters">
              {[["wszystko","Wszystko"],["sprawdzone","Sprawdzone"],["wtoku","W toku"]].map(([k,l]) => (
                <button key={k} className={filtr===k?"ghost tiny on":"ghost tiny"} onClick={()=>setFiltr(k)}>{l}</button>
              ))}
            </span>
          </div>

          <div className="dishes">
            {dania.map((x) => (
              <article key={x.id} className={"dish st-" + x.status}>
                <div className="dtop">
                  <h4>{x.nazwa}</h4>
                  <span className={"badge b-" + x.status}>
                    {x.status === "vault" ? "w vaulcie" : x.status === "odrzucone" ? "odrzucone"
                      : x.status === "kuchnia" ? "do wykonania" : "propozycja"}
                  </span>
                </div>
                <div className="dmacro">
                  <span><b>{x.bialko}</b> g białka</span>
                  <span><b>{x.blonnik}</b> g błonnika</span>
                  {x.data && <span className="dq">gotowane {x.data}</span>}
                </div>
                {(x.ocena || x.zona) && (
                  <div className="drate">
                    <span className="rlbl">Ja</span><Ocena n={x.ocena} />
                    <span className="rlbl">Żona</span><Ocena n={x.zona} />
                  </div>
                )}
                {x.zmiany && <p className="dchg">{x.zmiany}</p>}

                <div className="dact">
                  <select className="dsel" value={x.status}
                          onChange={(e) => zmienDanie(x.id, { status: e.target.value })}>
                    <option value="propozycja">propozycja</option>
                    <option value="kuchnia">do wykonania</option>
                    <option value="ocenione">ocenione</option>
                    <option value="vault">w vaulcie</option>
                    <option value="odrzucone">odrzucone</option>
                  </select>
                  {x.tresc && (
                    <button className="ghost tiny"
                            onClick={() => setOtwarte(otwarte === x.id ? null : x.id)}>
                      {otwarte === x.id ? "Zwiń przepis" : "Pokaż przepis"}
                    </button>
                  )}
                  {x.tresc && <button className="ghost tiny" onClick={() => edytujDanie(x)}>Edytuj</button>}
                  {x.tresc && <button className="ghost tiny" onClick={() => eksportujPrzepis(x)}>Pobierz .md</button>}
                  <button className="ghost tiny del" onClick={() => usunDanie(x.id)}>Usuń</button>
                </div>

                {otwarte === x.id && x.tresc && (
                  <div className="dopen">
                    <div className="dporcje">
                      <span className="cap">Porcje</span>
                      <button className="mini" onClick={() => zmienPorcje(x, -1)}>−</button>
                      <b>{x.porcje || "?"}</b>
                      <button className="mini" onClick={() => zmienPorcje(x, 1)}>+</button>
                      {x.porcjeBaza && x.porcje !== x.porcjeBaza && (
                        <em className="tiny-note">przeliczone z {x.porcjeBaza}</em>
                      )}
                      {progAlarm(x) && <span className="dalarm">{progAlarm(x)}</span>}
                    </div>

                    <div className="drate edytowalne">
                      <span className="rlbl">Ja</span>
                      <input className="ust-in tiny" inputMode="decimal" value={x.ocena ?? ""}
                             placeholder="—" onChange={(e) => ocenDanie(x.id, "ocena", e.target.value)} />
                      <span className="rlbl">Żona</span>
                      <input className="ust-in tiny" inputMode="decimal" value={x.zona ?? ""}
                             placeholder="—" onChange={(e) => ocenDanie(x.id, "zona", e.target.value)} />
                      <span className="tiny-note">skala /10</span>
                    </div>

                    {edycja === x.id ? (
                      <>
                        <textarea className="dedit" rows={18} value={roboczy}
                                  onChange={(e) => setRoboczy(e.target.value)} />
                        <div className="imp-akcje">
                          <button className="primary" onClick={() => zapiszEdycje(x.id)}>Zapisz</button>
                          <button className="ghost" onClick={() => setEdycja(null)}>Anuluj</button>
                        </div>
                      </>
                    ) : <Markdown tekst={x.tresc} />}
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="actions">
            <label className="primary imp-lbl">Wgraj przepis .md
              <input type="file" accept=".md,text/markdown" multiple className="imp-in"
                     onChange={(e) => wgrajPrzepisy(e.target.files)} />
            </label>
            <span className="ready">{DANIA.filter((x) => (x.ocena || 0) >= 7).length} dań z oceną 7+</span>
          </div>
          {mdBlad && <div className="impbox err"><b>Plik odbiega od szablonu.</b> {mdBlad}</div>}
          <p className="note">Wgrywasz plik prosto z vaulta — apka czyta tytuł, tagi, porcje i tabelę makro z sekcji Macros. Poprawka zrobiona tutaj wraca do vaulta przyciskiem „Pobierz .md", więc nie zostaje uwięziona w telefonie.</p>
        </section>
      )}

      <section className={"panel exp" + (expOpen ? " open" : "")}>
        <button className="exp-tog" onClick={() => setExpOpen(!expOpen)}>
          <span className="exp-caret">{expOpen ? "▾" : "▸"}</span>
          <span>Dane i eksport</span>
          <span className="tiny-note">schemat v{SCHEMA}</span>
        </button>

        {expOpen && (
          <div className="exp-body">
            <div className="exp-row">
              <div className="exp-txt">
                <b>Eksport pełnego rejestru</b>
                <em>Wszystkie tygodnie, komentarze trenera, pomiary i kamienie milowe w jednym pliku JSON.
                  Format przenośny — przyszła wersja aplikacji zaimportuje go bez przepisywania.</em>
              </div>
              <button className="primary" onClick={() => {
                const dane = zbierzDane({
                  entries: ENTRIES, komentarze: COMMENTS, testy: TESTY, cardio: CARDIO,
                  wymiary: WYMIARY, spiro: SPIRO, krew: KREW, skany: SCANS, planKcal: ustawienia.planKcal,
                  ciezary, historia, zapisane,
                });
                pobierzJson(dane, `rejestr-${new Date().toISOString().slice(0, 10)}.json`);
              }}>Eksportuj JSON</button>
            </div>
            <div className="exp-row">
              <div className="exp-txt">
                <b>Odzyskanie danych</b>
                <em>Z pliku eksportu albo z historii repozytorium. Podgląd przed zapisem — nic nie wchodzi po cichu.</em>
              </div>
              <label className="ghost imp-lbl">Wybierz plik
                <input type="file" className="imp-in"
                       onChange={(e) => { if (e.target.files[0]) importujJSON(e.target.files[0]); e.target.value = ""; }} />
              </label>
            </div>

            <p className="note">Jeśli wybranie pliku nie działa — bo ma złe rozszerzenie albo kopiowałeś treść z GitHuba — wklej ją tutaj. To ta sama droga, tylko z pominięciem pliku.</p>
            <textarea className="dedit" rows={4} value={wklejka}
                      placeholder='Wklej całość, od { do }'
                      onChange={(e) => setWklejka(e.target.value)} />
            <div className="imp-akcje">
              <button className="ghost" disabled={!wklejka.trim()}
                      onClick={() => przygotujImport(wklejka, "wklejone")}>Sprawdź wklejone</button>
            </div>

            {impStan && impStan.blad && (
              <div className="impbox err"><b>Nie wczytałem.</b> {impStan.blad}</div>
            )}

            {impStan && impStan.dane && (
              <div className="impbox">
                <b>Znalazłem dane{impStan.zapis ? ` z ${String(impStan.zapis).slice(0, 16).replace("T", " ")}` : ""}:</b>
                <table className="tbl imp-tbl">
                  <tbody>
                    <tr><td>Tygodnie</td><td className="n">{impStan.licz.tygodnie}</td>
                        <td>Wymiary</td><td className="n">{impStan.licz.wymiary}</td></tr>
                    <tr><td>Dania</td><td className="n">{impStan.licz.dania}</td>
                        <td>Skany</td><td className="n">{impStan.licz.skany}</td></tr>
                    <tr><td>Obliczenia makro</td><td className="n">{impStan.licz.makro}</td>
                        <td>Ćwiczenia z obciążeniem</td><td className="n">{impStan.licz.cwiczenia}</td></tr>
                  </tbody>
                </table>
                <p className="note">Zastąpi to, co jest teraz w tej przeglądarce. Porównaj liczby z tym, co pamiętasz — jeśli któraś jest niższa, niż powinna, weź wcześniejszy zapis z historii repozytorium.</p>
                <div className="imp-akcje">
                  <button className="primary" onClick={zatwierdzImport}>Wczytaj te dane</button>
                  <button className="ghost" onClick={() => setImpStan(null)}>Odrzuć</button>
                </div>
              </div>
            )}
            <p className="note">Eksport bez importu nie jest kopią zapasową. Trzymaj oba pod ręką — albo włącz synchronizację niżej, wtedy kopia robi się sama.</p>
          </div>
        )}
      </section>

      {/* ── Ustawienia ──────────────────────────────────────
          Wszystko, co dotąd wymagało edycji kodu: klucz, synchronizacja,
          tempo deficytu i granice faz. ROADMAP przewiduje zmianę tempa
          na przeglądzie — musi być dostępna stąd. */}
      <section className={"panel exp" + (setOpen ? " open" : "")}>
        <button className="exp-tog" onClick={() => setSetOpen(!setOpen)}>
          <span className="exp-caret">{setOpen ? "▾" : "▸"}</span>
          <span>Ustawienia</span>
          <span className="tiny-note">
            {ustawienia.klucz ? "klucz ✓" : "brak klucza"} · {ustawienia.token ? "sync ✓" : "sync off"}
          </span>
        </button>

        {setOpen && (
          <div className="exp-body">
            <h4 className="ust-h">Klucz API</h4>
            <p className="note">Potrzebny do kalkulatora makro. Zapisuje się wyłącznie w tej przeglądarce — nigdy w repozytorium z kodem.</p>
            <input className="ust-in" type="password" placeholder="sk-ant-…"
                   value={ustawienia.klucz}
                   onChange={(e) => setUstawienia({ ...ustawienia, klucz: e.target.value })} />

            <h4 className="ust-h">Synchronizacja między urządzeniami</h4>
            <p className="note">Osobne, <b>prywatne</b> repozytorium wyłącznie na dane — nie to samo, w którym leży kod. Git trzyma historię każdego zapisu, więc pomyłkowe nadpisanie da się cofnąć.</p>
            <div className="ust-para">
              <label>Repozytorium
                <input className="ust-in" placeholder="uzytkownik/rejestr-dane"
                       value={ustawienia.repo}
                       onChange={(e) => setUstawienia({ ...ustawienia, repo: e.target.value.trim() })} /></label>
              <label>Token dostępu
                <input className="ust-in" type="password" placeholder="github_pat_…"
                       value={ustawienia.token}
                       onChange={(e) => setUstawienia({ ...ustawienia, token: e.target.value.trim() })} /></label>
            </div>
            <div className="imp-akcje">
              <button className="primary" onClick={() => synchronizuj("wyslij")}
                      disabled={sync.stan === "pracuje"}>Wyślij stąd</button>
              <button className="ghost" onClick={() => synchronizuj("pobierz")}
                      disabled={sync.stan === "pracuje"}>Pobierz zdalne</button>
              <label className="wyklucz-inline">
                <input type="checkbox" checked={ustawienia.autosync}
                       onChange={(e) => setUstawienia({ ...ustawienia, autosync: e.target.checked })} />
                pobieraj przy starcie
              </label>
            </div>
            {sync.stan === "pracuje" && <p className="note">Łączę z GitHubem…</p>}
            {sync.blad && <div className="impbox err"><b>Synchronizacja:</b> {sync.blad}</div>}
            {sync.stan === "gotowe" && !sync.blad &&
              <p className="note">Ostatnio: {String(sync.kiedy).slice(0, 16).replace("T", " ")}</p>}

            <h4 className="ust-h">Plan i tempo</h4>
            <p className="note">Reguła z ROADMAP: dwa tygodnie regresu siły z rzędu przy komplecie sesji oznaczają powrót do 0,28 — niezależnie od tego, co pokazuje waga.</p>
            <label>Kalorie planowane
              <input className="ust-in short" inputMode="numeric" value={ustawienia.planKcal}
                     onChange={(e) => setUstawienia({ ...ustawienia, planKcal: parseInt(e.target.value, 10) || 0 })} /></label>
            <table className="tbl">
              <thead><tr><th>Faza</th><th>Od</th><th>Do</th><th>kg/tydz.</th></tr></thead>
              <tbody>
                {ustawienia.fazy.map((f, i) => (
                  <tr key={i}>
                    <td>{f.label}</td>
                    <td><input className="ust-in tiny" type="date" value={f.from}
                        onChange={(e) => zmienFaze(i, "from", e.target.value)} /></td>
                    <td><input className="ust-in tiny" type="date" value={f.to}
                        onChange={(e) => zmienFaze(i, "to", e.target.value)} /></td>
                    <td className="n"><input className="ust-in tiny" inputMode="decimal" value={f.tempo}
                        onChange={(e) => zmienFaze(i, "tempo", parseFloat(String(e.target.value).replace(",", ".")) || 0)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4 className="ust-h">Blokada</h4>
            <p className="note">Cztery cyfry przy otwarciu. Nie chroni pliku na dysku — chroni przed zajrzeniem w odblokowany telefon leżący na ławce.</p>
            <input className="ust-in short" inputMode="numeric" maxLength={4} placeholder="bez blokady"
                   value={ustawienia.pin}
                   onChange={(e) => setUstawienia({ ...ustawienia, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
          </div>
        )}
      </section>

      <footer className="foot">
        <span>
          {zapisBlad ? zapisBlad
            : zapisano ? `Zapisano lokalnie ${String(zapisano).slice(11, 16)}`
            : "Dane w tej przeglądarce"}
          {sync.stan === "pracuje" && " · wysyłam…"}
          {sync.kiedy && sync.stan === "gotowe" && !sync.blad &&
            ` · GitHub ${String(sync.kiedy).slice(11, 16)}`}
          {sync.blad && " · synchronizacja: " + sync.blad}
          {ustawienia.token && ustawienia.repo && !sync.blad &&
            (zgodne ? " · wysyła sama" : " · automat wstrzymany")}
        </span>
        <span className="foot-dev">
          Invented &amp; designed by <b>Big Dog</b> · engineered by <b>Claude</b> · Łódź 2026
        </span>
      </footer>
    </div>
  );
}

/* ── eksport do .ics ──────────────────────────────────────────
   Plik iCalendar to zwykły tekst, więc składamy go w przeglądarce.
   Wydarzenia całodniowe + przypomnienie na 7 dni przed. */
const OPIS = {
  pomiar: "Rano, na czczo, przed treningiem. Talia w najwęższym miejscu, pas na wysokości pępka.",
  test: "Kolejność: hollow hold, 15 min, podciągnięcia, 15 min, dipy. Magnezja. Nie po zarwanej nocy.",
  badanie: "Termin z KALENDARZ.md projektu.",
  faza: "Punkt decyzyjny projektu — patrz ROADMAP.md.",
  wyjazd: "Kalorie na utrzymaniu, jedno FBW, stabilizator na kostkę przy zejściach.",
};

function esc(t) {
  return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/* Godzina lokalna 9:00, koniec 10:00. Bez strefy w formacie — kalendarz
   przyjmuje ją jako czas lokalny urządzenia, co przy terminach
   umawianych na miejscu jest zachowaniem pożądanym. */
function dataIcs(iso, godz) {
  const dt = new Date(iso + "T00:00:00");
  const p = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}${p(dt.getMonth() + 1)}${p(dt.getDate())}T${p(godz)}0000`;
}

/* Pomiary robisz sam w domu — ostrzeżenie z tygodniowym wyprzedzeniem
   byłoby szumem. Badania i testy wymagają umówienia albo przygotowania. */
function alarmy(typ) {
  return typ === "pomiar"
    ? [["-P1D", "Jutro"], ["-PT1H", "Za godzinę"]]
    : [["-P7D", "Za tydzień"], ["-P1D", "Jutro"]];
}

function budujIcs(lista) {
  const teraz = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const linie = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rejestr projektu//PL", "CALSCALE:GREGORIAN",
  ];
  lista.forEach((w, i) => {
    linie.push(
      "BEGIN:VEVENT",
      `UID:${w.d}-${i}@rejestr-projektu`,
      `DTSTAMP:${teraz}`,
      `DTSTART:${dataIcs(w.d, 9)}`,
      `DTEND:${dataIcs(w.d, 10)}`,
      `SUMMARY:${esc(w.n)}`,
      `DESCRIPTION:${esc(OPIS[w.t] || "")}`,
      `CATEGORIES:${esc(w.t.toUpperCase())}`,
      ...alarmy(w.t).flatMap(([kiedy, etykieta]) => [
        "BEGIN:VALARM", `TRIGGER:${kiedy}`, "ACTION:DISPLAY",
        `DESCRIPTION:${esc(etykieta + ": " + w.n)}`, "END:VALARM",
      ]),
      "END:VEVENT"
    );
  });
  linie.push("END:VCALENDAR");
  return linie.join("\r\n");
}

/* ── eksport / import danych ──────────────────────────────────
   Format przenośny: pełny stan rejestru w jednym pliku JSON.
   Wersja schematu pozwala przyszłej aplikacji rozpoznać układ
   danych i zmigrować je bez przepisywania ręcznego. */

function zbierzDane({ entries, komentarze, testy, cardio, wymiary, spiro, krew, skany, planKcal, ciezary, historia, zapisane }) {
  return {
    schema: SCHEMA,
    eksport: new Date().toISOString(),
    projekt: {
      cel: { procentTluszczu: 13, masaDocelowa: TARGET, termin: "2027-07-25" },
      kamienieMilowe: MILESTONES,
      fazy: PHASES,
      planKcal,
    },
    tygodnie: entries.map((e) => ({
      data: e.date, waga: e.weight, pas: e.waist, sen: e.sleep,
      fbw: e.fbw, sila: e.sila, aktywnosci: e.acts, kcal: e.kcal,
      cheaty: e.cheats, notatka: e.note,
      komentarzTrenera: komentarze[e.date] || null,
    })),
    pomiary: {
      sprawnosc: testy, cardio, wymiary, spirometria: spiro,
      krew, skladCiala: skany,
    },
    trening: { cykle: CYKLE, obciazenia: ciezary, historiaObciazen: historia },
    kalkulator: zapisane,
    wydarzenia: WYDARZENIA,
  };
}

function pobierzJson(dane, nazwa) {
  const blob = new Blob([JSON.stringify(dane, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nazwa;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pobierzIcs(lista, nazwa) {
  const blob = new Blob([budujIcs(lista)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nazwa;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slug(t) {
  return t.toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => ({ "ą":"a","ć":"c","ę":"e","ł":"l","ń":"n","ó":"o","ś":"s","ź":"z","ż":"z" }[c]))
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

/* ── import CSV z apki do liczenia kalorii ────────────────────
   Eksport MyFitnessPal daje jeden wiersz na posiłek, więc sumujemy
   po dacie. Kolumny sodu i cholesterolu są w tej bazie niekompletne
   i bywają błędne — świadomie je pomijamy. */
const CSV_KOL = {
  data: "Data",
  kcal: "Kalorie",
  bialko: "Białko (g)",
  wegle: "Węglowodany (g)",
  tluszcz: "Tłuszcze (g)",
  blonnik: "Błonnik",
};

function parsujCsv(tekst) {
  const linie = tekst.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (linie.length < 2) throw new Error("Plik jest pusty.");

  const naglowki = rozbijWiersz(linie[0]);
  const idx = {};
  for (const [klucz, nazwa] of Object.entries(CSV_KOL)) {
    const i = naglowki.findIndex((h) => h.trim() === nazwa);
    if (i === -1) throw new Error(`Brak kolumny ${nazwa}. To nie wygląda na eksport z apki żywieniowej.`);
    idx[klucz] = i;
  }

  const dni = {};
  for (let i = 1; i < linie.length; i++) {
    const p = rozbijWiersz(linie[i]);
    if (p.length < naglowki.length - 2) continue;
    const d = p[idx.data].trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    dni[d] = dni[d] || { kcal: 0, bialko: 0, wegle: 0, tluszcz: 0, blonnik: 0, posilki: 0 };
    for (const k of ["kcal", "bialko", "wegle", "tluszcz", "blonnik"]) {
      dni[d][k] += parseFloat(String(p[idx[k]]).replace(",", ".")) || 0;
    }
    dni[d].posilki += 1;
  }

  const lista = Object.entries(dni)
    .map(([data, v]) => ({ data, ...v }))
    .sort((a, b) => a.data.localeCompare(b.data));
  if (!lista.length) throw new Error("Nie znaleziono żadnych dni z poprawną datą.");
  return lista;
}

/** Eksport pomiarów: dwie kolumny, jeden wiersz na dzień. */
function parsujCsvWaga(tekst) {
  const linie = tekst.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (linie.length < 2) throw new Error("Plik jest pusty.");
  const naglowki = rozbijWiersz(linie[0]).map((h) => h.trim());
  const iData = naglowki.findIndex((h) => h === "Data");
  const iWaga = naglowki.findIndex((h) => h === "Waga");
  if (iData === -1 || iWaga === -1) throw new Error("Brak kolumny Data lub Waga.");

  const lista = [];
  for (let i = 1; i < linie.length; i++) {
    const p = rozbijWiersz(linie[i]);
    const d = (p[iData] || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    const w = parseFloat(String(p[iWaga]).replace(",", "."));
    if (Number.isNaN(w) || w <= 0) continue;
    lista.push({ data: d, waga: w });
  }
  if (!lista.length) throw new Error("Nie znaleziono żadnych pomiarów.");
  return lista.sort((a, b) => a.data.localeCompare(b.data));
}

/** Rozpoznanie rodzaju pliku po nagłówku — jeden przycisk obsługuje oba eksporty. */
function rozpoznajCsv(tekst) {
  const pierwsza = tekst.replace(/^\uFEFF/, "").split(/\r?\n/)[0] || "";
  if (/Kalorie/.test(pierwsza)) return "zywienie";
  if (/Waga/.test(pierwsza)) return "waga";
  throw new Error("Nieznany format. Oczekiwano eksportu żywienia lub pomiarów.");
}

/** Rozbicie wiersza CSV z obsługą cudzysłowów — nazwy produktów bywają z przecinkami. */
function rozbijWiersz(w) {
  const out = []; let biez = ""; let wCudz = false;
  for (let i = 0; i < w.length; i++) {
    const z = w[i];
    if (z === '"') { if (wCudz && w[i + 1] === '"') { biez += '"'; i++; } else wCudz = !wCudz; }
    else if (z === "," && !wCudz) { out.push(biez); biez = ""; }
    else biez += z;
  }
  out.push(biez);
  return out;
}


function przesun({ r, m }, k) {
  const t = m + k;
  if (t < 0) return { r: r - 1, m: 11 };
  if (t > 11) return { r: r + 1, m: 0 };
  return { r, m: t };
}

/** ISO dla i-tego dnia tygodnia kończącego się w podanym dniu (0 = poniedziałek). */
function isoDnia(koniec, i) {
  const dt = new Date(koniec + "T00:00:00");
  dt.setDate(dt.getDate() - 6 + i);
  const p = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

/** Skrócona data do etykiety dnia. */
function dataDnia(koniec, i) {
  const iso = isoDnia(koniec, i);
  return `${iso.slice(8)}.${iso.slice(5, 7)}`;
}

/** Nazwa dnia tygodnia dla wybranej daty — podpowiada, czy wpis zamyka tydzień. */
function nazwaDnia(iso) {
  const d = new Date(iso + "T00:00:00");
  return ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"][d.getDay()];
}

function Tydzien({ wartosci, jednostka, wynik, format, onChange, koniec }) {
  const puste = wartosci.filter((x) => !String(x).trim()).length;
  return (
    <div className="tyd">
      <div className="tyd-grid">
        {DNI.map((dz, i) => (
          <label key={dz} className={"tyd-d " + (String(wartosci[i]).trim() ? "ma" : "")}>
            <span className="fkey tyd-key">
              {dz}
              <em>{dataDnia(koniec, i)}</em>
            </span>
            <div className="fval">
              <div className="daygrid">
                <input inputMode="decimal" value={wartosci[i]} placeholder="·"
                       onChange={(e) => onChange(i, e.target.value)} />
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="tyd-out">
        {wynik.n ? (
          <>
            <b>{format(wynik.avg)}</b>
            <span>średnia z {wynik.n} {wynik.n === 1 ? "pomiaru" : wynik.n < 5 ? "pomiarów" : "pomiarów"}
              {puste ? ` · ${puste} ${puste === 1 ? "dzień pominięty" : "dni pominiętych"}` : " · komplet"}</span>
          </>
        ) : (
          <span className="tyd-empty">Wpisz choć jeden dzień — puste pola nie wchodzą do średniej.</span>
        )}
      </div>
    </div>
  );
}

function Ring({ pct, label, hint, tone }) {
  const R = 21, C = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className="ring" title={hint}>
      <svg viewBox="0 0 54 54">
        <circle cx="27" cy="27" r={R} className="rbg" />
        <circle cx="27" cy="27" r={R} className={"rfg " + tone}
                strokeDasharray={`${(C * v) / 100} ${C}`} transform="rotate(-90 27 27)" />
        <text x="27" y="31" className="rtxt">{Math.round(v)}%</text>
      </svg>
      <span className="rlab">{label}</span>
    </div>
  );
}

function Ocena({ n }) {
  if (!n) return <span className="score none">brak</span>;
  return (
    <span className={"score " + (n >= 7 ? "hi" : n >= 5 ? "mid" : "lo")}>
      <span className="track"><i style={{ width: `${n * 10}%` }} /></span>
      <b>{n}</b><em>/10</em>
    </span>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
.rej{--paper:#EEF1F0;--ink:#111C19;--ink-2:#3E4B47;--rule:#C4CFCB;--plan:#7C948D;
  --actual:#B8860B;--warn:#8C2F39;--good:#3F6B57;
  --band-0:#E4E9E7;--band-1:#E9EDEB;--band-2:#DFE6E3;
  --panel:#F6F8F7;--hair:#DDE4E1;--tint:#E9EDEB;--hover:#F2F5F4;--open:#F9FBFA;
  --r:8px;--r-sm:5px;--r-lg:12px;
  background:var(--paper);color:var(--ink);font-family:'IBM Plex Sans',sans-serif;font-size:14px;
  line-height:1.45;padding:22px;max-width:800px;margin:0 auto;
  transition:background .2s,color .2s}
.rej.dark{--paper:#12171A;--ink:#E7EDEA;--ink-2:#B4C2BD;--rule:#33403F;--plan:#9BB5AE;
  --actual:#D9A62B;--warn:#C4596B;--good:#5FA07C;
  --band-0:#171D20;--band-1:#141A1D;--band-2:#1B2225;
  --panel:#171D20;--hair:#242E31;--tint:#1B2225;--hover:#1E2629;--open:#1B2225}
.rej *{box-sizing:border-box}
.rej *,.rej *:focus,.rej *:active{outline:none!important;-webkit-tap-highlight-color:transparent}
.rej button,.rej svg,.rej .ring,.rej .lbl,.rej .cap,.rej .fkey,.rej .eyebrow,
.rej .rlab,.rej .rtxt,.rej .tyd-d span,.rej .legend,.rej .bar-meta{
  -webkit-user-select:none;user-select:none}
.rej ::selection{background:var(--ink);color:var(--paper)}
.rej.dark .form input,.rej.dark .form textarea,.rej.dark .cl-ta,
.rej.dark .pip,.rej.dark .sc,.rej.dark .chip,.rej.dark .report{background:var(--paper)}
.rej.dark .tyd-d{background:var(--paper)}
.rej.dark .tyd-d.ma,.rej.dark .tyd-d:focus-within{background:var(--hover)}
.rej.dark .col,.rej.dark .tab,.rej.dark .jitem{background:var(--paper)}
.rej.dark .jitem.open{background:var(--open)}
.rej.dark .dish,.rej.dark .jcom,.rej.dark .bar{background:var(--paper)}
.rej.dark .badge{background:transparent}
/* Przygaszenia dobrane pod jasne tło robiły się nieczytelne na ciemnym. */
.rej.dark .cap em,.rej.dark .fkey em,.rej.dark .kaltyt em,
.rej.dark .exp-tog .tiny-note,.rej.dark .ag-foot{opacity:1;color:var(--ink-2)}
.rej.dark .hintline,.rej.dark .note,.rej.dark .pdesc,
.rej.dark .exp-txt em,.rej.dark .kuw{color:var(--ink-2);opacity:1}
.rej.dark .kd.obcy{opacity:.42}
.rej.dark .jitem .jmeta{opacity:.9}
.rej.dark .tyd-d input::placeholder,.rej.dark .daygrid input::placeholder{color:#5A6A66}
.rej.dark .score.none,.rej.dark .stars.none{color:var(--ink-2)}
.rej.dark .kal-w.done{opacity:.72}
/* W trybie ciemnym stan zaznaczony nie może odwracać kolorów: atramentowe tło
   jest niemal czarne, a --paper jako kolor tekstu też. Zamiast inwersji —
   jaśniejsze tło, wyraźna ramka i pogrubienie. */
.rej.dark .pip.on,.rej.dark .sc.on,.rej.dark .chip.on,
.rej.dark .chipm.on,.rej.dark .subtab.on,.rej.dark .tab.on{
  background:var(--hover);color:var(--ink);border-color:var(--ink);font-weight:600}
.rej.dark .sc.on .m2{background:var(--ink)}
.rej.dark .pip.on.low{background:rgba(196,89,107,.22);color:var(--warn);border-color:var(--warn)}
.rej.dark .mockbar{background:var(--panel);color:var(--ink);border:1px solid var(--rule)}
.rej.dark .themebtn{border-color:var(--ink-2);color:var(--ink);opacity:1}
.rej.dark .primary{background:var(--ink);color:#12171A;font-weight:600}
.rej.dark .dish.st-odrzucone{opacity:.72}
/* Tła kategorii budowane z rgba na jasnym papierze na ciemnym tle zlewały się
   w jednolitą szarość — w ciemnym motywie kolor niesie tekst i lewa krawędź. */
.rej.dark .e-pomiar{background:rgba(155,181,174,.14);color:#B6CFC7}
.rej.dark .e-test{background:rgba(217,166,43,.16);color:#E6BE5C}
.rej.dark .e-badanie{background:rgba(95,160,124,.16);color:#84C4A0}
.rej.dark .e-faza{background:rgba(196,89,107,.16);color:#E08699}
.rej.dark .e-wyjazd{background:rgba(180,194,189,.12);color:var(--ink-2)}
.rej.dark .kallegend i{border-left-width:3px}
.rej button:focus-visible,.rej input:focus-visible,.rej textarea:focus-visible{
  box-shadow:inset 0 0 0 2px var(--ink)}
.rej svg,.rej svg *{border:0}
.mockbar{border-radius:var(--r);background:var(--ink);color:var(--paper);font-family:'IBM Plex Mono',monospace;
  font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;padding:6px 10px;margin-bottom:18px;
  display:flex;align-items:center;justify-content:space-between;gap:12px}
.themebtn{border-radius:99px;background:none;border:1px solid var(--paper);color:var(--paper);cursor:pointer;
  font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.14em;
  text-transform:uppercase;padding:3px 9px;opacity:.75}
.themebtn:hover{opacity:1}
.eyebrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-family:'IBM Plex Mono',monospace;
  font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-2);margin-bottom:14px}
.dot{width:3px;height:3px;background:var(--rule);border-radius:50%}
.ledger{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);
  border:1px solid var(--rule);border-radius:var(--r);overflow:hidden}
.ledger.cztery{grid-template-columns:repeat(4,1fr)}
/* Cztery liczby w rzędzie potrzebują mniejszego stopnia, żeby zmieściły się
   bez łamania na wąskim ekranie. */
.ledger.cztery .big{font-size:32px}
@media(max-width:900px){ .ledger.cztery{grid-template-columns:repeat(2,1fr)} }
.col{background:var(--paper);padding:14px 16px;display:flex;flex-direction:column;gap:2px}
.lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2)}
.big{font-family:'Instrument Serif',serif;font-size:38px;line-height:1;font-variant-numeric:tabular-nums}
.big em,.mid em{font-family:'IBM Plex Mono',monospace;font-style:normal;font-size:12px;margin-left:5px;color:var(--ink-2)}
.big.quiet,.mid.quiet{color:var(--plan)}
.sub{font-size:11px;color:var(--ink-2)}
.col.var.ok .big,.col.var.ok .mid{color:var(--good)}
.col.var.off .big,.col.var.off .mid{color:var(--warn)}
.progress{display:flex;align-items:center;gap:20px;margin-top:14px;padding-top:14px;
  border-top:1px solid var(--rule);flex-wrap:wrap}
.rings{display:flex;gap:14px;flex-shrink:0}
.ring{display:flex;flex-direction:column;align-items:center;gap:4px;width:54px}
.ring svg{width:54px;height:54px;display:block}
.rbg{fill:none;stroke:var(--rule);stroke-width:5}
.rfg{fill:none;stroke-width:5;stroke-linecap:butt;transition:stroke-dasharray .5s}
.t-plan{stroke:var(--plan)}
.t-act{stroke:var(--actual)}
.rtxt{font-family:'IBM Plex Mono',monospace;font-size:13px;fill:var(--ink);text-anchor:middle;font-weight:500}
.rlab{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-2)}
.barwrap{flex:1;min-width:220px}
.bar-fill{height:5px;background:var(--actual);border-radius:99px}
.bar{background:var(--rule);height:5px;border-radius:99px;overflow:hidden}
.bar-meta{display:flex;justify-content:space-between;margin-top:6px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--ink-2)}
.pnote{font-size:11px;color:var(--ink-2);margin:8px 0 0;font-style:italic}
.panel{margin-top:16px;border:1px solid var(--rule);background:var(--panel);padding:16px;
  border-radius:var(--r-lg)}
.chart{width:100%;height:auto;display:block}
.band-0{fill:var(--band-0)}.band-1{fill:var(--band-1)}.band-2{fill:var(--band-2)}
.grid{stroke:var(--rule);stroke-width:.5}
.ytick,.xtick{font-family:'IBM Plex Mono',monospace;font-size:8.5px;fill:var(--ink-2)}
.ytick{text-anchor:end}
.target{stroke:var(--good);stroke-width:1;stroke-dasharray:2 3}
.planline{fill:none;stroke:var(--plan);stroke-width:1.5;stroke-dasharray:5 3}
.trendline{fill:none;stroke:var(--actual);stroke-width:2}
.pt{fill:var(--ink)}
.legend{display:flex;gap:16px;margin-top:10px;font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--ink-2)}
.legend span{display:flex;align-items:center;gap:6px}
.legend i{width:14px;height:2px;display:inline-block}
.k-plan{background:var(--plan)}.k-trend{background:var(--actual)}
.k-pt{background:var(--ink);height:5px;width:5px}.k-target{background:var(--good)}
.tabs{display:flex;gap:1px;margin-top:18px;background:var(--rule);border:1px solid var(--rule);
  border-radius:var(--r);overflow:hidden}
.tab{flex:1;padding:9px 6px;background:var(--paper);border:0;cursor:pointer;font-family:'IBM Plex Mono',monospace;
  font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2)}
.tab.on{background:var(--ink);color:var(--paper)}
.bal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
  font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;
  color:var(--ink-2);margin-bottom:14px}
.mid{font-family:'Instrument Serif',serif;font-size:28px;line-height:1;font-variant-numeric:tabular-nums}
.tiny-note{letter-spacing:0;text-transform:none;opacity:.7}
.form .row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.form .row.top{padding-bottom:16px;border-bottom:1px solid var(--rule);margin-bottom:18px}
.prefill{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
  margin:-4px 0 16px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--ink-2)}
.ghost{border:1px solid var(--rule);border-radius:99px;background:transparent;cursor:pointer;padding:6px 12px;
  font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}
.ghost:hover{border-color:var(--ink);color:var(--ink)}
.ghost.tiny{padding:4px 10px;font-size:9.5px}
.ghost.tiny.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.filters{display:flex;gap:5px}
.delta{font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:none;letter-spacing:0;margin-top:1px}
.delta.good{color:var(--good)}
.form label{display:flex;flex-direction:column;gap:5px;flex:1;min-width:120px;font-family:'IBM Plex Mono',monospace;
  font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2)}
.form input,.form textarea{font-family:'IBM Plex Mono',monospace;font-size:14px;padding:8px 10px;
  border:1px solid var(--rule);background:var(--paper);color:var(--ink);text-transform:none;letter-spacing:0;
  border-radius:var(--r-sm);width:100%}
.frow{display:flex;align-items:center;gap:18px;padding:13px 0;border-bottom:1px solid var(--hair)}
.frow.hi .fkey em{opacity:.75}
.frow.last{border-bottom:0;align-items:flex-start}
.fkey{width:180px;flex-shrink:0;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink-2)}
.fkey em{font-style:normal;text-transform:none;letter-spacing:0;opacity:.6;font-size:10px;margin-left:6px}
.fval{flex:1;min-width:0}
.fval.kcal{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.fval.kcal input{width:110px}
.unit{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--ink-2)}
/* wszystkie kontrolki: ta sama siatka, ta sama wysokość */
.pips,.scale,.chips{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;width:100%}
.pip,.sc,.chip{height:46px;border-radius:var(--r-sm);border:1px solid var(--rule);background:var(--paper);cursor:pointer;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  padding:0 4px;color:var(--ink-2);transition:background .12s,border-color .12s}
.pip:hover,.sc:hover,.chip:hover{border-color:var(--ink-2)}
.pip{font-family:'IBM Plex Mono',monospace;font-size:14px}
.sc{font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.02em;
  text-transform:lowercase;text-align:center;line-height:1.15}
.chip{font-family:'IBM Plex Sans',sans-serif;font-size:11.5px;text-align:center;line-height:1.15}
.pip.on,.sc.on,.chip.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.m{width:12px;height:12px;display:inline-block;flex-shrink:0}
.m0{background:var(--warn);clip-path:polygon(50% 100%,0 25%,100% 25%)}
.m1{background:#B5705A;clip-path:polygon(50% 90%,15% 35%,85% 35%)}
.m2{background:var(--ink-2);clip-path:polygon(0 40%,100% 40%,100% 60%,0 60%)}
.m3{background:#7E9B6E;clip-path:polygon(50% 10%,15% 65%,85% 65%)}
.m4{background:var(--good);clip-path:polygon(50% 0,0 75%,100% 75%)}
.sc.on .m2{background:var(--paper)}

.actions{display:flex;align-items:center;gap:14px;padding-top:18px;margin-top:6px;border-top:1px solid var(--rule);flex-wrap:wrap}
.primary{padding:11px 20px;background:var(--ink);color:var(--paper);border:0;border-radius:99px;cursor:pointer;
  font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.ready{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--good)}
.tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.tbl th{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-2);text-align:left;padding:6px 8px;border-bottom:1px solid var(--rule);font-weight:500}
.tbl td{padding:7px 8px;border-bottom:1px solid var(--hair)}
.tbl .n{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums;text-align:right}
.tbl .warn{color:var(--warn)}.tbl .good{color:var(--good)}
.silabar{display:flex;gap:6px;align-items:flex-end;height:90px;padding-bottom:16px;position:relative}
.silacol{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;position:relative}
.silafill{width:100%;transition:height .3s;border-radius:var(--r-sm) var(--r-sm) 0 0}
.s0{background:var(--warn)}.s1{background:#B5705A}.s2{background:var(--rule)}
.s3{background:#7E9B6E}.s4{background:var(--good)}
.silax{position:absolute;bottom:-15px;left:0;right:0;text-align:center;
  font-family:'IBM Plex Mono',monospace;font-size:8.5px;color:var(--ink-2)}
.journal{display:flex;flex-direction:column;gap:1px;background:var(--rule);border:1px solid var(--rule);
  border-radius:var(--r);overflow:hidden}
.jitem{background:var(--paper)}
.jitem.open{background:var(--open)}
.jhead{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;
  background:none;border:0;cursor:pointer;text-align:left;font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--ink-2)}
.jhead:hover{background:var(--hover)}
.jdate{font-size:10.5px;letter-spacing:.04em}
.jstats{display:flex;align-items:center;gap:9px;margin-left:auto;margin-right:14px}
.jstats b{font-size:13px;color:var(--ink);font-weight:500}
.jmeta{font-size:10px;opacity:.75}
.jflag{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--rule);min-width:52px;text-align:right}
.jflag.has{color:var(--actual)}
.jbody{padding:2px 14px 16px}
.jgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:9px;
  padding:11px 0 13px;border-top:1px solid var(--hair)}
.jgrid span{display:flex;flex-direction:column;gap:2px;font-family:'IBM Plex Mono',monospace;font-size:12px}
.jgrid em{font-style:normal;font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-2)}
.jnote{font-size:12.5px;font-style:italic;color:var(--ink-2);margin:0 0 13px;padding-left:11px;border-left:2px solid var(--rule)}
.jcom{background:var(--paper);border-left:2px solid var(--actual);padding:12px 14px;
  border-radius:0 var(--r-sm) var(--r-sm) 0}
.jcom.empty-com{border-left-color:var(--rule)}
.jcomlbl{display:block;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--actual);margin-bottom:7px}
.empty-com .jcomlbl{color:var(--ink-2)}
.jcom p{margin:0 0 9px;font-size:13px}
.jcom p:last-of-type{margin-bottom:0}
.empty-com p{color:var(--ink-2);font-style:italic;margin-bottom:11px}
.minirow{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap;margin-top:3px}
.minirow .mini{margin-top:0}
.mini-sep{color:var(--rule);font-size:10px}
.mini{background:none;border:0;padding:0;cursor:pointer;text-align:left;
  font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--plan);text-decoration:underline;
  text-underline-offset:3px;margin-top:3px}
.mini:hover{color:var(--ink)}
/* Kafle dni w tej samej konwencji co sen, FBW i aktywności:
   własna ramka, stała wysokość, siatka zawijana bez przepełnienia. */
/* Dwie kolumny w rytmie reszty formularza: nazwa dnia w miejscu etykiety,
   pole w rozmiarze pojedynczego kafla z rzędu „sen". */
/* Rząd dnia ma dokładnie tę samą budowę co rząd „sen": etykieta w kolumnie
   .fkey, a pole w piątej komórce pięciokolumnowej siatki — czyli tam,
   gdzie w rzędzie „sen" stoi kafel z piątką. */
.tyd{padding:0;margin:0 0 16px;max-width:100%}
.tyd-grid{display:flex;flex-direction:column;width:100%}
.tyd-d{display:flex;align-items:center;gap:18px;width:100%;padding:5px 0;
  border-bottom:1px solid var(--hair)}
.tyd-d:last-child{border-bottom:0}
.daygrid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;width:100%}
.daygrid input{grid-column:5;width:100%;height:46px;padding:0 8px;text-align:center;
  border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);
  color:var(--ink-2);font-family:'IBM Plex Mono',monospace;font-size:14px;
  transition:border-color .12s}
.daygrid input:hover{border-color:var(--ink-2)}
.daygrid input::placeholder{color:var(--rule)}
.tyd-d.ma .daygrid input{color:var(--ink);font-weight:500;border-color:var(--ink)}
.tyd-d.ma .fkey{color:var(--ink)}
.daygrid input:focus{border-color:var(--ink)}
.daygrid input:focus-visible{box-shadow:none}
.tyd-out{display:flex;align-items:baseline;gap:10px;margin-top:12px;
  padding-top:11px;border-top:1px solid var(--hair);flex-wrap:wrap}
.tyd-out b{font-family:'Instrument Serif',serif;font-size:24px;font-weight:400;line-height:1}
.tyd-out span{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--ink-2);
  letter-spacing:.03em}
.tyd-empty{font-style:italic;letter-spacing:0}
.closing{margin-top:18px;border-top:2px solid var(--ink);padding-top:16px}
.cl-head{display:flex;align-items:center;justify-content:space-between;gap:12px;
  font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--ink-2);margin-bottom:16px}
.cl-state{padding:3px 10px;border:1px solid var(--actual);border-radius:99px;color:var(--actual);font-size:9px}
.cl-state.done{border-color:var(--good);color:var(--good)}
.cl-step{display:flex;gap:13px;margin-bottom:20px}
.cl-step.dim{opacity:.45}
.cl-num{width:22px;height:22px;flex-shrink:0;border:1px solid var(--ink);border-radius:50%;
  display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;
  font-size:11px;color:var(--ink)}
.cl-body{flex:1;min-width:0}
.cl-lbl{margin:2px 0 10px;font-size:12.5px;color:var(--ink-2)}
.cl-ta{width:100%;font-family:'IBM Plex Sans',sans-serif;font-size:13px;padding:10px;
  border:1px solid var(--rule);background:var(--paper);color:var(--ink);border-radius:var(--r-sm);
  margin-bottom:11px;resize:vertical}
.report{font-family:'IBM Plex Mono',monospace;font-size:11px;white-space:pre-wrap;
  background:var(--paper);border:1px solid var(--rule);padding:13px;margin:11px 0 0;
  border-radius:var(--r-sm);max-height:240px;overflow:auto}
.cl-btns{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.primary:disabled{opacity:.35;cursor:not-allowed}
.kalnav{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.navbtn{width:30px;height:30px;border:1px solid var(--rule);border-radius:50%;background:transparent;
  cursor:pointer;color:var(--ink-2);font-size:15px;line-height:1;flex-shrink:0}
.navbtn:hover{border-color:var(--ink);color:var(--ink)}
.kaltyt{flex:1;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:11px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2)}
.kaltyt b{color:var(--ink);font-weight:500}
.kaltyt em{display:block;font-style:normal;font-size:9px;letter-spacing:.06em;
  text-transform:none;color:var(--ink-2);margin-top:3px;opacity:.8}
.kalhead{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;margin-bottom:3px}
.kalhead span{text-align:center;font-family:'IBM Plex Mono',monospace;font-size:9px;
  letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2);padding-bottom:4px}
.kalgrid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px}
.kd{position:relative;min-height:82px;border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);
  padding:5px 5px 6px;display:flex;flex-direction:column;gap:3px;min-width:0;position:relative}
.kd.obcy{opacity:.32}
.kd.nd{background:var(--tint)}
.kd-n{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--ink-2)}
.kd-kg{position:absolute;top:4px;right:6px;font-family:'IBM Plex Mono',monospace;
  font-size:10.5px;font-weight:500}
.kd-kg.wyk{color:var(--actual)}
.kd-kg.dzien{color:var(--ink);font-weight:400}
.kd-kg.prog{color:var(--ink-2);opacity:.7}
.kd-kcal{position:absolute;bottom:4px;right:6px;font-family:'IBM Plex Mono',monospace;
  font-size:9px;color:var(--plan)}
.kl-dane{margin-top:12px;margin-bottom:2px}
.kl-dane b{font-family:'IBM Plex Mono',monospace;font-size:10.5px;font-weight:500}
.lg-wyk{color:var(--actual)}
.lg-dzien{color:var(--ink)}
.lg-kcal{color:var(--plan);font-size:9px!important}
.kd-ev{font-size:8.5px;line-height:1.25;padding:3px 5px;border-radius:4px;
  overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;
  border-left:2px solid}
.e-pomiar{background:rgba(124,148,141,.18);border-color:var(--plan);color:var(--ink)}
.e-test{background:rgba(184,134,11,.18);border-color:var(--actual);color:var(--ink)}
.e-badanie{background:rgba(63,107,87,.18);border-color:var(--good);color:var(--ink)}
.e-faza{background:rgba(140,47,57,.15);border-color:var(--warn);color:var(--ink)}
.e-wyjazd{background:rgba(62,75,71,.15);border-color:var(--ink-2);color:var(--ink)}
.kalexp{margin-top:16px;padding-top:14px;border-top:1px solid var(--rule)}
.kalexp-btns{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.kalexp .note{margin-top:10px}
.kd-ev{border:0;cursor:pointer;text-align:left;font-family:inherit;width:100%}
.kd-ev:hover{filter:brightness(.94)}
.kallegend{display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;
  font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--ink-2)}
.kallegend span{display:flex;align-items:center;gap:6px}
.kallegend i{width:11px;height:11px;border-radius:3px;display:inline-block;border-left:2px solid}
@media(max-width:600px){
  .kd{min-height:58px;padding:4px}
  .kd-ev{font-size:7.5px;-webkit-line-clamp:2}
}
.wyklucz{display:flex;align-items:center;gap:9px;background:transparent;border:0;padding:0;
  cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;color:var(--ink-2);
  text-align:left}
.wyklucz .box{width:16px;height:16px;border:1px solid var(--rule);border-radius:4px;
  flex-shrink:0;display:inline-block}
.wyklucz:hover .box{border-color:var(--ink)}
.hintline{margin:7px 0 0;font-size:11px;color:var(--ink-2);opacity:.8;font-style:italic}
.imp-lbl{position:relative;overflow:hidden;display:inline-block}
.imp-in{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.impbox{border-left:2px solid var(--good);background:var(--tint);padding:12px 14px;
  margin:0 0 14px;border-radius:0 var(--r-sm) var(--r-sm) 0;font-size:12.5px}
.impbox.err{border-left-color:var(--warn)}
.impbox b{font-weight:500}
.implist{list-style:none;margin:9px 0 0;padding:0;display:flex;flex-direction:column;gap:5px}
.implist li{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;
  font-family:'IBM Plex Mono',monospace;font-size:11.5px}
.implist li span:first-child{min-width:82px}
.implist em{font-style:normal;color:var(--ink-2);font-size:10px}
.implist b{margin-left:auto;font-size:12.5px}
.impm{width:100%;color:var(--ink-2);font-size:10px}
.impbox .note{margin-top:10px}
.imp-tbl{margin-top:10px}
.imp-tbl th{font-size:9px}
.imp-tbl td{padding:5px 7px;font-size:12px}
.imp-akcje{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
.exp{padding:0}
.exp-tog{width:100%;display:flex;align-items:center;gap:10px;padding:13px 16px;
  background:none;border:0;cursor:pointer;text-align:left;
  font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--ink-2)}
.exp-tog:hover{color:var(--ink)}
.exp-caret{font-size:9px;width:10px;flex-shrink:0}
.exp-tog .tiny-note{margin-left:auto}
.exp-body{padding:2px 16px 16px;border-top:1px solid var(--hair)}
.exp-body .exp-row{padding-top:14px}
.filebtn{display:inline-flex;align-items:center;padding:9px 16px;border:1px solid var(--rule);
  border-radius:99px;background:transparent;cursor:pointer;font-family:'IBM Plex Mono',monospace;
  font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2)}
.filebtn:hover{border-color:var(--ink);color:var(--ink)}
.filebtn input{display:none}
.imp-blad{margin:9px 0 0;font-size:11.5px;color:var(--warn)}
.imp-box{margin-top:12px;border:1px solid var(--rule);border-radius:var(--r-sm);padding:12px 14px}
.imp-tbl{font-size:11.5px}
.imp-tbl th{font-size:8.5px}
.imp-tbl td{padding:5px 6px}
.imp-akcje{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
.exp-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.exp-txt{flex:1;min-width:220px;display:flex;flex-direction:column;gap:3px}
.exp-txt b{font-size:13px;font-weight:500}
.exp-txt em{font-style:normal;font-size:11.5px;color:var(--ink-2);line-height:1.45}
.agenda{padding-bottom:14px}
.ag-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.ag{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--hair)}
.ag:last-child{border-bottom:0}
.ag-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;background:var(--rule)}
.ag.teraz .ag-dot{background:var(--actual)}
.ag.zalegle .ag-dot{background:var(--warn)}
.ag.wkrotce .ag-dot{background:var(--plan)}
.ag-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.ag-body b{font-size:13px;font-weight:500}
.ag-body em{font-style:normal;font-size:11px;color:var(--ink-2)}
.ag-when{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-2);flex-shrink:0;text-align:right}
.ag.teraz .ag-when{color:var(--actual)}
.ag.zalegle .ag-when{color:var(--warn)}
.ag-foot{margin:12px 0 0;font-family:'IBM Plex Mono',monospace;font-size:9.5px;
  letter-spacing:.04em;color:var(--ink-2);opacity:.75}
.subtab.biezacy::after{content:"";width:5px;height:5px;border-radius:50%;
  background:var(--actual);display:inline-block;margin-left:7px;vertical-align:middle}
.cyklhead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  margin-bottom:12px}
.cyklhead b{display:block;font-size:15px;font-weight:600}
.cyklhead em{font-style:normal;font-family:'IBM Plex Mono',monospace;font-size:10.5px;
  color:var(--ink-2);letter-spacing:.04em}
.cstan{font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.12em;
  text-transform:uppercase;padding:4px 10px;border:1px solid var(--rule);border-radius:99px;
  color:var(--ink-2);white-space:nowrap;flex-shrink:0}
.c-aktualny{border-color:var(--actual);color:var(--actual)}
.seslist{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px}
.sesbtn{display:flex;align-items:center;gap:8px;padding:9px 15px;border:1px solid var(--rule);
  border-radius:var(--r-sm);background:var(--paper);cursor:pointer;color:var(--ink-2)}
.sesbtn:hover{border-color:var(--ink-2);color:var(--ink)}
.sesbtn b{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600}
.sesbtn span{font-size:12px}
.sesbtn.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.cwlist{display:flex;flex-direction:column}
.cw{padding:11px 0;border-bottom:1px solid var(--hair)}
.cw:last-child{border-bottom:0}
.cw-main{display:flex;align-items:center;gap:13px}
.cw-img{width:52px;height:52px;flex-shrink:0;border-radius:var(--r-sm);background:#fff;
  object-fit:contain;border:1px solid var(--rule)}
.cw-img.pusty{background:var(--tint);border-style:dashed}
.cw-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.cw-txt b{font-size:13.5px;font-weight:500}
.cw-txt em{font-style:normal;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--ink-2)}
.cw-wt{display:flex;align-items:center;gap:6px;flex-shrink:0}
.cw-wt input{width:74px;height:40px;padding:0 8px;text-align:center;
  border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);color:var(--ink);
  font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:500}
.cw-wt input:hover,.cw-wt input:focus{border-color:var(--ink)}
.cw-wt input::placeholder{color:var(--rule)}
.cw-j{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--ink-2);width:26px}
.cw-hist{width:30px;height:30px;flex-shrink:0;border:1px solid var(--rule);border-radius:50%;
  background:transparent;cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:11px;
  color:var(--ink-2)}
.cw-hist:hover{border-color:var(--ink);color:var(--ink)}
.cw-delta{display:block;margin-top:5px;font-family:'IBM Plex Mono',monospace;font-size:10px;
  color:var(--good)}
.cw-h{margin-top:11px;padding:12px 14px;background:var(--tint);border-radius:var(--r-sm)}
.subtabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px}
.subtab{padding:6px 13px;background:transparent;border:1px solid var(--rule);border-radius:99px;
  cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--ink-2)}
.subtab:hover{border-color:var(--ink-2);color:var(--ink)}
.subtab.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.pdesc{font-size:12.5px;color:var(--ink-2);margin:0 0 16px;padding-left:11px;
  border-left:2px solid var(--rule)}
.prow{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
.prow label{display:flex;flex-direction:column;gap:5px;flex:1;min-width:112px;
  font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink-2)}
.prow input,.prow select{font-family:'IBM Plex Mono',monospace;font-size:13.5px;padding:8px 10px;
  border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);color:var(--ink);
  text-transform:none;letter-spacing:0;width:100%}
.tblwrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.deltarow td{font-weight:500;border-top:1px solid var(--rule);border-bottom:0;
  font-family:'IBM Plex Mono',monospace;font-size:11px}
.deltarow td:first-child{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2)}
.metoda{margin-bottom:14px}
.mchips{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.chipm{padding:8px 16px;border:1px solid var(--rule);border-radius:99px;background:var(--paper);
  cursor:pointer;font-family:'IBM Plex Sans',sans-serif;font-size:12px;color:var(--ink-2)}
.chipm:hover{border-color:var(--ink-2)}
.chipm.on{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.krewgrp{margin-top:18px}
.krewhead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding-bottom:6px;border-bottom:1px solid var(--rule);
  font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ink)}
.krewhead em{font-style:normal;font-size:9px;letter-spacing:.04em;text-transform:none;color:var(--ink-2)}
.krewgrp .tbl td{padding:6px 8px;font-size:12.5px}
.kn{max-width:210px}
.kuw{display:block;font-size:10.5px;color:var(--ink-2);font-style:italic;
  line-height:1.35;margin-top:3px}
.ku{font-size:10px;color:var(--ink-2)}
.kref{font-size:10.5px;white-space:nowrap}
.f-prog td:first-child{box-shadow:inset 2px 0 0 var(--warn)}
.f-prog .n.strong{color:var(--warn)}
.f-gora td:first-child{box-shadow:inset 2px 0 0 var(--actual)}
.f-gora .n.strong{color:var(--actual)}
.pempty{padding:18px 0}
.pempty p{margin:0 0 8px;color:var(--ink-2)}
.dishes{display:flex;flex-direction:column;gap:10px}
.dish{border:1px solid var(--rule);background:var(--paper);padding:13px 15px;border-radius:var(--r)}
.dish.st-odrzucone{opacity:.6}
.dish.st-propozycja{border-style:dashed}
.dtop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px}
.dtop h4{margin:0;font-size:14.5px;font-weight:500;line-height:1.3}
.badge{font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;
  padding:3px 8px;border:1px solid var(--rule);border-radius:99px;color:var(--ink-2);
  white-space:nowrap;flex-shrink:0}
.b-vault{border-color:var(--good);color:var(--good)}
.b-odrzucone{border-color:var(--warn);color:var(--warn)}
.b-kuchnia{border-color:var(--actual);color:var(--actual)}
.dmacro{display:flex;gap:16px;flex-wrap:wrap;font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--ink-2)}
.dmacro b{color:var(--ink);font-size:12px}
.dq{opacity:.7}
.drate{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}
.rlbl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2)}
.score{display:inline-flex;align-items:center;gap:6px;margin-right:12px;
  font-family:'IBM Plex Mono',monospace}
.score .track{width:54px;height:5px;background:var(--rule);display:inline-block;position:relative;
  border-radius:99px;overflow:hidden}
.score .track i{position:absolute;left:0;top:0;bottom:0;display:block}
.score.hi .track i{background:var(--good)}
.score.mid .track i{background:var(--actual)}
.score.lo .track i{background:var(--warn)}
.score b{font-size:12.5px;font-weight:500}
.score em{font-style:normal;font-size:9.5px;color:var(--ink-2)}
.score.none{color:var(--ink-2);font-size:10px;font-style:italic}
.dchg{font-size:12.5px;color:var(--ink-2);margin:10px 0 0;padding-left:11px;border-left:2px solid var(--rule)}
.dact{margin-top:11px}
.dfile{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--good)}
.dfile.off{color:var(--ink-2)}
.note{font-size:11.5px;color:var(--ink-2);margin:12px 0 0;font-style:italic}
.foot{margin-top:18px;padding-top:12px;border-top:1px solid var(--hair);
  display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;
  font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--ink-2);letter-spacing:.06em}
.foot-dev{opacity:.85;text-align:right}
.foot-dev b{font-weight:500;color:var(--ink)}
@media(max-width:600px){
  .rej{padding:14px}.ledger{grid-template-columns:1fr}.big{font-size:32px}
  .frow{flex-direction:column;align-items:flex-start;gap:8px}.fkey{width:auto}
  .tyd{padding:10px 11px}
  .pips,.scale,.chips{grid-auto-flow:row;grid-template-columns:repeat(3,1fr)}
  .pip,.sc,.chip{height:42px}
  .jstats{margin-right:8px}.jmeta{display:none}
}

/* ── drugi poziom nawigacji ───────────────────────────────── */
.subnav{display:flex;gap:22px;margin-top:14px;border-bottom:1px solid var(--rule);
  flex-wrap:wrap}
.snav{padding:0 0 10px;background:none;border:0;border-bottom:2px solid transparent;
  margin-bottom:-1px;cursor:pointer;white-space:nowrap;
  font-family:'IBM Plex Sans',sans-serif;font-size:12.5px;font-weight:500;color:var(--ink-2)}
.snav:hover{color:var(--ink)}
.snav.on{color:var(--ink);border-bottom-color:var(--ink)}

/* ── kalkulator makro ─────────────────────────────────────── */
.kalk-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
.kalk-in{width:100%;min-height:210px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;
  padding:13px 14px;border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);
  color:var(--ink);resize:vertical;line-height:1.5}
.kalk-in:hover,.kalk-in:focus{border-color:var(--ink-2)}
.kalk-side{display:flex;flex-direction:column;gap:16px}
.kalk-fld{display:flex;flex-direction:column;gap:7px}
.kalk-fld input{font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:11px 13px;
  border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);
  color:var(--ink);width:100%}
.kalk-fld input:hover,.kalk-fld input:focus{border-color:var(--ink-2)}
.cap em{font-style:normal;text-transform:none;letter-spacing:0;opacity:.65;margin-left:5px}
.pquick{display:flex;gap:5px;flex-wrap:wrap}
.pq{width:44px;height:44px;border:1px solid var(--rule);border-radius:var(--r-sm);
  background:var(--paper);cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:15px;
  color:var(--ink-2);flex-shrink:0}
.pq:hover{border-color:var(--ink-2);color:var(--ink)}
.pq.on{background:var(--ink);color:var(--paper);border-color:var(--ink);font-weight:600}
.pq-other{flex:1;min-width:64px;height:44px;padding:0 10px;text-align:center;
  border:1px solid var(--rule);border-radius:var(--r-sm);background:var(--paper);color:var(--ink);
  font-family:'IBM Plex Mono',monospace;font-size:14px}
.pq-other::placeholder{color:var(--rule);font-size:11px}
.pinfo{font-style:normal;font-size:11px;color:var(--ink-2)}
.kalk-btns{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
.kalk-kontrola{margin:12px 0 0;font-family:'IBM Plex Mono',monospace;font-size:10.5px}
.kalk-kontrola.ok{color:var(--good)}
.kalk-kontrola.zla{color:var(--warn)}
.kalk-progi{margin:10px 0 0;font-family:'IBM Plex Mono',monospace;font-size:10.5px}
.kalk-progi.ok{color:var(--good)}
.kalk-progi.zla{color:var(--warn)}
.zapisy{margin:0}
.zap{background:var(--tint);border-radius:var(--r-sm);margin-bottom:6px;overflow:hidden}
.zap-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:12px 14px;background:none;border:0;cursor:pointer;text-align:left}
.zap-head:hover{background:var(--hover)}
.zap-txt{display:flex;flex-direction:column;gap:2px;min-width:0}
.zap-txt b{font-size:13px;font-weight:500}
.zap-txt em{font-style:normal;font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--ink-2)}
.zap-kcal{font-family:'IBM Plex Mono',monospace;font-size:15px;font-weight:500;flex-shrink:0}
.zap-kcal i{font-style:normal;font-size:9px;color:var(--ink-2);margin-left:3px}
.zap-body{padding:0 14px 14px}
.zap-opis{font-size:12px;color:var(--ink-2);font-style:italic;margin:0 0 11px;
  padding-left:11px;border-left:2px solid var(--rule)}
.ledger .col .sub.makro{display:flex;flex-direction:column;gap:2px;line-height:1.5}
.makro-blon{font-style:normal;opacity:.7}

.jact{display:flex;gap:8px;margin-top:10px}
.wact{white-space:nowrap}
.wact .mini{margin-left:4px}
.zdalne{display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:10px 14px;margin-bottom:12px;border:1px solid var(--rule);
  border-radius:6px;background:var(--bg-1);font-size:13px}
.zdalne span{flex:1;min-width:220px}

/* ── kuchnia i raporty ───────────────────────────────────── */
.dsel{padding:4px 8px;border:1px solid var(--rule);border-radius:4px;
  background:var(--bg-1);color:var(--ink-1);font-family:inherit;font-size:12px}
.dopen{margin-top:12px;padding-top:12px;border-top:1px solid var(--rule)}
.dporcje{display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap}
.dporcje b{font-size:15px;min-width:22px;text-align:center}
.dalarm{font-size:12px;color:#B4453C;flex-basis:100%}
.drate.edytowalne input{width:52px;text-align:center}
.dedit{width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;
  line-height:1.6;padding:10px;border:1px solid var(--rule);border-radius:4px;
  background:var(--bg-0);color:var(--ink-1)}
.rapbox{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.md{font-size:13px;line-height:1.7}
.md-h{margin:16px 0 6px;font-size:13px;letter-spacing:.06em}
.md-p{margin:8px 0}
.md-hr{border:none;border-top:1px solid var(--rule);margin:16px 0}
.md-ul,.md-ol{margin:8px 0;padding-left:20px}
.md-ul li,.md-ol li{margin:3px 0}
.md-check{list-style:none;margin:8px 0;padding:0}
.md-check li{display:flex;align-items:flex-start;gap:8px;margin:4px 0}
.md-box{flex:none;width:12px;height:12px;margin-top:4px;border:1px solid var(--rule);border-radius:2px}
.md-q{margin:10px 0;padding-left:11px;border-left:2px solid var(--rule);color:var(--ink-3)}
.md-tblwrap{overflow-x:auto;margin:10px 0}
.md code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}

/* ── sygnały ─────────────────────────────────────────────── */
.sygbox{margin:0 0 18px;padding:12px 14px;border:1px solid var(--rule);
  border-radius:6px;background:var(--bg-1)}
.syg{display:flex;align-items:center;gap:10px;padding:7px 0;
  border-bottom:1px solid var(--rule);font-size:13px}
.syg:last-of-type{border-bottom:none}
.syg-txt{flex:1}
.syg.s-ostrzezenie{color:#B4453C}
.syg.s-uwaga{color:var(--ink-1)}
.syg.s-informacja{color:var(--ink-3)}

/* ── edytor wydarzeń ─────────────────────────────────────── */
.kd-add{opacity:0;position:absolute;right:3px;top:3px;width:16px;height:16px;
  line-height:14px;border:1px solid var(--rule);border-radius:3px;background:var(--bg-1);
  color:var(--ink-3);font-size:11px;cursor:pointer;padding:0}
.kd:hover .kd-add{opacity:1}
.kd-ev.zrob{opacity:.45;text-decoration:line-through}
.evbox{margin:14px 0;padding:14px;border:1px solid var(--rule);border-radius:6px;
  background:var(--bg-1)}
.evnazwa{display:block;font-size:12px;color:var(--ink-3);margin-bottom:10px}
.evnazwa em{font-style:normal;opacity:.7}
.evnazwa input{width:100%;padding:8px 10px;border:1px solid var(--rule);border-radius:4px;
  background:var(--bg-0);color:var(--ink-1);font-family:inherit;font-size:13px;margin-top:4px}
.ghost.del{color:#B4453C;border-color:#B4453C}

/* ── ustawienia, blokada, synchronizacja ─────────────────── */
.ust-h{font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-3);margin:18px 0 6px}
.ust-in{width:100%;padding:8px 10px;border:1px solid var(--rule);border-radius:4px;
  background:var(--bg-1);color:var(--ink-1);font-family:inherit;font-size:13px}
.ust-in.short{max-width:180px}
.ust-in.tiny{padding:4px 6px;font-size:12px}
.ust-para{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px}
.ust-para label{display:block;font-size:12px;color:var(--ink-3)}
.wyklucz-inline{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ink-3)}
.pinbox{min-height:100vh;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:14px}
.pinbox b{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3)}
.pinbox em{font-size:12px;color:var(--bad,#B4453C);font-style:normal}
@media(max-width:700px){ .ust-para{grid-template-columns:1fr} }

@media(max-width:700px){
  .kalk-grid{grid-template-columns:1fr}
  .kalk-in{min-height:150px}
}
`;
