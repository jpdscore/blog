(function($){
  // Search
  var $searchWrap = $('#search-form-wrap'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function(){
    isSearchAnim = true;
  };

  var stopSearchAnim = function(callback){
    setTimeout(function(){
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $('#nav-search-btn').on('click', function(){
    if (isSearchAnim) return;

    startSearchAnim();
    $searchWrap.addClass('on');
    stopSearchAnim(function(){
      $('.search-form-input').focus();
    });
  });

  $('.search-form-input').on('blur', function(){
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim();
  });

  // Share
  $('body').on('click', function(){
    $('.article-share-box.on').removeClass('on');
  }).on('click', '.article-share-link', function(e){
    e.stopPropagation();

    var $this = $(this),
      url = $this.attr('data-url'),
      encodedUrl = encodeURIComponent(url),
      id = 'article-share-box-' + $this.attr('data-id'),
      offset = $this.offset();

    if ($('#' + id).length){
      var box = $('#' + id);

      if (box.hasClass('on')){
        box.removeClass('on');
        return;
      }
    } else {
      var html = [
        '<div id="' + id + '" class="article-share-box">',
          '<input class="article-share-input" value="' + url + '">',
          '<div class="article-share-links">',
            '<a href="https://twitter.com/intent/tweet?url=' + encodedUrl + '" class="article-share-twitter" target="_blank" title="Twitter"></a>',
            '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-facebook" target="_blank" title="Facebook"></a>',
          '</div>',
        '</div>'
      ].join('');

      var box = $(html);

      $('body').append(box);
    }

    $('.article-share-box.on').hide();

    box.css({
      top: offset.top + 25,
      left: offset.left
    }).addClass('on');
  }).on('click', '.article-share-box', function(e){
    e.stopPropagation();
  }).on('click', '.article-share-box-input', function(){
    $(this).select();
  }).on('click', '.article-share-box-link', function(e){
    e.preventDefault();
    e.stopPropagation();

    window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
  });

  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox')) return;

      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Mobile nav
  var $container = $('#container'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  }

  $('#main-nav-toggle').on('click', function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass('mobile-nav-on');
    stopMobileNavAnim();
  });

  $('#wrap').on('click', function(){
    if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

    $container.removeClass('mobile-nav-on');
  });

  // Code copy functionality
  function addCopyButtons() {
    // Add copy buttons to highlight blocks
    $('.highlight').each(function() {
      var $highlight = $(this);
      if ($highlight.find('.code-copy-btn').length === 0) {
        var $copyBtn = $('<button class="code-copy-btn" title="コードをコピー">コピー</button>');
        $highlight.append($copyBtn);
      }
    });

    // Add copy buttons to regular pre blocks (not inside highlight)
    $('.article-entry pre').not('.highlight pre').each(function() {
      var $pre = $(this);
      if ($pre.parent().hasClass('highlight')) return;
      if ($pre.find('.code-copy-btn').length === 0) {
        $pre.css('position', 'relative');
        var $copyBtn = $('<button class="code-copy-btn" title="コードをコピー">コピー</button>');
        $pre.append($copyBtn);
      }
    });
  }

  // Copy to clipboard function
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      var textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      return new Promise(function(resolve, reject) {
        if (document.execCommand('copy')) {
          resolve();
        } else {
          reject();
        }
        document.body.removeChild(textArea);
      });
    }
  }

  // Handle copy button clicks
  $(document).on('click', '.code-copy-btn', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var $btn = $(this);
    var $codeBlock = $btn.parent();
    var codeText = '';
    
    // Get code text from highlight blocks
    if ($codeBlock.hasClass('highlight')) {
      var $code = $codeBlock.find('code');
      if ($code.length > 0) {
        codeText = $code.text();
      } else {
        // For table-based highlight
        var $lines = $codeBlock.find('.code .line');
        if ($lines.length > 0) {
          codeText = $lines.map(function() { return $(this).text(); }).get().join('\n');
        } else {
          codeText = $codeBlock.find('pre').text();
        }
      }
    } else {
      // For regular pre blocks
      codeText = $codeBlock.find('code').length > 0 ? $codeBlock.find('code').text() : $codeBlock.text();
      // Remove the copy button text from the copied content
      codeText = codeText.replace('コピー', '').trim();
    }
    
    copyToClipboard(codeText).then(function() {
      $btn.addClass('copied').text('✓');
      setTimeout(function() {
        $btn.removeClass('copied').text('コピー');
      }, 2000);
    }).catch(function() {
      $btn.addClass('error').text('✗');
      setTimeout(function() {
        $btn.removeClass('error').text('コピー');
      }, 2000);
    });
  });

  // Initialize copy buttons when page loads
  $(document).ready(function() {
    addCopyButtons();
    
    // Re-observe for dynamically loaded content using MutationObserver
    if (window.MutationObserver) {
      var observer = new MutationObserver(function(mutations) {
        var shouldAddButtons = false;
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
              var node = mutation.addedNodes[i];
              if (node.nodeType === 1 && (node.tagName === 'PRE' || node.className.indexOf('highlight') !== -1)) {
                shouldAddButtons = true;
                break;
              }
            }
          }
        });
        if (shouldAddButtons) {
          setTimeout(addCopyButtons, 100);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });

})(jQuery);