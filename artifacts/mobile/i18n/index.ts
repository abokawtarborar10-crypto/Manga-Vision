import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type AppLanguage = "en" | "ar" | "fr" | "es" | "zh-CN";
export type AppDirection = "ltr" | "rtl";

export const LANGUAGE_OPTIONS: Array<{
  code: AppLanguage;
  nativeName: string;
  englishName: string;
  direction: AppDirection;
}> = [
  { code: "en", nativeName: "English", englishName: "English", direction: "ltr" },
  { code: "ar", nativeName: "العربية", englishName: "Arabic", direction: "rtl" },
  { code: "fr", nativeName: "Français", englishName: "French", direction: "ltr" },
  { code: "es", nativeName: "Español", englishName: "Spanish", direction: "ltr" },
  { code: "zh-CN", nativeName: "中文", englishName: "Chinese (Simplified)", direction: "ltr" },
];

export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.map(({ code }) => code);
export const FALLBACK_LANGUAGE: AppLanguage = "en";

export function isAppLanguage(value: unknown): value is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(value as AppLanguage);
}

export function languageDirection(language: AppLanguage): AppDirection {
  return language === "ar" ? "rtl" : "ltr";
}

const resources = {
  en: {
    translation: {
      common: {
        cancel: "Cancel",
        close: "Close",
        confirm: "Confirm",
        done: "Done",
        retry: "Retry",
        save: "Save",
        reset: "Reset",
        remove: "Remove",
        import: "Import",
        all: "All",
        more: "More",
        soon: "Coming soon",
        pages: "{{count}} page",
        pages_other: "{{count}} pages",
      },
      navigation: {
        home: "Home",
        explore: "Explore",
        library: "Library",
        profile: "Profile",
        settings: "Settings",
        reader: "Reader",
      },
      home: {
        welcome: "Welcome back",
        continueReading: "Continue Reading",
        trending: "Trending Now",
        latest: "Latest Updates",
        browseGenres: "Browse by Genre",
        noContinue: "Your reading list will appear here.",
        seeAll: "See all",
      },
      explore: {
        title: "Explore",
        searchPlaceholder: "Search manga, manhwa, webtoon...",
        noResults: "No results found",
        clearSearch: "Clear search",
        filter: "Filter",
      },
      library: {
        title: "Library",
        empty: "Your library is empty",
        emptyDescription: "Add manga to your library to see it here.",
        removeTitle: "Remove from Library",
        removeMessage: "Remove {{title}} from your library?",
        saved: "Saved {{date}}",
      },
      profile: {
        title: "Profile",
        stats: {
          library: "Library",
          favorites: "Favorites",
          reading: "Reading",
          done: "Done",
        },
        mode: "Mode",
        direction: "Direction",
        theme: "Theme",
        version: "Version",
        settings: "Settings",
        aiTranslation: "AI Translation",
        about: "About MangaVerse",
        language: "Language",
        model: "Model",
        activeKey: "Active Key",
      },
      settings: {
        title: "Settings",
        language: "Language",
        languageDescription: "Choose the language used throughout MangaVerse",
        reading: "Reading",
        appearance: "Appearance",
        aiAndTranslation: "AI & Translation",
        sources: "Sources",
        data: "Data",
        app: "App",
        reader: "Reader",
        readerDescription: "Direction, zoom, brightness, preload",
        fonts: "Fonts & Text",
        fontsDescription: "Font family, size, bubble style",
        imageProcessing: "Image Processing",
        imageProcessingDescription: "Text removal, mask padding, bubble borders",
        theme: "Theme",
        followsSystem: "Follows system",
        alwaysDark: "Always dark",
        alwaysLight: "Always light",
        aiTranslation: "AI Translation",
        aiTranslationDescription: "Gemini keys, model, style, language",
        sourcesDescription: "Enable, priority, cookies, stats",
        network: "Network",
        networkDescription: "Connection, proxy, inpaint server",
        storage: "Storage",
        storageDescription: "Cache, database, cleanup",
        backup: "Backup & Restore",
        backupDescription: "Export and import settings",
        about: "About MangaVerse",
        aboutDescription: "Version, licenses, developer",
        debug: "Settings Debug",
        debugDescription: "Live wiring and persistence audit",
        legalNotice: "MangaVerse aggregates content from legal public sources. All content is provided in accordance with respective platform Terms of Service.",
        chooseLanguage: "Choose language",
        currentLanguage: "Current language",
      },
      reader: {
        chapter: "Chapter {{number}}",
        page: "Page {{number}}",
        loading: "Loading chapter...",
        retrying: "Retrying… Attempt {{attempt}}",
        reading: "Reading",
        display: "Display",
        interaction: "Interaction",
        pagesSection: "Pages",
        readingMode: "Reading Mode",
        verticalScroll: "Vertical scroll",
        pageByPage: "Page-by-page",
        scrolling: "Scrolling",
        enabled: "Enabled",
        disabled: "Disabled",
        readingDirection: "Reading Direction",
        leftToRight: "Left to right",
        rightToLeft: "Right to left (manga)",
        pageTransition: "Page Transition",
        continuous: "Continuous",
        swipe: "Swipe",
        pageAnimation: "Page Animation",
        animateTransitions: "Animate page transitions",
        keepAwake: "Keep Screen Awake",
        keepAwakeDescription: "Prevent screen from sleeping while reading",
        hideSystemBars: "Hide System Bars",
        immersiveDescription: "Full immersive reading mode",
        showPageNumber: "Show Page Number",
        pageNumberDescription: "Display current page overlay",
        progressBar: "Reading Progress Bar",
        progressBarDescription: "Show progress bar at top of reader",
        brightness: "Brightness",
        doubleTapZoom: "Double Tap Zoom",
        doubleTapDescription: "Double-tap to zoom in/out",
        pinchZoom: "Pinch Zoom",
        pinchDescription: "Pinch gesture to zoom",
        fitMode: "Fit Mode",
        fitWidth: "Fit to screen width",
        fitHeight: "Fit to screen height",
        fitScreen: "Fit entire screen",
        dataSaver: "Data Saver",
        dataSaverDescription: "Use a smaller preload window and one download at a time",
        rememberLastPage: "Remember Last Page",
        rememberDescription: "Resume from where you left off",
        preloadPages: "Preload Next Pages",
      },
      errors: {
        generic: "Something went wrong",
        network: "Network error",
        tryAgain: "Please try again.",
        translation: "Translation Error",
        rateLimited: "Rate Limited",
        rateLimitedDescription: "This API key hit its limit. Add another key in Settings.",
      },
    },
  },
  ar: {
    translation: {
      common: {
        cancel: "إلغاء", close: "إغلاق", confirm: "تأكيد", done: "تم", retry: "إعادة المحاولة",
        save: "حفظ", reset: "إعادة ضبط", remove: "إزالة", import: "استيراد", all: "الكل",
        more: "المزيد", soon: "قريباً", pages: "{{count}} صفحة", pages_other: "{{count}} صفحات",
      },
      navigation: { home: "الرئيسية", explore: "استكشاف", library: "المكتبة", profile: "الملف الشخصي", settings: "الإعدادات", reader: "القارئ" },
      home: { welcome: "مرحباً بعودتك", continueReading: "متابعة القراءة", trending: "الأكثر رواجاً", latest: "آخر التحديثات", browseGenres: "تصفح حسب النوع", noContinue: "ستظهر قائمة قراءتك هنا.", seeAll: "عرض الكل" },
      explore: { title: "استكشاف", searchPlaceholder: "ابحث عن مانغا أو مانهوا أو ويب تون...", noResults: "لم يتم العثور على نتائج", clearSearch: "مسح البحث", filter: "تصفية" },
      library: { title: "المكتبة", empty: "مكتبتك فارغة", emptyDescription: "أضف مانغا إلى مكتبتك لتظهر هنا.", removeTitle: "إزالة من المكتبة", removeMessage: "إزالة {{title}} من مكتبتك؟", saved: "تم الحفظ في {{date}}" },
      profile: { title: "الملف الشخصي", stats: { library: "المكتبة", favorites: "المفضلة", reading: "قيد القراءة", done: "مكتمل" }, mode: "الوضع", direction: "الاتجاه", theme: "المظهر", version: "الإصدار", settings: "الإعدادات", aiTranslation: "الترجمة بالذكاء الاصطناعي", about: "حول MangaVerse", language: "اللغة", model: "النموذج", activeKey: "المفتاح النشط" },
      settings: { title: "الإعدادات", language: "اللغة", languageDescription: "اختر اللغة المستخدمة في MangaVerse", reading: "القراءة", appearance: "المظهر", aiAndTranslation: "الذكاء الاصطناعي والترجمة", sources: "المصادر", data: "البيانات", app: "التطبيق", reader: "القارئ", readerDescription: "الاتجاه والتكبير والسطوع والتحميل المسبق", fonts: "الخط والنص", fontsDescription: "نوع الخط وحجمه ونمط الفقاعات", imageProcessing: "معالجة الصور", imageProcessingDescription: "إزالة النص وحواف الفقاعات", theme: "المظهر", followsSystem: "حسب النظام", alwaysDark: "داكن دائماً", alwaysLight: "فاتح دائماً", aiTranslation: "الترجمة بالذكاء الاصطناعي", aiTranslationDescription: "مفاتيح Gemini والنموذج واللغة", sourcesDescription: "التفعيل والأولوية وملفات الارتباط والإحصاءات", network: "الشبكة", networkDescription: "الاتصال والوكيل وخادم التنظيف", storage: "التخزين", storageDescription: "التخزين المؤقت وقاعدة البيانات والتنظيف", backup: "النسخ الاحتياطي والاستعادة", backupDescription: "تصدير واستيراد الإعدادات", about: "حول MangaVerse", aboutDescription: "الإصدار والتراخيص والمطور", debug: "تصحيح الإعدادات", debugDescription: "تدقيق الربط والحفظ", legalNotice: "يجمع MangaVerse المحتوى من مصادر عامة قانونية وفقاً لشروط استخدام كل منصة.", chooseLanguage: "اختر اللغة", currentLanguage: "اللغة الحالية" },
      reader: { chapter: "الفصل {{number}}", page: "الصفحة {{number}}", loading: "جارٍ تحميل الفصل...", retrying: "إعادة المحاولة… المحاولة {{attempt}}", reading: "القراءة", display: "العرض", interaction: "التفاعل", pagesSection: "الصفحات", readingMode: "وضع القراءة", verticalScroll: "تمرير عمودي", pageByPage: "صفحة بصفحة", scrolling: "التمرير", enabled: "مفعّل", disabled: "معطّل", readingDirection: "اتجاه القراءة", leftToRight: "من اليسار إلى اليمين", rightToLeft: "من اليمين إلى اليسار (مانغا)", pageTransition: "انتقال الصفحات", continuous: "مستمر", swipe: "سحب", pageAnimation: "حركة الصفحات", animateTransitions: "تحريك انتقال الصفحات", keepAwake: "إبقاء الشاشة مضاءة", keepAwakeDescription: "منع الشاشة من السكون أثناء القراءة", hideSystemBars: "إخفاء أشرطة النظام", immersiveDescription: "وضع قراءة غامر بالكامل", showPageNumber: "إظهار رقم الصفحة", pageNumberDescription: "عرض رقم الصفحة الحالية", progressBar: "شريط تقدم القراءة", progressBarDescription: "إظهار شريط التقدم أعلى القارئ", brightness: "السطوع", doubleTapZoom: "تكبير بالنقر المزدوج", doubleTapDescription: "انقر مرتين للتكبير أو التصغير", pinchZoom: "تكبير باللمس", pinchDescription: "استخدم حركة القرص للتكبير", fitMode: "ملاءمة العرض", fitWidth: "ملاءمة عرض الشاشة", fitHeight: "ملاءمة ارتفاع الشاشة", fitScreen: "ملاءمة الشاشة كاملة", dataSaver: "توفير البيانات", dataSaverDescription: "تحميل مسبق أصغر وتنزيل واحد في كل مرة", rememberLastPage: "تذكر آخر صفحة", rememberDescription: "استئناف القراءة من مكان التوقف", preloadPages: "تحميل الصفحات التالية مسبقاً" },
      errors: { generic: "حدث خطأ ما", network: "خطأ في الشبكة", tryAgain: "يرجى المحاولة مرة أخرى.", translation: "خطأ في الترجمة", rateLimited: "تم بلوغ الحد", rateLimitedDescription: "بلغ مفتاح API هذا حده. أضف مفتاحاً آخر من الإعدادات." },
    },
  },
  fr: {
    translation: {
      common: { cancel: "Annuler", close: "Fermer", confirm: "Confirmer", done: "Terminé", retry: "Réessayer", save: "Enregistrer", reset: "Réinitialiser", remove: "Supprimer", import: "Importer", all: "Tout", more: "Plus", soon: "Bientôt", pages: "{{count}} page", pages_other: "{{count}} pages" },
      navigation: { home: "Accueil", explore: "Explorer", library: "Bibliothèque", profile: "Profil", settings: "Paramètres", reader: "Lecteur" },
      home: { welcome: "Bon retour", continueReading: "Continuer la lecture", trending: "Tendances", latest: "Dernières mises à jour", browseGenres: "Parcourir par genre", noContinue: "Votre liste de lecture apparaîtra ici.", seeAll: "Tout voir" },
      explore: { title: "Explorer", searchPlaceholder: "Rechercher manga, manhwa, webtoon...", noResults: "Aucun résultat", clearSearch: "Effacer la recherche", filter: "Filtrer" },
      library: { title: "Bibliothèque", empty: "Votre bibliothèque est vide", emptyDescription: "Ajoutez des mangas à votre bibliothèque pour les voir ici.", removeTitle: "Retirer de la bibliothèque", removeMessage: "Retirer {{title}} de votre bibliothèque ?", saved: "Enregistré le {{date}}" },
      profile: { title: "Profil", stats: { library: "Bibliothèque", favorites: "Favoris", reading: "En cours", done: "Terminé" }, mode: "Mode", direction: "Direction", theme: "Thème", version: "Version", settings: "Paramètres", aiTranslation: "Traduction IA", about: "À propos de MangaVerse", language: "Langue", model: "Modèle", activeKey: "Clé active" },
      settings: { title: "Paramètres", language: "Langue", languageDescription: "Choisissez la langue de MangaVerse", reading: "Lecture", appearance: "Apparence", aiAndTranslation: "IA et traduction", sources: "Sources", data: "Données", app: "Application", reader: "Lecteur", readerDescription: "Direction, zoom, luminosité, préchargement", fonts: "Polices et texte", fontsDescription: "Police, taille et bulles", imageProcessing: "Traitement d'image", imageProcessingDescription: "Suppression du texte et bordures", theme: "Thème", followsSystem: "Selon le système", alwaysDark: "Toujours sombre", alwaysLight: "Toujours clair", aiTranslation: "Traduction IA", aiTranslationDescription: "Clés Gemini, modèle, style et langue", sourcesDescription: "Activation, priorité, cookies et statistiques", network: "Réseau", networkDescription: "Connexion, proxy et serveur inpaint", storage: "Stockage", storageDescription: "Cache, base de données et nettoyage", backup: "Sauvegarde et restauration", backupDescription: "Exporter et importer les paramètres", about: "À propos de MangaVerse", aboutDescription: "Version, licences et développeur", debug: "Débogage des paramètres", debugDescription: "Audit des connexions et de la persistance", legalNotice: "MangaVerse regroupe du contenu provenant de sources publiques légales, conformément aux conditions de chaque plateforme.", chooseLanguage: "Choisir la langue", currentLanguage: "Langue actuelle" },
      reader: { chapter: "Chapitre {{number}}", page: "Page {{number}}", loading: "Chargement du chapitre...", retrying: "Nouvel essai… Tentative {{attempt}}", reading: "Lecture", display: "Affichage", interaction: "Interaction", pagesSection: "Pages", readingMode: "Mode de lecture", verticalScroll: "Défilement vertical", pageByPage: "Page par page", scrolling: "Défilement", enabled: "Activé", disabled: "Désactivé", readingDirection: "Sens de lecture", leftToRight: "De gauche à droite", rightToLeft: "De droite à gauche (manga)", pageTransition: "Transition de page", continuous: "Continu", swipe: "Glissement", pageAnimation: "Animation des pages", animateTransitions: "Animer les transitions", keepAwake: "Garder l'écran allumé", keepAwakeDescription: "Empêcher la mise en veille pendant la lecture", hideSystemBars: "Masquer les barres système", immersiveDescription: "Mode de lecture immersif", showPageNumber: "Afficher le numéro de page", pageNumberDescription: "Afficher la page actuelle", progressBar: "Barre de progression", progressBarDescription: "Afficher la progression en haut du lecteur", brightness: "Luminosité", doubleTapZoom: "Zoom double-tap", doubleTapDescription: "Appuyez deux fois pour zoomer", pinchZoom: "Zoom pincé", pinchDescription: "Pincez pour zoomer", fitMode: "Mode d'ajustement", fitWidth: "Ajuster à la largeur", fitHeight: "Ajuster à la hauteur", fitScreen: "Ajuster à l'écran", dataSaver: "Économie de données", dataSaverDescription: "Préchargement réduit et un téléchargement à la fois", rememberLastPage: "Mémoriser la dernière page", rememberDescription: "Reprendre là où vous vous êtes arrêté", preloadPages: "Précharger les pages suivantes" },
      errors: { generic: "Une erreur est survenue", network: "Erreur réseau", tryAgain: "Veuillez réessayer.", translation: "Erreur de traduction", rateLimited: "Limite atteinte", rateLimitedDescription: "Cette clé API a atteint sa limite. Ajoutez-en une autre dans les paramètres." },
    },
  },
  es: {
    translation: {
      common: { cancel: "Cancelar", close: "Cerrar", confirm: "Confirmar", done: "Listo", retry: "Reintentar", save: "Guardar", reset: "Restablecer", remove: "Eliminar", import: "Importar", all: "Todo", more: "Más", soon: "Próximamente", pages: "{{count}} página", pages_other: "{{count}} páginas" },
      navigation: { home: "Inicio", explore: "Explorar", library: "Biblioteca", profile: "Perfil", settings: "Ajustes", reader: "Lector" },
      home: { welcome: "Bienvenido de nuevo", continueReading: "Continuar leyendo", trending: "Tendencias", latest: "Últimas novedades", browseGenres: "Explorar por género", noContinue: "Tu lista de lectura aparecerá aquí.", seeAll: "Ver todo" },
      explore: { title: "Explorar", searchPlaceholder: "Buscar manga, manhwa, webtoon...", noResults: "No se encontraron resultados", clearSearch: "Borrar búsqueda", filter: "Filtrar" },
      library: { title: "Biblioteca", empty: "Tu biblioteca está vacía", emptyDescription: "Añade manga a tu biblioteca para verlo aquí.", removeTitle: "Quitar de la biblioteca", removeMessage: "¿Quitar {{title}} de tu biblioteca?", saved: "Guardado el {{date}}" },
      profile: { title: "Perfil", stats: { library: "Biblioteca", favorites: "Favoritos", reading: "Leyendo", done: "Completado" }, mode: "Modo", direction: "Dirección", theme: "Tema", version: "Versión", settings: "Ajustes", aiTranslation: "Traducción IA", about: "Acerca de MangaVerse", language: "Idioma", model: "Modelo", activeKey: "Clave activa" },
      settings: { title: "Ajustes", language: "Idioma", languageDescription: "Elige el idioma de MangaVerse", reading: "Lectura", appearance: "Apariencia", aiAndTranslation: "IA y traducción", sources: "Fuentes", data: "Datos", app: "Aplicación", reader: "Lector", readerDescription: "Dirección, zoom, brillo y precarga", fonts: "Fuentes y texto", fontsDescription: "Familia, tamaño y burbujas", imageProcessing: "Procesamiento de imagen", imageProcessingDescription: "Eliminación de texto y bordes", theme: "Tema", followsSystem: "Según el sistema", alwaysDark: "Siempre oscuro", alwaysLight: "Siempre claro", aiTranslation: "Traducción IA", aiTranslationDescription: "Claves Gemini, modelo, estilo e idioma", sourcesDescription: "Activación, prioridad, cookies y estadísticas", network: "Red", networkDescription: "Conexión, proxy y servidor de inpainting", storage: "Almacenamiento", storageDescription: "Caché, base de datos y limpieza", backup: "Copia y restauración", backupDescription: "Exportar e importar ajustes", about: "Acerca de MangaVerse", aboutDescription: "Versión, licencias y desarrollador", debug: "Depuración de ajustes", debugDescription: "Auditoría de conexión y persistencia", legalNotice: "MangaVerse reúne contenido de fuentes públicas legales conforme a los términos de cada plataforma.", chooseLanguage: "Elegir idioma", currentLanguage: "Idioma actual" },
      reader: { chapter: "Capítulo {{number}}", page: "Página {{number}}", loading: "Cargando capítulo...", retrying: "Reintentando… Intento {{attempt}}", reading: "Lectura", display: "Pantalla", interaction: "Interacción", pagesSection: "Páginas", readingMode: "Modo de lectura", verticalScroll: "Desplazamiento vertical", pageByPage: "Página a página", scrolling: "Desplazamiento", enabled: "Activado", disabled: "Desactivado", readingDirection: "Dirección de lectura", leftToRight: "De izquierda a derecha", rightToLeft: "De derecha a izquierda (manga)", pageTransition: "Transición de página", continuous: "Continuo", swipe: "Deslizar", pageAnimation: "Animación de página", animateTransitions: "Animar transiciones", keepAwake: "Mantener pantalla activa", keepAwakeDescription: "Evitar que la pantalla se apague al leer", hideSystemBars: "Ocultar barras del sistema", immersiveDescription: "Modo de lectura inmersivo", showPageNumber: "Mostrar número de página", pageNumberDescription: "Mostrar la página actual", progressBar: "Barra de progreso", progressBarDescription: "Mostrar progreso en la parte superior", brightness: "Brillo", doubleTapZoom: "Zoom con doble toque", doubleTapDescription: "Toca dos veces para ampliar", pinchZoom: "Zoom con pellizco", pinchDescription: "Pellizca para ampliar", fitMode: "Modo de ajuste", fitWidth: "Ajustar al ancho", fitHeight: "Ajustar a la altura", fitScreen: "Ajustar a la pantalla", dataSaver: "Ahorro de datos", dataSaverDescription: "Precarga reducida y una descarga a la vez", rememberLastPage: "Recordar última página", rememberDescription: "Continuar desde donde lo dejaste", preloadPages: "Precargar páginas siguientes" },
      errors: { generic: "Algo salió mal", network: "Error de red", tryAgain: "Inténtalo de nuevo.", translation: "Error de traducción", rateLimited: "Límite alcanzado", rateLimitedDescription: "Esta clave API alcanzó su límite. Añade otra en Ajustes." },
    },
  },
  "zh-CN": {
    translation: {
      common: { cancel: "取消", close: "关闭", confirm: "确认", done: "完成", retry: "重试", save: "保存", reset: "重置", remove: "移除", import: "导入", all: "全部", more: "更多", soon: "即将推出", pages: "{{count}} 页", pages_other: "{{count}} 页" },
      navigation: { home: "首页", explore: "探索", library: "书架", profile: "个人资料", settings: "设置", reader: "阅读器" },
      home: { welcome: "欢迎回来", continueReading: "继续阅读", trending: "热门推荐", latest: "最新更新", browseGenres: "按类型浏览", noContinue: "你的阅读列表会显示在这里。", seeAll: "查看全部" },
      explore: { title: "探索", searchPlaceholder: "搜索漫画、韩漫、网漫...", noResults: "未找到结果", clearSearch: "清除搜索", filter: "筛选" },
      library: { title: "书架", empty: "书架为空", emptyDescription: "将漫画加入书架后会显示在这里。", removeTitle: "从书架移除", removeMessage: "要从书架移除 {{title}} 吗？", saved: "保存于 {{date}}" },
      profile: { title: "个人资料", stats: { library: "书架", favorites: "收藏", reading: "阅读中", done: "已完成" }, mode: "模式", direction: "方向", theme: "主题", version: "版本", settings: "设置", aiTranslation: "AI 翻译", about: "关于 MangaVerse", language: "语言", model: "模型", activeKey: "当前密钥" },
      settings: { title: "设置", language: "语言", languageDescription: "选择 MangaVerse 使用的语言", reading: "阅读", appearance: "外观", aiAndTranslation: "AI 与翻译", sources: "来源", data: "数据", app: "应用", reader: "阅读器", readerDescription: "方向、缩放、亮度和预加载", fonts: "字体与文本", fontsDescription: "字体、大小和气泡样式", imageProcessing: "图像处理", imageProcessingDescription: "文本移除、遮罩边距和气泡边框", theme: "主题", followsSystem: "跟随系统", alwaysDark: "始终深色", alwaysLight: "始终浅色", aiTranslation: "AI 翻译", aiTranslationDescription: "Gemini 密钥、模型、样式和语言", sourcesDescription: "启用、优先级、Cookie 和统计", network: "网络", networkDescription: "连接、代理和修复服务器", storage: "存储", storageDescription: "缓存、数据库和清理", backup: "备份与恢复", backupDescription: "导出和导入设置", about: "关于 MangaVerse", aboutDescription: "版本、许可证和开发者", debug: "设置调试", debugDescription: "实时连接和持久化检查", legalNotice: "MangaVerse 汇总合法公开来源的内容，并遵循各平台的服务条款。", chooseLanguage: "选择语言", currentLanguage: "当前语言" },
      reader: { chapter: "第 {{number}} 章", page: "第 {{number}} 页", loading: "正在加载章节...", retrying: "正在重试…第 {{attempt}} 次", reading: "阅读", display: "显示", interaction: "交互", pagesSection: "页面", readingMode: "阅读模式", verticalScroll: "垂直滚动", pageByPage: "逐页阅读", scrolling: "滚动", enabled: "已启用", disabled: "已停用", readingDirection: "阅读方向", leftToRight: "从左到右", rightToLeft: "从右到左（漫画）", pageTransition: "页面切换", continuous: "连续", swipe: "滑动", pageAnimation: "页面动画", animateTransitions: "为页面切换添加动画", keepAwake: "保持屏幕常亮", keepAwakeDescription: "阅读时防止屏幕休眠", hideSystemBars: "隐藏系统栏", immersiveDescription: "沉浸式阅读模式", showPageNumber: "显示页码", pageNumberDescription: "显示当前页码", progressBar: "阅读进度条", progressBarDescription: "在阅读器顶部显示进度", brightness: "亮度", doubleTapZoom: "双击缩放", doubleTapDescription: "双击放大或缩小", pinchZoom: "双指缩放", pinchDescription: "使用捏合手势缩放", fitMode: "适配模式", fitWidth: "适配屏幕宽度", fitHeight: "适配屏幕高度", fitScreen: "适配整个屏幕", dataSaver: "节省流量", dataSaverDescription: "使用较小的预加载窗口并一次下载一页", rememberLastPage: "记住上一页", rememberDescription: "从上次停止的位置继续", preloadPages: "预加载后续页面" },
      errors: { generic: "发生错误", network: "网络错误", tryAgain: "请重试。", translation: "翻译错误", rateLimited: "已达到限制", rateLimitedDescription: "此 API 密钥已达到限制。请在设置中添加其他密钥。" },
    },
  },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: FALLBACK_LANGUAGE,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: false,
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    react: { useSuspense: false },
  });
}

export { i18n };