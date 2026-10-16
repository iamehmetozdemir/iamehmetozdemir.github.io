# Personal Portfolio

Düz HTML/CSS/JS ile yazılmış, derleme gerektirmeyen, iki dilli (EN/TR) kişisel portfolyo sitesi. GitHub Pages'te doğrudan çalışır.

## Yapı

```
.
├── index.html        # Sayfa iskeleti (bölümler, data-i18n anahtarları)
├── projects.json     # Proje listesi (kartlar buradan üretilir)
├── i18n/
│   ├── en.json       # İngilizce metinler (varsayılan)
│   └── tr.json       # Türkçe metinler
├── css/style.css     # Tasarım, renk paleti (üstteki :root değişkenleri), tema
├── js/main.js        # Dil/tema geçişi, proje kartları, scroll animasyonları
├── favicon.svg
└── .nojekyll         # GitHub Pages'in Jekyll işlemesini kapatır
```

Özellikler: sistem temasını takip eden koyu/açık tema (seçim `localStorage`'da), TR/EN geçişi (seçim `localStorage`'da, `<html lang>` güncellenir), `prefers-reduced-motion`'a saygılı animasyonlar, klavye ile gezinme, "içeriğe geç" bağlantısı.

## Yerelde çalıştırma

`fetch` kullanıldığı için `index.html`'i çift tıklayıp açmak JSON dosyalarını yüklemez; basit bir sunucu kullan:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Kendi bilgilerini girme

1. **Ad, unvan, tanıtım, hakkımda, yetenek başlıkları** → `i18n/en.json` ve `i18n/tr.json` (örn. `"name"`, `"hero.role"`, `"about.p1"`, `"about.f1_v"`).
2. **İletişim** (e-posta ve sosyal linkler) → `index.html` içindeki `#contact` bölümü (`you@example.com`, `your-username`).
3. **Yetenek listeleri** (JavaScript, React vb.) → `index.html` içindeki `#skills` bölümü. Başlıklar ve "Practices" çevirileri JSON'da.
4. **Renkler/yazı tipleri** → `css/style.css` başındaki `:root` değişkenleri (`--accent` vurgu rengidir).
5. `index.html` içindeki İngilizce metinler JS çalışmadan önce/yokken görünen yedektir ve arama motorları için de önemlidir. `en.json`'daki metni değiştirince `index.html`'deki aynı metni de güncelle (özellikle ad, `<title>` ve `<meta name="description">`).

## Proje ekleme / düzenleme

`projects.json` bir dizidir; yeni bir nesne eklemek yeterli:

```json
{
  "id": "my-project",
  "title":       { "en": "My Project", "tr": "Projem" },
  "description": { "en": "What it does.", "tr": "Ne yaptığı." },
  "tech":   ["JavaScript", "Node.js"],
  "github": "https://github.com/kullaniciadin/my-project",
  "demo":   "https://kullaniciadin.github.io/my-project/"
}
```

- `demo` veya `github` alanını silersen o bağlantı görünmez.
- Kartlar dosyadaki sırayla listelenir.
- JSON'da son elemandan sonra virgül **olmamalı**; hata olursa projeler yüklenmez (tarayıcı konsoluna bak).

## Çeviri ekleme / düzenleme

- Her anahtar `en.json` ve `tr.json`'da bulunmalı. HTML'de bir öğeye `data-i18n="anahtar"` eklersen içeriği o anahtardan gelir.
- Özellikler için: `data-i18n-attr="aria-label:anahtar"`.
- `&amp;` gibi HTML varlıkları kullanılabilir (metinler `innerHTML` ile yazılır, bu yüzden yalnızca kendi yazdığın metinleri koy).
- Yeni bir dil (ör. `de`) eklemek için `i18n/de.json` oluştur, `js/main.js` içindeki `LANGS` dizisine ekle ve `index.html`'deki `.lang` grubuna bir buton koy.

## GitHub Pages'e yayınlama

Kullanıcı sitesi için repo adı **tam olarak** `kullaniciadin.github.io` olmalı (site `https://kullaniciadin.github.io` adresinde yayınlanır).

1. GitHub'da **yeni, boş** bir repo oluştur: ad `kullaniciadin.github.io`, Public (README/.gitignore ekleme).
2. Bu klasörde:
   ```bash
   git branch -M main
   git remote add origin https://github.com/kullaniciadin/kullaniciadin.github.io.git
   git push -u origin main
   ```
3. GitHub'da repo → **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch**, Branch: **main** / **/(root)** → Save.
4. 1–2 dakika içinde `https://kullaniciadin.github.io` yayında olur (ilerleme: repo → *Actions* sekmesi).

Güncelleme: değişiklik yap → `git add -A && git commit -m "..." && git push`.

Not: Farklı bir repo adı kullanırsan (ör. `portfolio`) site `https://kullaniciadin.github.io/portfolio/` altında yayınlanır; tüm yollar göreli olduğu için bu da sorunsuz çalışır.
