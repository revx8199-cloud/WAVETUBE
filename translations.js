// ============ translations.js — słownik PL/EN/RU + i18n ============

// ── JĘZYK / i18n ─────────────────────────────────────────────────────────
const TRANSLATIONS={
  pl:{
    nav_home:'Strona główna',nav_shorts:'Shorts',nav_trending:'Popularne',nav_you:'Ty',
    nav_mychannel:'Mój kanał',nav_subs:'Moje subskrypcje',nav_history:'Historia oglądania',
    nav_messages:'Wiadomości',nav_subscriptions:'Subskrypcje',nav_announcements:'Ogłoszenia',nav_saved:'Zapisane filmy',nav_watchlater:'Obejrzę później',
    nav_findbug:'Znajdź bug',findbug_title:'Znajdź bug',findbug_desc:'Znalazłeś błąd albo dziurę w bezpieczeństwie? Napisz do nas!',findbug_reward:'Opisz znaleziony bug lub lukę bezpieczeństwa i wyślij nam maila. Jeśli zgłoszenie okaże się prawdziwe — dostaniesz nagrodę! 🎁',findbug_copy_btn:'Kopiuj adres e-mail',findbug_copied_toast:'Skopiowano adres e-mail!',
    credits_code_label:'Kod',credits_lead_label:'Prowadzi projekt',vip_since_label:'od',
    search_placeholder:'Szukaj filmów...',btn_add_video:'+ Dodaj film',
    dd_mychannel:'Mój kanał',dd_settings:'Ustawienia',dd_logout:'Wyloguj',
    btn_subscribe:'Subskrybuj',btn_subscribed:'Subskrybujesz',btn_share:'Udostępnij',
    btn_download:'Pobierz',btn_support:'Wesprzyj autora',btn_report:'Zgłoś',
    comments_label:'Komentarze',comment_placeholder:'Napisz komentarz...',comments_label_zero:'Komentarze (0)',
    btn_send:'Wyślij',btn_cancel:'Anuluj',btn_reply:'Odpowiedz',
    sort_top:'Najtrafniejsze',sort_newest:'Najnowsze',
    settings_title:'Ustawienia',settings_nick:'Twój nick',settings_lang:'Język',
    btn_save:'Zapisz',btn_close:'Zamknij',btn_publish:'Opublikuj',
    tab_videos:'Filmy',tab_shorts:'Shorts',tab_posts:'Posty',subscribers_label:'subskrybentów',videos_label:'filmów',your_channel_label:'To Twój kanał',
    login_google:'Zaloguj się',logged_in_as:'Zalogowano jako',
    ch_default_name:'Kanał',ch_change_banner:'Zmień baner',ch_message:'Wiadomość',ch_stats:'Statystyki',
    ch_add_desc:'+ Dodaj opis kanału',ch_no_videos:'Ten kanał nie ma jeszcze żadnych filmów',
    ch_no_shorts:'Brak Shorts na tym kanale',ch_comments_suffix:'komentarzy',ch_comments_off:'Komentarze wyłączone',
    ch_premiere:'Premiera',toast_unsubscribed:'Anulowano subskrypcję',toast_subscribing:'Subskrybujesz',ch_joined:'Dołączył(a):',ch_set_country:'Ustaw kraj kanału',
    settings_country:'Kraj kanału',settings_country_desc:'Widoczny publicznie na Twoim kanale.',
    desc_placeholder:'Opis kanału...',desc_saved_toast:'Opis zapisany! ✅',
    posts_loading:'⏳ Ładowanie postów...',posts_add_btn:'+ Dodaj post',posts_none:'Brak postów na tym kanale',
    post_delete_title:'Usuń post',post_comment_ph:'Komentarz...',post_login_comment:'Zaloguj się żeby komentować',
    post_login_vote:'Zaloguj się żeby głosować',post_login_vote_toast:'Zaloguj się żeby zagłosować!',
    vote_singular:'głos',vote_plural:'głosów',anonim:'Anonim',
    toast_login_generic:'Zaloguj się!',confirm_delete_post:'Usunąć post?',confirm_irreversible:'Ta czynność jest nieodwracalna.',
    toast_max_images:'Maksymalnie 6 zdjęć na post',
    post_poll_question_missing:'Wpisz pytanie ankiety!',post_poll_min_options:'Dodaj przynajmniej 2 opcje!',
    post_empty_error:'Napisz coś, dodaj zdjęcie lub ankietę!',post_publishing:'Publikowanie...',
    post_rate_limit:'Za dużo postów naraz — odczekaj chwilę 🐢',post_new_notification:'dodał nowy post 📝',
    post_published_toast:'Post dodany! 📝',
    post_modal_title:'📝 Nowy post',post_text_label:'Tekst',post_text_placeholder:'Co chcesz napisać?',
    post_images_label:'Zdjęcia (opcjonalnie, max 6)',post_add_poll:'📊 Dodaj ankietę',
    post_poll_question_ph:'Zadaj pytanie...',post_add_option:'+ Dodaj opcję',
    post_poll_option_ph:'Opcja',post_poll_max_options:'Maksymalnie 4 opcje',
    page_shorts:'Shorts',page_my_subs:'Moje subskrypcje',page_saved:'💾 Zapisane filmy',
    page_watchlater:'⏰ Obejrzę później',page_announcements:'📢 Ogłoszenia od twórcy',
    page_trending:'🔥 Popularne',page_history:'Historia oglądania',btn_clear:'Wyczyść',
    saved_login:'Zaloguj się żeby zapisywać filmy',saved_empty:'Brak zapisanych filmów',
    saved_empty_sub:'Kliknij ⋮ przy filmie i wybierz "Zapisz"',
    wl_login:'Zaloguj się żeby korzystać z "Obejrzę później"',wl_empty:'Brak filmów do obejrzenia później',
    wl_empty_sub:'Kliknij ⋮ przy filmie i wybierz "Obejrzę później"',
    wl_login_toast:'Zaloguj się żeby dodawać do "Obejrzę później"!',wl_removed_toast:'Usunięto z "Obejrzę później"',wl_added_toast:'Dodano do obejrzenia później ⏰',
    save_label:'Zapisz',save_added_label:'Zapisano',wl_label:'Obejrzę później',wl_added_label:'W kolejce',
    notifications_title:'Powiadomienia',notif_empty:'Brak powiadomień',notif_clear_empty_toast:'Brak powiadomień do wyczyszczenia',
    history_login:'Zaloguj się żeby zobaczyć historię oglądania',history_empty:'Brak historii oglądania',
    history_empty_sub:'Filmy które oglądasz pojawią się tutaj',watched_at_label:'Oglądano',
    confirm_clear_history:'Wyczyścić historię oglądania?',confirm_clear_history_sub:'Cała historia obejrzanych filmów zostanie usunięta.',
    toast_history_cleared:'Historia wyczyszczona!',
    subs_empty:'Nie subskrybujesz jeszcze nikogo!',subs_empty_sub:'Wejdź na czyjś kanał i kliknij Subskrybuj',
    subs_no_videos:'Brak filmów od subskrybowanych kanałów',
    msg_conversations:'Konwersacje',msg_new_btn:'+ Nowa',msg_pick_conv:'Wybierz konwersację lub zacznij nową',msg_retention_note:'🕒 Czat czyści się co 30 dni',
    msg_no_convs:'Brak konwersacji.',msg_no_convs_sub:'Wejdź na czyjś kanał i kliknij ✉️ Wiadomość',
    msg_placeholder:'Napisz wiadomość...',confirm_delete_conv:'Usunąć tę konwersację?',confirm_delete_conv_sub:'Wszystkie wiadomości zostaną trwale usunięte.',toast_chat_deleted:'Czat usunięty 🗑',
    feed_all_videos:'Wszystkie filmy',feed_no_results:'Brak wyników',feed_no_videos:'Brak filmów',feed_results_for:'Wyniki',
    filter_all_categories:'📂 Wszystkie kategorie',filter_any_length:'⏱ Dowolna długość',
    filter_short:'Krótkie (do 4 min)',filter_medium:'Średnie (4–20 min)',filter_long:'Długie (ponad 20 min)',
    filter_newest:'🆕 Najnowsze',filter_oldest:'Najstarsze',filter_popular:'🔥 Najpopularniejsze',filter_liked:'👍 Najwięcej polubień',
    settings_autoplay:'▶️ Autoodtwarzanie następnego filmu',settings_autoplay_desc:'Po skończeniu filmu automatycznie odtworzy się kolejny.',
    autoplay_next_video:'Następny film',autoplay_play_now:'Odtwórz teraz',
    form_title:'🎬 Dodaj film',form_subtitle:'YouTube, Google Drive, TikTok i bezpośrednie linki MP4',
    form_section_basic:'Podstawowe informacje',form_title_label:'Tytuł *',form_title_ph:'np. Wakacje w górach',
    form_desc_label:'Opis',form_desc_ph:'Opisz film...',
    form_link_label:'Link do filmu *',form_link_ph:'YouTube / Google Drive / TikTok / MP4',form_link_hint:'Wklej link — zostanie automatycznie rozpoznany',
    form_thumb_label:'Miniaturka',form_thumb_url_tab:'🔗 Link URL',form_thumb_file_tab:'📁 Z dysku',form_thumb_auto_tab:'✨ Auto',
    form_thumb_url_ph:'https://... link do zdjęcia',form_thumb_auto_hint:'Miniaturka zostanie pobrana automatycznie z YouTube',
    form_duration_label:'Czas trwania',form_duration_ph:'np. 5:42 (dla MP4 wykryjemy automatycznie)',
    form_category_label:'Kategoria',cat_none:'Brak kategorii',cat_gaming:'🎮 Gaming',cat_music:'🎵 Muzyka',cat_sport:'⚽ Sport',
    cat_vlog:'📹 Vlog',cat_tutorial:'📚 Tutorial',cat_humor:'😂 Humor',cat_travel:'✈️ Podróże',cat_other:'📌 Inne',
    form_tags_label:'Tagi (opcjonalnie)',form_tags_ph:'np. gaming, vlog, muzyka (oddziel przecinkami)',form_tags_hint:'Tagi pomagają ludziom znaleźć Twój film',
    form_section_details:'Szczegóły',form_lang_label:'Język filmu',form_license_label:'Licencja',
    license_standard:'Standardowa licencja WaveTube',license_cc:'Creative Commons — uznanie autorstwa',
    form_premiere_label:'Data premiery (opcjonalnie)',form_premiere_hint:'Zostaw puste żeby opublikować od razu. Ustaw datę żeby zaplanować premierę.',
    form_short_title:'To jest Short (maks. 1 minuta)',form_short_desc:'Shorts wyświetlają się osobno w pionie jak na TikToku',
    form_section_visibility:'Widoczność publiczna',
    vis_public_title:'Publiczny',vis_public_desc:'Widoczny dla wszystkich — na stronie głównej, w wyszukiwarce i popularnych',
    vis_unlisted_title:'Niepubliczny (unlisted)',vis_unlisted_desc:'Nie pojawia się w żadnych listach — obejrzy go tylko ten, kto ma bezpośredni link',
    vis_private_title:'Prywatny',vis_private_desc:'Widzisz go tylko Ty (i administrator) — nawet z linkiem nikt inny go nie otworzy',
    form_comments_label:'Włącz komentarze',form_likes_label:'Pokazuj liczbę polubień',form_hideviews_label:'Ukryj liczbę wyświetleń (publicznie)',
    form_kids_label:'Treść przeznaczona dla dzieci',form_age_label:'Ograniczenie wiekowe (18+)',
    form_submit_btn:'Opublikuj film',form_publishing_btn:'Publikowanie...',form_need_title_url:'Podaj tytuł i link!',
    hint_paste_link:'Wklej link — zostanie automatycznie rozpoznany',
    hint_gdrive:'✅ <b style="color:#1a73e8">Google Drive</b> — upewnij się że plik jest publiczny',
    hint_mp4_detecting:'✅ <b style="color:#188038">MP4</b> — wykrywam długość...',hint_unknown_format:'⚠️ Nierozpoznany format',hint_mp4_detected:'✅ <b style="color:#188038">MP4</b> — długość wykryta automatycznie',
    settings_allow_msg:'✉️ Zezwalaj innym na pisanie do mnie',settings_allow_msg_desc:'Gdy wyłączone, nikt nie założy z Tobą nowej rozmowy w Wiadomościach.',toast_msg_disabled:'Ten użytkownik wyłączył możliwość pisania do niego',
    announce_load_error:'Nie udało się wczytać ogłoszeń',announce_empty:'Brak ogłoszeń',announce_empty_sub:'Tutaj pojawią się wiadomości od twórcy WaveTube'
  },
  en:{
    nav_home:'Home',nav_shorts:'Shorts',nav_trending:'Trending',nav_you:'You',
    nav_mychannel:'My channel',nav_subs:'My subscriptions',nav_history:'Watch history',
    nav_messages:'Messages',nav_subscriptions:'Subscriptions',nav_announcements:'Announcements',nav_saved:'Saved videos',nav_watchlater:'Watch later',
    nav_findbug:'Find a bug',findbug_title:'Find a bug',findbug_desc:'Found a bug or a security hole? Write to us!',findbug_reward:'Describe the bug or security issue you found and send us an email. If it turns out to be real — you\'ll get a reward! 🎁',findbug_copy_btn:'Copy email address',findbug_copied_toast:'Email address copied!',
    credits_code_label:'Code',credits_lead_label:'Leads the project',vip_since_label:'since',
    search_placeholder:'Search videos...',btn_add_video:'+ Add video',
    dd_mychannel:'My channel',dd_settings:'Settings',dd_logout:'Sign out',
    btn_subscribe:'Subscribe',btn_subscribed:'Subscribed',btn_share:'Share',
    btn_download:'Download',btn_support:'Support creator',btn_report:'Report',
    comments_label:'Comments',comment_placeholder:'Add a comment...',comments_label_zero:'Comments (0)',
    btn_send:'Send',btn_cancel:'Cancel',btn_reply:'Reply',
    sort_top:'Top comments',sort_newest:'Newest first',
    settings_title:'Settings',settings_nick:'Your nickname',settings_lang:'Language',
    btn_save:'Save',btn_close:'Close',btn_publish:'Publish',
    tab_videos:'Videos',tab_shorts:'Shorts',tab_posts:'Posts',subscribers_label:'subscribers',videos_label:'videos',your_channel_label:'This is your channel',
    login_google:'Sign in',logged_in_as:'Signed in as',
    ch_default_name:'Channel',ch_change_banner:'Change banner',ch_message:'Message',ch_stats:'Stats',
    ch_add_desc:'+ Add channel description',ch_no_videos:'This channel has no videos yet',
    ch_no_shorts:'No Shorts on this channel',ch_comments_suffix:'comments',ch_comments_off:'Comments are off',
    ch_premiere:'Premiere',toast_unsubscribed:'Unsubscribed',toast_subscribing:'Subscribed to',ch_joined:'Joined:',ch_set_country:'Set channel country',
    settings_country:'Channel country',settings_country_desc:'Publicly visible on your channel.',
    desc_placeholder:'Channel description...',desc_saved_toast:'Description saved! ✅',
    posts_loading:'⏳ Loading posts...',posts_add_btn:'+ Add post',posts_none:'No posts on this channel',
    post_delete_title:'Delete post',post_comment_ph:'Comment...',post_login_comment:'Sign in to comment',
    post_login_vote:'Sign in to vote',post_login_vote_toast:'Sign in to vote!',
    vote_singular:'vote',vote_plural:'votes',anonim:'Anonymous',
    toast_login_generic:'Please sign in!',confirm_delete_post:'Delete this post?',confirm_irreversible:'This action cannot be undone.',
    toast_max_images:'Maximum 6 images per post',
    post_poll_question_missing:'Enter a poll question!',post_poll_min_options:'Add at least 2 options!',
    post_empty_error:'Write something, add an image or a poll!',post_publishing:'Publishing...',
    post_rate_limit:'Too many posts at once — slow down a bit 🐢',post_new_notification:'posted something new 📝',
    post_published_toast:'Post published! 📝',
    post_modal_title:'📝 New post',post_text_label:'Text',post_text_placeholder:'What do you want to say?',
    post_images_label:'Images (optional, max 6)',post_add_poll:'📊 Add poll',
    post_poll_question_ph:'Ask a question...',post_add_option:'+ Add option',
    post_poll_option_ph:'Option',post_poll_max_options:'Maximum 4 options',
    page_shorts:'Shorts',page_my_subs:'My subscriptions',page_saved:'💾 Saved videos',
    page_watchlater:'⏰ Watch later',page_announcements:'📢 Announcements from the creator',
    page_trending:'🔥 Trending',page_history:'Watch history',btn_clear:'Clear',
    saved_login:'Sign in to save videos',saved_empty:'No saved videos',
    saved_empty_sub:'Click ⋮ on a video and choose "Save"',
    wl_login:'Sign in to use "Watch later"',wl_empty:'No videos to watch later',
    wl_empty_sub:'Click ⋮ on a video and choose "Watch later"',
    wl_login_toast:'Sign in to add to "Watch later"!',wl_removed_toast:'Removed from "Watch later"',wl_added_toast:'Added to watch later ⏰',
    save_label:'Save',save_added_label:'Saved',wl_label:'Watch later',wl_added_label:'In queue',
    notifications_title:'Notifications',notif_empty:'No notifications',notif_clear_empty_toast:'No notifications to clear',
    history_login:'Sign in to see your watch history',history_empty:'No watch history',
    history_empty_sub:'Videos you watch will show up here',watched_at_label:'Watched',
    confirm_clear_history:'Clear watch history?',confirm_clear_history_sub:'Your entire watch history will be deleted.',
    toast_history_cleared:'History cleared!',
    subs_empty:'You\'re not subscribed to anyone yet!',subs_empty_sub:'Visit a channel and click Subscribe',
    subs_no_videos:'No videos from your subscribed channels',
    msg_conversations:'Conversations',msg_new_btn:'+ New',msg_pick_conv:'Select a conversation or start a new one',msg_retention_note:'🕒 Chat clears every 30 days',
    msg_no_convs:'No conversations.',msg_no_convs_sub:'Visit someone\'s channel and click ✉️ Message',
    msg_placeholder:'Type a message...',confirm_delete_conv:'Delete this conversation?',confirm_delete_conv_sub:'All messages will be permanently deleted.',toast_chat_deleted:'Chat deleted 🗑',
    feed_all_videos:'All videos',feed_no_results:'No results',feed_no_videos:'No videos',feed_results_for:'Results',
    filter_all_categories:'📂 All categories',filter_any_length:'⏱ Any length',
    filter_short:'Short (under 4 min)',filter_medium:'Medium (4–20 min)',filter_long:'Long (over 20 min)',
    filter_newest:'🆕 Newest',filter_oldest:'Oldest',filter_popular:'🔥 Most popular',filter_liked:'👍 Most liked',
    settings_autoplay:'▶️ Autoplay next video',settings_autoplay_desc:'The next video will start automatically when this one ends.',
    autoplay_next_video:'Next video',autoplay_play_now:'Play now',
    form_title:'🎬 Add video',form_subtitle:'YouTube, Google Drive, TikTok and direct MP4 links',
    form_section_basic:'Basic info',form_title_label:'Title *',form_title_ph:'e.g. Mountain vacation',
    form_desc_label:'Description',form_desc_ph:'Describe the video...',
    form_link_label:'Video link *',form_link_ph:'YouTube / Google Drive / TikTok / MP4',form_link_hint:'Paste a link — it will be recognized automatically',
    form_thumb_label:'Thumbnail',form_thumb_url_tab:'🔗 URL link',form_thumb_file_tab:'📁 From device',form_thumb_auto_tab:'✨ Auto',
    form_thumb_url_ph:'https://... image link',form_thumb_auto_hint:'The thumbnail will be fetched automatically from YouTube',
    form_duration_label:'Duration',form_duration_ph:'e.g. 5:42 (auto-detected for MP4)',
    form_category_label:'Category',cat_none:'No category',cat_gaming:'🎮 Gaming',cat_music:'🎵 Music',cat_sport:'⚽ Sports',
    cat_vlog:'📹 Vlog',cat_tutorial:'📚 Tutorial',cat_humor:'😂 Comedy',cat_travel:'✈️ Travel',cat_other:'📌 Other',
    form_tags_label:'Tags (optional)',form_tags_ph:'e.g. gaming, vlog, music (comma separated)',form_tags_hint:'Tags help people find your video',
    form_section_details:'Details',form_lang_label:'Video language',form_license_label:'License',
    license_standard:'Standard WaveTube license',license_cc:'Creative Commons — Attribution',
    form_premiere_label:'Premiere date (optional)',form_premiere_hint:'Leave empty to publish right away. Set a date to schedule a premiere.',
    form_short_title:'This is a Short (max. 1 minute)',form_short_desc:'Shorts are shown separately in vertical format, like TikTok',
    form_section_visibility:'Public visibility',
    vis_public_title:'Public',vis_public_desc:'Visible to everyone — on the homepage, in search and trending',
    vis_unlisted_title:'Unlisted',vis_unlisted_desc:'Doesn\'t appear in any listing — only viewable with a direct link',
    vis_private_title:'Private',vis_private_desc:'Only you (and the admin) can see it — not even a direct link works for anyone else',
    form_comments_label:'Enable comments',form_likes_label:'Show like count',form_hideviews_label:'Hide view count (publicly)',
    form_kids_label:'Content made for kids',form_age_label:'Age restriction (18+)',
    form_submit_btn:'Publish video',form_publishing_btn:'Publishing...',form_need_title_url:'Enter a title and a link!',
    hint_paste_link:'Paste a link — it will be recognized automatically',
    hint_gdrive:'✅ <b style="color:#1a73e8">Google Drive</b> — make sure the file is public',
    hint_mp4_detecting:'✅ <b style="color:#188038">MP4</b> — detecting duration...',hint_unknown_format:'⚠️ Unrecognized format',hint_mp4_detected:'✅ <b style="color:#188038">MP4</b> — duration detected automatically',
    settings_allow_msg:'✉️ Allow others to message me',settings_allow_msg_desc:'When off, no one can start a new conversation with you in Messages.',toast_msg_disabled:'This user has disabled messages',
    announce_load_error:'Failed to load announcements',announce_empty:'No announcements',announce_empty_sub:'Messages from the WaveTube creator will appear here'
  },
  ru:{
    nav_home:'Главная',nav_shorts:'Shorts',nav_trending:'В тренде',nav_you:'Вы',
    nav_mychannel:'Мой канал',nav_subs:'Мои подписки',nav_history:'История просмотров',
    nav_messages:'Сообщения',nav_subscriptions:'Подписки',nav_announcements:'Объявления',nav_saved:'Сохранённые',nav_watchlater:'Посмотреть позже',
    nav_findbug:'Найти баг',findbug_title:'Найти баг',findbug_desc:'Нашли баг или дыру в безопасности? Напишите нам!',findbug_reward:'Опишите найденный баг или уязвимость и отправьте нам письмо. Если сообщение окажется реальным — вы получите награду! 🎁',findbug_copy_btn:'Копировать адрес почты',findbug_copied_toast:'Адрес почты скопирован!',
    credits_code_label:'Код',credits_lead_label:'Руководит проектом',vip_since_label:'с',
    search_placeholder:'Поиск видео...',btn_add_video:'+ Добавить видео',
    dd_mychannel:'Мой канал',dd_settings:'Настройки',dd_logout:'Выйти',
    btn_subscribe:'Подписаться',btn_subscribed:'Вы подписаны',btn_share:'Поделиться',
    btn_download:'Скачать',btn_support:'Поддержать автора',btn_report:'Пожаловаться',
    comments_label:'Комментарии',comment_placeholder:'Напишите комментарий...',comments_label_zero:'Комментарии (0)',
    btn_send:'Отправить',btn_cancel:'Отмена',btn_reply:'Ответить',
    sort_top:'По значимости',sort_newest:'Сначала новые',
    settings_title:'Настройки',settings_nick:'Ваш никнейм',settings_lang:'Язык',
    btn_save:'Сохранить',btn_close:'Закрыть',btn_publish:'Опубликовать',
    tab_videos:'Видео',tab_shorts:'Shorts',tab_posts:'Посты',subscribers_label:'подписчиков',videos_label:'видео',your_channel_label:'Это ваш канал',
    login_google:'Войти',logged_in_as:'Вы вошли как',
    ch_default_name:'Канал',ch_change_banner:'Изменить баннер',ch_message:'Сообщение',ch_stats:'Статистика',
    ch_add_desc:'+ Добавить описание канала',ch_no_videos:'На этом канале пока нет видео',
    ch_no_shorts:'На этом канале нет Shorts',ch_comments_suffix:'комментариев',ch_comments_off:'Комментарии отключены',
    ch_premiere:'Премьера',toast_unsubscribed:'Подписка отменена',toast_subscribing:'Вы подписались на',ch_joined:'Дата регистрации:',ch_set_country:'Указать страну канала',
    settings_country:'Страна канала',settings_country_desc:'Отображается публично на вашем канале.',
    desc_placeholder:'Описание канала...',desc_saved_toast:'Описание сохранено! ✅',
    posts_loading:'⏳ Загрузка постов...',posts_add_btn:'+ Добавить пост',posts_none:'На этом канале нет постов',
    post_delete_title:'Удалить пост',post_comment_ph:'Комментарий...',post_login_comment:'Войдите, чтобы комментировать',
    post_login_vote:'Войдите, чтобы голосовать',post_login_vote_toast:'Войдите, чтобы проголосовать!',
    vote_singular:'голос',vote_plural:'голосов',anonim:'Аноним',
    toast_login_generic:'Войдите!',confirm_delete_post:'Удалить пост?',confirm_irreversible:'Это действие необратимо.',
    toast_max_images:'Максимум 6 фото на пост',
    post_poll_question_missing:'Введите вопрос опроса!',post_poll_min_options:'Добавьте минимум 2 варианта!',
    post_empty_error:'Напишите что-нибудь, добавьте фото или опрос!',post_publishing:'Публикация...',
    post_rate_limit:'Слишком много постов подряд — подождите немного 🐢',post_new_notification:'опубликовал новый пост 📝',
    post_published_toast:'Пост опубликован! 📝',
    post_modal_title:'📝 Новый пост',post_text_label:'Текст',post_text_placeholder:'Что хотите написать?',
    post_images_label:'Фото (необязательно, макс. 6)',post_add_poll:'📊 Добавить опрос',
    post_poll_question_ph:'Задайте вопрос...',post_add_option:'+ Добавить вариант',
    post_poll_option_ph:'Вариант',post_poll_max_options:'Максимум 4 варианта',
    page_shorts:'Shorts',page_my_subs:'Мои подписки',page_saved:'💾 Сохранённые видео',
    page_watchlater:'⏰ Посмотреть позже',page_announcements:'📢 Объявления от автора',
    page_trending:'🔥 В тренде',page_history:'История просмотров',btn_clear:'Очистить',
    saved_login:'Войдите, чтобы сохранять видео',saved_empty:'Нет сохранённых видео',
    saved_empty_sub:'Нажмите ⋮ на видео и выберите "Сохранить"',
    wl_login:'Войдите, чтобы использовать "Посмотреть позже"',wl_empty:'Нет видео для просмотра позже',
    wl_empty_sub:'Нажмите ⋮ на видео и выберите "Посмотреть позже"',
    wl_login_toast:'Войдите, чтобы добавлять в "Посмотреть позже"!',wl_removed_toast:'Удалено из "Посмотреть позже"',wl_added_toast:'Добавлено в "Посмотреть позже" ⏰',
    save_label:'Сохранить',save_added_label:'Сохранено',wl_label:'Посмотреть позже',wl_added_label:'В очереди',
    notifications_title:'Уведомления',notif_empty:'Нет уведомлений',notif_clear_empty_toast:'Нет уведомлений для очистки',
    history_login:'Войдите, чтобы увидеть историю просмотров',history_empty:'История просмотров пуста',
    history_empty_sub:'Видео, которые вы смотрите, появятся здесь',watched_at_label:'Просмотрено',
    confirm_clear_history:'Очистить историю просмотров?',confirm_clear_history_sub:'Вся история просмотренных видео будет удалена.',
    toast_history_cleared:'История очищена!',
    subs_empty:'Вы пока ни на кого не подписаны!',subs_empty_sub:'Зайдите на чей-нибудь канал и нажмите Подписаться',
    subs_no_videos:'Нет видео от каналов, на которые вы подписаны',
    msg_conversations:'Беседы',msg_new_btn:'+ Новая',msg_pick_conv:'Выберите беседу или начните новую',msg_retention_note:'🕒 Чат очищается каждые 30 дней',
    msg_no_convs:'Нет бесед.',msg_no_convs_sub:'Зайдите на чей-нибудь канал и нажмите ✉️ Сообщение',
    msg_placeholder:'Напишите сообщение...',confirm_delete_conv:'Удалить эту беседу?',confirm_delete_conv_sub:'Все сообщения будут безвозвратно удалены.',toast_chat_deleted:'Чат удалён 🗑',
    feed_all_videos:'Все видео',feed_no_results:'Нет результатов',feed_no_videos:'Нет видео',feed_results_for:'Результаты',
    filter_all_categories:'📂 Все категории',filter_any_length:'⏱ Любая длительность',
    filter_short:'Короткие (до 4 мин)',filter_medium:'Средние (4–20 мин)',filter_long:'Длинные (более 20 мин)',
    filter_newest:'🆕 Сначала новые',filter_oldest:'Сначала старые',filter_popular:'🔥 Популярные',filter_liked:'👍 По лайкам',
    settings_autoplay:'▶️ Автовоспроизведение следующего видео',settings_autoplay_desc:'После окончания видео автоматически начнётся следующее.',
    autoplay_next_video:'Следующее видео',autoplay_play_now:'Смотреть сейчас',
    form_title:'🎬 Добавить видео',form_subtitle:'YouTube, Google Диск, TikTok и прямые ссылки MP4',
    form_section_basic:'Основная информация',form_title_label:'Название *',form_title_ph:'напр. Отпуск в горах',
    form_desc_label:'Описание',form_desc_ph:'Опишите видео...',
    form_link_label:'Ссылка на видео *',form_link_ph:'YouTube / Google Диск / TikTok / MP4',form_link_hint:'Вставьте ссылку — она будет распознана автоматически',
    form_thumb_label:'Миниатюра',form_thumb_url_tab:'🔗 Ссылка URL',form_thumb_file_tab:'📁 С диска',form_thumb_auto_tab:'✨ Авто',
    form_thumb_url_ph:'https://... ссылка на изображение',form_thumb_auto_hint:'Миниатюра будет загружена автоматически с YouTube',
    form_duration_label:'Продолжительность',form_duration_ph:'напр. 5:42 (для MP4 определим автоматически)',
    form_category_label:'Категория',cat_none:'Без категории',cat_gaming:'🎮 Игры',cat_music:'🎵 Музыка',cat_sport:'⚽ Спорт',
    cat_vlog:'📹 Влог',cat_tutorial:'📚 Обучение',cat_humor:'😂 Юмор',cat_travel:'✈️ Путешествия',cat_other:'📌 Другое',
    form_tags_label:'Теги (необязательно)',form_tags_ph:'напр. игры, влог, музыка (через запятую)',form_tags_hint:'Теги помогают людям найти ваше видео',
    form_section_details:'Подробности',form_lang_label:'Язык видео',form_license_label:'Лицензия',
    license_standard:'Стандартная лицензия WaveTube',license_cc:'Creative Commons — с указанием авторства',
    form_premiere_label:'Дата премьеры (необязательно)',form_premiere_hint:'Оставьте пустым, чтобы опубликовать сразу. Укажите дату, чтобы запланировать премьеру.',
    form_short_title:'Это Short (макс. 1 минута)',form_short_desc:'Shorts отображаются отдельно в вертикальном формате, как в TikTok',
    form_section_visibility:'Публичная видимость',
    vis_public_title:'Публичное',vis_public_desc:'Видно всем — на главной странице, в поиске и в трендах',
    vis_unlisted_title:'Доступ по ссылке (unlisted)',vis_unlisted_desc:'Не появляется ни в одном списке — увидит только тот, у кого есть прямая ссылка',
    vis_private_title:'Приватное',vis_private_desc:'Видите только вы (и администратор) — даже по ссылке никто другой не откроет',
    form_comments_label:'Включить комментарии',form_likes_label:'Показывать количество лайков',form_hideviews_label:'Скрыть количество просмотров (публично)',
    form_kids_label:'Контент для детей',form_age_label:'Возрастное ограничение (18+)',
    form_submit_btn:'Опубликовать видео',form_publishing_btn:'Публикация...',form_need_title_url:'Укажите название и ссылку!',
    hint_paste_link:'Вставьте ссылку — она будет распознана автоматически',
    hint_gdrive:'✅ <b style="color:#1a73e8">Google Диск</b> — убедитесь, что файл публичный',
    hint_mp4_detecting:'✅ <b style="color:#188038">MP4</b> — определяю длительность...',hint_unknown_format:'⚠️ Формат не распознан',hint_mp4_detected:'✅ <b style="color:#188038">MP4</b> — длительность определена автоматически',
    settings_allow_msg:'✉️ Разрешить другим писать мне',settings_allow_msg_desc:'Если выключено, никто не сможет начать с вами новый разговор в Сообщениях.',toast_msg_disabled:'Этот пользователь отключил возможность писать ему',
    announce_load_error:'Не удалось загрузить объявления',announce_empty:'Нет объявлений',announce_empty_sub:'Здесь появятся сообщения от автора WaveTube'
  }
};

