const appEventHandlers = {
  h4: function(event) {
    toggleAdminSettings()
  },
  h5: function(event) {
    toggleShortcuts()
  },
  h6: function(event) {
    showAdminTab('photos')
  },
  h7: function(event) {
    showAdminTab('colors')
  },
  h8: function(event) {
    showAdminTab('fonts')
  },
  h9: function(event) {
    showAdminTab('settings')
  },
  h60: function(event) {
    showAdminTab('language')
  },
  h61: function(event) {
    changeLanguage(event.target.value)
  },
  h10: function(event) {
    loadDefaultPhoto(event, 'male')
  },
  h11: function(event) {
    loadDefaultPhoto(event, 'female')
  },
  h12: function(event) {
    loadDefaultPhoto(event, 'other')
  },
  h13: function(event) {
    switchColorMode()
  },
  h14: function(event) {
    updateColorSettings()
  },
  h15: function(event) {
    updateFontSettings()
  },
  h16: function(event) {
    resetColorsToDefault()
  },
  h17: function(event) {
    exportColorsSettings()
  },
  h18: function(event) {
    importColorsSettings()
  },
  h19: function(event) {
    exportDatabase()
  },
  h20: function(event) {
    importDatabaseBackup(event)
  },
  h21: function(event) {
    document.getElementById('profileImportInput').click()
  },
  h22: function(event) {
    switchPage('app')
  },
  h23: function(event) {
    scrollToFeatures()
  },
  h24: function(event) {
    if(event.key==='Enter') loginUser()
  },
  h25: function(event) {
    loginUser()
  },
  h26: function(event) {
    showPasswordRecovery()
  },
  h27: function(event) {
    toggleRegisterForm()
  },
  h28: function(event) {
    registerUser()
  },
  h29: function(event) {
    sendPasswordRecovery()
  },
  h30: function(event) {
    showLoginForm()
  },
  h31: function(event) {
    updatePassword()
  },
  h32: function(event) {
    toggleMobilePanel('left')
  },
  h33: function(event) {
    toggleMobilePanel('right')
  },
  h34: function(event) {
    closeMobilePanels()
  },
  h35: function(event) {
    filterProfiles()
  },
  h36: function(event) {
    createNewProfile()
  },
  h37: function(event) {
    openBatchExport()
  },
  h38: function(event) {
    deleteCurrentProfile()
  },
  h39: function(event) {
    resetDatabase()
  },
  h40: function(event) {
    logoutUser()
  },
  h41: function(event) {
    updateElementSize('name', this.value)
  },
  h42: function(event) {
    updateElementSize('phone', this.value)
  },
  h43: function(event) {
    updateElementSize('date', this.value)
  },
  h44: function(event) {
    updateElementSize('row', this.value)
  },
  h45: function(event) {
    updateElementSize('totalPrice', this.value)
  },
  h46: function(event) {
    updateElementSize('totalLabel', this.value)
  },
  h47: function(event) {
    updateFontLive()
  },
  h48: function(event) {
    updateGender()
  },
  h49: function(event) {
    updateCountry()
  },
  h50: function(event) {
    loadImage(event)
  },
  h51: function(event) {
    printWithName()
  },
  h52: function(event) {
    closeModal('deleteModal')
  },
  h53: function(event) {
    confirmDeleteProfile()
  },
  h54: function(event) {
    closeModal('resetModal')
  },
  h55: function(event) {
    confirmResetDatabase()
  },
  h56: function(event) {
    selectAllBatchProfiles()
  },
  h57: function(event) {
    deselectAllBatchProfiles()
  },
  h58: function(event) {
    closeModal('batchExportModal')
  },
  h59: function(event) {
    executeBatchPrint()
  },
  h63: function(event) {
    acceptAccountTerms()
  },
  h64: function(event) {
    searchAdminAccounts()
  },
  h65: function(event) {
    performAccountAdminAction('moderate_account', 'suspend')
  },
  h66: function(event) {
    performAccountAdminAction('moderate_account', 'reactivate')
  },
  h67: function(event) {
    performAccountAdminAction('manage_moderator', 'grant')
  },
  h68: function(event) {
    performAccountAdminAction('manage_moderator', 'revoke')
  },
  h69: function(event) {
    selectAdminAccount(this.dataset.accountTargetId)
  },
  h70: function(event) {
    retryAccountAccess()
  },
  h71: function(event) {
    updateTermsAcceptButton(event)
  },
  h72: function(event) {
    saveAccountPaymentDue()
  },
  h73: function(event) {
    markAccountPaymentPaid(this.dataset.paymentId)
  },
  h74: function(event) {
    cancelAccountPayment(this.dataset.paymentId)
  },
  h75: function(event) {
    loadAccountPayments()
  },
  h76: function(event) {
    window.AppDocuments.showProfiles()
  },
  h77: function(event) {
    window.AppDocuments.activate()
  },
  h78: function(event) {
    window.AppNotifications.toggle()
  },
  h79: function(event) {
    window.AppNotifications.markAllRead()
  },
  h80: function(event) {
    window.AppNotifications.markRead(this.dataset.notificationId)
  },
  h81: function(event) {
    window.AppDocuments.createPreset(this.value)
  },
  h82: function(event) {
    window.AppDocuments.loadTemplate(this.value)
  },
  h83: function(event) {
    if (this.value) window.AppDocuments.loadDocument(this.value)
  },
  h84: function(event) {
    window.AppDocuments.createPreset(document.getElementById('documentCategory').value)
  },
  h85: function(event) {
    window.AppDocuments.saveTemplate()
  },
  h86: function(event) {
    window.AppDocuments.addField()
  },
  h87: function(event) {
    window.AppDocuments.updateFromElement(this)
  },
  h88: function(event) {
    window.AppDocuments.moveField(this.dataset.documentFieldMove, Number(this.dataset.documentDirection))
  },
  h89: function(event) {
    window.AppDocuments.removeField(this.dataset.documentFieldRemove)
  },
  h90: function(event) {
    window.AppDocuments.saveDocument()
  },
  h91: function(event) {
    window.AppDocuments.deleteTemplate()
  },
  h92: function(event) {
    window.AppDocuments.deleteDocument()
  },
  h93: function(event) {
    window.AppDocuments.print()
  },
  h94: function(event) {
    window.AppDocuments.refresh()
  }
};

for (const eventType of ["click","change","keypress","keyup","input"]) {
  document.addEventListener(eventType, event => {
    let element = event.target;
    if (element && element.nodeType !== 1) element = element.parentElement;

    while (element && element !== document.documentElement) {
      const handlerId = element.getAttribute(`data-handler-${eventType}`);
      const handler = handlerId && appEventHandlers[handlerId];
      if (handler) {
        if (handler.call(element, event) === false) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (event.cancelBubble) break;
      }
      element = element.parentElement;
    }
  });
}
