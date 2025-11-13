
// Psikolojik Test Soruları ve Yapıları

export interface TestQuestion {
  id: number;
  text?: string;
  question?: string;  // Beck testleri için geriye dönük uyumluluk - en az biri olmalı
  options: { value: number; label: string }[];
}

export interface TestScale {
  name: string;
  description: string;
  questionIds: number[];
  totalItems: number;
}

export interface TestData {
  testName: string;
  testCode: string;
  version: string;
  description: string;
  totalQuestions: number;
  questions: TestQuestion[];
  scales?: { [key: string]: TestScale };
  scoring: any;
  instructions: string;
  timeFrame?: string;
  reference?: string;
}

// Beck Depresyon ve Beck Anksiyete Testleri

export const BECK_DEPRESSION_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: "Üzüntü",
    options: [
      { value: 0, label: "Kendimi üzgün hissetmiyorum" },
      { value: 1, label: "Kendimi üzgün hissediyorum" },
      { value: 2, label: "Her zaman üzgünüm ve bundan kurtulamıyorum" },
      { value: 3, label: "O kadar üzgün ve mutsuzum ki dayanamıyorum" },
    ],
  },
  {
    id: 2,
    question: "Karamsarlık",
    options: [
      { value: 0, label: "Gelecek hakkında umutsuz ve karamsar değilim" },
      { value: 1, label: "Gelecek hakkında karamsarım" },
      { value: 2, label: "Gelecekten beklediğim hiçbir şey yok" },
      { value: 3, label: "Geleceğim hakkında umutsuzum ve her şey daha da kötüye gidecek" },
    ],
  },
  {
    id: 3,
    question: "Başarısızlık Duygusu",
    options: [
      { value: 0, label: "Kendimi başarısız biri olarak görmüyorum" },
      { value: 1, label: "Çevremdeki birçok kişiden daha fazla başarısızlıklarım oldu" },
      { value: 2, label: "Geçmişe baktığımda başarısızlıklarla dolu olduğunu görüyorum" },
      { value: 3, label: "Kendimi tümüyle başarısız bir insan olarak görüyorum" },
    ],
  },
  {
    id: 4,
    question: "Memnuniyetsizlik",
    options: [
      { value: 0, label: "Hayattan eskisi kadar zevk alıyorum" },
      { value: 1, label: "Eskiden olduğu gibi hayattan zevk alamıyorum" },
      { value: 2, label: "Artık hiçbir şey bana zevk vermiyor" },
      { value: 3, label: "Her şeyden sıkılıyorum ve hiçbir şey hoşuma gitmiyor" },
    ],
  },
  {
    id: 5,
    question: "Suçluluk Duygusu",
    options: [
      { value: 0, label: "Kendimi suçlu hissetmiyorum" },
      { value: 1, label: "Zaman zaman kendimi suçlu hissediyorum" },
      { value: 2, label: "Çoğu zaman kendimi suçlu hissediyorum" },
      { value: 3, label: "Kendimi her zaman suçlu hissediyorum" },
    ],
  },
  {
    id: 6,
    question: "Cezalandırılma Duygusu",
    options: [
      { value: 0, label: "Cezalandırıldığımı düşünmüyorum" },
      { value: 1, label: "Cezalandırılabileceğimi hissediyorum" },
      { value: 2, label: "Cezalandırılmayı bekliyorum" },
      { value: 3, label: "Cezalandırıldığımı hissediyorum" },
    ],
  },
  {
    id: 7,
    question: "Kendinden Hoşnutsuzluk",
    options: [
      { value: 0, label: "Kendimi eskisi gibi seviyorum" },
      { value: 1, label: "Kendimi eskisi kadar sevmiyorum" },
      { value: 2, label: "Kendimden hiç hoşlanmıyorum" },
      { value: 3, label: "Kendimden nefret ediyorum" },
    ],
  },
  {
    id: 8,
    question: "Kendini Suçlama",
    options: [
      { value: 0, label: "Kendimi başkalarından daha kötü görmüyorum" },
      { value: 1, label: "Zayıf yönlerim veya hatalarım için kendimi eleştiriyorum" },
      { value: 2, label: "Hatalarım için çoğu zaman kendimi suçluyorum" },
      { value: 3, label: "Her kötü şey olduğunda kendimi suçluyorum" },
    ],
  },
  {
    id: 9,
    question: "İntihar Düşünceleri",
    options: [
      { value: 0, label: "Kendimi öldürmeyi düşünmüyorum" },
      { value: 1, label: "Bazen kendimi öldürmeyi düşünüyorum ama yapmam" },
      { value: 2, label: "Kendimi öldürmek isterdim" },
      { value: 3, label: "Fırsatını bulsam kendimi öldürürüm" },
    ],
  },
  {
    id: 10,
    question: "Ağlama",
    options: [
      { value: 0, label: "Her zamankinden fazla ağlamıyorum" },
      { value: 1, label: "Eskisinden daha fazla ağlıyorum" },
      { value: 2, label: "Her şey için ağlıyorum" },
      { value: 3, label: "Ağlamak istiyorum ama yapamıyorum" },
    ],
  },
  {
    id: 11,
    question: "Sinirlilik",
    options: [
      { value: 0, label: "Her zamankinden daha sinirli değilim" },
      { value: 1, label: "Eskisinden daha kolay sinirleniyor ve kızıyorum" },
      { value: 2, label: "Çoğu zaman sinirliyim" },
      { value: 3, label: "Eskiden sinirlendiğim şeylere bile artık sinirlenemiyorum" },
    ],
  },
  {
    id: 12,
    question: "İlgi Kaybı",
    options: [
      { value: 0, label: "Başkaları ile görüşme isteğimi kaybetmedim" },
      { value: 1, label: "Eskisine göre insanlarla daha az görüşmek istiyorum" },
      { value: 2, label: "Başkaları ile görüşme isteğimin çoğunu kaybettim" },
      { value: 3, label: "Hiç kimse ile görüşmek istemiyorum" },
    ],
  },
  {
    id: 13,
    question: "Kararsızlık",
    options: [
      { value: 0, label: "Eskisi gibi karar verebiliyorum" },
      { value: 1, label: "Eskisinden daha fazla karar vermekte güçlük çekiyorum" },
      { value: 2, label: "Karar verirken çok zorlanıyorum" },
      { value: 3, label: "Artık hiç karar veremiyorum" },
    ],
  },
  {
    id: 14,
    question: "Değersizlik",
    options: [
      { value: 0, label: "Görünüşümün eskisinden daha kötü olduğunu düşünmüyorum" },
      { value: 1, label: "Yaşlandığımı ve çekiciliğimi kaybettiğimi düşünüyorum" },
      { value: 2, label: "Görünüşümde artık değiştirilmesi mümkün olmayan kötü değişiklikler olduğunu hissediyorum" },
      { value: 3, label: "Çirkin olduğuma inanıyorum" },
    ],
  },
  {
    id: 15,
    question: "Çalışma Gücü Kaybı",
    options: [
      { value: 0, label: "Eskisi kadar iyi çalışabiliyorum" },
      { value: 1, label: "Bir şeyler yapabilmek için gayret göstermem gerekiyor" },
      { value: 2, label: "Herhangi bir şeyi yapabilmek için kendimi çok zorlamam gerekiyor" },
      { value: 3, label: "Hiçbir şey yapamıyorum" },
    ],
  },
  {
    id: 16,
    question: "Uyku Bozukluğu",
    options: [
      { value: 0, label: "Eskisi gibi uyuyabiliyorum" },
      { value: 1, label: "Eskisi kadar iyi uyuyamıyorum" },
      { value: 2, label: "1-2 saat erken uyanıyorum ve tekrar uyumakta zorlanıyorum" },
      { value: 3, label: "Çok erken uyanıyor ve tekrar uyuyamıyorum" },
    ],
  },
  {
    id: 17,
    question: "Yorgunluk",
    options: [
      { value: 0, label: "Her zamankinden daha çabuk yorulmuyorum" },
      { value: 1, label: "Eskisinden daha çabuk yoruluyorum" },
      { value: 2, label: "Yaptığım her şey beni yoruyor" },
      { value: 3, label: "Kendimi hiçbir şey yapamayacak kadar yorgun hissediyorum" },
    ],
  },
  {
    id: 18,
    question: "İştah Kaybı",
    options: [
      { value: 0, label: "İştahım eskisinden farklı değil" },
      { value: 1, label: "İştahım eskisi kadar iyi değil" },
      { value: 2, label: "İştahım çok azaldı" },
      { value: 3, label: "Hiç iştahım yok" },
    ],
  },
  {
    id: 19,
    question: "Kilo Kaybı",
    options: [
      { value: 0, label: "Son zamanlarda kilo kaybetmedim" },
      { value: 1, label: "İstemediğim halde 2 kilodan fazla kaybettim" },
      { value: 2, label: "İstemediğim halde 5 kilodan fazla kaybettim" },
      { value: 3, label: "İstemediğim halde 7 kilodan fazla kaybettim" },
    ],
  },
  {
    id: 20,
    question: "Sağlık Kaygısı",
    options: [
      { value: 0, label: "Sağlığım beni her zamankinden fazla endişelendirmiyor" },
      { value: 1, label: "Ağrı, sızı, mide bozukluğu, kabızlık gibi şikayetlerim var" },
      { value: 2, label: "Sağlığımla ilgili kaygılarım var ve başka şeyleri düşünmek zor" },
      { value: 3, label: "Sağlığım hakkında o kadar endişeliyim ki başka hiçbir şey düşünemiyorum" },
    ],
  },
  {
    id: 21,
    question: "Cinsel İlgi Kaybı",
    options: [
      { value: 0, label: "Son zamanlarda cinsel ilgimde bir değişiklik fark etmedim" },
      { value: 1, label: "Eskisine göre cinsel ilgim azaldı" },
      { value: 2, label: "Cinsel ilgim çok azaldı" },
      { value: 3, label: "Cinsel ilgimi tamamen kaybettim" },
    ],
  },
];

