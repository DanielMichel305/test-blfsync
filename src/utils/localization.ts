import { Language } from '../LanguageContext';

export const getLocalizedDonorName = (name: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return name;
  switch (name) {
    case 'Mariam Abdelmessih':
      return 'مريم عبد المسيح';
    case 'Michael Sawiris':
      return 'مايكل ساويرس';
    case 'Samuel Fahmy':
      return 'صموئيل فهمي';
    case 'Pastor Kamal Naguib':
    case 'Pastor Kamal':
      return 'القس كمال نجيب';
    case 'Maryam':
      return 'مريم';
    case 'Fady Shenouda':
      return 'فادي شنودة';
    case 'Youssef Mansour':
      return 'يوسف منصور';
    case 'Christina Ghali':
      return 'كريستينا غالي';
    case 'Partner':
    case 'Ministry Partner':
      return 'شريك الخدمة';
    case 'Staff Admin':
      return 'مسؤول الخدمة والمتابعة';
    case 'Ministry Outreach Team':
      return 'فريق الامتداد الميداني';
    case 'Apologetics Media Team':
      return 'فريق الإعلام والردود الدفاعية';
    case 'Cairo Counseling Center':
      return 'مركز المشورة والتعميق بالقاهرة';
    case 'Minya Field Coordinator':
      return 'منسق خدمة المنيا الميدانية';
    case 'Mobile App Team':
      return 'فريق التطبيقات والخدمة الرقمية';
    default:
      // Replace known name segments if present
      let res = name;
      res = res.replace('Mariam Abdelmessih', 'مريم عبد المسيح');
      res = res.replace('Michael Sawiris', 'مايكل ساويرس');
      res = res.replace('Samuel Fahmy', 'صموئيل فهمي');
      res = res.replace('Pastor Kamal Naguib', 'القس كمال نجيب');
      res = res.replace('Pastor Kamal', 'القس كمال نجيب');
      res = res.replace('Fady Shenouda', 'فادي شنودة');
      res = res.replace('Youssef Mansour', 'يوسف منصور');
      res = res.replace('Christina Ghali', 'كريستينا غالي');
      return res;
  }
};

export const getLocalizedTierName = (name: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return name;
  switch (name) {
    case 'Vision Champion': 
      return 'شريك الرؤية الاستراتيجية';
    case 'Kingdom Builders': 
      return 'بناة الملكوت';
    case 'Cornerstone Friend': 
      return 'عضو حجر الزاوية';
    case 'Faithful Giver': 
      return 'الوكيل الأمين';
    case 'Harvest Keeper': 
      return 'شريك الحصاد المبارك';
    case 'Light Bearer': 
      return 'حامل السراج والكلمة';
    case 'Faith Companion': 
      return 'رفيق الخدمة والنعمة';
    case 'Seed Planter': 
      return 'زارع الكلمة والبذور';
    default: 
      return name;
  }
};

export const getLocalizedTierDesc = (name: string, language: 'en' | 'ar', fallback: string) => {
  if (language !== 'ar') return fallback;
  switch (name) {
    case 'Vision Champion': 
      return 'يرعى البث الفضائي الواسع والإنتاج المرئي للخدمة.';
    case 'Kingdom Builders': 
      return 'يدعم المؤتمرات والنهضات الروحية والمشورة الميدانية للشباب والعائلات.';
    case 'Cornerstone Friend': 
      return 'يساند إنتاج الأستوديو ومتابعة المشورة اليومية للباحثين عن الحق.';
    case 'Faithful Giver': 
      return 'يساهم في برامج الخدمة اليومية ودراسة الكلمة المقدسة وتوزيعها.';
    case 'Harvest Keeper': 
      return 'يسند خدمة المتابعة المخصصة ومساعدة النفوس الباحثة على منصات التواصل.';
    case 'Light Bearer': 
      return 'يسهم في نشر الترانيم الروحية وحق الكلمة المقدسة عبر المنصات الرقمية.';
    case 'Faith Companion': 
      return 'يدعم الإعلانات الرقمية الموجهة وتوزيع الرسائل والآيات الروحية للباحثين.';
    case 'Seed Planter': 
      return 'يساهم في غرس بذور الإنجيل الأولى في قلوب وعقول طالبي المعرفة.';
    default: 
      return fallback;
  }
};

export const getLocalizedTrackName = (trackId: string, fallbackName: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallbackName;
  switch (trackId) {
    case 'general-fund':
      return 'الصندوق العام المشترك';
    case 'gospel-reach':
      return 'كرازة الإنجيل وتوصيل البشارة المفرحة'; // Evangelism
    case 'answer-search':
      return 'مجاوبة المتسائلين والبحث عن الحق الروحي';
    
    case 'believer-followup':
      return 'خدمة التلمذة والتأصيل والنمو الروحي للنفوس';
    case 'radio-ministry':
      return 'بث ترانيم الحياة والتعزية والأمل الإلهي';
    case 'rallies':
      return 'النهضات الروحية والمؤتمرات الكرازية الميدانية';
    default:
      return fallbackName;
  }
};

