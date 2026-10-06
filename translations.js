// ============ translations.js — słownik PL/EN/RU + i18n ============

// ── JĘZYK / i18n ─────────────────────────────────────────────────────────
const TRANSLATIONS={
  pl:{
    nav_home:'Strona główna',nav_shorts:'Shorts',nav_trending:'Popularne',nav_you:'Ty',
    nav_mychannel:'Mój kanał',nav_subs:'Moje subskrypcje',nav_history:'Historia oglądania',
    nav_messages:'Wiadomości',nav_subscriptions:'Subskrypcje',nav_announcements:'Ogłoszenia',nav_saved:'Zapisane filmy',nav_watchlater:'Obejrzę później',
    nav_findbug:'Znajdź bug',nav_support:'Wesprzyj WaveTube',findbug_title:'Znajdź bug',
    support_title:'Wesprzyj autora WaveTube',support_desc:'Podoba Ci się aplikacja? Możesz postawić autorowi coś fajnego.',support_steam_desc:'🎮 Wyślij ofertę wymiany (trade) na Steam — każde wsparcie motywuje do dalszej rozbudowy WaveTube!',support_steam_btn:'🎮 Wyślij trade na Steam',findbug_desc:'Znalazłeś błąd albo dziurę w bezpieczeństwie? Napisz do nas!',findbug_reward:'Opisz znaleziony bug lub lukę bezpieczeństwa i wyślij nam maila. Jeśli zgłoszenie okaże się prawdziwe — dostaniesz nagrodę! 🎁',findbug_copy_btn:'Kopiuj adres e-mail',findbug_copied_toast:'Skopiowano adres e-mail!',
    credits_code_label:'Kod',credits_lead_label:'Prowadzi projekt',vip_since_label:'od',
    banner_crop_title:'Podgląd banera',banner_crop_sub:'Tak będzie wyglądać Twój baner. Przeciągnij zdjęcie żeby ustawić kadr.',
    search_placeholder:'Szukaj filmów...',btn_add_video:'+ Dodaj film',
    dd_mychannel:'Mój kanał',dd_settings:'Ustawienia',dd_add_account:'Dodaj inne konto',terms_welcome_title:'👋 Witaj w WaveTube',terms_welcome_sub:'Zanim zaczniesz korzystać z aplikacji, zapoznaj się z zasadami i je zaakceptuj.',terms_agree_prefix:'Zgadzam się z',terms_agree_link:'zasadami WaveTube',terms_continue:'Kontynuuj',terms_modal_title:'📜 Zasady WaveTube',dd_shortcuts:'Skróty klawiszowe',shortcuts_title:'⌨️ Skróty klawiszowe',sc_player:'Odtwarzacz wideo',sc_playpause:'Odtwórz / pauza',sc_seek:'Przewiń o 5 sekund',sc_volume:'Głośność +/- 5%',sc_mute:'Wycisz / włącz dźwięk',sc_fullscreen:'Pełny ekran',sc_general:'Ogólne',sc_close:'Zamknij okno / odtwarzacz',sc_lightbox:'Poprzednie / następne zdjęcie w podglądzie',sc_shortcuts:'Pokaż skróty klawiszowe',sc_messages:'Wiadomości',sc_send:'Wyślij wiadomość',sc_newline:'Nowa linia',dd_logout:'Wyloguj',
    btn_subscribe:'Subskrybuj',btn_subscribed:'Subskrybujesz',btn_share:'Udostępnij',
    btn_download:'Pobierz',btn_support:'Wesprzyj autora',btn_report:'Zgłoś',
    comments_label:'Komentarze',comment_placeholder:'Napisz komentarz...',comments_label_zero:'Komentarze (0)',
    btn_send:'Wyślij',btn_cancel:'Anuluj',btn_reply:'Odpowiedz',
    sort_top:'Najtrafniejsze',sort_newest:'Najnowsze',
    settings_title:'Ustawienia',settings_nick:'Twój nick',settings_lang:'Język',
    btn_save:'Zapisz',btn_close:'Zamknij',btn_publish:'Opublikuj',btn_add:'Dodaj',btn_copy:'Kopiuj',menu_buy_vip:'Kup panel VIP 💎',buy_vip_title:'Kup panel VIP',buy_vip_desc:'Panel VIP odblokowuje kolor nicku, ramkę avatara, cząsteczki wokół avatara, plakietkę VIP i inne ozdobniki na Twoim kanale.',buy_vip_instructions:'☕ Wesprzyj przez Buy Me a Coffee, a w polu wiadomości/notatki przy wpłacie koniecznie wpisz e-mail, na który jesteś zalogowany/a w WaveTube — inaczej nie będziemy wiedzieć, komu przyznać VIP.',buy_vip_email_label:'Twój e-mail:',btn_buy_vip_coffee:'☕ Przejdź do Buy Me a Coffee',
    tab_videos:'Filmy',tab_shorts:'Shorts',tab_posts:'Posty',subscribers_label:'subskrybentów',videos_label:'filmów',your_channel_label:'To Twój kanał',
    login_google:'Zaloguj się',logged_in_as:'Zalogowano jako',
    ch_default_name:'Kanał',ch_change_banner:'Zmień baner',ch_message:'Wiadomość',ch_stats:'Statystyki',
    stats_title:'📊 Statystyki kanału',stats_sub:'Podgląd tylko dla Ciebie — widoczne wyłącznie na Twoim koncie.',
    stats_views:'Wyświetlenia',stats_likes:'Polubienia',stats_subs:'Subskrybenci',stats_videos:'Filmy',stats_comments:'Komentarze',
    stats_avg_views:'Śr. wyświetleń/film',stats_engagement:'Zaangażowanie',stats_dislikes:'Dislajki',stats_saved:'Zapisano',stats_watchlater:'Obejrzę później',
    stats_sub_growth:'📈 Wzrost subskrybentów (skumulowany)',stats_top_videos:'🏆 Najpopularniejsze filmy',stats_no_videos:'Brak filmów',
    stats_longs_vs_shorts:'🎞️ Filmy vs Shorts',stats_by_category:'📂 Wyświetlenia wg kategorii',stats_no_data:'Brak danych',
    stats_by_month:'🗓️ Publikacje wg miesiąca',stats_posts_section:'📝 Posty',stats_posts:'Posty',stats_post_likes:'Polubienia postów',stats_post_comments:'Komentarze pod postami',
    stats_no_title:'Bez tytułu',stats_no_category:'Bez kategorii',
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
    nav_playlists:'Playlisty',page_playlists:'Playlisty',playlist_picker_title:'Dodaj do playlisty',playlist_new_ph:'Nazwa nowej playlisty',
    playlist_empty:'Nie masz jeszcze żadnej playlisty',playlist_empty_sub:'Dodaj film do nowej playlisty przyciskiem ➕ pod filmem',playlist_login:'Zaloguj się żeby zobaczyć swoje playlisty',
    playlist_add_label:'Dodaj do playlisty',playlist_videos_count:'filmów',playlist_created_toast:'Utworzono playlistę',playlist_deleted_toast:'Usunięto playlistę',
    playlist_delete_confirm:'Usunąć tę playlistę?',playlist_added_toast:'Dodano do playlisty',playlist_removed_toast:'Usunięto z playlisty',playlist_new_name_needed:'Podaj nazwę playlisty',
    playlist_remove_from_this:'Usuń z tej playlisty',
    notifications_title:'Powiadomienia',notif_empty:'Brak powiadomień',notif_clear_empty_toast:'Brak powiadomień do wyczyszczenia',
    history_login:'Zaloguj się żeby zobaczyć historię oglądania',history_empty:'Brak historii oglądania',
    history_empty_sub:'Filmy które oglądasz pojawią się tutaj',watched_at_label:'Oglądano',
    confirm_clear_history:'Wyczyścić historię oglądania?',confirm_clear_history_sub:'Cała historia obejrzanych filmów zostanie usunięta.',
    confirm_cancel:'Anuluj',confirm_delete_default:'Usuń',btn_more:'...więcej',btn_less:'mniej',
    form_moderating_btn:'Sprawdzanie...',toast_nsfw_blocked:'⚠️ Miniaturka wygląda na nieodpowiednią (18+/nagość) i nie może zostać opublikowana.',
    confirm_clear_notifications:'Wyczyścić powiadomienia?',confirm_clear_notifications_sub:'Wszystkie powiadomienia zostaną usunięte.',
    toast_history_cleared:'Historia wyczyszczona!',
    subs_empty:'Nie subskrybujesz jeszcze nikogo!',subs_empty_sub:'Wejdź na czyjś kanał i kliknij Subskrybuj',
    subs_no_videos:'Brak filmów od subskrybowanych kanałów',
    msg_conversations:'Konwersacje',msg_new_btn:'+ Nowa',msg_pick_conv:'Wybierz konwersację lub zacznij nową',msg_retention_note:'🕒 Czat czyści się co 30 dni',
    call_status_calling:'Dzwonię...',call_status_incoming:'Dzwoni...',call_accept:'Odbierz',call_reject:'Odrzuć',call_hangup:'Rozłącz',call_mute:'Wycisz mikrofon',call_boost:'Głośniej (wzmocnienie)',call_screenshare:'Udostępnij ekran',call_screenshare_stop:'Zatrzymaj udostępnianie',call_quality_good:'Dobre połączenie',call_quality_medium:'Średnie połączenie',call_quality_bad:'Słabe połączenie',call_quality_checking:'Sprawdzanie połączenia...',
    call_rejected_toast:'Połączenie odrzucone',call_busy_toast:'Użytkownik jest zajęty',call_ended_toast:'Połączenie zakończone',call_mic_denied_toast:'Brak dostępu do mikrofonu',call_busy_self_toast:'Masz już aktywne połączenie',
    msg_no_convs:'Brak konwersacji.',msg_no_convs_sub:'Wejdź na czyjś kanał i kliknij ✉️ Wiadomość',
    msg_placeholder:'Napisz wiadomość...',confirm_delete_conv:'Usunąć tę konwersację?',confirm_delete_conv_sub:'Wszystkie wiadomości zostaną trwale usunięte.',toast_chat_deleted:'Czat usunięty 🗑',
    feed_all_videos:'Wszystkie filmy',feed_no_results:'Brak wyników',feed_no_videos:'Brak filmów',feed_results_for:'Wyniki',
    filter_all_categories:'📂 Wszystkie kategorie',filter_any_length:'⏱ Dowolna długość',
    filter_short:'Krótkie (do 4 min)',filter_medium:'Średnie (4–20 min)',filter_long:'Długie (ponad 20 min)',
    filter_newest:'🆕 Najnowsze',filter_oldest:'Najstarsze',filter_popular:'🔥 Najpopularniejsze',filter_liked:'👍 Najwięcej polubień',
    settings_autoplay:'▶️ Autoodtwarzanie następnego filmu',settings_autoplay_desc:'Po skończeniu filmu automatycznie odtworzy się kolejny.',
    autoplay_next_video:'Następny film',autoplay_play_now:'Odtwórz teraz',
    form_title:'🎬 Dodaj film',form_subtitle:'YouTube, Google Drive, TikTok, MEGA, Яндекс.Диск, pCloud i bezpośrednie linki MP4',
    form_section_basic:'Podstawowe informacje',form_title_label:'Tytuł *',form_title_ph:'np. Wakacje w górach',
    form_desc_label:'Opis',form_desc_ph:'Opisz film...',
    form_link_label:'Link do filmu *',form_link_ph:'YouTube / Google Drive / TikTok / MEGA / MP4',form_link_hint:'Wklej link — zostanie automatycznie rozpoznany',
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
    settings_allow_calls:'📞 Zezwalaj innym na dzwonienie do mnie',settings_allow_calls_desc:'Gdy wyłączone, nikt nie zadzwoni do Ciebie w Wiadomościach.',call_disabled_toast:'Ten użytkownik wyłączył możliwość dzwonienia do niego',
    settings_data:'📦 Twoje dane',settings_data_desc:'Pobierz kopię swoich danych z WaveTube (profil, filmy, posty, wiadomości, subskrypcje i inne) w formacie JSON.',settings_data_btn:'⬇️ Pobierz moje dane',settings_data_loading:'Przygotowywanie...',settings_data_done:'Pobrano Twoje dane 📦',
    settings_rules:'📜 Zasady WaveTube',settings_rules_desc:'Regulamin, który zaakceptowałeś/aś przy pierwszym logowaniu.',settings_rules_btn:'📜 Przeczytaj zasady',
    settings_danger:'⚠️ Strefa zagrożenia',settings_delete_desc:'Usunięcie konta jest trwałe i nieodwracalne — stracisz profil, filmy, posty, wiadomości, subskrypcje i cały dostęp. Rozważ najpierw pobranie swoich danych (poniżej).',settings_delete_btn:'🗑️ Usuń konto na stałe',settings_delete_loading:'Usuwanie konta...',settings_delete_done:'Konto zostało usunięte. Żegnamy! 👋',
    confirm_delete_account:'Usunąć konto na stałe?',confirm_delete_account_sub:'Stracisz profil, filmy, posty, komentarze, wiadomości i subskrypcje. Tej operacji nie da się cofnąć.',
    confirm_delete_account_2:'Na pewno? To ostatnia szansa.',confirm_delete_account_2_sub:'Po kliknięciu Twoje konto zostanie usunięte natychmiast i trwale.',confirm_delete_account_final_btn:'Tak, usuń na zawsze',
    announce_load_error:'Nie udało się wczytać ogłoszeń',announce_empty:'Brak ogłoszeń',announce_empty_sub:'Tutaj pojawią się wiadomości od twórcy WaveTube'
  },
  en:{
    nav_home:'Home',nav_shorts:'Shorts',nav_trending:'Trending',nav_you:'You',
    nav_mychannel:'My channel',nav_subs:'My subscriptions',nav_history:'Watch history',
    nav_messages:'Messages',nav_subscriptions:'Subscriptions',nav_announcements:'Announcements',nav_saved:'Saved videos',nav_watchlater:'Watch later',
    nav_findbug:'Find a bug',nav_support:'Support WaveTube',findbug_title:'Find a bug',
    support_title:'Support the WaveTube creator',support_desc:'Like the app? You can treat the creator to something nice.',support_steam_desc:'🎮 Send a Steam trade offer — every bit of support motivates further development of WaveTube!',support_steam_btn:'🎮 Send a Steam trade',findbug_desc:'Found a bug or a security hole? Write to us!',findbug_reward:'Describe the bug or security issue you found and send us an email. If it turns out to be real — you\'ll get a reward! 🎁',findbug_copy_btn:'Copy email address',findbug_copied_toast:'Email address copied!',
    credits_code_label:'Code',credits_lead_label:'Leads the project',vip_since_label:'since',
    banner_crop_title:'Banner preview',banner_crop_sub:'This is how your banner will look. Drag the image to set the crop.',
    search_placeholder:'Search videos...',btn_add_video:'+ Add video',
    dd_mychannel:'My channel',dd_settings:'Settings',dd_add_account:'Add another account',terms_welcome_title:'👋 Welcome to WaveTube',terms_welcome_sub:'Before you start using the app, please read and accept the rules.',terms_agree_prefix:'I agree to the',terms_agree_link:'WaveTube rules',terms_continue:'Continue',terms_modal_title:'📜 WaveTube rules',dd_shortcuts:'Keyboard shortcuts',shortcuts_title:'⌨️ Keyboard shortcuts',sc_player:'Video player',sc_playpause:'Play / pause',sc_seek:'Seek 5 seconds',sc_volume:'Volume +/- 5%',sc_mute:'Mute / unmute',sc_fullscreen:'Full screen',sc_general:'General',sc_close:'Close window / player',sc_lightbox:'Previous / next photo in viewer',sc_shortcuts:'Show keyboard shortcuts',sc_messages:'Messages',sc_send:'Send message',sc_newline:'New line',dd_logout:'Sign out',
    btn_subscribe:'Subscribe',btn_subscribed:'Subscribed',btn_share:'Share',
    btn_download:'Download',btn_support:'Support creator',btn_report:'Report',
    comments_label:'Comments',comment_placeholder:'Add a comment...',comments_label_zero:'Comments (0)',
    btn_send:'Send',btn_cancel:'Cancel',btn_reply:'Reply',
    sort_top:'Top comments',sort_newest:'Newest first',
    settings_title:'Settings',settings_nick:'Your nickname',settings_lang:'Language',
    btn_save:'Save',btn_close:'Close',btn_publish:'Publish',btn_add:'Add',btn_copy:'Copy',menu_buy_vip:'Buy VIP panel 💎',buy_vip_title:'Buy VIP panel',buy_vip_desc:'The VIP panel unlocks a name color, avatar frame, particle effects around your avatar, VIP badge and other cosmetics on your channel.',buy_vip_instructions:'☕ Support us on Buy Me a Coffee, and in the message/note field please write the email you use to log in to WaveTube — otherwise we won\'t know who to grant VIP to.',buy_vip_email_label:'Your email:',btn_buy_vip_coffee:'☕ Go to Buy Me a Coffee',
    tab_videos:'Videos',tab_shorts:'Shorts',tab_posts:'Posts',subscribers_label:'subscribers',videos_label:'videos',your_channel_label:'This is your channel',
    login_google:'Sign in',logged_in_as:'Signed in as',
    ch_default_name:'Channel',ch_change_banner:'Change banner',ch_message:'Message',ch_stats:'Stats',
    stats_title:'📊 Channel statistics',stats_sub:'Preview only for you — visible only on your account.',
    stats_views:'Views',stats_likes:'Likes',stats_subs:'Subscribers',stats_videos:'Videos',stats_comments:'Comments',
    stats_avg_views:'Avg. views/video',stats_engagement:'Engagement',stats_dislikes:'Dislikes',stats_saved:'Saved',stats_watchlater:'Watch later',
    stats_sub_growth:'📈 Subscriber growth (cumulative)',stats_top_videos:'🏆 Top videos',stats_no_videos:'No videos',
    stats_longs_vs_shorts:'🎞️ Videos vs Shorts',stats_by_category:'📂 Views by category',stats_no_data:'No data',
    stats_by_month:'🗓️ Uploads by month',stats_posts_section:'📝 Posts',stats_posts:'Posts',stats_post_likes:'Post likes',stats_post_comments:'Comments on posts',
    stats_no_title:'Untitled',stats_no_category:'Uncategorized',
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
    nav_playlists:'Playlists',page_playlists:'Playlists',playlist_picker_title:'Add to playlist',playlist_new_ph:'New playlist name',
    playlist_empty:"You don't have any playlists yet",playlist_empty_sub:'Add a video to a new playlist using the ➕ button under a video',playlist_login:'Sign in to see your playlists',
    playlist_add_label:'Add to playlist',playlist_videos_count:'videos',playlist_created_toast:'Playlist created',playlist_deleted_toast:'Playlist deleted',
    playlist_delete_confirm:'Delete this playlist?',playlist_added_toast:'Added to playlist',playlist_removed_toast:'Removed from playlist',playlist_new_name_needed:'Enter a playlist name',
    playlist_remove_from_this:'Remove from this playlist',
    notifications_title:'Notifications',notif_empty:'No notifications',notif_clear_empty_toast:'No notifications to clear',
    history_login:'Sign in to see your watch history',history_empty:'No watch history',
    history_empty_sub:'Videos you watch will show up here',watched_at_label:'Watched',
    confirm_clear_history:'Clear watch history?',confirm_clear_history_sub:'Your entire watch history will be deleted.',
    confirm_cancel:'Cancel',confirm_delete_default:'Delete',btn_more:'...more',btn_less:'less',
    form_moderating_btn:'Checking...',toast_nsfw_blocked:'⚠️ This thumbnail looks inappropriate (18+/nudity) and can\'t be published.',
    confirm_clear_notifications:'Clear notifications?',confirm_clear_notifications_sub:'All notifications will be deleted.',
    toast_history_cleared:'History cleared!',
    subs_empty:'You\'re not subscribed to anyone yet!',subs_empty_sub:'Visit a channel and click Subscribe',
    subs_no_videos:'No videos from your subscribed channels',
    msg_conversations:'Conversations',msg_new_btn:'+ New',msg_pick_conv:'Select a conversation or start a new one',msg_retention_note:'🕒 Chat clears every 30 days',
    call_status_calling:'Calling...',call_status_incoming:'Incoming call...',call_accept:'Accept',call_reject:'Decline',call_hangup:'Hang up',call_mute:'Mute mic',call_boost:'Louder (boost)',call_screenshare:'Share screen',call_screenshare_stop:'Stop sharing',call_quality_good:'Good connection',call_quality_medium:'Medium connection',call_quality_bad:'Poor connection',call_quality_checking:'Checking connection...',
    call_rejected_toast:'Call declined',call_busy_toast:'User is busy',call_ended_toast:'Call ended',call_mic_denied_toast:'No microphone access',call_busy_self_toast:'You already have an active call',
    msg_no_convs:'No conversations.',msg_no_convs_sub:'Visit someone\'s channel and click ✉️ Message',
    msg_placeholder:'Type a message...',confirm_delete_conv:'Delete this conversation?',confirm_delete_conv_sub:'All messages will be permanently deleted.',toast_chat_deleted:'Chat deleted 🗑',
    feed_all_videos:'All videos',feed_no_results:'No results',feed_no_videos:'No videos',feed_results_for:'Results',
    filter_all_categories:'📂 All categories',filter_any_length:'⏱ Any length',
    filter_short:'Short (under 4 min)',filter_medium:'Medium (4–20 min)',filter_long:'Long (over 20 min)',
    filter_newest:'🆕 Newest',filter_oldest:'Oldest',filter_popular:'🔥 Most popular',filter_liked:'👍 Most liked',
    settings_autoplay:'▶️ Autoplay next video',settings_autoplay_desc:'The next video will start automatically when this one ends.',
    autoplay_next_video:'Next video',autoplay_play_now:'Play now',
    form_title:'🎬 Add video',form_subtitle:'YouTube, Google Drive, TikTok, MEGA, Yandex.Disk, pCloud and direct MP4 links',
    form_section_basic:'Basic info',form_title_label:'Title *',form_title_ph:'e.g. Mountain vacation',
    form_desc_label:'Description',form_desc_ph:'Describe the video...',
    form_link_label:'Video link *',form_link_ph:'YouTube / Google Drive / TikTok / MEGA / MP4',form_link_hint:'Paste a link — it will be recognized automatically',
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
    settings_allow_calls:'📞 Allow others to call me',settings_allow_calls_desc:'When off, no one can call you in Messages.',call_disabled_toast:'This user has disabled calls',
    settings_data:'📦 Your data',settings_data_desc:'Download a copy of your WaveTube data (profile, videos, posts, messages, subscriptions and more) as JSON.',settings_data_btn:'⬇️ Download my data',settings_data_loading:'Preparing...',settings_data_done:'Your data has been downloaded 📦',
    settings_rules:'📜 WaveTube rules',settings_rules_desc:'The rules you accepted when you first signed in.',settings_rules_btn:'📜 Read the rules',
    settings_danger:'⚠️ Danger zone',settings_delete_desc:'Deleting your account is permanent and irreversible — you\'ll lose your profile, videos, posts, messages, subscriptions and all access. Consider downloading your data first (below).',settings_delete_btn:'🗑️ Delete account permanently',settings_delete_loading:'Deleting account...',settings_delete_done:'Your account has been deleted. Goodbye! 👋',
    confirm_delete_account:'Delete your account permanently?',confirm_delete_account_sub:'You\'ll lose your profile, videos, posts, comments, messages and subscriptions. This cannot be undone.',
    confirm_delete_account_2:'Are you sure? This is your last chance.',confirm_delete_account_2_sub:'Once you click, your account will be deleted immediately and permanently.',confirm_delete_account_final_btn:'Yes, delete forever',
    announce_load_error:'Failed to load announcements',announce_empty:'No announcements',announce_empty_sub:'Messages from the WaveTube creator will appear here'
  },
  ru:{
    nav_home:'Главная',nav_shorts:'Shorts',nav_trending:'В тренде',nav_you:'Вы',
    nav_mychannel:'Мой канал',nav_subs:'Мои подписки',nav_history:'История просмотров',
    nav_messages:'Сообщения',nav_subscriptions:'Подписки',nav_announcements:'Объявления',nav_saved:'Сохранённые',nav_watchlater:'Посмотреть позже',
    nav_findbug:'Найти баг',nav_support:'Поддержать WaveTube',findbug_title:'Найти баг',
    support_title:'Поддержать автора WaveTube',support_desc:'Нравится приложение? Можешь угостить автора чем-нибудь приятным.',support_steam_desc:'🎮 Отправь обмен (trade) в Steam — любая поддержка мотивирует развивать WaveTube дальше!',support_steam_btn:'🎮 Отправить trade в Steam',findbug_desc:'Нашли баг или дыру в безопасности? Напишите нам!',findbug_reward:'Опишите найденный баг или уязвимость и отправьте нам письмо. Если сообщение окажется реальным — вы получите награду! 🎁',findbug_copy_btn:'Копировать адрес почты',findbug_copied_toast:'Адрес почты скопирован!',
    credits_code_label:'Код',credits_lead_label:'Руководит проектом',vip_since_label:'с',
    banner_crop_title:'Предпросмотр баннера',banner_crop_sub:'Так будет выглядеть ваш баннер. Перетащите изображение, чтобы задать кадр.',
    search_placeholder:'Поиск видео...',btn_add_video:'+ Добавить видео',
    dd_mychannel:'Мой канал',dd_settings:'Настройки',dd_add_account:'Добавить аккаунт',terms_welcome_title:'👋 Добро пожаловать в WaveTube',terms_welcome_sub:'Перед тем как начать пользоваться приложением, ознакомьтесь с правилами и примите их.',terms_agree_prefix:'Я согласен с',terms_agree_link:'правилами WaveTube',terms_continue:'Продолжить',terms_modal_title:'📜 Правила WaveTube',dd_shortcuts:'Быстрые клавиши',shortcuts_title:'⌨️ Быстрые клавиши',sc_player:'Видеоплеер',sc_playpause:'Воспроизведение / пауза',sc_seek:'Перемотка на 5 секунд',sc_volume:'Громкость +/- 5%',sc_mute:'Выключить / включить звук',sc_fullscreen:'Полный экран',sc_general:'Общие',sc_close:'Закрыть окно / плеер',sc_lightbox:'Предыдущее / следующее фото',sc_shortcuts:'Показать быстрые клавиши',sc_messages:'Сообщения',sc_send:'Отправить сообщение',sc_newline:'Новая строка',dd_logout:'Выйти',
    btn_subscribe:'Подписаться',btn_subscribed:'Вы подписаны',btn_share:'Поделиться',
    btn_download:'Скачать',btn_support:'Поддержать автора',btn_report:'Пожаловаться',
    comments_label:'Комментарии',comment_placeholder:'Напишите комментарий...',comments_label_zero:'Комментарии (0)',
    btn_send:'Отправить',btn_cancel:'Отмена',btn_reply:'Ответить',
    sort_top:'По значимости',sort_newest:'Сначала новые',
    settings_title:'Настройки',settings_nick:'Ваш никнейм',settings_lang:'Язык',
    btn_save:'Сохранить',btn_close:'Закрыть',btn_publish:'Опубликовать',btn_add:'Добавить',btn_copy:'Копировать',menu_buy_vip:'Купить VIP-панель 💎',buy_vip_title:'Купить VIP-панель',buy_vip_desc:'VIP-панель открывает цвет ника, рамку аватара, эффект частиц вокруг аватара, значок VIP и другие украшения на твоём канале.',buy_vip_instructions:'☕ Поддержи через Buy Me a Coffee и обязательно укажи в поле сообщения/заметки email, на который ты зарегистрирован(а) в WaveTube — иначе мы не будем знать, кому выдать VIP.',buy_vip_email_label:'Твой email:',btn_buy_vip_coffee:'☕ Перейти на Buy Me a Coffee',
    tab_videos:'Видео',tab_shorts:'Shorts',tab_posts:'Посты',subscribers_label:'подписчиков',videos_label:'видео',your_channel_label:'Это ваш канал',
    login_google:'Войти',logged_in_as:'Вы вошли как',
    ch_default_name:'Канал',ch_change_banner:'Изменить баннер',ch_message:'Сообщение',ch_stats:'Статистика',
    stats_title:'📊 Статистика канала',stats_sub:'Видно только Вам — доступно только на Вашем аккаунте.',
    stats_views:'Просмотры',stats_likes:'Лайки',stats_subs:'Подписчики',stats_videos:'Видео',stats_comments:'Комментарии',
    stats_avg_views:'Ср. просмотров/видео',stats_engagement:'Вовлечённость',stats_dislikes:'Дизлайки',stats_saved:'Сохранено',stats_watchlater:'Посмотреть позже',
    stats_sub_growth:'📈 Рост подписчиков (накопительный)',stats_top_videos:'🏆 Популярные видео',stats_no_videos:'Нет видео',
    stats_longs_vs_shorts:'🎞️ Видео vs Shorts',stats_by_category:'📂 Просмотры по категориям',stats_no_data:'Нет данных',
    stats_by_month:'🗓️ Публикации по месяцам',stats_posts_section:'📝 Посты',stats_posts:'Посты',stats_post_likes:'Лайки постов',stats_post_comments:'Комментарии к постам',
    stats_no_title:'Без названия',stats_no_category:'Без категории',
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
    nav_playlists:'Плейлисты',page_playlists:'Плейлисты',playlist_picker_title:'Добавить в плейлист',playlist_new_ph:'Название нового плейлиста',
    playlist_empty:'У вас пока нет плейлистов',playlist_empty_sub:'Добавьте видео в новый плейлист кнопкой ➕ под видео',playlist_login:'Войдите, чтобы увидеть свои плейлисты',
    playlist_add_label:'Добавить в плейлист',playlist_videos_count:'видео',playlist_created_toast:'Плейлист создан',playlist_deleted_toast:'Плейлист удалён',
    playlist_delete_confirm:'Удалить этот плейлист?',playlist_added_toast:'Добавлено в плейлист',playlist_removed_toast:'Удалено из плейлиста',playlist_new_name_needed:'Введите название плейлиста',
    playlist_remove_from_this:'Удалить из этого плейлиста',
    notifications_title:'Уведомления',notif_empty:'Нет уведомлений',notif_clear_empty_toast:'Нет уведомлений для очистки',
    history_login:'Войдите, чтобы увидеть историю просмотров',history_empty:'История просмотров пуста',
    history_empty_sub:'Видео, которые вы смотрите, появятся здесь',watched_at_label:'Просмотрено',
    confirm_clear_history:'Очистить историю просмотров?',confirm_clear_history_sub:'Вся история просмотренных видео будет удалена.',
    confirm_cancel:'Отмена',confirm_delete_default:'Удалить',btn_more:'...ещё',btn_less:'скрыть',
    form_moderating_btn:'Проверка...',toast_nsfw_blocked:'⚠️ Эта миниатюра выглядит неприемлемой (18+/нагота) и не может быть опубликована.',
    confirm_clear_notifications:'Очистить уведомления?',confirm_clear_notifications_sub:'Все уведомления будут удалены.',
    toast_history_cleared:'История очищена!',
    subs_empty:'Вы пока ни на кого не подписаны!',subs_empty_sub:'Зайдите на чей-нибудь канал и нажмите Подписаться',
    subs_no_videos:'Нет видео от каналов, на которые вы подписаны',
    msg_conversations:'Беседы',msg_new_btn:'+ Новая',msg_pick_conv:'Выберите беседу или начните новую',msg_retention_note:'🕒 Чат очищается каждые 30 дней',
    call_status_calling:'Звоним...',call_status_incoming:'Входящий звонок...',call_accept:'Принять',call_reject:'Отклонить',call_hangup:'Завершить',call_mute:'Выключить микрофон',call_boost:'Громче (усиление)',call_screenshare:'Демонстрация экрана',call_screenshare_stop:'Остановить показ',call_quality_good:'Хорошее соединение',call_quality_medium:'Среднее соединение',call_quality_bad:'Плохое соединение',call_quality_checking:'Проверка соединения...',
    call_rejected_toast:'Звонок отклонён',call_busy_toast:'Пользователь занят',call_ended_toast:'Звонок завершён',call_mic_denied_toast:'Нет доступа к микрофону',call_busy_self_toast:'У вас уже есть активный звонок',
    msg_no_convs:'Нет бесед.',msg_no_convs_sub:'Зайдите на чей-нибудь канал и нажмите ✉️ Сообщение',
    msg_placeholder:'Напишите сообщение...',confirm_delete_conv:'Удалить эту беседу?',confirm_delete_conv_sub:'Все сообщения будут безвозвратно удалены.',toast_chat_deleted:'Чат удалён 🗑',
    feed_all_videos:'Все видео',feed_no_results:'Нет результатов',feed_no_videos:'Нет видео',feed_results_for:'Результаты',
    filter_all_categories:'📂 Все категории',filter_any_length:'⏱ Любая длительность',
    filter_short:'Короткие (до 4 мин)',filter_medium:'Средние (4–20 мин)',filter_long:'Длинные (более 20 мин)',
    filter_newest:'🆕 Сначала новые',filter_oldest:'Сначала старые',filter_popular:'🔥 Популярные',filter_liked:'👍 По лайкам',
    settings_autoplay:'▶️ Автовоспроизведение следующего видео',settings_autoplay_desc:'После окончания видео автоматически начнётся следующее.',
    autoplay_next_video:'Следующее видео',autoplay_play_now:'Смотреть сейчас',
    form_title:'🎬 Добавить видео',form_subtitle:'YouTube, Google Диск, TikTok, MEGA, Яндекс.Диск, pCloud и прямые ссылки MP4',
    form_section_basic:'Основная информация',form_title_label:'Название *',form_title_ph:'напр. Отпуск в горах',
    form_desc_label:'Описание',form_desc_ph:'Опишите видео...',
    form_link_label:'Ссылка на видео *',form_link_ph:'YouTube / Google Диск / TikTok / MEGA / MP4',form_link_hint:'Вставьте ссылку — она будет распознана автоматически',
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
    settings_allow_calls:'📞 Разрешить другим звонить мне',settings_allow_calls_desc:'Если выключено, никто не сможет позвонить вам в Сообщениях.',call_disabled_toast:'Этот пользователь отключил звонки',
    settings_data:'📦 Ваши данные',settings_data_desc:'Скачайте копию своих данных WaveTube (профиль, видео, посты, сообщения, подписки и др.) в формате JSON.',settings_data_btn:'⬇️ Скачать мои данные',settings_data_loading:'Подготовка...',settings_data_done:'Ваши данные скачаны 📦',
    settings_rules:'📜 Правила WaveTube',settings_rules_desc:'Правила, которые вы приняли при первом входе.',settings_rules_btn:'📜 Прочитать правила',
    settings_danger:'⚠️ Опасная зона',settings_delete_desc:'Удаление аккаунта необратимо — вы потеряете профиль, видео, посты, сообщения, подписки и весь доступ. Сначала стоит скачать свои данные (ниже).',settings_delete_btn:'🗑️ Удалить аккаунт навсегда',settings_delete_loading:'Удаление аккаунта...',settings_delete_done:'Ваш аккаунт удалён. Прощайте! 👋',
    confirm_delete_account:'Удалить аккаунт навсегда?',confirm_delete_account_sub:'Вы потеряете профиль, видео, посты, комментарии, сообщения и подписки. Это необратимо.',
    confirm_delete_account_2:'Вы уверены? Это последний шанс передумать.',confirm_delete_account_2_sub:'После клика аккаунт будет удалён немедленно и навсегда.',confirm_delete_account_final_btn:'Да, удалить навсегда',
    announce_load_error:'Не удалось загрузить объявления',announce_empty:'Нет объявлений',announce_empty_sub:'Здесь появятся сообщения от автора WaveTube'
  }
};

