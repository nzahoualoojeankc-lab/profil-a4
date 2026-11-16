(function() {
  const phraseRows = [
    ['Язык', 'Language', 'Langue'],
    ['Главная', 'Home', 'Accueil'],
    ['Приложение', 'Application', 'Application'],
    ['Посетитель', 'Visitor', 'Visiteur'],
    ['Профили A4', 'Profiles A4', 'Profils A4'],
    ['Настройки профиля', 'Profile settings', 'Paramètres du profil'],
    ['Сочетания клавиш', 'Keyboard shortcuts', 'Raccourcis clavier'],
    ['Печать', 'Print', 'Imprimer'],
    ['Сохранить', 'Save', 'Enregistrer'],
    ['Новый профиль', 'New profile', 'Nouveau profil'],
    ['Печать в цепочку', 'Batch print', 'Impression en série'],
    ['Показать сочетания', 'Show shortcuts', 'Afficher les raccourcis'],
    ['Фото', 'Photos', 'Photos'],
    ['Цвета', 'Colors', 'Couleurs'],
    ['Шрифты', 'Fonts', 'Polices'],
    ['Параметры', 'Settings', 'Paramètres'],
    ['Язык интерфейса', 'Interface language', 'Langue de l’interface'],
    ['Фотографии по умолчанию', 'Default photos', 'Photos par défaut'],
    ['Фото мужчины', 'Male photo', 'Photo homme'],
    ['Фото женщины', 'Female photo', 'Photo femme'],
    ['Фото не указано', 'No gender photo', 'Photo non renseignée'],
    ['Мужчина', 'Male', 'Homme'],
    ['Женщина', 'Female', 'Femme'],
    ['Не указано', 'Not specified', 'Non renseigné'],
    ['Пользовательские цвета', 'Custom colors', 'Couleurs personnalisées'],
    ['Режим приложения', 'Application mode', 'Mode de l’application'],
    ['Глобальные параметры', 'Global settings', 'Paramètres globaux'],
    ['Текущий профиль', 'Current profile', 'Profil actuel'],
    ['Цвет текста', 'Text color', 'Couleur du texte'],
    ['Зеленый цвет', 'Green color', 'Couleur verte'],
    ['Красный цвет', 'Red color', 'Couleur rouge'],
    ['Цвет фона карты', 'Card background color', 'Couleur de fond de la fiche'],
    ['Цвет границы фото', 'Photo border color', 'Couleur de bordure de la photo'],
    ['Цвет фона итога', 'Total background color', 'Couleur de fond du total'],
    ['Семейство шрифтов', 'Font family', 'Famille de polices'],
    ['Шрифт применяется ко всему содержимому документа', 'The font applies to the entire document', 'La police s’applique à tout le document'],
    ['Действия', 'Actions', 'Actions'],
    ['Сбросить цвета', 'Reset colors', 'Réinitialiser les couleurs'],
    ['Экспортировать параметры', 'Export settings', 'Exporter les paramètres'],
    ['Импортировать параметры', 'Import settings', 'Importer les paramètres'],
    ['База данных', 'Database', 'Base de données'],
    ['Ваши профили:', 'Your profiles:', 'Vos profils :'],
    ['Использованное пространство:', 'Storage used:', 'Espace utilisé :'],
    ['Экспорт профилей', 'Export profiles', 'Exporter les profils'],
    ['Импорт локальной копии', 'Import local backup', 'Importer une copie locale'],
    ['Профессиональное управление профилями A4', 'Professional A4 profile management', 'Gestion professionnelle de profils A4'],
    ['Создавайте профили A4 и синхронизируйте их между устройствами после входа в аккаунт.', 'Create A4 profiles and sync them across devices after signing in.', 'Créez des profils A4 et synchronisez-les entre vos appareils après connexion.'],
    ['Начать', 'Get started', 'Commencer'],
    ['Узнать больше', 'Learn more', 'En savoir plus'],
    ['Наши функции', 'Our features', 'Nos fonctionnalités'],
    ['Легкое создание', 'Easy creation', 'Création facile'],
    ['Создавайте профили A4 в несколько кликов.', 'Create A4 profiles in a few clicks.', 'Créez des profils A4 en quelques clics.'],
    ['Автосохранение', 'Automatic saving', 'Enregistrement automatique'],
    ['Все ваши профили автоматически сохраняются.', 'All your profiles are saved automatically.', 'Tous vos profils sont enregistrés automatiquement.'],
    ['Облачная синхронизация', 'Cloud synchronization', 'Synchronisation cloud'],
    ['Ваши профили доступны после входа и синхронизируются между устройствами.', 'Your profiles are available after sign-in and sync across devices.', 'Vos profils sont disponibles après connexion et synchronisés entre vos appareils.'],
    ['Типография', 'Typography', 'Typographie'],
    ['Персонализируйте шрифты и внешний вид.', 'Customize fonts and appearance.', 'Personnalisez les polices et l’apparence.'],
    ['Управление изображениями', 'Image management', 'Gestion des images'],
    ['Импортируйте изображения в свои профили.', 'Import images into your profiles.', 'Importez des images dans vos profils.'],
    ['Печатайте несколько профилей автоматически.', 'Print multiple profiles automatically.', 'Imprimez plusieurs profils automatiquement.'],
    ['Пароль', 'Password', 'Mot de passe'],
    ['Войти', 'Sign in', 'Se connecter'],
    ['Забыли пароль?', 'Forgot password?', 'Mot de passe oublié ?'],
    ['или', 'or', 'ou'],
    ['Нет аккаунта?', 'No account?', 'Pas encore de compte ?'],
    ['Зарегистрироваться', 'Sign up', 'S’inscrire'],
    ['Полное имя', 'Full name', 'Nom complet'],
    ['Ваше имя', 'Your name', 'Votre nom'],
    ['Подтвердить пароль', 'Confirm password', 'Confirmer le mot de passe'],
    ['Уже зарегистрированы?', 'Already registered?', 'Déjà inscrit ?'],
    ['Отправить ссылку для сброса', 'Send reset link', 'Envoyer le lien de réinitialisation'],
    ['Вернуться ко входу', 'Back to sign in', 'Retour à la connexion'],
    ['Новый пароль', 'New password', 'Nouveau mot de passe'],
    ['Повторите пароль', 'Repeat password', 'Répétez le mot de passe'],
    ['Сохранить новый пароль', 'Save new password', 'Enregistrer le nouveau mot de passe'],
    ['Открыть панель профилей', 'Open profiles panel', 'Ouvrir le panneau des profils'],
    ['Открыть панель инструментов', 'Open tools panel', 'Ouvrir le panneau des outils'],
    ['Закрыть панель', 'Close panel', 'Fermer le panneau'],
    ['Менеджер', 'Manager', 'Gestionnaire'],
    ['Пользователь:', 'User:', 'Utilisateur :'],
    ['Гость', 'Guest', 'Invité'],
    ['Ожидание подключения', 'Waiting for connection', 'En attente de connexion'],
    ['Данные профилей (без фото)', 'Profile data (without photos)', 'Données des profils (sans photos)'],
    ['ЕМКОСТЬ', 'CAPACITY', 'CAPACITÉ'],
    ['Создано', 'Created', 'Créés'],
    ['Осталось', 'Remaining', 'Restants'],
    ['Использование', 'Usage', 'Utilisation'],
    ['Поиск...', 'Search...', 'Rechercher...'],
    ['Нет профилей', 'No profiles', 'Aucun profil'],
    ['Новое', 'New', 'Nouveau'],
    ['Цепочка', 'Batch', 'Série'],
    ['Экспорт', 'Export', 'Exporter'],
    ['Удал.', 'Delete', 'Suppr.'],
    ['Сброс', 'Reset', 'Réinitialiser'],
    ['Выход', 'Sign out', 'Déconnexion'],
    ['Имя', 'Name', 'Nom'],
    ['Телефон', 'Phone', 'Téléphone'],
    ['Дата', 'Date', 'Date'],
    ['Строки', 'Rows', 'Lignes'],
    ['Итого', 'Total', 'Total'],
    ['Этикетка', 'Label', 'Libellé'],
    ['Пол', 'Gender', 'Genre'],
    ['Страна', 'Country', 'Pays'],
    ['Выберите страну...', 'Select a country...', 'Choisissez un pays...'],
    ['Действия', 'Actions', 'Actions'],
    ['Сумма', 'Amount', 'Montant'],
    ['Бонусы', 'Bonuses', 'Bonus'],
    ['Штрафы', 'Penalties', 'Pénalités'],
    ['ИТОГО', 'TOTAL', 'TOTAL'],
    ['Добро пожаловать!', 'Welcome!', 'Bienvenue !'],
    ['Удалить', 'Delete', 'Supprimer'],
    ['Вы уверены?', 'Are you sure?', 'Êtes-vous sûr ?'],
    ['Необратимо!', 'This cannot be undone!', 'Cette action est irréversible !'],
    ['Отмена', 'Cancel', 'Annuler'],
    ['Внимание: Необратимо!', 'Warning: This cannot be undone!', 'Attention : cette action est irréversible !'],
    ['Вы собираетесь удалить', 'You are about to delete', 'Vous êtes sur le point de supprimer'],
    ['профиль (ей).', 'profile(s).', 'profil(s).'],
    ['Удалить все', 'Delete all', 'Tout supprimer'],
    ['Выберите профили для печати в цепочку:', 'Select profiles for batch printing:', 'Sélectionnez les profils à imprimer en série :'],
    ['Выбрать все', 'Select all', 'Tout sélectionner'],
    ['Отменить', 'Deselect all', 'Tout désélectionner'],
    ['Глобальная статистика:', 'Global statistics:', 'Statistiques globales :'],
    ['Всего существующих профилей:', 'Total existing profiles:', 'Nombre total de profils :'],
    ['Осталось профилей:', 'Profiles remaining:', 'Profils restants :'],
    ['Распределение по периодам:', 'Distribution by period:', 'Répartition par période :'],
    ['Текущий экспорт:', 'Current export:', 'Export actuel :'],
    ['Доминирующий период:', 'Dominant period:', 'Période dominante :'],
    ['Выбранные профили:', 'Selected profiles:', 'Profils sélectionnés :'],
    ['Имя не указано', 'Name not specified', 'Nom non renseigné'],
    ['Количество', 'Quantity', 'Quantité'],
    ['не указано', 'not specified', 'non renseigné'],
    ['Телефон не указан', 'Phone not specified', 'Téléphone non renseigné'],
    ['Профили A4 - Полная платформа', 'Profiles A4 - Full platform', 'Profils A4 - Plateforme complète'],
    ['Профили A4 - Управление профилями', 'Profiles A4 - Profile Management', 'Profili A4 - Gestion de Profils'],
    ['Контакт', 'Contact', 'Contact'],
    ['Управление профилями', 'Profile Management', 'Gestion de profils'],
    ['Профессиональное', 'Professional', 'Professionnelle'],
    ['Профессиональное управление профилями', 'Professional Profile Management', 'Gestion professionnelle de profils'],
    ['Организуйте профили, печатайте их в формате A4 и синхронизируйте данные после входа в аккаунт. Требуется подключение к интернету.', 'Organize your profiles, print in A4, and sync your data after signing in. An Internet connection is required.', 'Organisez vos profils, imprimez en A4 et synchronisez vos données après connexion à votre compte. Une connexion Internet est requise.'],
    ['Функции', 'Features', 'Fonctionnalités'],
    ['Открыть приложение', 'Open the app', 'Accéder à l’App'],
    ['Попробовать сейчас', 'Try it now', 'Essayer maintenant'],
    ['Узнать больше', 'Learn more', 'En savoir plus'],
    ['Попробовать сейчас', 'Try it now', 'Essayer Maintenant'],
    ['Узнать больше', 'Learn more', 'En Savoir Plus'],
    ['Полное управление', 'Complete management', 'Gestion complète'],
    ['Полное управление', 'Complete management', 'Gestion Complète'],
    ['Создавайте, редактируйте, удаляйте и легко упорядочивайте профили', 'Create, edit, delete, and organize your profiles with ease', 'Créez, modifiez, supprimez et organisez vos profils facilement'],
    ['Печать A4', 'A4 printing', 'Impression A4'],
    ['Печатайте профили в профессиональном формате A4', 'Print your profiles in professional A4 format', 'Imprimez vos profils en format A4 professionnel'],
    ['Несколько устройств', 'Multi-device', 'Multi-appareils'],
    ['Несколько устройств', 'Multi-device', 'Multi-Appareils'],
    ['Открывайте приложение на компьютере, планшете или телефоне', 'Access from desktop, tablet, or mobile', 'Accédez depuis desktop, tablette ou mobile'],
    ['Многоязычность', 'Multilingual', 'Multilingue'],
    ['Русский, английский, французский и другие языки', 'Russian, English, French, and more', 'Russe, anglais, français et plus'],
    ['Русский, английский, французский и другие языки', 'Russian, English, French, and more', 'Russe, Anglais, Français et plus'],
    ['Приватная синхронизация', 'Private synchronization', 'Synchronisation privée'],
    ['Ваши профили доступны на устройствах после входа в аккаунт', 'Access your profiles on your devices after signing in', 'Retrouvez vos profils après connexion à votre compte sur vos appareils'],
    ['Безопасность', 'Secure', 'Sécurisé'],
    ['Профили защищены правилами доступа вашего аккаунта', 'Your profiles are protected by your account access rules', 'Vos profils sont protégés par les règles d’accès de votre compte'],
    ['Профили защищены правилами доступа вашего аккаунта', 'Your profiles are protected by your account access rules', 'Vos profils sont protégés par les règles d\'accès de votre compte'],
    ['Связаться с нами', 'Contact us', 'Nous contacter'],
    ['Связаться с нами', 'Contact us', 'Nous Contacter'],
    ['Выберите удобный способ связи.', 'Choose the contact method that works for you.', 'Choisissez le moyen de contact qui vous convient.'],
    ['Телеграм: @jeankc', 'Telegram: @jeankc', 'Telegram : @jeankc'],
    ['Все права защищены.', 'All rights reserved.', 'Tous droits réservés.'],
    ['© 2024 Profili A4. Все права защищены.', '© 2024 Profili A4. All rights reserved.', '© 2024 Profili A4. Tous droits réservés.'],
    ['Правовая информация', 'Legal notice', 'Mentions légales'],
    ['Функции', 'Features', 'Nos Fonctionnalités'],
    ['Конфиденциальность', 'Privacy', 'Confidentialité'],
    ['Условия использования', 'Terms of use', 'Conditions d’utilisation'],
    ['Условия использования', 'Terms of use', 'Conditions d\'utilisation'],
    ['Логотип', 'Logo', 'Logo'],
    ['Предпросмотр приложения', 'App preview', 'Aperçu de l’application'],
    ['Предпросмотр приложения', 'App Preview', 'Aperçu de l’application'],
    ['Открыть приложение', 'Open the app', 'Accéder à l\'App'],
    ['Фото профиля', 'Profile photo', 'Photo de profil'],
    ['Профессиональное управление профилями', 'Professional profile management', 'Gestion professionnelle de profils'],
    ['Сохранено', 'Saved', 'Enregistré'],
    ['Загрузка облачных профилей…', 'Loading cloud profiles…', 'Chargement des profils cloud…'],
    ['Профили обновлены', 'Profiles updated', 'Profils mis à jour'],
    ['Синхронизация завершена', 'Synchronization complete', 'Synchronisation terminée'],
    ['Не удалось сохранить профиль.', 'Could not save the profile.', 'Impossible d’enregistrer le profil.'],
    ['Не удалось открыть профиль: ', 'Could not open profile: ', 'Impossible d’ouvrir le profil : '],
    ['Не удалось загрузить фото профиля: ', 'Could not load the profile photo: ', 'Impossible de charger la photo du profil : '],
    ['Не удалось сохранить язык на этом устройстве: ', 'Could not save the language on this device: ', 'Impossible d’enregistrer la langue sur cet appareil : '],
    ['Не удалось сохранить язык аккаунта: ', 'Could not save the account language: ', 'Impossible d’enregistrer la langue du compte : '],
    ['Не удалось подготовить профиль к печати: ', 'Could not prepare the profile for printing: ', 'Impossible de préparer le profil pour l’impression : '],
    ['Не удалось сохранить профиль перед печатью: ', 'Could not save the profile before printing: ', 'Impossible d’enregistrer le profil avant impression : '],
    ['Ошибка пакетной печати: ', 'Batch printing error: ', 'Erreur d’impression en série : '],
    ['Пакетная печать остановлена: ', 'Batch printing stopped: ', 'Impression en série interrompue : '],
    ['Ошибка синхронизации: ', 'Synchronization error: ', 'Erreur de synchronisation : '],
    ['Не удалось загрузить профили: ', 'Could not load profiles: ', 'Impossible de charger les profils : '],
    ['Не удалось подключиться к облаку: ', 'Could not connect to the cloud: ', 'Impossible de se connecter au cloud : '],
    ['Не удалось подключиться к Supabase: ', 'Could not connect to Supabase: ', 'Impossible de se connecter à Supabase : '],
    ['Не удалось сохранить профиль: ', 'Could not save the profile: ', 'Impossible d’enregistrer le profil : '],
    ['Ошибка загрузки фото: ', 'Photo upload error: ', 'Erreur de chargement de la photo : '],
    ['Не удалось сохранить фото: ', 'Could not save the photo: ', 'Impossible d’enregistrer la photo : '],
    ['Не удалось сохранить локальное фото: ', 'Could not save the local photo: ', 'Impossible d’enregistrer la photo locale : '],
    ['Не удалось прочитать файл изображения.', 'Could not read the image file.', 'Impossible de lire le fichier image.'],
    ['Не удалось загрузить профиль: ', 'Could not load the profile: ', 'Impossible de charger le profil : '],
    ['Не удалось удалить профиль: ', 'Could not delete the profile: ', 'Impossible de supprimer le profil : '],
    ['Не удалось проверить базу профилей: ', 'Could not check the profile database: ', 'Impossible de vérifier la base de profils : '],
    ['Не удалось очистить базу профилей: ', 'Could not clear the profile database: ', 'Impossible de vider la base de profils : '],
    ['Не удалось экспортировать профили: ', 'Could not export profiles: ', 'Impossible d’exporter les profils : '],
    ['Не удалось импортировать резервную копию: ', 'Could not import the backup: ', 'Impossible d’importer la sauvegarde : '],
    ['Ошибка обновления данных: ', 'Data update error: ', 'Erreur de mise à jour des données : '],
    ['Не удалось выйти: ', 'Could not sign out: ', 'Impossible de se déconnecter : '],
    ['Заполните email и пароль.', 'Enter your email and password.', 'Saisissez votre e-mail et votre mot de passe.'],
    ['Заполните все поля.', 'Complete all fields.', 'Remplissez tous les champs.'],
    ['Пароли не совпадают.', 'Passwords do not match.', 'Les mots de passe ne correspondent pas.'],
    ['Минимальная длина пароля — 6 символов.', 'The password must be at least 6 characters long.', 'Le mot de passe doit comporter au moins 6 caractères.'],
    ['Проверьте почту и подтвердите адрес, затем войдите.', 'Check your email and confirm your address, then sign in.', 'Vérifiez votre e-mail et confirmez votre adresse avant de vous connecter.'],
    ['Введите email.', 'Enter your email.', 'Saisissez votre e-mail.'],
    ['Если аккаунт существует, на его почту отправлена ссылка для сброса пароля.', 'If the account exists, a password reset link has been sent to its email address.', 'Si le compte existe, un lien de réinitialisation a été envoyé à son adresse e-mail.'],
    ['Пароль успешно изменен.', 'Password changed successfully.', 'Mot de passe modifié avec succès.'],
    ['Выйти?', 'Sign out?', 'Se déconnecter ?'],
    ['Сначала устраните ошибку сохранения профиля.', 'Resolve the profile save error first.', 'Corrigez d’abord l’erreur d’enregistrement du profil.'],
    ['Сначала войдите и выберите профиль.', 'Sign in and select a profile first.', 'Connectez-vous et sélectionnez d’abord un profil.'],
    ['Поддерживаются только изображения JPEG, PNG и WebP.', 'Only JPEG, PNG, and WebP images are supported.', 'Seules les images JPEG, PNG et WebP sont prises en charge.'],
    ['Изображение слишком велико (максимум 20 МБ).', 'The image is too large (20 MB maximum).', 'L’image est trop volumineuse (20 Mo maximum).'],
    ['Формат фото должен быть JPEG, PNG или WebP.', 'The photo must be JPEG, PNG, or WebP format.', 'La photo doit être au format JPEG, PNG ou WebP.'],
    ['Локальное фото по умолчанию должно быть не больше 512 КБ.', 'The default local photo must be no larger than 512 KB.', 'La photo locale par défaut ne doit pas dépasser 512 Ko.'],
    ['Фото сохранено на этом устройстве.', 'Photo saved on this device.', 'Photo enregistrée sur cet appareil.'],
    ['Фото загружено и сохранено', 'Photo uploaded and saved', 'Photo chargée et enregistrée'],
    ['Фото профиля сохранено, но предыдущий файл не удалось удалить: ', 'The profile photo was saved, but the previous file could not be deleted: ', 'La photo du profil a été enregistrée, mais l’ancien fichier n’a pas pu être supprimé : '],
    ['Не удалось сохранить фото профиля: ', 'Could not save the profile photo: ', 'Impossible d’enregistrer la photo du profil : '],
    ['Достигнут лимит ', 'Limit reached: ', 'Limite atteinte : '],
    [' профилей', ' profiles', ' profils'],
    ['Достигнут лимит профилей', 'Profile limit reached', 'Limite de profils atteinte'],
    ['Профиль не найден.', 'Profile not found.', 'Profil introuvable.'],
    ['Профиль не найден или доступ к нему запрещен.', 'Profile not found or access is denied.', 'Profil introuvable ou accès refusé.'],
    ['Формат фото должен быть JPEG, PNG или WebP.', 'The photo must be JPEG, PNG, or WebP format.', 'La photo doit être au format JPEG, PNG ou WebP.'],
    ['Изображение слишком велико (максимум 20 МБ).', 'The image is too large (20 MB maximum).', 'L’image est trop volumineuse (20 Mo maximum).'],
    ['Облако синхронизировано', 'Cloud synchronized', 'Cloud synchronisé'],
    ['Нет связи с синхронизацией в реальном времени', 'Real-time synchronization is unavailable', 'La synchronisation en temps réel est indisponible'],
    ['Не подключено', 'Not connected', 'Non connecté'],
    ['Не удалось загрузить клиент Supabase. Проверьте подключение к интернету и перезагрузите страницу.', 'Could not load the Supabase client. Check your Internet connection and reload the page.', 'Impossible de charger le client Supabase. Vérifiez votre connexion Internet et rechargez la page.'],
    ['Настройте URL проекта и публичный anon key в файле JS/supabase-config.js.', 'Set the project URL and public anon key in JS/supabase-config.js.', 'Configurez l’URL du projet et la clé publique anon dans JS/supabase-config.js.'],
    ['URL Supabase должен использовать HTTPS.', 'The Supabase URL must use HTTPS.', 'L’URL Supabase doit utiliser HTTPS.'],
    ['Поддерживаются только изображения JPEG, PNG и WebP.', 'Only JPEG, PNG, and WebP images are supported.', 'Seules les images JPEG, PNG et WebP sont prises en charge.'],
    ['Изображение слишком велико (максимум 20 МБ).', 'The image is too large (20 MB maximum).', 'L’image est trop volumineuse (20 Mo maximum).'],
    ['Профиль удален, но фото осталось в хранилище: ', 'The profile was deleted, but its photo remains in storage: ', 'Le profil a été supprimé, mais sa photo reste dans le stockage : '],
    ['Профили удалены, но некоторые фото остались в хранилище: ', 'The profiles were deleted, but some photos remain in storage: ', 'Les profils ont été supprimés, mais certaines photos restent dans le stockage : '],
    ['Фото имеет неподдерживаемый формат.', 'The photo format is not supported.', 'Le format de la photo n’est pas pris en charge.'],
    ['Фото имеет неподдерживаемый формат или превышает 20 МБ.', 'The photo format is not supported or it exceeds 20 MB.', 'Le format de la photo n’est pas pris en charge ou elle dépasse 20 Mo.'],
    ['Печать отменена: профиль не удалось сохранить.', 'Printing canceled: the profile could not be saved.', 'Impression annulée : le profil n’a pas pu être enregistré.'],
    ['Печать остановлена: профиль не удалось сохранить.', 'Printing stopped: the profile could not be saved.', 'Impression interrompue : le profil n’a pas pu être enregistré.'],
    ['Не удалось сохранить профиль.', 'Could not save the profile.', 'Impossible d’enregistrer le profil.'],
    ['Не удалось сохранить текущий профиль.', 'Could not save the current profile.', 'Impossible d’enregistrer le profil actuel.'],
    ['Цвета сброшены', 'Colors reset', 'Couleurs réinitialisées'],
    ['Экспортировано', 'Exported', 'Exporté'],
    ['Импортировано', 'Imported', 'Importé'],
    ['Облачная база профилей очищена.', 'Cloud profile database cleared.', 'Base cloud des profils vidée.'],
    ['Экспорт профилей завершен. Фотографии хранятся отдельно в приватном облачном хранилище.', 'Profile export complete. Photos are stored separately in private cloud storage.', 'Export des profils terminé. Les photos sont stockées séparément dans un espace cloud privé.'],
    ['Файл резервной копии слишком велик (максимум 50 МБ).', 'The backup file is too large (50 MB maximum).', 'Le fichier de sauvegarde est trop volumineux (50 Mo maximum).'],
    ['Ожидается JSON-массив профилей.', 'Expected a JSON array of profiles.', 'Un tableau JSON de profils est attendu.'],
    ['Можно хранить не более ', 'No more than ', 'Vous pouvez stocker au maximum '],
    [' профилей на аккаунт.', ' profiles per account.', ' profils par compte.'],
    ['Пропущена запись с неверным форматом.', 'Skipped an entry with an invalid format.', 'Une entrée au format invalide a été ignorée.'],
    ['Импортировано профилей: ', 'Profiles imported: ', 'Profils importés : '],
    ['. Ошибок: ', '. Errors: ', '. Erreurs : '],
    ['Изменения сохранены', 'Changes saved', 'Modifications enregistrées'],
    ['Сохранение…', 'Saving…', 'Enregistrement…'],
    ['Ошибка', 'Error', 'Erreur'],
    ['Ошибка: ', 'Error: ', 'Erreur : '],
    ['❌ Ошибка: ', '❌ Error: ', '❌ Erreur : '],
    ['Достигнут лимит', 'Limit reached', 'Limite atteinte'],
    ['❌ Достигнут лимит ', '❌ Limit reached: ', '❌ Limite atteinte : '],
    ['профилей', 'profiles', 'profils'],
    ['Об облачных профилях', 'Cloud profiles', 'Profils cloud'],
    ['Подключение не выполнено', 'Connection failed', 'Échec de la connexion'],
    ['Файл имеет неподдерживаемый формат.', 'The file format is not supported.', 'Le format du fichier n’est pas pris en charge.'],
    ['Пользователь не найден.', 'User not found.', 'Utilisateur introuvable.'],
    ['Настройте URL проекта и публичный anon key в файле JS/supabase-config.js.', 'Set the project URL and public anon key in JS/supabase-config.js.', 'Configurez l’URL du projet et la clé publique anon dans JS/supabase-config.js.'],
    ['Войдите в аккаунт, чтобы изменить настройки.', 'Sign in to change settings.', 'Connectez-vous pour modifier les paramètres.'],
    ['🌍 АФРИКА', '🌍 AFRICA', '🌍 AFRIQUE'],
    ['🌏 АЗИЯ', '🌏 ASIA', '🌏 ASIE'],
    ['🌎 ЕВРОПА', '🌎 EUROPE', '🌎 EUROPE'],
    ['🌎 АМЕРИКА', '🌎 AMERICA', '🌎 AMÉRIQUE'],
    ['Supabase не настроен. Заполните URL и публичный anon key в JS/supabase-config.js.', 'Supabase is not configured. Set the URL and public anon key in JS/supabase-config.js.', 'Supabase n’est pas configuré. Renseignez l’URL et la clé publique anon dans JS/supabase-config.js.'],
    ['Невозможно сохранить профиль без активного аккаунта.', 'Cannot save a profile without an active account.', 'Impossible d’enregistrer un profil sans compte actif.'],
    ['Принять условия', 'Accept the terms', 'Accepter les conditions'],
    ['Я принимаю Условия использования v1.0.', 'I accept the Terms of Use v1.0.', 'J’accepte les Conditions générales d’utilisation v1.0.'],
    ['Условия использования', 'Terms of Use', 'Conditions générales d’utilisation'],
    ['Для доступа к профилям необходимо принять обновлённые условия.', 'You must accept the updated terms to access your profiles.', 'Une nouvelle acceptation est nécessaire pour accéder à vos profils.'],
    ['Версия условий: ', 'Terms version: ', 'Version des conditions : '],
    ['Я принимаю Условия использования.', 'I accept the Terms of Use.', 'J’accepte les Conditions générales d’utilisation.'],
    ['Принять и продолжить', 'Accept and continue', 'Accepter et continuer'],
    ['Аккаунт приостановлен', 'Account suspended', 'Compte suspendu'],
    ['Доступ к профилям приостановлен. Ваши данные сохранены.', 'Your access to profiles is suspended. Your data is retained.', 'Votre accès aux profils est suspendu. Vos données sont conservées.'],
    ['Указанная причина', 'Reason provided', 'Motif communiqué'],
    ['Причина не указана.', 'No reason provided.', 'Aucun motif communiqué.'],
    ['Вы можете запросить пересмотр этого решения.', 'You may appeal this decision.', 'Vous pouvez demander un réexamen de cette décision.'],
    ['Связаться с командой для подачи апелляции', 'Contact the team to appeal', 'Contacter l’équipe pour exercer un recours'],
    ['Проверить снова', 'Check again', 'Vérifier à nouveau'],
    ['Проверка аккаунта недоступна', 'Account verification unavailable', 'Vérification du compte indisponible'],
    ['Управление аккаунтами', 'Account administration', 'Administration des comptes'],
    ['Приостановка обратима, требует указания причины и записывается в журнал. Окончательное удаление недоступно.', 'Suspensions are reversible, reasoned, and logged. Permanent deletion is not available.', 'Les suspensions sont réversibles, motivées et journalisées. Aucune suppression définitive n’est proposée.'],
    ['Поиск аккаунта по адресу электронной почты', 'Search for an account by email', 'Rechercher un compte par e-mail'],
    ['Не менее 3 символов', 'At least 3 characters', 'Au moins 3 caractères'],
    ['Найти', 'Search', 'Rechercher'],
    ['Причина обязательна', 'Reason required', 'Motif obligatoire'],
    ['Приостановить', 'Suspend', 'Suspendre'],
    ['Возобновить доступ', 'Reactivate', 'Réactiver'],
    ['Передать права администратора', 'Delegate administration', 'Déléguer l’administration'],
    ['Отозвать делегирование', 'Revoke delegation', 'Révoquer la délégation'],
    ['Журнал действий', 'Action log', 'Journal des actions'],
    ['Уведомление аккаунта', 'Account notification', 'Notification du compte'],
    ['Уведомление о приостановке', 'Suspension notice', 'Notification de suspension'],
    ['Уведомление о возобновлении доступа', 'Reactivation notice', 'Notification de réactivation'],
    ['Права администратора делегированы', 'Administrator delegation granted', 'Délégation d’administration accordée'],
    ['Делегирование прав администратора отозвано', 'Administrator delegation revoked', 'Délégation d’administration révoquée'],
    ['Апелляция по поводу приостановки аккаунта', 'Appeal regarding account suspension', 'Recours concernant la suspension du compte'],
    ['Введите не менее 3 символов.', 'Enter at least 3 characters.', 'Saisissez au moins 3 caractères.'],
    ['Найдено аккаунтов: ', 'Accounts found: ', 'Comptes trouvés : '],
    ['Приостановлен', 'Suspended', 'Suspendu'],
    ['Активен', 'Active', 'Actif'],
    ['Статус: ', 'Status: ', 'Statut : '],
    ['Необходимо указать причину.', 'A reason is required.', 'Un motif est obligatoire.'],
    ['Подтвердить приостановку этого аккаунта?', 'Confirm suspending this account?', 'Confirmer la suspension de ce compte ?'],
    ['Подтвердить возобновление доступа к этому аккаунту?', 'Confirm reactivating this account?', 'Confirmer la réactivation de ce compte ?'],
    ['Подтвердить делегирование?', 'Confirm this delegation?', 'Confirmer cette délégation ?'],
    ['Подтвердить отзыв делегирования?', 'Confirm revoking this delegation?', 'Confirmer la révocation de cette délégation ?'],
    ['Действие записано.', 'Action recorded.', 'Action enregistrée.'],
    ['Аккаунт снова активен', 'Account reactivated', 'Compte réactivé'],
    ['Делегирование предоставлено', 'Delegation granted', 'Délégation accordée'],
    ['Делегирование отозвано', 'Delegation revoked', 'Délégation révoquée'],
    ['Не удалось проверить статус аккаунта: ', 'Could not verify account status: ', 'Impossible de vérifier le statut du compte : '],
    ['Необходимо принять Условия использования v1.0.', 'You must accept the Terms of Use v1.0.', 'Vous devez accepter les Conditions générales d’utilisation v1.0.'],
    ['Выйти из аккаунта', 'Sign out', 'Se déconnecter du compte'],
    ['Текст условий соответствует выбранному языку приложения.', 'The terms are displayed in your selected app language.', 'Le texte des conditions suit la langue choisie dans l’application.'],
    ['Условия использования v1.0', 'Terms of Use v1.0', 'Conditions générales d’utilisation v1.0'],
    ["Создавая аккаунт или пользуясь им, вы соглашаетесь соблюдать правила использования приложения и принятые на себя обязательства по оплате. Владелец приложения или назначенные им администраторы могут временно приостановить доступ к вашей учётной записи при нарушении соглашения, в том числе из-за просроченного платежа, мошенничества или неэтичного поведения. Приостановка сохраняет ваши данные, указывает причину и позволяет подать апелляцию. Эта версия не регулирует окончательное удаление аккаунта, и данная функция не удаляет аккаунт окончательно.", "By creating or using your account, you agree to follow the application’s rules and any payment obligations you have agreed to. The application owner or administrators appointed by the owner may temporarily suspend access to your account if you breach the agreement, including for overdue payments, fraud, or ethical misconduct. Suspension preserves your data, states a reason, and lets you appeal. This version does not govern permanent account deletion, and this feature will not permanently delete your account.", "En créant ou en utilisant votre compte, vous vous engagez à respecter les règles d’utilisation de l’application et vos obligations de paiement lorsqu’elles sont convenues. Le propriétaire de l’application ou les administrateurs qu’il a désignés peuvent suspendre temporairement l’accès à votre compte en cas de non-respect du contrat, notamment en cas d’échéance impayée, de fraude ou de manquement éthique. La suspension conserve vos données, indique un motif et vous permet de présenter un recours. La suppression définitive du compte n’est pas régie par cette version et ne sera pas effectuée par cette fonctionnalité."],
    ['Роль : ', 'Role: ', 'Rôle : '],
    ['Владелец', 'Owner', 'Propriétaire'],
    ['Делегированный администратор', 'Delegate', 'Délégué'],
    ['Пользователь', 'User', 'Utilisateur'],
    ['Проверьте почту, подтвердите адрес, затем войдите и примите условия.', 'Check your email, confirm your address, then sign in and accept the terms.', 'Vérifiez votre e-mail, confirmez votre adresse, puis connectez-vous et acceptez les conditions.'],
    ['Ежемесячные платежи', 'Monthly dues and payments', 'Échéances et paiements'],
    ['Для каждого периода укажите сумму, валюту и срок оплаты. Напоминания начинаются через 3 дня после срока и повторяются каждые 3 дня до подтверждения оплаты.', 'Enter the amount, currency, and due date for each period. Reminders start 3 days after the due date and repeat every 3 days until payment is confirmed.', 'Pour chaque période, saisissez le montant, la devise et la date d’échéance. Les rappels commencent après 3 jours de retard, puis sont répétés tous les 3 jours jusqu’à confirmation.'],
    ['Период (месяц)', 'Billing month', 'Période mensuelle'],
    ['Валюта (код из 3 букв)', 'Currency (3-letter code)', 'Devise (code à 3 lettres)'],
    ['Срок оплаты', 'Due date', 'Date d’échéance'],
    ['Причина изменения или подтверждения', 'Reason for change or confirmation', 'Motif de la modification ou confirmation'],
    ['Сохранить срок оплаты', 'Save due', 'Enregistrer l’échéance'],
    ['Обновить платежи', 'Refresh payments', 'Actualiser les paiements'],
    ['Записанные платежи', 'Recorded payments', 'Paiements enregistrés'],
    ['Журнал платежей', 'Payment log', 'Journal des paiements'],
    ['К оплате', 'Due', 'À payer'],
    ['Оплачен', 'Paid', 'Payé'],
    ['Отменен', 'Cancelled', 'Annulé'],
    ['Отметить как оплаченный', 'Mark as paid', 'Marquer payé'],
    ['Отменить / исправить', 'Cancel / correct', 'Annuler / corriger'],
    ['Платеж подтвержден; письмо с подтверждением поставлено в очередь.', 'Payment confirmed; receipt email queued.', 'Confirmation enregistrée; e-mail de reçu mis en file d’attente.'],
    ['Срок оплаты сохранен.', 'Payment due saved.', 'Échéance enregistrée.'],
    ['Платеж отменен; уведомление об исправлении поставлено в очередь.', 'Payment cancelled; correction email queued.', 'Paiement annulé; e-mail de correction mis en file d’attente.'],
    ['Записей об оплате нет.', 'No payment records.', 'Aucune échéance enregistrée.'],
    ['Уведомление об оплате: отправлено', 'Receipt email: sent', 'E-mail de reçu : envoyé'],
    ['Уведомление об оплате: ожидает отправки', 'Receipt email: pending', 'E-mail de reçu : en attente d’envoi'],
    ['Подтвердить отметку об оплате?', 'Confirm marking this payment as paid?', 'Confirmer l’enregistrement de ce paiement comme payé ?'],
    ['Подтвердить отмену этого платежа?', 'Confirm cancelling this payment record?', 'Confirmer l’annulation de cette échéance ?'],
    ['Срок оплаты создан', 'Due created', 'Échéance créée'],
    ['Срок оплаты изменен', 'Due updated', 'Échéance modifiée'],
    ['Оплата подтверждена', 'Payment confirmed', 'Paiement confirmé'],
    ['Оплата отменена', 'Payment cancelled', 'Paiement annulé'],
    ['Сумма должна быть больше нуля.', 'Amount must be greater than zero.', 'Le montant doit être supérieur à zéro.'],
    ['Укажите трехбуквенный код валюты в верхнем регистре.', 'Enter a three-letter uppercase currency code.', 'Saisissez un code de devise en trois lettres majuscules.'],
    ['Заполните все поля срока оплаты.', 'Complete all payment due fields.', 'Remplissez tous les champs de l’échéance.'],
    ['Письмо не отправлено: ', 'Email not sent: ', 'E-mail non envoyé : '],
    ['Напоминание отправлено', 'Reminder sent', 'Rappel envoyé'],
    ['Напоминание ожидает отправки', 'Reminder pending', 'Rappel en attente d’envoi'],
    ['Письмо об исправлении: отправлено', 'Correction email: sent', 'E-mail de correction : envoyé'],
    ['Письмо об исправлении: ожидает отправки', 'Correction email: pending', 'E-mail de correction : en attente d’envoi'],
    ['Письмо игнорируется', 'Email skipped', 'E-mail ignoré'],
    ['Письмо отправляется', 'Email sending', 'E-mail en cours d’envoi'],
    ['Срок оплаты отменен.', 'Payment due cancelled.', 'Échéance annulée.'],
    ['Уведомления', 'Notifications', 'Notifications'],
    ['Проверяйте почту, включая папку «Спам», по адресу, связанному с аккаунтом.', 'Check the account email inbox, including spam.', 'Vérifiez la boîte e-mail liée au compte, y compris les courriers indésirables.'],
    ['Адрес, связанный с аккаунтом: ', 'Account email address: ', 'Adresse associée au compte : '],
    ['Адрес электронной почты аккаунта недоступен.', 'No account email address is available.', 'Aucune adresse e-mail de compte disponible.'],
    ['Отметить все как прочитанные', 'Mark all as read', 'Tout marquer comme lu'],
    ['Отметить как прочитанное', 'Mark as read', 'Marquer comme lu'],
    ['Уведомлений пока нет.', 'No notifications yet.', 'Aucune notification pour le moment.'],
    ['Уведомление аккаунта', 'Account notification', 'Notification du compte'],
    ['Срок: ', 'Period: ', 'Période : '],
    ['Сумма: ', 'Amount: ', 'Montant : '],
    ['Срок оплаты: ', 'Due date: ', 'Date d’échéance : '],
    ['Причина: ', 'Reason: ', 'Motif : '],
    ['Письмо передано почтовому сервису. Проверьте входящие и папку со спамом.', 'The email was accepted by the email service. Check your inbox and spam folder.', 'Un e-mail a été transmis. Vérifiez votre boîte de réception et les courriers indésirables.'],
    ['Письмо ожидает отправки или повторной попытки. Проверьте также папку со спамом.', 'The email is queued or being retried. Also check your spam folder.', 'L’e-mail est en attente ou fait l’objet d’une nouvelle tentative. Vérifiez aussi les courriers indésirables.'],
    ['Для этого уведомления письмо не отправлялось.', 'No email was sent for this notification.', 'Aucun e-mail n’a été envoyé pour cette notification.'],
    ['Ошибка отправки: ', 'Email sending error: ', 'Échec d’envoi : '],
    ['Синхронизация уведомлений недоступна.', 'Notification sync is unavailable.', 'La synchronisation des notifications est indisponible.'],
    ['Синхронизация документов недоступна.', 'Document sync is unavailable.', 'La synchronisation des documents est indisponible.'],
    ['Профили', 'Profiles', 'Fiches de profil'],
    ['Персональные документы', 'Custom documents', 'Documents personnalisés'],
    ['Категория', 'Category', 'Catégorie'],
    ['Выберите сохраненный шаблон', 'Choose a saved template', 'Choisir un modèle enregistré'],
    ['Выберите сохраненный документ', 'Choose a saved document', 'Choisir un document enregistré'],
    ['Новый документ', 'New document', 'Nouveau document'],
    ['Настройка документа', 'Customize', 'Personnaliser'],
    ['Название шаблона', 'Template name', 'Nom du modèle'],
    ['Название документа', 'Document title', 'Titre du document'],
    ['Тема и макет', 'Theme and layout', 'Thème et mise en page'],
    ['Готовая тема', 'Preset theme', 'Thème prédéfini'],
    ['Зеленый и синий', 'Green and blue', 'Vert et bleu'],
    ['Корпоративная', 'Corporate', 'Entreprise'],
    ['Фестиваль', 'Festival', 'Festival'],
    ['Ориентация A4', 'A4 orientation', 'Orientation A4'],
    ['Книжная', 'Portrait', 'Portrait'],
    ['Альбомная', 'Landscape', 'Paysage'],
    ['Форма', 'Shape', 'Forme'],
    ['Скругленная', 'Rounded', 'Arrondie'],
    ['Прямоугольная', 'Rectangular', 'Rectangulaire'],
    ['Бейдж', 'Badge', 'Badge'],
    ['Билет', 'Ticket', 'Billet'],
    ['Основной цвет', 'Primary color', 'Couleur principale'],
    ['Фон', 'Background', 'Arrière-plan'],
    ['Акцент', 'Accent', 'Accent'],
    ['Текст', 'Text', 'Texte'],
    ['Шрифт', 'Font', 'Police'],
    ['Поля и информация', 'Fields and information', 'Champs et informations'],
    ['Название поля', 'Field name', 'Nom du champ'],
    ['Показывать', 'Show', 'Afficher'],
    ['Переместить поле вверх', 'Move field up', 'Monter le champ'],
    ['Переместить поле вниз', 'Move field down', 'Descendre le champ'],
    ['Удалить поле', 'Remove', 'Retirer'],
    ['Добавить поле', 'Add field', 'Ajouter un champ'],
    ['Название нового поля', 'New field name', 'Nom du nouveau champ'],
    ['Текст', 'Text', 'Texte'],
    ['Число', 'Number', 'Nombre'],
    ['Дата', 'Date', 'Date'],
    ['Сохранить шаблон', 'Save template', 'Enregistrer le modèle'],
    ['Удалить шаблон', 'Delete template', 'Supprimer le modèle'],
    ['Сохранить документ', 'Save document', 'Enregistrer le document'],
    ['Удалить документ', 'Delete document', 'Supprimer le document'],
    ['Печать / PDF', 'Print / PDF', 'Imprimer / PDF'],
    ['Данные и шаблоны сохраняются в аккаунте. Чек является макетом, а билеты не проверяются билетным сервисом.', 'Documents and templates are saved in the account. The check is a layout mockup, and tickets are not validated by a ticketing service.', 'Les données et modèles sont enregistrés dans le compte. Le chèque est une maquette, et les billets ne sont pas validés par un service de billetterie.'],
    ['Отчет о заработной плате', 'Payroll report', 'Rapport de paie'],
    ['Чек зарплаты', 'Payroll check', 'Chèque de paie'],
    ['Бейдж персонала', 'Staff badge', 'Badge du personnel'],
    ['Печатный чек зарплаты', 'Printable payroll check', 'Chèque de paie imprimable'],
    ['Бейдж персонала мероприятия', 'Event staff badge', 'Badge du personnel événementiel'],
    ['Билет на мероприятие', 'Event ticket', 'Billet d’événement'],
    ['Расчет заработной платы', 'Payroll calculation summary', 'Récapitulatif de rémunération'],
    ['Логотип организации', 'Organization logo', 'Logo de l’organisation'],
    ['Организация', 'Organization', 'Organisation'],
    ['Имя сотрудника', 'Employee name', 'Nom du salarié'],
    ['Телефон', 'Phone', 'Téléphone'],
    ['Период оплаты', 'Pay period', 'Période de rémunération'],
    ['Количество заказов', 'Number of orders', 'Nombre de commandes'],
    ['Сумма заказов', 'Order amount', 'Montant des commandes'],
    ['Премии', 'Bonuses', 'Primes'],
    ['Штрафы (вводите отрицательное значение)', 'Penalties (enter a negative value)', 'Pénalités (saisir une valeur négative)'],
    ['К оплате', 'Total due', 'Montant total à payer'],
    ['Организация-эмитент', 'Issuing organization', 'Organisation émettrice'],
    ['Банк', 'Bank', 'Banque'],
    ['Номер чека', 'Check number', 'Numéro du chèque'],
    ['Дата выпуска', 'Issue date', 'Date d’émission'],
    ['Получатель', 'Payee', 'Bénéficiaire'],
    ['Сумма', 'Amount', 'Montant'],
    ['Валюта', 'Currency', 'Devise'],
    ['Назначение', 'Purpose', 'Motif'],
    ['Подпись уполномоченного лица', 'Authorized signature', 'Signature autorisée'],
    ['Мероприятие', 'Event', 'Événement'],
    ['Имя сотрудника', 'Staff member name', 'Nom du membre du personnel'],
    ['Должность', 'Role', 'Fonction'],
    ['Период действия', 'Validity dates', 'Dates de validité'],
    ['Номер бейджа', 'Badge number', 'Numéro du badge'],
    ['Контакт', 'Contact', 'Contact'],
    ['Название мероприятия', 'Event name', 'Nom de l’événement'],
    ['Тип мероприятия', 'Event type', 'Type d’événement'],
    ['Имя участника', 'Attendee name', 'Nom du participant'],
    ['Дата и время', 'Date and time', 'Date et heure'],
    ['Место проведения', 'Venue', 'Lieu'],
    ['Категория билета', 'Ticket category', 'Catégorie du billet'],
    ['Место', 'Seat', 'Place'],
    ['Номер билета', 'Ticket number', 'Numéro du billet'],
    ['Цена', 'Price', 'Prix'],
    ['Дополнительная информация', 'Additional information', 'Informations complémentaires'],
    ['Модель для печати: приложение не проверяет вход и не обрабатывает платежи.', 'Printable ticket mockup: the app does not validate entry or process payments.', 'Modèle de billet imprimable : l’application ne valide pas les entrées et ne traite pas les paiements.'],
    ['Только печатный макет: этот документ не является действительным банковским чеком.', 'Printable layout only: this document is not a valid bank check.', 'Maquette imprimable uniquement : ce document n’est pas un chèque bancaire valide.'],
    ['Выберите тип документа.', 'Choose a document type.', 'Choisissez un type de document.'],
    ['Неподдерживаемый тип документа.', 'Unsupported document type.', 'Type de document non pris en charge.'],
    ['Выберите название нового поля.', 'Enter a name for the new field.', 'Saisissez le nom du nouveau champ.'],
    ['В шаблоне может быть не более 40 полей.', 'A template can contain no more than 40 fields.', 'Un modèle ne peut pas contenir plus de 40 champs.'],
    ['Неподдерживаемый тип поля.', 'Unsupported field type.', 'Type de champ non pris en charge.'],
    ['Заголовок документа обязателен.', 'Document title is required.', 'Le titre du document est obligatoire.'],
    ['Модель сохранена в аккаунте.', 'Template saved to this account.', 'Modèle enregistré dans ce compte.'],
    ['Документ сохранен в аккаунте.', 'Document saved to this account.', 'Document enregistré dans ce compte.'],
    ['Документ слишком велик для сохранения.', 'Document is too large to save.', 'Le document est trop volumineux pour être enregistré.'],
    ['Документ сохранен, но некоторые старые изображения не удалось удалить: ', 'Document saved, but some old images could not be removed: ', 'Document enregistré, mais certaines anciennes images n’ont pas pu être supprimées : '],
    ['Сначала сохраните документ.', 'Save the document before deleting it.', 'Enregistrez le document avant de le supprimer.'],
    ['Удалить сохраненный документ без возможности восстановления?', 'Permanently delete this saved document?', 'Supprimer définitivement ce document enregistré ?'],
    ['Документ удален, но некоторые изображения не удалось удалить: ', 'Document deleted, but some images could not be removed: ', 'Document supprimé, mais certaines images n’ont pas pu être supprimées : '],
    ['Документ удален.', 'Document deleted.', 'Document supprimé.'],
    ['Сохраненный шаблон не выбран.', 'No saved template is selected.', 'Aucun modèle enregistré n’est sélectionné.'],
    ['Удалить сохраненный шаблон без возможности восстановления?', 'Permanently delete this saved template?', 'Supprimer définitivement ce modèle enregistré ?'],
    ['Шаблон удален.', 'Template deleted.', 'Modèle supprimé.'],
    ['Сохраненный шаблон не найден.', 'The selected template was not found.', 'Le modèle sélectionné est introuvable.'],
    ['Сохраненный документ не найден.', 'The selected document was not found.', 'Le document sélectionné est introuvable.'],
    ['Недопустимое изображение: используйте JPEG, PNG или WebP.', 'Invalid image: use JPEG, PNG, or WebP.', 'Image invalide : utilisez JPEG, PNG ou WebP.'],
    ['Размер изображения превышает 5 МБ.', 'Image exceeds the 5 MB limit.', 'L’image dépasse la limite de 5 Mo.'],
    ['Изображение сохранено в документе.', 'Image saved in this document.', 'Image enregistrée dans ce document.'],
    ['Добавить изображение', 'Add image', 'Ajouter une image'],
    ['Тип документа не поддерживается.', 'Document type is not supported.', 'Type de document non pris en charge.'],
    ['Код валюты', 'Currency code', 'Code de devise'],
    ['К оплате', 'Total due', 'Montant total à payer'],
    ['Рабочие пространства', 'Workspaces', 'Espaces de travail'],
    ['Аккаунт приостановлен', 'Account suspended', 'Compte suspendu'],
    ['Аккаунт снова активен', 'Account reactivated', 'Compte réactivé'],
    ['Делегирование предоставлено', 'Delegation granted', 'Délégation accordée'],
    ['Делегирование отозвано', 'Delegation revoked', 'Délégation révoquée'],
    ['Напоминание об оплате', 'Payment reminder', 'Rappel de paiement'],
    ['Исправление оплаты', 'Payment correction', 'Correction de paiement'],
    ['Чек зарплаты — печатный макет', 'Payroll check — printable mockup', 'Chèque de paie — modèle imprimable'],
    ['Необязательное изображение', 'Optional image', 'Image facultative'],
    ['Фото сотрудника', 'Employee photo', 'Photo du salarié'],
    ['Фото сотрудника мероприятия', 'Event staff photo', 'Photo du membre du personnel'],
    ['Бейдж сотрудника мероприятия', 'Event staff badge', 'Badge du personnel événementiel'],
    ['Обновить список документов', 'Refresh document list', 'Actualiser la liste des documents'],
    ['Войдите в аккаунт, чтобы сохранять документы.', 'Sign in to save documents to your account.', 'Connectez-vous pour enregistrer des documents dans votre compte.'],
    ['Войдите в аккаунт, чтобы открыть документы своего аккаунта.', 'Sign in to access your account documents.', 'Connectez-vous pour accéder aux documents de votre compte.'],
    ['Установить приложение', 'Install app', 'Installer l’application'],
    ['Чтобы установить приложение на iPhone или iPad, откройте эту страницу в Safari, нажмите «Поделиться», затем «На экран Домой».', 'To install this app on iPhone or iPad, open this page in Safari, tap Share, then Add to Home Screen.', 'Pour installer l’application sur iPhone ou iPad, ouvrez cette page dans Safari, touchez Partager, puis Sur l’écran d’accueil.'],
    ['В Safari на Mac откройте меню «Файл» и выберите «Добавить в Dock».', 'In Safari on Mac, open the File menu and choose Add to Dock.', 'Dans Safari sur Mac, ouvrez le menu Fichier puis choisissez Ajouter au Dock.'],
    ['Установка пока недоступна. Используйте меню браузера, чтобы установить приложение.', 'Installation is not available yet. Use the browser menu to install the app.', 'Installation impossible pour le moment. Utilisez le menu du navigateur pour installer l’application.'],
    ['Когда в уведомлении указано, что письмо отправлено, проверьте почту и папку со спамом.', 'When a notification says an email was sent, check the account inbox and spam folder.', 'Lorsqu’une notification indique qu’un e-mail a été transmis, vérifiez la boîte liée au compte et les courriers indésirables.']
  ];

  const supportedLanguages = ['ru', 'en', 'fr'];
  const compositeTranslations = {
    publicHero: {
      ru: 'Профессиональное <span class="highlight">управление профилями A4</span>',
      en: 'Professional <span class="highlight">A4 profile management</span>',
      fr: 'Gestion <span class="highlight">professionnelle de profils A4</span>'
    }
  };
  const dictionaries = { ru: {}, en: {}, fr: {} };
  phraseRows.forEach(row => {
    supportedLanguages.forEach((language, index) => {
      dictionaries[language][row[0]] = row[index];
      dictionaries[language][row[1]] = row[index];
      dictionaries[language][row[2]] = row[index];
    });
  });

  let language = 'ru';
  let originalTitle = '';
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();

  function getSavedLanguage() {
    try {
      const saved = localStorage.getItem('language');
      if (supportedLanguages.includes(saved)) return saved;
    } catch (error) {
      return supportedLanguages.includes(document.documentElement.lang)
        ? document.documentElement.lang
        : 'ru';
    }
    return supportedLanguages.includes(document.documentElement.lang)
      ? document.documentElement.lang
      : 'ru';
  }

  function translate(text) {
    if (dictionaries[language][text]) return dictionaries[language][text];
    const sources = Object.keys(dictionaries[language]).sort((a, b) => b.length - a.length);
    for (const source of sources) {
      if ((source.endsWith(' ') || /[:.!?…]$/.test(source)) && text.startsWith(source)) {
        return dictionaries[language][source] + text.slice(source.length);
      }
      if (!text.endsWith(source) || text.length === source.length) continue;
      const prefix = text.slice(0, -source.length);
      if (!/[A-Za-zА-Яа-яЁёÀ-ÿ0-9]/.test(prefix)) {
        return prefix + dictionaries[language][source];
      }
    }
    return text;
  }

  function isUserContent(node) {
    const element = node.parentElement;
    return !element || Boolean(element.closest('[contenteditable="true"], .profile-item, [data-i18n-ignore="true"], #deleteMessage strong, script, style, textarea'));
  }

  function translateTextNode(node) {
    if (isUserContent(node) || !node.nodeValue.trim()) return;
    const source = originalText.has(node) ? originalText.get(node) : node.nodeValue;
    if (!originalText.has(node)) originalText.set(node, source);
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    const content = source.slice(leading.length, source.length - trailing.length);
    node.nodeValue = leading + translate(content) + trailing;
  }

  function translateElementAttributes(element) {
    ['placeholder', 'title', 'aria-label', 'alt'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      let originals = originalAttributes.get(element);
      if (!originals) {
        originals = {};
        originalAttributes.set(element, originals);
      }
      if (!Object.prototype.hasOwnProperty.call(originals, attribute)) {
        originals[attribute] = element.getAttribute(attribute);
      }
      element.setAttribute(attribute, translate(originals[attribute]));
    });
  }

  function apply(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateElementAttributes(node);
    }
  }

  function applyCompositeTranslations() {
    document.querySelectorAll('[data-i18n-composite]').forEach(element => {
      const translations = compositeTranslations[element.dataset.i18nComposite];
      if (!translations) return;
      element.dataset.i18nIgnore = 'true';
      element.innerHTML = translations[language];
    });
  }

  function closeMenus() {
    document.querySelectorAll('[data-language-menu]').forEach(menu => {
      menu.hidden = true;
      const toggle = document.querySelector(`[data-language-toggle="${menu.dataset.languageMenu}"]`);
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function setLanguage(nextLanguage) {
    if (!supportedLanguages.includes(nextLanguage)) return language;
    language = nextLanguage;
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.warn('Could not persist the selected language.', error);
    }
    document.documentElement.lang = language;
    if (document.body) {
      applyCompositeTranslations();
      apply(document.body);
    }
    if (originalTitle) document.title = translate(originalTitle);
    document.querySelectorAll('[data-language-choice]').forEach(button => {
      const selected = button.dataset.languageChoice === language;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-language-select]').forEach(select => {
      select.value = language;
    });
    closeMenus();
    window.dispatchEvent(new CustomEvent('app-language-changed', { detail: { language } }));
    return language;
  }

  function start() {
    originalTitle = document.title;
    setLanguage(getSavedLanguage());
    if (document.body && window.MutationObserver) {
      const observer = new MutationObserver(records => {
        records.forEach(record => {
          record.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) apply(node);
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  document.addEventListener('click', event => {
    const choice = event.target.closest('[data-language-choice]');
    if (choice) {
      setLanguage(choice.dataset.languageChoice);
      return;
    }
    const toggle = event.target.closest('[data-language-toggle]');
    if (toggle) {
      const menu = document.querySelector(`[data-language-menu="${toggle.dataset.languageToggle}"]`);
      if (!menu) return;
      const willOpen = menu.hidden;
      closeMenus();
      menu.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
      return;
    }
    if (!event.target.closest('[data-language-menu]')) closeMenus();
  });

  window.AppI18n = {
    currentLanguage: () => language,
    setLanguage,
    t: translate
  };

  const nativeAlert = window.alert.bind(window);
  const nativeConfirm = window.confirm.bind(window);
  window.alert = message => nativeAlert(translate(String(message)));
  window.confirm = message => nativeConfirm(translate(String(message)));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