export const BECK_ANXIETY_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    question: "Bedeninizin herhangi bir yerinde uyuşma veya karıncalanma",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 2,
    question: "Sıcak/ateş basmaları",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 3,
    question: "Bacaklarda halsizlik, titreme",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 4,
    question: "Gevşeyememe",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 5,
    question: "Çok kötü şeyler olacak korkusu",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 6,
    question: "Baş dönmesi veya sersemlik",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 7,
    question: "Kalp çarpıntısı",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 8,
    question: "Dengeyi kaybetme duygusu",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 9,
    question: "Korkmuş olma",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 10,
    question: "Sinirlilik",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 11,
    question: "Boğuluyormuş gibi olma duygusu",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 12,
    question: "Ellerde titreme",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 13,
    question: "Titreklik",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 14,
    question: "Kontrolü kaybetme korkusu",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 15,
    question: "Nefes almada güçlük",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 16,
    question: "Ölüm korkusu",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 17,
    question: "Korkuya kapılma",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 18,
    question: "Midede hazımsızlık ya da rahatsızlık hissi",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 19,
    question: "Baygınlık",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 20,
    question: "Yüzde kızarma",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
  {
    id: 21,
    question: "Terleme (sıcağa bağlı olmayan)",
    options: [
      { value: 0, label: "Hiç" },
      { value: 1, label: "Hafif düzeyde" },
      { value: 2, label: "Orta düzeyde" },
      { value: 3, label: "Ciddi düzeyde" },
    ],
  },
];