function t(key){
  const lang=getLang();
  return(TRANSLATIONS[lang]&&TRANSLATIONS[lang][key])||TRANSLATIONS.pl[key]||key;
}

function getLang(){return localStorage.getItem('wt_lang')||'en';}

function applyTranslations(){
  const lang=getLang();
  const dict=TRANSLATIONS[lang]||TRANSLATIONS.pl;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(dict[key])el.textContent=dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key=el.getAttribute('data-i18n-placeholder');
    if(dict[key])el.placeholder=dict[key];
  });
}

function openSettingsModal(){
  document.getElementById('settings-modal').classList.add('open');
  const nickField=document.getElementById('settings-nick-inp')?.closest('.field');
  if(currentUser){
    if(nickField)nickField.style.display='block';
    const inp=document.getElementById('settings-nick-inp');
    if(inp)inp.value=getMyDisplayName()||'';
  } else if(nickField){
    nickField.style.display='none';
  }
  const countryField=document.getElementById('settings-country-sel')?.closest('.field');
  if(currentUser){
    if(countryField)countryField.style.display='block';
    loadMyCountryIntoSettings();
  } else if(countryField){
    countryField.style.display='none';
  }
  updateLangButtons();
  updateThemeButtons();
  syncAutoplayToggleUI();
  loadAllowMsgIntoSettings();
}

