$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$pagePath = Join-Path $projectRoot "app\calculator-universal\page.tsx"

if (-not (Test-Path $pagePath)) {
    Write-Host "Nu gasesc fisierul: $pagePath" -ForegroundColor Red
    Write-Host "Deschide PowerShell in folderul proiectului, acolo unde exista package.json, apoi ruleaza din nou scriptul." -ForegroundColor Yellow
    exit 1
}

$lines = [System.Collections.Generic.List[string]](Get-Content -LiteralPath $pagePath)
$index = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i].TrimStart().StartsWith("function DayCell(")) {
        $index = $i
        break
    }
}

if ($index -lt 0) {
    Write-Host "Nu am gasit functia DayCell in $pagePath" -ForegroundColor Red
    exit 1
}

$newLine = 'function DayCell({day,entry,selected,ro,shifts,onClick}:{day:number;entry?:CalendarEntry;selected:boolean;ro:boolean;shifts:ShiftDefinition[];onClick:()=>void}){const status=getDayStatusDefinition(entry?.status||"off");const shift=entry?.status==="worked"&&entry?.shiftId?shifts.find(s=>s.id===entry.shiftId):undefined;const adjustments=shift?[...(entry?.undertimeHours||0)>0?[`-${entry?.undertimeHours}h`]:[],...(entry?.overtimeHours||0)>0?[`+${entry?.overtimeHours}h`]:[]].join(" · "):"";return <button className={`${styles.day} ${selected?styles.selected:""}`} onClick={onClick}><div className={styles.dayNum}>{day}</div><span className={styles.dayCode} style={{background:shift?.color||status.color}}>{shift?.code||(ro?status.codeRo:status.codeEn)}</span>{(adjustments||!shift)&&<div className={styles.dayInfo}>{shift?adjustments:(ro?status.labelRo:status.labelEn)}</div>}</button>}'

$backupPath = "$pagePath.bak-before-calendar-v8"
Copy-Item -LiteralPath $pagePath -Destination $backupPath -Force
$lines[$index] = $newLine
[System.IO.File]::WriteAllLines($pagePath, $lines, (New-Object System.Text.UTF8Encoding($false)))

$remaining = Select-String -LiteralPath $pagePath -Pattern 'shift\.startTime.*shift\.endTime' -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Atentie: mai exista o referinta la orele turei in fisier:" -ForegroundColor Yellow
    $remaining | ForEach-Object { Write-Host $_.Line }
} else {
    Write-Host "Gata: orele turei au fost eliminate din celulele calendarului." -ForegroundColor Green
    Write-Host "Backup: $backupPath" -ForegroundColor DarkGray
}