export function calculateTestScore(responses: number[]): { totalScore: number; severity: string } {
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  
  let severity = "";
  if (totalScore <= 9) severity = "Minimal";
  else if (totalScore <= 16) severity = "Hafif";
  else if (totalScore <= 29) severity = "Orta";
  else severity = "Şiddetli";
  
  return { totalScore, severity };
}

// Yeni testler için dinamik veri yükleme
import scl90Data from '../data/scl90_test.json';
import mmpiData from '../data/mmpi_test.json';
import otomatikDusuncelerData from '../data/otomatik_dusunceler_test.json';

export const SCL_90_DATA: TestData = scl90Data as any;
export const MMPI_DATA: any = mmpiData as any;  // MMPI has complex structure, keep as any
export const OTOMATIK_DUSUNCELER_DATA: TestData = otomatikDusuncelerData as any;

// Test türüne göre test verilerini getir
export function getTestData(testType: string): TestData | null {
  switch (testType) {
    case 'SCL_90':
      return SCL_90_DATA;
    case 'MMPI':
      return MMPI_DATA;
    case 'OTOMATIK_DUSUNCELER':
      return OTOMATIK_DUSUNCELER_DATA;
    case 'BECK_DEPRESSION':
      return {
        testName: 'Beck Depresyon Ölçeği',
        testCode: 'BDI',
        version: 'BDI-II',
        description: 'Depresyon semptomlarını değerlendiren 21 soruluk bir öz-bildirim ölçeğidir.',
        totalQuestions: 21,
        questions: BECK_DEPRESSION_QUESTIONS.map(q => ({ ...q, text: q.question || '' })),
        scoring: {
          method: 'Toplam puan',
          interpretation: {
            minimal: '0-9',
            hafif: '10-16',
            orta: '17-29',
            şiddetli: '30-63'
          }
        },
        instructions: 'Lütfen her ifadeyi okuyun ve son iki hafta içinde kendinizi nasıl hissettiğinizi en iyi yansıtan seçeneği işaretleyin.',
        timeFrame: 'Son iki hafta'
      };
    case 'BECK_ANXIETY':
      return {
        testName: 'Beck Anksiyete Ölçeği',
        testCode: 'BAI',
        version: 'BAI',
        description: 'Anksiyete semptomlarını değerlendiren 21 soruluk bir öz-bildirim ölçeğidir.',
        totalQuestions: 21,
        questions: BECK_ANXIETY_QUESTIONS.map(q => ({ ...q, text: q.question || '' })),
        scoring: {
          method: 'Toplam puan',
          interpretation: {
            minimal: '0-7',
            hafif: '8-15',
            orta: '16-25',
            şiddetli: '26-63'
          }
        },
        instructions: 'Lütfen aşağıdaki belirtilerin her birini son bir hafta içinde ne kadar rahatsız ettiğini belirtin.',
        timeFrame: 'Son bir hafta'
      };
    default:
      return null;
  }
}

