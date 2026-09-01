# Dziennik zmian

Numer wersji widać w stopce aplikacji. To jedyny pewny sposób sprawdzenia,
co faktycznie załadowało się na telefonie — jeśli stopka pokazuje starszą
wersję niż ostatni wpis poniżej, przeglądarka nadal podaje z pamięci podręcznej.

Wersje sprzed v1.28 są w historii gita, ale nie były opisywane. Ostatnie
numery, które da się tam wskazać, to v1.23, v1.26 i v1.27 — treści zmian
nie odtwarzam, bo commity powstawały przez zbiorcze wgranie plików.

---

## v1.29 — 1 września 2026

Dwie naprawy synchronizacji. Obie wynikły ze zgłoszenia, że dane znikają
albo nie docierają na drugie urządzenie.

**Przepisy z kalkulatora makro przestały znikać.** Bramka zgodności przed
automatyczną wysyłką liczyła tylko cztery pola — tygodnie, wymiary, dania
i skany — a pomijała `zapisane`. Urządzenie z mniejszą liczbą przepisów
niż w repozytorium nie widziało, że zostaje w tyle, i nadpisywało bogatszy
stan. Lista pól liczonych ilościowo jest teraz jedna (`POLA_ILOSCIOWE`),
wspólna dla bramki wysyłki i dla ostrzeżenia „co zniknie” przed pobraniem.

**Plan i tempo synchronizują się między urządzeniami.** Kalorie planowane,
utrzymanie, kamienie milowe i fazy siedziały w worku `ustawienia`, który
celowo nigdy nie jedzie przez GitHub, bo trzyma klucz API, token i PIN.
To są jednak dane projektu, nie urządzenia — telefon zostawał z wagą
startową i celem kalorycznym sprzed zmiany. Wędrują teraz osobnym polem
`plan` wewnątrz synchronizowanego worka; reszta ustawień zostaje lokalnie.

## v1.28 — 1 września 2026

**Eksport dziennika do `.md`.** Całość jednym plikiem: wszystkie tygodnie
w kolejności chronologicznej, z liczbami, notatkami i komentarzami trenera.
Służy do wklejenia w czacie trenera przy przeglądzie cyklu — stąd komplet,
a nie pojedynczy tydzień. Przycisk siedzi w Ustawieniach, w sekcji
„Dane i eksport”, obok eksportu JSON.
