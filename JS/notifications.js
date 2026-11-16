(function() {
  let client = null;
  let userId = null;
  let userEmail = '';
  let channel = null;
  let notifications = [];
  let unreadCount = 0;
  let refreshTimer = null;

  const titles = {
    suspended: 'Compte suspendu',
    reactivated: 'Compte réactivé',
    moderator_granted: 'Délégation accordée',
    moderator_revoked: 'Délégation révoquée',
    payment_due_created: 'Échéance créée',
    payment_due_updated: 'Échéance modifiée',
    payment_due_cancelled: 'Échéance annulée',
    payment_receipt: 'Paiement confirmé',
    payment_reminder: 'Rappel de paiement',
    payment_correction: 'Correction de paiement'
  };

  function translated(text) {
    return window.AppI18n.t(text);
  }

  function setFeedback(message, isError) {
    const feedback = document.getElementById('accountNotificationFeedback');
    feedback.textContent = message || '';
    feedback.classList.toggle('error', !!isError);
  }

  function appendDetail(lines, label, value) {
    if (value === undefined || value === null || value === '') return;
    lines.push(`${translated(label)} ${value}`);
  }

  function notificationMessage(notification) {
    const details = notification.details || {};
    const lines = [];
    appendDetail(lines, 'Période : ', details.period ? String(details.period).slice(0, 7) : '');
    if (details.amount !== undefined) {
      appendDetail(lines, 'Montant : ', `${Number(details.amount).toFixed(2)} ${details.currency || ''}`.trim());
    }
    appendDetail(lines, 'Date d’échéance : ', details.due_date);
    appendDetail(lines, 'Motif : ', details.reason);

    if (notification.email_status === 'accepted') {
      lines.push(translated('Un e-mail a été transmis. Vérifiez votre boîte de réception et les courriers indésirables.'));
    } else if (notification.email_status === 'queued' || notification.email_status === 'retrying') {
      lines.push(translated('L’e-mail est en attente ou fait l’objet d’une nouvelle tentative. Vérifiez aussi les courriers indésirables.'));
    } else if (notification.email_status === 'skipped') {
      lines.push(translated('Aucun e-mail n’a été envoyé pour cette notification.'));
    }
    if (notification.email_error) {
      lines.push(`${translated('Échec d’envoi : ')}${notification.email_error}`);
    }
    return lines.join('\n');
  }

  function render() {
    const list = document.getElementById('accountNotificationList');
    const button = document.getElementById('accountNotificationsButton');
    const count = document.getElementById('accountNotificationCount');
    count.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
    count.hidden = unreadCount === 0;
    button.setAttribute('aria-label', translated('Notifications') + (unreadCount ? ` (${unreadCount})` : ''));
    list.replaceChildren();

    if (!notifications.length) {
      const empty = document.createElement('li');
      empty.className = 'notification-empty';
      empty.textContent = translated('Aucune notification pour le moment.');
      list.appendChild(empty);
    }

    notifications.forEach(notification => {
      const item = document.createElement('li');
      item.className = 'account-notification-item';
      item.classList.toggle('unread', !notification.read_at);

      const heading = document.createElement('div');
      heading.className = 'account-notification-heading';
      const title = document.createElement('strong');
      title.textContent = translated(titles[notification.event_type] || 'Notification du compte');
      heading.appendChild(title);

      const date = document.createElement('time');
      date.dateTime = notification.created_at;
      date.textContent = new Date(notification.created_at).toLocaleString(window.AppI18n.currentLanguage());
      heading.appendChild(date);
      item.appendChild(heading);

      const body = document.createElement('p');
      body.textContent = notificationMessage(notification);
      item.appendChild(body);

      if (!notification.read_at) {
        const markRead = document.createElement('button');
        markRead.type = 'button';
        markRead.className = 'secondary';
        markRead.dataset.notificationId = notification.id;
        markRead.dataset.handlerClick = 'h80';
        markRead.textContent = translated('Marquer comme lu');
        item.appendChild(markRead);
      }
      list.appendChild(item);
    });

    document.getElementById('accountNotificationsMarkAll').hidden = unreadCount === 0;
    document.getElementById('accountNotificationEmail').textContent = userEmail
      ? `${translated('Adresse associée au compte : ')}${userEmail}`
      : translated('Aucune adresse e-mail de compte disponible.');
  }

  async function load() {
    if (!client || !userId) return;
    const requestedUserId = userId;
    const [listResult, unreadResult] = await Promise.all([
      client.from('account_notifications')
        .select('id,category,event_type,details,email_status,email_error,created_at,read_at')
        .eq('user_id', requestedUserId)
        .order('created_at', { ascending: false })
        .limit(100),
      client.from('account_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', requestedUserId)
        .is('read_at', null)
    ]);
    if (listResult.error) throw listResult.error;
    if (unreadResult.error) throw unreadResult.error;
    if (userId !== requestedUserId) return;
    notifications = listResult.data || [];
    unreadCount = unreadResult.count || 0;
    setFeedback('', false);
    render();
  }

  function subscribe() {
    if (!client || !userId) return;
    const subscribedUserId = userId;
    channel = client.channel(`account-notifications:${subscribedUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'account_notifications',
        filter: `user_id=eq.${subscribedUserId}`
      }, () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
          load().catch(error => setFeedback(error.message, true));
        }, 150);
      })
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setFeedback(translated('La synchronisation des notifications est indisponible.'), true);
        }
      });
  }

  async function initialize(supabaseClient, accountId, email) {
    await reset();
    client = supabaseClient;
    userId = accountId;
    userEmail = email || '';
    document.getElementById('accountNotificationsButton').hidden = false;
    document.getElementById('accountNotificationPanel').hidden = true;
    try {
      await load();
    } catch (error) {
      setFeedback(error.message, true);
    }
    subscribe();
  }

  async function reset() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    if (channel && client) {
      await client.removeChannel(channel);
    }
    client = null;
    userId = null;
    userEmail = '';
    channel = null;
    notifications = [];
    unreadCount = 0;
    const button = document.getElementById('accountNotificationsButton');
    if (button) {
      button.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
    const panel = document.getElementById('accountNotificationPanel');
    if (panel) panel.hidden = true;
    const list = document.getElementById('accountNotificationList');
    if (list) list.replaceChildren();
    const feedback = document.getElementById('accountNotificationFeedback');
    if (feedback) setFeedback('', false);
  }

  function toggle() {
    const panel = document.getElementById('accountNotificationPanel');
    panel.hidden = !panel.hidden;
    document.getElementById('accountNotificationsButton').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) load().catch(error => setFeedback(error.message, true));
  }

  async function markRead(id) {
    if (!client || !userId || !/^\d+$/.test(String(id))) return;
    const { error } = await client.from('account_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', Number(id))
      .eq('user_id', userId)
      .is('read_at', null);
    if (error) {
      setFeedback(error.message, true);
      return;
    }
    await load();
  }

  async function markAllRead() {
    if (!client || !userId) return;
    const { error } = await client.from('account_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);
    if (error) {
      setFeedback(error.message, true);
      return;
    }
    await load();
  }

  function setLanguage() {
    if (userId) render();
  }

  window.AppNotifications = { initialize, reset, toggle, markRead, markAllRead, setLanguage };
})();