// SCL-90 için puanlama fonksiyonu
export function calculateSCL90Score(responses: { [key: number]: number }): any {
  const scales = SCL_90_DATA.scales || {};
  const results: any = {};
  
  for (const [scaleKey, scale] of Object.entries(scales)) {
    let total = 0;
    let count = 0;
    
    scale.questionIds.forEach(qId => {
      if (responses[qId] !== undefined) {
        total += responses[qId];
        count++;
      }
    });
    
    const average = count > 0 ? total / count : 0;
    let severity = 'Normal';
    
    if (average < 1) severity = 'Normal';
    else if (average < 2) severity = 'Hafif Düzeyde';
    else if (average < 3) severity = 'Orta Düzeyde';
    else severity = 'Şiddetli Düzeyde';
    
    results[scaleKey] = {
      name: scale.name,
      average: average.toFixed(2),
      severity
    };
  }
  
  // Global indeksler
  const allValues = Object.values(responses);
  const gsi = allValues.reduce((sum: number, val: any) => sum + val, 0) / allValues.length;
  const pst = allValues.filter((val: any) => val > 0).length;
  const psdi = pst > 0 ? allValues.reduce((sum: number, val: any) => sum + val, 0) / pst : 0;
  
  results.globalIndices = {
    GSI: gsi.toFixed(2),
    PST: pst,
    PSDI: psdi.toFixed(2)
  };
  
  return results;
}

// MMPI için puanlama fonksiyonu (basitleştirilmiş)
export function calculateMMPIScore(responses: { [key: number]: number }, gender: string): any {
  // Bu fonksiyon çok karmaşık olduğu için basitleştirilmiş bir versiyon
  // Gerçek MMPI puanlaması profesyonel yazılım gerektirir
  return {
    message: 'MMPI puanlaması profesyonel değerlendirme gerektirir',
    responses: responses,
    gender: gender,
    note: 'Detaylı analiz için uzman psikoloğa danışınız'
  };
}

// Otomatik Düşünceler için puanlama fonksiyonu
export function calculateOtomatikDusuncelerScore(responses: { [key: number]: number }): any {
  const scales = OTOMATIK_DUSUNCELER_DATA.scales || {};
  const results: any = {};
  
  let totalScore = 0;
  let responseCount = 0;
  
  // Toplam puan hesapla
  Object.values(responses).forEach(val => {
    totalScore += val;
    responseCount++;
  });
  
  // Alt ölçek puanları
  for (const [scaleKey, scale] of Object.entries(scales)) {
    let scaleTotal = 0;
    let scaleCount = 0;
    
    scale.questionIds.forEach(qId => {
      if (responses[qId] !== undefined) {
        scaleTotal += responses[qId];
        scaleCount++;
      }
    });
    
    results[scaleKey] = {
      name: scale.name,
      description: scale.description,
      score: scaleTotal,
      average: scaleCount > 0 ? (scaleTotal / scaleCount).toFixed(2) : 0
    };
  }
  
  // Toplam değerlendirme
  let severity = 'Düşük';
  if (totalScore > 70) severity = 'Klinik Düzeyde';
  else if (totalScore > 50) severity = 'Orta';
  else severity = 'Düşük';
  
  results.total = {
    score: totalScore,
    severity: severity,
    interpretation: totalScore > 70 
      ? 'Yüksek puanlar klinik düzeyde depresif düşünceler gösterir' 
      : 'Olumsuz otomatik düşünceler normal sınırlar içinde'
  };
  
  return results;
}
