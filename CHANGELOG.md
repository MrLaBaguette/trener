# Dziennik zmian

Numer wersji widać w stopce aplikacji. To jedyny pewny sposób sprawdzenia,
co faktycznie załadowało się na telefonie — jeśli stopka pokazuje starszą
wersję niż ostatni wpis poniżej, przeglądarka nadal podaje z pamięci podręcznej.

Wersje sprzed v1.28 są w historii gita, ale nie były opisywane. Ostatnie
numery, które da się tam wskazać, to v1.23, v1.26 i v1.27 — treści zmian
nie odtwarzam, bo commity powstawały przez zbiorcze wgranie plików.

---

## v1.30 — 1 września 2026

**Spirometria trzyma komplet parametrów.** Przy zapisie zostawały cztery
wartości, reszta raportu szła do kosza — w tym MEF25 i FEF25-75, czyli małe
oskrzela, najsłabszy element wyniku i główny cel leczenia wziewnego. Teraz
zapisywane są wszystkie pozycje, a podzakładka pokazuje je w tabeli pod
zbiorczym zestawieniem FEV1/FVC. Badania zapisane starszą wersją nie mają
kompletu i mówią o tym wprost — wystarczy wgrać raport ponownie.

**Krew: kolumna zmiany.** Przy każdym parametrze różnica względem
poprzedniego pobrania, w którym ten parametr wystąpił. Liczba miejsc po
przecinku bierze się z samego wyniku, więc kreatynina schodzi o 0,06,
a ferrytyna rośnie o 17. Bez kolorowania — w morfologii kierunek nie znaczy
tego samego dla każdej pozycji.

**Krew: widok po parametrze.** Przełącznik nad tabelą. Drugi układ daje
jeden wiersz na badanie i kolumnę na pobranie, więc trend widać od razu.
Domyślny zostaje podział po pobraniu.

**Krew: wykresy pięciu obserwowanych.** HDL, ferrytyna, witamina D, FT3
i TSH, każdy z własną skalą i od drugiego pomiaru wzwyż.

**Uzupełniona lista „Nieoznaczone".** Pięć świadomych luk w baseline razem
z powodem, dla którego nie zostały zrobione.

**Poprawki znalezione przy okazji.** Wyniki nieliczbowe („ujemny", „<0,3")
gubiły wartość przy imporcie krwi — w tabeli zostawał sam zakres. Wyniki na
granicy zakresu nie podświetlały się, bo import wpisywał flagę, dla której
nie było stylu. Dwa pobrania nazwane tak samo dawały kolizję kluczy Reacta.

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
