# Rakip Analizi ve Kritik Özellik Belirleme (Pareto Prensibi)

Bu doküman, fatura yönetimi ve kişisel finans alanındaki en başarılı küresel ve yerel ürünlerin analizini ve "En Az Eforla En Yüksek Değer" sağlayan özelliklerin listesini içerir.

## 1. İncelenen Önde Gelen Ürünler (Benchmark)

Araştırma kapsamında hem küresel hem de Türkiye pazarında popüler olan şu ürünler incelenmiştir:

### Kişisel Finans & Bütçe Yönetimi
*   **YNAB (You Need A Budget):** "Sıfır tabanlı bütçeleme" (Zero-based budgeting) metodolojisiyle pazar lideri. Her kuruşa bir görev atama prensibine dayanır.
*   **Monarch Money / Empower:** Varlık takibi ve yatırım odaklı, net değer (net worth) hesaplamasında güçlü.
*   **Mint (Emekli oldu, yerini Credit Karma aldı):** Otomatik kategorilendirme ve fatura takibi konusunda standart belirleyiciydi.
*   **PocketGuard:** "Ne kadar harcayabilirim?" sorusuna anlık cevap veren basit arayüzüyle tanınır.

### Fatura ve Küçük İşletme Yönetimi
*   **QuickBooks / Xero:** Kapsamlı muhasebe, fatura ve nakit akışı yönetimi devleri.
*   **FreshBooks:** Özellikle freelancerlar ve küçük işletmeler için "fatura kesme" kolaylığına odaklanan kullanıcı dostu çözüm.
*   **Paraşüt / Bizim Hesap (Yerel):** Türkiye pazarındaki e-fatura entegrasyonu ve banka mutabakatı konularında liderler.

---

## 2. Ortak Özellikler Havuzu

Bu ürünlerin neredeyse tamamında bulunan standart özellikler şunlardır:

*   **Veri Girişi:** Manuel işlem ekleme, Banka entegrasyonu (PSD2/Open Banking), Excel/CSV içe aktarma.
*   **Görselleştirme:** Gelir/Gider pasta grafikleri, zaman bazlı çubuk grafikler, harcama trendleri.
*   **Fatura Yönetimi:** Fatura oluşturma şablonları, PDF çıktısı, E-posta ile gönderme, Vade hatırlatıcıları.
*   **Kategorilendirme:** Harcama kategorileri (Gıda, Ulaşım vb.), Etiketleme, Proje bazlı takip.
*   **Bütçeleme:** Kategori bazlı limit koyma, Limit aşım uyarıları.
*   **Çoklu Para Birimi:** Döviz hesapları ve kur çevirimi.

---

## 3. %20 Özellik = %80 Değer Analizi (MVP Odaklı)

Pareto prensibi uygulandığında, kullanıcıya sağlanan değerin %80'ini oluşturan kritik özellik seti (%20) aşağıdadır. Bir MVP (Minimum Viable Product) öncelikle bu özelliklere odaklanmalıdır.

### 🌟 1. Otomatik Banka Entegrasyonu ve Akıllı Kategorilendirme (Değer: %30)
Kullanıcıların en büyük sorunu **veri girişi tembelliğidir**. Manuel giriş gerektiren uygulamalar kısa sürede terk edilir.
*   **Kritik Özellik:** Banka hesap hareketlerinin otomatik çekilmesi ve Yapay Zeka/Kurallar ile otomatik kategorize edilmesi (örn: "Starbucks" harcamasını otomatik "Yeme-İçme" yapması).
*   **Değer:** Kullanıcıya "zahmetsiz" bir şekilde finansal durumunu gösterir.

### 🌟 2. "Şu An Ne Durumdayım?" Dashboard'u (Değer: %25)
Kullanıcı uygulamayı açtığında saniyeler içinde finansal sağlığını anlamalıdır.
*   **Kritik Özellik:**
    *   **Net Nakit:** (Toplam Mevcut Para - Kredi Kartı Borçları)
    *   **Ay Sonu Tahmini:** "Bu hızla harcarsan ay sonunu -1000 TL ile bitireceksin" gibi proaktif uyarılar.
*   **Değer:** Karar verme sürecini anlık veriye dayandırır, anksiyeteyi azaltır.

### 🌟 3. Hızlı Fatura Oluşturma ve Takibi (Değer: %15)
(Özellikle freelancer/işletme modülü için)
*   **Kritik Özellik:** 3 tıkla profesyonel fatura oluşturup paylaşma ve "Ödenmedi/Gecikti" durumlarını renkli kodlarla görme.
*   **Değer:** Nakit akışını hızlandırır, unutulan alacakları tahsil etmeyi sağlar.

### 🌟 4. Abonelik ve Sabit Gider Takibi (Değer: %10)
*   **Kritik Özellik:** Düzenli tekrarlayan ödemelerin (Netflix, Kira, Yazılım lisansları) otomatik tanınması ve yaklaşan ödemeler takvimi.
*   **Değer:** "Gereksiz abonelikleri iptal etme" farkındalığı yaratarak doğrudan tasarruf sağlar.

### 🌟 Sonuç: Ürün Vizyonu

En başarılı ürün, **"kullanıcıdan en az veri girişi isteyip, ona en çok içgörüyü (insight) sunan"** üründür.
Rakiplerden ayrışmak için sadece "kayıt tutan" bir uygulama değil, kullanıcının yerine **"düşünen ve uyaran"** (Örn: "Geçen aya göre %20 fazla harcıyorsun", "Faturanın vadesi 3 gün geçti") bir finansal asistan hedeflenmelidir.
