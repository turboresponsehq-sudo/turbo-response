(() => {
  const stories = [
    { title: 'Politics & Policy', body: 'Understand the decisions shaping Georgia. This preview is ready for verified reporting and explainers.' },
    { title: 'Women in Leadership', body: 'Profiles of Black women serving Georgia communities will be added after editorial verification.' },
    { title: 'Culture & Community', body: 'Stories where civic life, culture and business meet — with community voices at the center.' },
    { title: 'Events & Action', body: 'Discover civic events and community opportunities as the calendar becomes active.' }
  ];
  const results = document.querySelector('#story-results');
  const dialog = document.querySelector('#story-dialog');
  const dialogTitle = document.querySelector('#dialog-title');
  const dialogCopy = document.querySelector('#dialog-copy');

  const renderStories = (query = '') => {
    const normalized = query.trim().toLowerCase();
    const matches = stories.filter((story) => `${story.title} ${story.body}`.toLowerCase().includes(normalized));
    results.innerHTML = `
      <label class="sr-only" for="story-search">Search stories</label>
      <input id="story-search" type="search" placeholder="Search stories and topics" value="${query.replaceAll('"', '&quot;')}" style="grid-column:1/-1;width:100%;padding:15px;background:#fff;color:#111;border:0">
      ${matches.map((story) => `<article class="card"><span class="tag">EDITORIAL PREVIEW</span><h3>${story.title}</h3><p>${story.body}</p><button type="button" class="open-story" data-title="${story.title}" style="background:#d51d37;color:#fff;border:0;padding:12px;margin-top:16px;cursor:pointer">READ MORE</button></article>`).join('') || '<p>No matching topics.</p>'}`;
    results.querySelector('#story-search').addEventListener('input', (event) => renderStories(event.target.value));
  };

  renderStories();

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.open-story');
    if (button) {
      const story = stories.find((item) => item.title === button.dataset.title);
      if (!story) return;
      dialogTitle.textContent = story.title;
      dialogCopy.textContent = `${story.body} This preview does not present unpublished claims as reporting.`;
      dialog.showModal();
    }
    const interest = event.target.closest('[data-interest]');
    if (interest) {
      window.location.hash = 'involved';
      const email = document.querySelector('#email');
      if (email) email.focus();
    }
  });

  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.querySelector('#signup').addEventListener('submit', (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector('button');
    const previous = button.textContent;
    button.textContent = 'PREVIEW ONLY';
    button.disabled = true;
    window.setTimeout(() => { button.textContent = previous; button.disabled = false; }, 2400);
  });
})();
