# Shopairs


Shopping list application for couples.

[Requirements](http://webprogramozas.inf.elte.hu/#!/subjects/full-stack)


## Description

There are a lot of shopping list apps in the market, but none of them were made for couples. Some of them has sharing features, but after you create a new list, you have to share with your choosen one.In our app, when you create a list, it's shared with your partner immediately. Both of you can edit the shopping list,see the results in the same time.

## Funkcionális követelmények

Lehessen regisztrálni az oldalra. Minden felhasználó kap egy rövid azonosítót. Ezzel az azonosítóval tudnak a felhasználók párokat alkotni. Pár alkotása után lehet rendesen használni az alkalmazást. Ezután a felhasználók létre tudnak hozzni bevásárló listákat, melyekre több árucikket is fel tudnak venni. A listát és tartalmát az alkalmazás automatikus megosztja a felhasználó párjával. A pár közösen birtokolja a listákat. A listákat a pár bármelyik tagja törölheti. A listákon az elemek kipipálhatóak, és ilyenkor sötétebben a lista aljára kerülnek.


## Nem funkcionális követelmények

* Real-time szinkronizáció a párok között websocket kapcsolattal.
* Mobile first development frontend-en.  
* Semantic UI css használata
* NodeJs szerver typescript-ben írva. 
* Websocket kapcsolat
* PWA alkalmazás készítése
* SQL adatbázis használata ORM segítségével


## Szakfogalmak

* Kliens-Szerver architektúra
* Websocket
* Typescript
* SQLite adatbázis
* Object-relational mapping


## Szerepkörök

* Szabó Martin: HTML, CSS, SQL
* Leczó Gábor: Szerver, socket, Frontend programozás (js)


## Development

We have milestones!

### First milestone

**Projektötlet**
Első lépésként egy rövid feladatleírást kell megadni a projekt Github főoldalán a README.md állományban. A feladatleírásnak a következő elemeket kell tartalmaznia rövid leírás vagy felsorolás formájában:

* feladat funkcionális követelményeit
* feladat nem funkcionális követelményei
* szakterületi fogalomjegyzék (azon fogalmak definiálása, ami köré az alkalmazás épül)
* szerepkörök

## Adatbázis parancsok
```bash
npx prisma migrate up --experimental
```