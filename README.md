# Calculator Salariu Android

Pachet Android Studio pregătit pentru upload în Google Play Console.

## Ce conține
- aplicație Android nativă (Kotlin)
- încărcare locală a calculatorului salarial din asseturi web
- blocare screenshot pe Android prin FLAG_SECURE
- iconuri incluse
- orientare portret

## Ce NU conține încă
- backend real
- bază de date cloud
- autentificare reală pe server
- abonament Google Play Billing
- resetare parolă pe email
- sincronizare între dispozitive

Asta înseamnă că proiectul este bun pentru:
- testare pe telefon
- build APK / AAB
- closed testing în Google Play

Dar pentru producție completă cu abonament lunar și conturi reale, mai trebuie etapa Flutter + Supabase/Billing.

## Cum îl deschizi
1. Deschide folderul `CalculatorSalariuAndroid` în Android Studio.
2. Lasă proiectul să facă Gradle Sync.
3. Rulează pe emulator sau telefon.
4. Pentru upload:
   - Build > Generate Signed Bundle / APK
   - alege Android App Bundle (AAB)

## Informații listing
Nume aplicație: Calculator Salariu
Email suport: helpcalculatorsalariu@gmail.com
Preț abonament dorit: 9.9 lei / lună (încă neimplementat în buildul actual)

## Observație
Dacă vrei aplicația finală pentru Play Store cu:
- login real
- cloud save
- forgot password pe email
- abonament lunar în aplicație
atunci următorul pas este să construim varianta mobilă completă, nu doar shell-ul Android.