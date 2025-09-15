async function main() {
  // Use browser.* if available, otherwise fall back to chrome.*
  if (typeof browser === 'undefined') {
    var browser = chrome;
  }

  const subPrefixes = {
    anime: '#',
    manga: '//#',
    AnimeImpressions: '#'
  };
  const invalidFacesMap = {
    anime: new Set(['#live', '#live', '#sidebarimg', '#sidebarimg2', '#sidebarimg3', '#s', '#wiki_']),
    manga: new Set(),
    AnimeImpressions: new Set()
  }

  /*
  ** Get current sub to distinct between Subreddits
  */
  const sub = window.location.href.match(/reddit\.com\/r\/([^\/]+)/)?.[1];
  const subPrefix = subPrefixes[sub];
  const invalidFaces = invalidFacesMap[sub];

  const cssUrl = Array.from(document.styleSheets).find((css) => css?.href?.includes('thumbs.redditmedia.com')).href;

  async function fetchAndParseCommentFaces(link) {
    const resp = await fetch(link).then((resp) => resp.text());

    const faces = new Set([...resp.matchAll(new RegExp(`\\[href[^\^]?="(${subPrefix}[\\w\\d\\-_]+?)"`, 'gi'))].map(m => m[1]));
    return Array.from(faces).filter((face) => !invalidFaces.has(face));
  }

  const commentFaces = await fetchAndParseCommentFaces(cssUrl);

// Get Stored options

  function onError(error) {
    // console.log(`Error: ${error}`);
  }

  function onGot(result) {
    if (result.opcommentfaces !== undefined) {
      cf = result.opcommentfaces;
    } else {
      cf = true;
    }

    if (result.opanisearch !== undefined) {
      as = result.opanisearch;
    } else {
      as = true;
    }

    if (result.opspoiler !== undefined) {
      sp = result.opspoiler;
    } else {
      sp = false;
    }

    if (result.nuspoiler !== undefined) {
      nsp = result.nuspoiler;
    } else {
      nsp = false;
    }

    if (nsp) {
      nuSpoilers();
    }

    createMenu(cf, as, sp);
  }

// Get Option Data from Storage

  const getting = browser.storage.local.get(['opcommentfaces', 'opanisearch', 'opspoiler', 'nuspoiler']);
  getting.then(onGot, onError);

// Create Menu

  let menu = '';

  function createMenu(cf, as, sp) {
    menu += '<div class="md ranimeenhanced"><form action="" class="commentfaces">';
    if (cf) {
      menu += '<a class="stab showcommentfacestab">Commentfaces</a>';
    }
    if (as) {
      menu += '<a class="stab anilisttab">AniList</a>';
    }
    if (sp) {
      menu += '<a class="stab formattab">Formatting</a>';
    }
    if (cf) {
      menu += '<div class="tabwrapper commenttabwrapper">';
      menu += '<a class="showrecentcommentfaces">🕐</a>';
      // menu += '<a class="showrecentfavouritefaces">♥</a>';
      menu += '<a class="showallcommentfaces">Browse Faces</a>';
      menu += '<input type="text" class="commentfacesearch" placeholder="search commentfaces">';
      menu += '<input type="text" class="commentfacetext texttop" placeholder="Toptext">';
      menu += '<input type="text" class="commentfacetext textbottom" placeholder="Bottomtext">';
      menu += '<input type="text" class="commentfacetext texthover" placeholder="Hovertext">';
      menu += '</div>';
    }
    if (as) {
      menu += '<div class="tabwrapper anilisttabwrapper">';
      menu += '<input type="text" class="aniListSearch anilist" placeholder="Search Media">';
      menu += '<input type="text" class="aniListSearchCharacters anilist" placeholder="Search Characters">';
      menu += '<input type="text" class="aniListSearchStaff anilist" placeholder="Search Staff">';
      menu += '<input type="text" class="aniListSearchStudios anilist" placeholder="Search Studios">';
      menu += '</div>';
    }
    if (sp) {
      menu += '<div class="tabwrapper formattabwrapper">';
      menu += '<a class="addSpoiler newspoiler">New Spoiler</a>';
      menu += '</div>';
    }
    menu += '<div class="commentfacewrapper">';
    menu += '<div class="commentfacecontainer"></div></div></form></div>';

    /*
    ** Create Commentface Input on initialy reply to thread reply field
    */

    const form = $('.commentarea').children('form');
    form.prepend(menu);
    createCommentfacefield(form);
  }

  /*
  ** Create Commentface Input Field on Click at the container of the Click
  */

  const replyButton = document.getElementsByClassName('reply-button');

  for (var i = 0; i < replyButton.length; i++) {
    replyButton[i].addEventListener('click', function () {
      const form = $(this).parents('.entry').siblings('.child').children('form');

      form.children('.md').remove();

      /*
      ** Add new field
      */

      form.prepend(menu);
      createCommentfacefield(form);

      const innerform = $(form).children('.ranimeenhanced').children('.commentfaces');
      initializeTabs();
    });
  }

  /*
  ** Clicking on Edit Button
  */

  const editButton = document.getElementsByClassName('edit-usertext');

  for (var i = 0; i < editButton.length; i++) {
    editButton[i].addEventListener('click', function () {
      const form = $(this).parents('.entry').children('form');

      // Remove Copy from initial reply field and clear commentfield

      form.children('.md').remove();

      // Add new field

      form.prepend(menu);
      createCommentfacefield(form);
    });
  }

  /*
  ** Remove Edit Commentfacefield on Cancel or Submit
  */

  const cancelButton = document.getElementsByClassName('cancel');

  for (var i = 0; i < cancelButton.length; i++) {
    cancelButton[i].addEventListener('click', function () {
      $(this).parents('form').children('.md').remove();
    });
  }

  const saveButton = document.getElementsByClassName('save');

  for (var i = 0; i < saveButton.length; i++) {
    saveButton[i].addEventListener('click', function () {
      $(this).parents('form').children('.md').remove();
    });
  }

  function createCommentfacefield(form) {
    const innerform = $(form).children('.ranimeenhanced').children('.commentfaces');

    initializeTabs(innerform);

    setUpFormat(innerform);
  }

  /*
  ** Initialize Tabs
  */

  function initializeTabs(innerform) {
    const showcommentfacestab = innerform.children('.showcommentfacestab');
    const anilisttab = innerform.children('.anilisttab');
    const formattab = innerform.children('.formattab');

    showcommentfacestab.click(() => {
      if (showcommentfacestab.siblings('.commenttabwrapper').css('display') === 'none') {
        showcommentfacestab.siblings('.anilisttabwrapper').css('display', 'none');
        showcommentfacestab.siblings('.formattabwrapper').css('display', 'none');
        showcommentfacestab.siblings('.commenttabwrapper').css('display', 'inherit');

        innerform.children('.commentfacewrapper').children('.commentfacecontainer').html('');
        createCommentfaces(innerform);
      } else {
        showcommentfacestab.siblings('.commenttabwrapper').css('display', 'none');
        innerform.children('.commentfacewrapper').css('display', 'none');
      }
    });

    anilisttab.click(() => {
      if (anilisttab.siblings('.anilisttabwrapper').css('display') === 'none') {
        anilisttab.siblings('.commenttabwrapper').css('display', 'none');
        anilisttab.siblings('.formattabwrapper').css('display', 'none');
        anilisttab.siblings('.anilisttabwrapper').css('display', 'inherit');

        innerform.children('.commentfacewrapper').children('.commentfacecontainer').html('');
        setUpAniListSearch(innerform);
      } else {
        anilisttab.siblings('.anilisttabwrapper').css('display', 'none');
        innerform.children('.commentfacewrapper').css('display', 'none');
      }
    });

    formattab.click(() => {
      if (formattab.siblings('.formattabwrapper').css('display') === 'none') {
        innerform.children('.commentfacewrapper').css('display', 'none');
        formattab.siblings('.commenttabwrapper').css('display', 'none');
        formattab.siblings('.anilisttabwrapper').css('display', 'none');
        formattab.siblings('.formattabwrapper').css('display', 'inherit');

        innerform.children('.commentfacewrapper').children('.commentfacecontainer').html('');
      } else {
        formattab.siblings('.formattabwrapper').css('display', 'none');
        innerform.children('.commentfacewrapper').css('display', 'none');
      }
    });
  }

  function createCommentfaces(innerform) {
    const classnamesearch = innerform.children('.commenttabwrapper').children('.commentfacesearch');

    classnamesearch.keyup(function () {
      let result = '';
      const filteredFaces = commentFaces.filter((x) => x.toLowerCase().includes(this.value));
      $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').css('display', 'inherit');

      const texttop = $(this).siblings('.texttop:first').val();
      const textbottom = $(this).siblings('.textbottom:first').val();
      const texthover = $(this).siblings('.texthover:first').val();

      filteredFaces.forEach((filteredFace) => {
        result += generateCommentfaces(filteredFace, texttop, textbottom, texthover);
      });
      $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .html(result);

      const activecommentfaces = $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .children('.addCommentface');

      for (let i = 0; i < activecommentfaces.length; i++) {
        activecommentfaces[i].addEventListener('mousedown', addClickEvent, false);
      }
    });

    /*
    ** Set the Commentface text on input on the dummy commentFaces
    */

    const commentfacetext = innerform.children('.commenttabwrapper').children('.commentfacetext');

    commentfacetext.keyup(function () {
      const inputclass = $(this).attr('class').split(' ')[1];
      const inputvalue = $(this).val();

      const commentfacefield = $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .children('a');
      commentfacefield.each(function () {
        const facecontent = $(this).html();
        if (inputclass === 'texttop') {
          if (/<strong>.*<\/strong>/.test(facecontent)) {
            var strong = facecontent.match('<strong>.*<\/strong>');
            $(this).html(inputvalue + strong);
          } else {
            $(this).html(inputvalue);
          }
        } else if (inputclass === 'textbottom') {
          var strong = facecontent.replace(/<strong>.*<\/strong>/g, '');
          $(this).html(`${strong}<strong>${inputvalue}</strong>`);
        } else if (inputclass === 'texthover') {
          $(this).attr('title', inputvalue);
        }
      });
    });

    /*
    ** Browse Commentfaces
    ** Note: The whole filtering should be put into it's own function. At this point I got the same code twice
    */

    const showallcommentfaces = innerform.children('.commenttabwrapper').children('.showallcommentfaces');

    showallcommentfaces.click(function () {
      let result = '';
      $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').css('display', 'inherit');

      const texttop = $(this).siblings('.texttop:first').val();
      const textbottom = $(this).siblings('.textbottom:first').val();
      const texthover = $(this).siblings('.texthover:first').val();

      commentFaces.forEach((filteredFace) => {
        /*
        ** Distinction between subs necessary since the css build differs
        */
        result += generateCommentfaces(filteredFace, texttop, textbottom, texthover);
      });

      $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .html(result);

      const activecommentfaces = $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .children('.addCommentface');

      for (let i = 0; i < activecommentfaces.length; i++) {
        /*
        ** Setting up actions on Clicking the Dummy Commentfaces
        */
        activecommentfaces[i].addEventListener('mousedown', addClickEvent, false);
      }
    });

    function generateCommentfaces(filteredFace, texttop, textbottom, texthover) {
      let inner = texttop;

      if (typeof textbottom !== 'undefined') {
        inner += `<strong>${textbottom}</strong>`;
      }
      const hoverText = texthover ? ` title="${texthover}"` : '';
      return `<a href="${filteredFace}" class="addCommentface"${hoverText} data-href-url="${filteredFace}" rel="nofollow">${inner}</a>`;
      // if (sub === 'manga') {
      //   return `<a href="//#${filteredFace}" class="addCommentface" title="${texthover}" data-href-url="//#${filteredFace}">${inner}</a>`;
      // }
      // if (sub === 'anime' || sub === 'ftfanime' || sub === 'AnimeImpressions') {
      //   return `<a href="#${filteredFace}" class="addCommentface" title="${texthover}" data-href-url="#${filteredFace}" rel="nofollow">${inner}</a>`;
      // }
    }

    /*
    ** Shows the ten recently used Commentfaces
    */

    const showrecentcommentfaces = innerform.children('.commenttabwrapper').children('.showrecentcommentfaces');

    showrecentcommentfaces.click(function () {
      let result = '';
      $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').css('display', 'inherit');

      const texttop = $(this).siblings('.texttop:first').val();
      const textbottom = $(this).siblings('.textbottom:first').val();
      const texthover = $(this).siblings('.texthover:first').val();

      let storageItemList = localStorage.getItem('recent');
      if (storageItemList !== null) {
        storageItemList = storageItemList.replace('#', '');
        storageItemList = storageItemList.split(',');
        storageItemList = storageItemList.reverse();

        storageItemList.forEach((itemList) => {
          // Check if Commentface Code is included in the subs CSS, if not, don't show it
          if (commentFaces.includes(itemList.replace('#', ''))) {
            result += generateCommentfaces(itemList.replace('#', ''), texttop, textbottom, texthover);
          }
        });
      }

      if (result === '') {
        result = '<br />No Commentfaces used recently.';
      }
      $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .html(result);

      const activecommentfaces = $(this).parents('.commenttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer')
          .children('.addCommentface');

      for (let i = 0; i < activecommentfaces.length; i++) {
        activecommentfaces[i].addEventListener('mousedown', addClickEvent, false);
      }
    });
  }

  /*
  ** Setup AniList Search
  */

  function setUpAniListSearch(innerform) {
    innerform.children('.anilisttabwrapper').children('.aniListSearch').keyup(function (e) {
      if (e.keyCode === 13) {
        const query = $(this).val();
        searchOnAniList(query, $(this), 'anime');
      }
    });

    innerform.children('.anilisttabwrapper').children('.aniListSearchStaff').keyup(function (e) {
      if (e.keyCode === 13) {
        const query = $(this).val();
        searchOnAniList(query, $(this), 'staff');
      }
    });

    innerform.children('.anilisttabwrapper').children('.aniListSearchStudios').keyup(function (e) {
      if (e.keyCode === 13) {
        const query = $(this).val();
        searchOnAniList(query, $(this), 'studios');
      }
    });

    innerform.children('.anilisttabwrapper').children('.aniListSearchCharacters').keyup(function (e) {
      if (e.keyCode === 13) {
        const query = $(this).val();
        searchOnAniList(query, $(this), 'characters');
      }
    });
  }

  /*
  ** Set Up Spoiler Button
  */

  function setUpFormat(innerform) {
    innerform.children('.formattabwrapper').children('.addSpoiler').click(function (e) {
      e.preventDefault;

      const txtarea = $(this).parents('.formattabwrapper').parents('.commentfaces').parents('.md')
          .siblings('.usertext-edit')
          .children('.md')
          .children('textarea');
      const start = txtarea[0].selectionStart;
      const finish = txtarea[0].selectionEnd;
      const sel = txtarea[0].value.substring(start, finish);

      const output = `[] >!${sel}!<`;

      const formfieldbefore = txtarea.val().substr(0, start);
      const formfieldafter = txtarea.val().substr(finish, txtarea.val().length);

      txtarea.val(formfieldbefore + output + formfieldafter);

      txtarea.focus();
    });
  }

  /*
  ** Save Faces to show most recent ones
  */

  function saveRecentFaces(store) {
    let storageItemList = localStorage.getItem('recent');
    if (storageItemList !== null) {
      if (storageItemList.includes(store)) {
        storageItemList = storageItemList.replace(store, '');
        storageItemList = storageItemList.replace(',,', ',');
        if (storageItemList[0] === ',') {
          storageItemList = storageItemList.substr(1);
        }
      }
      if (storageItemList.match(/#/g).length > 9) {
        storageItemList = storageItemList.replace(/#(.*?),/, '');
      }
      localStorage.setItem('recent', `${storageItemList},${store}`);
    } else {
      localStorage.setItem('recent', store);
    }
  }

  function addClickEvent(e) {
    e.preventDefault();

    /*
    ** Get href from clickedCommentface to set it into the textarea
    */

    let commentcode = this.getAttribute('href');
    if (commentcode.includes('https')) {
      const raute = commentcode.indexOf('#');
      commentcode = commentcode.substr(raute, commentcode.length - 1);
      this.setAttribute('href', commentcode);
    }
    saveRecentFaces(commentcode);
    let commentfacetext = this.innerHTML;
    commentfacetext = commentfacetext.replace('<strong>', '**');
    commentfacetext = commentfacetext.replace('</strong>', '**');
    if (this.title != '') {
      var commentfacetexthover = ` '${this.title}'`;
    } else {
      var commentfacetexthover = '';
    }
    let output = `[${commentfacetext}](${commentcode}${commentfacetexthover})`;
    output = output.replace('****', '');

    /*
    ** Get texarea to insert to
    */

    const formfield = $(this).parents('.commentfacecontainer').parents('.commentfacewrapper').parents('.commentfaces')
        .parents('.md')
        .siblings('.usertext-edit')
        .children('.md')
        .children('textarea');

    insertOutput(output, formfield);

    e.stopImmediatePropagation();
  }

  function insertOutput(output, formfield) {
    const cursorposition = formfield.prop('selectionStart');
    const formfieldcontent = formfield.val();

    if (cursorposition === 'undefined') {
      formfield.val(formfield.val() + output);
    } else {
      if (formfieldcontent.length > 0) {
        const formfieldbefore = formfieldcontent.substr(0, cursorposition);
        const formfieldafter = formfieldcontent.substr(cursorposition, formfieldcontent.length);
        formfield.val(formfieldbefore + output + formfieldafter);
      } else {
        formfield.val(output);
      }

      formfield.focus();
    }
  }

  /*
  ** Anilist API
  */

  /*
  ** Api Query Call
  */

  let topic;

  function searchOnAniList(searchterm, targetelement, field) {
    topic = field;
    if (topic === 'anime') {
      var query = `
    query ($id: Int, $page: Int, $perPage: Int, $search: String) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media (id: $id, search: $search) {
          id
          title {
            romaji
          }
          coverImage {
            medium
          }
          type
          format
        }
      }
    }
    `;
    } else if (topic === 'staff') {
      var query = `
    query ($id: Int, $page: Int, $perPage: Int, $search: String) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        staff (id: $id, search: $search) {
          id
          name {
            first
            last
          }
          image {
            medium
          }
        }
      }
    }
    `;
    } else if (topic === 'studios') {
      var query = `
    query ($id: Int, $page: Int, $perPage: Int, $search: String) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        studios (id: $id, search: $search) {
          id
          name
        }
      }
    }
    `;
    } else if (topic === 'characters') {
      var query = `
    query ($id: Int, $page: Int, $perPage: Int, $search: String) {
      Page (page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        characters (id: $id, search: $search) {
          id
          name {
            first
            last
          }
          image {
            medium
          }
        }
      }
    }
    `;
    }
    const variables = {
      search: searchterm,
      page: 1,
      perPage: 80,
    };

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    };
    fetch(url, options).then(handleResponse)
        .then(handleData)
        .catch(handleError);

    function handleResponse(response) {
      return response.json().then((json) => (response.ok ? json : Promise.reject(json)));
    }

    function handleData(data) {
      let result = '<table class="browseAniListtable">';
      let sorttable = [];
      if (topic === 'anime') {
        for (var i = 0; i < data.data.Page.media.length; i++) {
          var name = data.data.Page.media[i].title.romaji;
          var {id} = data.data.Page.media[i];
          const coverimage = data.data.Page.media[i].coverImage.medium;
          const {type} = data.data.Page.media[i];
          const {format} = data.data.Page.media[i];
          var mdma = `[${name}](https://anilist.co/${type.toLowerCase()}/${id}/)`;
          sorttable.push([name, id, coverimage, type, format, mdma]);
        }
        sorttable = sorttable.sort(
            (a, b) => b[4] > a[4],
        );
        for (var i = 0; i < sorttable.length; i++) {
          result += `<tr><td><img class="anilistsearchimg" data="${sorttable[i][5]}" src="${sorttable[i][2]}"></td>`;
          result += `<td><a href="https://anilist.co/${sorttable[i][3].toLowerCase()}/${sorttable[i][1]}/" target="_blank">${sorttable[i][0]}</a></td><td>${sorttable[i][4].replace('_', ' ').toLowerCase()}</td></tr>`;
        }
      } else if (topic === 'staff') {
        for (var i = 0; i < data.data.Page.staff.length; i++) {
          var firstname = data.data.Page.staff[i].name.first;
          var lastname = data.data.Page.staff[i].name.last;
          var {id} = data.data.Page.staff[i];
          var image = data.data.Page.staff[i].image.medium;
          var mdma = `[${firstname} ${lastname}](https://anilist.co/staff/${id}/)`;
          sorttable.push([firstname, lastname, image, mdma, id]);
        }
        for (var i = 0; i < sorttable.length; i++) {
          result += `<tr><td><img class="anilistsearchimg" data="${sorttable[i][3]}" src="${sorttable[i][2]}"></td>`;
          result += `<td><a href="https://anilist.co/staff/${sorttable[i][4]}/" target="_blank">${sorttable[i][0]} ${sorttable[i][1]}</a></td></tr>`;
        }
      } else if (topic === 'studios') {
        for (var i = 0; i < data.data.Page.studios.length; i++) {
          var {id} = data.data.Page.studios[i];
          var {name} = data.data.Page.studios[i];
          var mdma = `[${name}](https://anilist.co/studio/${id}/)`;
          sorttable.push([name, mdma, id]);
        }
        for (var i = 0; i < sorttable.length; i++) {
          result += `<tr><td><span class="anilistsearchimg" data="${sorttable[i][1]}">Add to Comment</span></td>`;
          result += `<td><a href="https://anilist.co/studio/${sorttable[i][2]}/" target="_blank">${sorttable[i][0]}</a></td></tr>`;
        }
      } else if (topic === 'characters') {
        for (var i = 0; i < data.data.Page.characters.length; i++) {
          var {id} = data.data.Page.characters[i];
          var firstname = data.data.Page.characters[i].name.first;
          var lastname = data.data.Page.characters[i].name.last;
          if (firstname === null) {
            firstname = '';
          }
          if (lastname === null) {
            lastname = '';
          }
          var image = data.data.Page.characters[i].image.medium;
          var mdma = `[${firstname} ${lastname}](https://anilist.co/character/${id}/)`;
          sorttable.push([id, firstname, lastname, image, mdma]);
        }
        for (var i = 0; i < sorttable.length; i++) {
          result += `<tr><td><img class="anilistsearchimg" data="${sorttable[i][4]}" src="${sorttable[i][3]}"></td>`;
          result += `<td><a href="https://anilist.co/character/${sorttable[i][0]}/" target="_blank">${sorttable[i][1]} ${sorttable[i][2]}</a></td></tr>`;
        }
      }
      result += '</table>';
      if (result === '<table class="browseAniListtable"></table>') {
        result = 'No records to your query returned.';
      }
      targetelement.parents('.anilisttabwrapper').siblings('.commentfacewrapper').css('display', 'inherit');
      targetelement.parents('.anilisttabwrapper').siblings('.commentfacewrapper').children('.commentfacecontainer').html(result);

      const anilistsearchimg = document.getElementsByClassName('anilistsearchimg');

      for (var i = 0; i < anilistsearchimg.length; i++) {
        anilistsearchimg[i].addEventListener('click', function () {
          output = $(this).attr('data');
          const formfield = $(this).parents('td').parents('tr').parents('tbody')
              .parents('table')
              .parents('.commentfacecontainer')
              .parents('.commentfacewrapper')
              .parents('.commentfaces')
              .parents('.md')
              .siblings('.usertext-edit')
              .children('.md')
              .children('textarea');
          insertOutput(output, formfield);
        });
      }
    }

    function handleError(error) {
      // console.error(error);
    }
  }

  /*
  ** Make New Spoiler work like Old Spoiler
  */

  function nuSpoilers(nsp) {
    const nuspoiler = document.getElementsByClassName('md-spoiler-text');

    for (let i = 0; i < nuspoiler.length; i++) {
      nuspoiler[i].addEventListener('mouseover', function () {
        this.classList.add('revealed');
      });
      nuspoiler[i].addEventListener('mouseout', function () {
        this.classList.remove('revealed');
      });
    }
  }
}

main();