export const getLocalizedTrackDesc = (trackId: string, fallbackDesc: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallbackDesc;
  switch (trackId) {
    case 'general-fund':
      return 'يدعم الصندوق العام كافة العمليات الخدمية والكرازية بمرونة لتوجيه الموارد المتاحة نحو الاحتياجات الروحية والعملية الأكثر إلحاحاً.';
    case 'gospel-reach':
      return 'الوصول للقلوب العطشى بكلمة الله الحية والقدوسة عبر وسائل التواصل والفضائيات.';
    case 'answer-search':
      return 'تقديم الإرشاد الروحي والدفاعيات الكتابية والرد على أسئلة المشككين والباحثين بأمانة ومحبة.';
    
    case 'believer-followup':
      return 'رعاية المؤمنين وتأصيلهم بدراسات الكتاب المقدس والربط بشركة الكنائس المحلية للنمو.';
    case 'radio-ministry':
      return 'بث الترانيم والبرامج المشجعة والمعزية للنفوس في البيوت ووسائل المواصلات والقرى البعيدة.';
    case 'rallies':
      return 'إقامة نهضات واجتماعات كرازية حاشدة لخدمة الشباب وبناء البيوت وتقديم العون العملي.';
    default:
      return fallbackDesc;
  }
};

export const getLocalizedTrackUnitLabel = (trackId: string, fallbackUnit: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallbackUnit;
  switch (trackId) {
    case 'general-fund':
      return 'نفوس ملموسة بالنعمة';
    case 'gospel-reach':
      return 'رسائل إنجيلية';
    case 'answer-search':
      return 'تساؤلات مُجَاب عنها روحيًا ودفاعيًا';
    
    case 'believer-followup':
      return 'شخص متتلمذ';
    case 'radio-ministry':
      return 'مستمع';
    case 'rallies':
      return 'حاضر';
    default:
      return fallbackUnit;
  }
};

export const getLocalizedBadgeName = (badgeType: string, fallback: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallback;
  switch (badgeType) {
    case 'first_step':
      return 'البداية المباركة';
    case 'three_month_faithful':
      return 'ثمار الأمانة المستمرة';
    case 'gospel_multiplier':
      return 'سفير الكلمة المتضاعف';
    case 'anniversary_friend':
      return 'شريك الخدمة الدائم والوفي';
    default:
      return fallback;
  }
};

export const getLocalizedBadgeDesc = (badgeType: string, fallback: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallback;
  switch (badgeType) {
    case 'first_step':
      return 'بدأ خطوته الأولى في المشاركة والعطاء المكرس لدعم انتشار الكلمة.';
    case 'three_month_faithful':
      return 'أكمل ثلاثة أشهر متتالية من الأمانة والعطاء المستمر لدعم الخدمة.';
    case 'gospel_multiplier':
      return 'ساهم في توصيل البشارة المفرحة لألف نفس عطشى عبر الميديا الرقمية.';
    case 'anniversary_friend':
      return 'أكمل عامًا كاملاً من الشركة والأمانة في العطاء لدعم ملكوت الله.';
    default:
      return fallback;
  }
};

export const getLocalizedAltarPostText = (id: string, fallback: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return fallback;
  switch (id) {
    case 'seed-prayer-0':
      return 'من أجل نفوس الـ 1500 شاب الذين حضروا مؤتمرنا الأخير بالمنيا، لكي تنمو لهم جذور عميقة في مجموعات التلمذة الروحية.';
    case 'seed-prayer-1':
      return 'من أجل فريق الميديا والردود الدفاعية لكي يمنحهم الرب حكمة لكتابة سيناريوهات لـ 12 فيديو قصيرًا للرد على تساؤلات البحث عن الرجاء.';
    case 'seed-prayer-2':
      return 'من أجل سلامة وأمان وفتح الأبواب لمرشدي ومتابعي الخدمة بالقاهرة أثناء إجابتهم على أسئلة الباحثين والنفوس المتعبة عبر المحادثات المباشرة.';
    case 'seed-thanks-0':
      return 'نشكر إلهنا الصالح! تم الانتهاء من مونتاج وإنتاج جميع الفيديوهات الدفاعية الـ 12 وهي الآن جاهزة للبث والنشر على كافة المنصات!';
    case 'seed-thanks-1':
      return 'المجد لله من كل القلب! شهد مؤتمر الشباب بالمنيا قبول أكثر من 700 شاب وفتاة للمخلص والتزامهم الروحي، وتم ربط المئات بكنائسهم المحلية.';
    case 'seed-thanks-2':
      return 'نشكر الرب جزيل الشكر! أكثر من 15,000 قارئ يتفاعلون الآن مع تطبيق الكتاب المقدس اليومي كل صباح للنمو الروحي والدراسة اليومية.';
    default:
      return fallback;
  }
};

export const getLocalizedAltarPostCategory = (cat: string, language: 'en' | 'ar') => {
  if (language !== 'ar') return cat;
  switch (cat) {
    case 'Youth Outreach':
    case 'Youth Outreach Group':
      return 'اجتماعات الشباب والنهضات';
    case 'Media Frontiers':
      return 'خدمة الميديا والإنتاج';
    case 'Follow-up':
      return 'المتابعة والإرشاد والمشورة';
    case 'Discipleship':
      return 'التلمذة الروحية وتأصيل الإيمان';
    case 'Healing & Health':
      return 'الطلب لأجل الشفاء والصحة';
    case 'Family & Peace':
      return 'سلام العائلات والبيوت';
    case 'Personal Faith':
      return 'العمق الإيماني والنمو الروحي';
    default:
      return cat;
  }
};
