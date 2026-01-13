# Kişisel Fatura/Harcama Dashboard Araştırması ve En İyi Uygulamalar

Bu belge, modern ve kullanıcı dostu bir kişisel finans yönetimi arayüzü (UI) tasarlamak için yapılan derinlemesine araştırmanın özetidir.

## En Önemli 5 Metrik (KPI)

Bir kullanıcının finansal sağlığını bir bakışta anlaması için dashboard'da mutlaka bulunması gereken temel veriler:

1.  **Net Nakit Akışı (Net Cash Flow):**
    *   **Nedir:** Belirli bir dönemdeki (örneğin bu ay) Toplam Gelir - Toplam Gider.
    *   **Neden Önemli:** Kullanıcının o ay "eksie mi düştüğünü" yoksa "artıda mı olduğunu" en hızlı gösteren veridir.
    *   **Gösterim:** Genellikle büyük puntolarla, pozitif ise yeşil, negatif ise kırmızı renkle gösterilir.

2.  **Kategori Bazlı Harcama Dağılımı (Expense Breakdown):**
    *   **Nedir:** Harcamaların (Gıda, Kira, Ulaşım vb.) toplam harcama içindeki payı.
    *   **Neden Önemli:** Kullanıcıya "Param nereye gidiyor?" sorusunun cevabını verir.
    *   **Gösterim:** Pasta grafiği (Donut chart) veya yatay çubuk grafikler.

3.  **Bütçe Doluluk Oranı (Budget vs. Actual):**
    *   **Nedir:** Belirlenen kategori limitlerine göre harcama durumu (Örn: Market bütçesinin %75'i harcandı).
    *   **Neden Önemli:** Aşırı harcamayı önlemek için erken uyarı sistemi görevi görür.
    *   **Gösterim:** İlerleme çubukları (Progress bars). Limite yaklaşıldığında renk sarıdan kırmızıya dönmelidir.

4.  **Tasarruf Oranı (Savings Rate):**
    *   **Nedir:** Toplam gelirin ne kadarının biriktirildiği veya yatırıma ayrıldığı.
    *   **Neden Önemli:** Finansal özgürlük ve gelecek hedefleri için en kritik performans göstergesidir.
    *   **Gösterim:** Yüzdesel gösterim veya hedef/gerçekleşen karşılaştırması.

5.  **Son İşlemler (Recent Transactions):**
    *   **Nedir:** En son yapılan 5-10 harcama veya gelir kalemi.
    *   **Neden Önemli:** Kullanıcıya anlık hafıza tazeleme ve hatalı işlemleri hızlıca fark etme imkanı sağlar.
    *   **Gösterim:** Temiz, kronolojik bir liste.

---

## En Kritik UI Bölümleri

Etkili bir dashboard tasarımı için sayfa yerleşimi (layout) şu 5 ana bölümden oluşmalıdır:

### 1. Genel Bakış Paneli (The Command Center)
Sayfanın en üstünde, kullanıcıyı karşılayan bölüm.
*   **İçerik:** Toplam Bakiye (Total Balance), Bu Ayki Gelir, Bu Ayki Gider kartları.
*   **Tasarım:** Dikkat dağıtıcı olmayan, minimalist kartlar. Sayılar net ve okunabilir olmalı.

### 2. Görsel Analiz Bölümü (Visual Analytics)
Verilerin görselleştirildiği orta bölüm.
*   **İçerik:**
    *   **Zaman Çizelgesi:** Harcamaların günlere/haftalara göre dalgalanmasını gösteren çizgi grafik (Line chart).
    *   **Kategori Dağılımı:** Harcama pastası (Donut chart).
*   **Özellik:** Grafikler etkileşimli olmalı (üzerine gelince detay göstermeli).

### 3. Hızlı İşlem Alanı (Quick Actions)
Kullanıcının en sık yaptığı işlemi en kolay hale getiren bölüm.
*   **İçerik:** "Harcama Ekle" ve "Gelir Ekle" butonları.
*   **Konum:** Mobilde genellikle sağ alt köşe (Floating Action Button), masaüstünde sağ üst köşe veya navigasyon barı.
*   **Önem:** Veri girişi zor olursa kullanıcı uygulamayı bırakır. Bu buton her zaman ulaşılabilir olmalı.

### 4. Bütçe Takip Kartları (Budget Trackers)
Hedeflere ne kadar yaklaşıldığını gösteren bölüm.
*   **İçerik:** Her kategori için mini ilerleme çubukları.
*   **Örnek:** "Yeme-İçme: ₺4.500 / ₺5.000" (Geriye ₺500 kaldı).

### 5. Detaylı İşlem Dökümü (Global Feed)
Tüm hareketlerin görüldüğü, filtrelenebilir liste.
*   **Yerleşim:** Genellikle dashboard'un alt kısmında veya ayrı bir sekmede "Tümünü Gör" seçeneği ile sunulur.
*   **Özellikler:** Arama çubuğu, tarih filtresi ve kategori ikonları ile zenginleştirilmiş satırlar.

---

## Tasarım Önerileri (UX Best Practices)
*   **Renk Psikolojisi:** Pozitif durumlar için yumuşak yeşiller/maviler, uyarılar için turuncu, kritik durumlar için kırmızı kullanın. Ancak "Hata kırmızısı" ile "Kategori rengi olan kırmızıyı" karıştırmayın.
*   **Mikro-Etkileşimler:** Bir butona tıklandığında veya grafik yüklendiğinde ufak animasyonlar kullanmak hissiyatı (premium feel) artırır.
*   **Karanlık Mod (Dark Mode):** Finans uygulamaları sık sık akşamları kontrol edilir, göz yormayan bir karanlık mod şarttır.