async function loadMyCountryIntoSettings(){
  const sel=document.getElementById('settings-country-sel');
  if(!sel)return;
  const sorted=[...COUNTRIES].sort((a,b)=>countryName(a[0]).localeCompare(countryName(b[0]),getLang()==='ru'?'ru':'pl'));
  sel.innerHTML=`<option value="">— ${getLang()==='ru'?'не указано':'nie podano'} —</option>`+
    sorted.map(c=>`<option value="${c[0]}">${flagEmoji(c[0])} ${countryName(c[0])}</option>`).join('');
  const{data}=await sb.from('profiles').select('country').eq('id',currentUser.id).single();
  sel.value=data?.country||'';
}

async function saveMyCountry(){
  if(!currentUser)return;
  const sel=document.getElementById('settings-country-sel');
  const country=sel.value;
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,country}],{onConflict:'id'});
  if(error){toast('Błąd: '+error.message);return;}
  toast(country?'Kraj zapisany! 🌍':'Kraj usunięty');
}

function closeSettingsModal(){
  document.getElementById('settings-modal').classList.remove('open');
}

async function saveMySettingsNick(){
  if(!currentUser)return;
  const newNick=document.getElementById('settings-nick-inp').value.trim();
  if(!newNick){toast('Wpisz nick');return;}
  if(newNick.length>30){toast('Nick może mieć max 30 znaków!');return;}
  const{error:authErr}=await sb.auth.updateUser({data:{full_name:newNick}});
  if(authErr){toast('Błąd: '+authErr.message);return;}
  const{error}=await sb.from('profiles').upsert([{id:currentUser.id,name:newNick}],{onConflict:'id'});
  if(error){toast('Błąd zapisu: '+error.message);return;}
  myDisplayNick=newNick;
  profileCache[currentUser.id]={...(profileCache[currentUser.id]||{id:currentUser.id,avatar:currentUser.user_metadata?.avatar_url||'',email:currentUser.email||''}),name:newNick};
  toast('Nick zmieniony! ✏️');
  updateAuthUI();
}