const TERMS_CONTENT={
  pl:`<h4>1. Postanowienia ogólne</h4>
<p>Korzystając z WaveTube akceptujesz niniejszy regulamin. Jeśli się z nim nie zgadzasz, nie możesz korzystać z aplikacji. Administrator zastrzega sobie prawo do zmiany regulaminu — o istotnych zmianach poinformujemy w aplikacji.</p>
<h4>2. Konto</h4>
<p>Logujesz się przez konto Google. Odpowiadasz za wszystko, co dzieje się na Twoim koncie i za jego bezpieczeństwo.</p>
<h4>3. Treści i zachowanie</h4>
<p>Zakazane jest publikowanie treści: niezgodnych z prawem, nawołujących do nienawiści lub przemocy, o charakterze pornograficznym lub seksualizującym osoby niepełnoletnie, naruszających prawa autorskie, będących spamem, oraz podszywania się pod inne osoby. Dotyczy to filmów, postów, komentarzy, wiadomości oraz treści przesyłanych podczas rozmów (w tym udostępniania ekranu). W filmach zabronione jest reklamowanie kasyn, zakładów bukmacherskich, hazardu online oraz innych treści z nimi związanych (w tym linków afiliacyjnych/kodów promocyjnych do takich serwisów).</p>
<h4>4. Reklama i promocja</h4>
<p>Na platformie zabronione jest wyświetlanie reklam przerywających odtwarzanie filmu (np. automatycznie wyskakujących reklam, tak jak na YouTube) — WaveTube nie wspiera takiego mechanizmu reklamowego. Dozwolone jest natomiast umieszczenie promocji lub reklamy jako część treści samego filmu przez jego twórcę (np. wzmianka sponsora w filmie) — to leży w gestii twórcy. Zabronione jest też reklamowanie produktów, usług lub innych stron i kanałów w postach, komentarzach oraz wiadomościach bez zgody administratora.</p>
<h4>5. Szacunek do twórcy i administracji</h4>
<p>Zabronione jest wyzywanie, obrażanie i nękanie twórcy, administratorów oraz osób pracujących nad projektem. Dozwolona jest normalna, rzeczowa krytyka aplikacji i jej działania — bez wyzwisk, agresji i pomówień.</p>
<h4>6. Moderacja</h4>
<p>Administrator może usuwać treści naruszające regulamin oraz nakładać bany lub wyciszenia na konta, które go łamią — czasowo lub na stałe, bez wcześniejszego ostrzeżenia w przypadku poważnych naruszeń.</p>
<h4>7. Zgłoszenia</h4>
<p>Możesz zgłaszać posty i inne treści naruszające regulamin przy użyciu funkcji zgłoszeń w aplikacji. Nadużywanie funkcji zgłoszeń (fałszywe zgłoszenia) samo w sobie może skutkować sankcjami.</p>
<h4>8. Panel VIP</h4>
<p>Funkcje VIP są dodatkiem do standardowego konta i nie zwalniają z przestrzegania niniejszego regulaminu.</p>
<h4>9. Prywatność i dane osobowe</h4>
<p>Twój adres e-mail oraz inne dane osobowe (w tym adres IP) są widoczne wyłącznie dla administratora — pozostali użytkownicy ich nie widzą. Przetwarzamy dane niezbędne do działania aplikacji (profil, treści, które publikujesz, adres IP dla celów bezpieczeństwa).</p>
<h4>10. Odpowiedzialność</h4>
<p>Aplikacja dostarczana jest "tak jak jest". Administrator nie ponosi odpowiedzialności za treści publikowane przez użytkowników ani za przerwy w działaniu serwisu.</p>
<h4>11. Wiek</h4>
<p>Z aplikacji mogą korzystać osoby, które ukończyły 13 lat. Jeśli nie spełniasz tego wymogu, nie zakładaj konta.</p>
<h4>12. Kontakt</h4>
<p>W sprawach regulaminu, zgłoszeń lub odwołań od bana skontaktuj się z administratorem przez wiadomości w aplikacji lub e-mailowo: wavetubebuisness@gmail.com. Administrator nie ma wglądu w treść prywatnych wiadomości między użytkownikami — jeśli zgłaszasz problem związany z wiadomościami, opisz go administratorowi samodzielnie.</p>
`,
  en:`<h4>1. General provisions</h4>
<p>By using WaveTube you accept these rules. If you do not agree, you may not use the app. The administrator reserves the right to change the rules — we will inform you in the app about significant changes.</p>
<h4>2. Account</h4>
<p>You sign in with a Google account. You are responsible for everything that happens on your account and for keeping it secure.</p>
<h4>3. Content and behavior</h4>
<p>It is forbidden to publish content that is: illegal, inciting hatred or violence, pornographic or sexualizing minors, infringing copyright, spam, or impersonating another person. This applies to videos, posts, comments, messages, and content shared during calls (including screen sharing). Advertising casinos, sports betting, online gambling, or other related content (including affiliate links/promo codes for such services) is forbidden in videos.</p>
<h4>4. Advertising and promotion</h4>
<p>Ads that interrupt video playback (such as ads that automatically pop up during a video, like on YouTube) are forbidden on the platform — WaveTube does not support this kind of ad mechanism. However, promotion or advertising included as part of the video itself by its creator (e.g. a sponsor mention within the video) is allowed — that is up to the video creator. Advertising products, services, or other sites/channels in posts, comments, or messages without the administrator’s consent is also forbidden.</p>
<h4>5. Respect for the creator and administration</h4>
<p>Insulting, abusing, or harassing the creator, administrators, or anyone working on the project is forbidden. Normal, fact-based criticism of the app and how it works is allowed — without insults, aggression, or defamation.</p>
<h4>6. Moderation</h4>
<p>The administrator may remove content that violates these rules and impose bans or mutes on accounts that break them — temporarily or permanently, without prior warning in case of serious violations.</p>
<h4>7. Reports</h4>
<p>You can report posts and other content that violates these rules using the report feature in the app. Abusing the report feature (false reports) may itself result in sanctions.</p>
<h4>8. VIP panel</h4>
<p>VIP features are an addition to a standard account and do not exempt you from following these rules.</p>
<h4>9. Privacy and personal data</h4>
<p>Your email address and other personal data (including your IP address) are visible only to the administrator — other users cannot see them. We process data necessary for the app to work (profile, content you publish, IP address for security purposes).</p>
<h4>10. Liability</h4>
<p>The app is provided "as is". The administrator is not responsible for content published by users or for service interruptions.</p>
<h4>11. Age</h4>
<p>The app may be used by people aged 13 and older. If you do not meet this requirement, do not create an account.</p>
<h4>12. Contact</h4>
<p>For questions about these rules, reports, or ban appeals, contact the administrator via messages in the app or by email: wavetubebuisness@gmail.com. The administrator cannot view the content of private messages between users — if you're reporting a problem involving a message, please describe it yourself to the administrator.</p>
`,
  ru:`<h4>1. Общие положения</h4>
<p>Используя WaveTube, вы принимаете настоящие правила. Если вы не согласны, вы не можете пользоваться приложением. Администратор оставляет за собой право изменять правила — о существенных изменениях мы сообщим в приложении.</p>
<h4>2. Аккаунт</h4>
<p>Вход осуществляется через аккаунт Google. Вы несёте ответственность за всё, что происходит на вашем аккаунте, и за его безопасность.</p>
<h4>3. Контент и поведение</h4>
<p>Запрещено публиковать контент: незаконный, разжигающий ненависть или насилие, порнографический или сексуализирующий несовершеннолетних, нарушающий авторские права, являющийся спамом, а также выдавать себя за другого человека. Это касается видео, постов, комментариев, сообщений и контента во время звонков (включая демонстрацию экрана). В видео запрещена реклама казино, букмекерских контор, онлайн-азартных игр и другого связанного с ними контента (включая партнёрские ссылки/промокоды таких сервисов).</p>
<h4>4. Реклама и продвижение</h4>
<p>На платформе запрещена реклама, прерывающая просмотр видео (например, реклама, которая автоматически всплывает во время просмотра, как на YouTube) — WaveTube не поддерживает такой механизм рекламы. При этом размещение рекламы или продвижения как части самого видео его автором (например, упоминание спонсора в видео) разрешено — это на усмотрение автора видео. Также запрещена реклама товаров, услуг или других сайтов и каналов в постах, комментариях и сообщениях без согласия администратора.</p>
<h4>5. Уважение к автору и администрации</h4>
<p>Запрещено оскорблять, унижать и травить автора, администраторов и людей, работающих над проектом. Разрешена обычная, обоснованная критика приложения и его работы — без оскорблений, агрессии и клеветы.</p>
<h4>6. Модерация</h4>
<p>Администратор может удалять контент, нарушающий правила, а также блокировать или временно ограничивать аккаунты, которые их нарушают — на время или навсегда, без предварительного предупреждения в случае серьёзных нарушений.</p>
<h4>7. Жалобы</h4>
<p>Вы можете жаловаться на посты и другой контент, нарушающий правила, с помощью функции жалоб в приложении. Злоупотребление функцией жалоб (ложные жалобы) само по себе может привести к санкциям.</p>
<h4>8. VIP-панель</h4>
<p>Функции VIP являются дополнением к обычному аккаунту и не освобождают от соблюдения настоящих правил.</p>
<h4>9. Конфиденциальность и личные данные</h4>
<p>Ваш адрес электронной почты и другие личные данные (включая IP-адрес) видны только администратору — остальные пользователи их не видят. Мы обрабатываем данные, необходимые для работы приложения (профиль, публикуемый контент, IP-адрес в целях безопасности).</p>
<h4>10. Ответственность</h4>
<p>Приложение предоставляется «как есть». Администратор не несёт ответственности за контент, публикуемый пользователями, или за перебои в работе сервиса.</p>
<h4>11. Возраст</h4>
<p>Приложением могут пользоваться лица старше 13 лет. Если вы не соответствуете этому требованию, не создавайте аккаунт.</p>
<h4>12. Контакты</h4>
<p>По вопросам правил, жалоб или обжалования бана обращайтесь к администратору через сообщения в приложении или по e-mail: wavetubebuisness@gmail.com. Администратор не имеет доступа к содержимому личных сообщений между пользователями — если жалоба связана с сообщением, опишите её администратору самостоятельно.</p>
`
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
  loadAllowCallsIntoSettings();
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

function openShortcutsModal(){
  document.getElementById('shortcuts-modal').classList.add('open');
  document.getElementById('dropdown')?.classList.remove('open');
}
function closeShortcutsModal(){
  document.getElementById('shortcuts-modal')?.classList.remove('open');
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

async function downloadMyData(){
  if(!currentUser)return;
  const btn=document.getElementById('download-data-btn');
  const origLabel=btn.textContent;
  btn.disabled=true;btn.textContent='⏳ '+t('settings_data_loading');
  try{
    const uid=currentUser.id;
    const{data:profile}=await sb.from('profiles').select('name,description,country,created_at,avatar,banner_url,name_color,name_font,text_color,avatar_frame,avatar_particles,avatar_particle_type,banner_frame,is_vip,vip_since,allow_messages,allow_calls,terms_accepted').eq('id',uid).single();
    const[videos,posts,msgsSent,msgsRecv,subs,subscribers,notifs,saved,watchLater,watchHistory]=await Promise.all([
      sb.from('videos').select('id,title,description,category,views,likes,dislikes,date,created_at,tags,is_short,visibility,language').eq('user_id',uid),
      sb.from('posts').select('id,text,likes,created_at').eq('user_id',uid),
      sb.from('messages').select('conv_id,receiver_id,receiver_name,text,created_at').eq('sender_id',uid),
      sb.from('messages').select('conv_id,sender_id,sender_name,text,created_at').eq('receiver_id',uid),
      sb.from('subscriptions').select('channel_id,channel_name,created_at').eq('subscriber_id',uid),
      sb.from('subscriptions').select('subscriber_id,created_at').eq('channel_id',uid),
      sb.from('notifications').select('message,sender_name,created_at').eq('user_id',uid),
      sb.from('saved_videos').select('video_id,created_at').eq('user_id',uid),
      sb.from('watch_later').select('video_id,created_at').eq('user_id',uid),
      sb.from('watch_history').select('video_id,watched_at').eq('user_id',uid)
    ]);
    const exportObj={
      exported_at:new Date().toISOString(),
      account_email:currentUser.email,
      profile:profile||null,
      videos:videos.data||[],
      posts:posts.data||[],
      messages_sent:msgsSent.data||[],
      messages_received:msgsRecv.data||[],
      subscriptions:subs.data||[],
      subscribers:subscribers.data||[],
      notifications:notifs.data||[],
      saved_videos:saved.data||[],
      watch_later:watchLater.data||[],
      watch_history:watchHistory.data||[],
      note:'Ten eksport nie zawiera samych plików wideo/miniatur/obrazów (zbyt duże pliki) ani treści komentarzy dodanych pod cudzymi filmami/postami.'
    };
    const blob=new Blob([JSON.stringify(exportObj,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='wavetube_dane_'+uid.slice(0,8)+'.json';
    document.body.appendChild(a);a.click();a.remove();
    URL.revokeObjectURL(url);
    toast(t('settings_data_done'));
  }catch(e){
    toast('Błąd: '+e.message);
  }finally{
    btn.disabled=false;btn.textContent=origLabel;
  }
}

