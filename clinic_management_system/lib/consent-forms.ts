
// KVKK ve Onam Formları Metinleri

export const KVKK_TEXT = `
# KİŞİSEL VERİLERİN KORUNMASI AYDINLATMA METNİ

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verilerinizin işlenmesine ilişkin olarak sizi bilgilendirmek isteriz.

## Veri Sorumlusu
Kişisel verileriniz, veri sorumlusu sıfatıyla kliniğimiz tarafından işlenmektedir.

## Kişisel Verilerin İşlenme Amaçları
Kişisel verileriniz, psikolojik danışmanlık hizmetlerinin sunulması, randevu yönetimi, tedavi süreçlerinin takibi, yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenmektedir.

## Kişisel Verilerin Aktarılması
Kişisel verileriniz, yasal yükümlülükler gereği ilgili kamu kurum ve kuruluşları ile paylaşılabilir.

## Haklarınız
KVKK kapsamında, kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı 3. kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini/yok edilmesini isteme haklarına sahipsiniz.

Yukarıda belirtilen haklarınızı kullanmak için kliniğimize başvurabilirsiniz.
`;

export const ADULT_CONSENT_FORM = `
# YETİŞKİN DANIŞAN ONAM FORMU

## Psikolojik Danışmanlık Hizmetleri Onam Formu

Ben, ${new Date().getFullYear()} tarihinde psikolojik danışmanlık hizmeti almak üzere kendi isteğimle başvuruyorum.

### Bilgilendirildiğim Konular:

1. **Gizlilik**: Seanslar sırasında paylaşacağım bilgilerin gizli tutulacağını, ancak yasal zorunluluklar (kendime ya da başkalarına zarar verme riski) durumunda bu gizliliğin kaldırılabileceğini,

2. **Süreç**: Psikolojik danışmanlık sürecinin, bireysel ihtiyaçlara göre değişkenlik gösterebileceğini ve belirli bir süre gerektireceğini,

3. **İşbirliği**: Tedavi sürecinin başarısının, aktif katılımıma ve terapistle işbirliği yapmama bağlı olduğunu,

4. **Kayıt**: Seans notlarının ve değerlendirme sonuçlarının güvenli bir şekilde saklanacağını,

5. **İptal**: Randevularımı en az 24 saat önceden iptal etmem gerektiğini, aksi halde ücret alınabileceğini,

6. **İletişim**: Acil durumlarda nasıl iletişime geçeceğim konusunda bilgilendirildiğimi,

anladığımı ve kabul ettiğimi beyan ederim.
`;

export const CHILD_CONSENT_FORM = `
# ÇOCUK/ERGEN DANIŞAN VELİ ONAM FORMU

## Çocuk ve Ergen Psikolojik Danışmanlık Hizmetleri Veli Onam Formu

Ben, velayet hakkına sahip olduğum çocuğumun/ergenimin psikolojik danışmanlık hizmeti alması için başvuruyorum.

### Bilgilendirildiğim Konular:

1. **Gizlilik ve Veli Bilgilendirmesi**: 
   - Çocuğumun/ergenimin paylaşacağı bilgilerin gizli tutulacağını,
   - Ancak gelişim düzeyine uygun olarak, genel ilerleme durumu hakkında bilgilendirilece ğimi,
   - Çocuğuma/ergenime zarar verme ya da başkalarına zarar verme riski durumunda gizliliğin kaldırılabileceğini,

2. **Yaş ve Gelişim Düzeyine Uygun Yaklaşım**: 
   - Terapistin, çocuğumun/ergenimin yaşına ve gelişim düzeyine uygun yöntemler kullanacağını,

3. **Aile İşbirliği**: 
   - Sürecin etkinliği için gerektiğinde aile görüşmeleri yapılabileceğini,
   - Çocuğumun/ergenimin tedavi sürecini desteklemem için öneriler alacağımı,

4. **Değerlendirme ve Testler**: 
   - Çocuğuma/ergenime psikolojik testler uygulanabileceğini ve bu testlerin sonuçları hakkında bilgilendirileceğimi,

5. **Süreç**: 
   - Çocuk/ergen terapisinin, çocuğumun ihtiyaçlarına göre değişkenlik göstereceğini,

6. **İptal ve Katılım**: 
   - Randevuları en az 24 saat önceden iptal etmem gerektiğini,
   - Çocuğumun/ergenimin seanslara düzenli katılımının önemli olduğunu,

7. **Acil Durumlar**: 
   - Acil durumlarda nasıl iletişime geçeceğim konusunda bilgilendirildiğimi,

anladığımı ve kabul ettiğimi beyan ederim.

**Not**: Bu formda "veli" ifadesi, velayet hakkına sahip anne/baba veya yasal vasiyi ifade etmektedir.
`;

export const REFERRAL_SOURCES = [
  { value: "arkadas", label: "Arkadaş Tavsiyesi" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "google", label: "Google Arama" },
  { value: "web", label: "Web Sitesi" },
  { value: "billboard", label: "Reklam/Billboard" },
  { value: "other", label: "Diğer" },
];
