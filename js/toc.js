document.addEventListener('DOMContentLoaded', function() {
    const article = document.querySelector('.article-entry');
    const tocContainer = document.querySelector('#toc');
    
    if (!article || !tocContainer) return;
    
    // H2とH3要素を取得
    const headings = article.querySelectorAll('h2, h3');
    
    if (headings.length === 0) {
        tocContainer.style.display = 'none';
        return;
    }
    
    // Add TOC display class to body
    document.body.classList.add('has-toc');
    
    // Hide if too few headings (2 or less)
    if (headings.length <= 2) {
        tocContainer.style.display = 'none';
        return;
    }
    
    // Position TOC to align with article content
    function positionTOC() {
        const articleHeader = document.querySelector('.article-header-single');
        if (articleHeader) {
            const headerRect = articleHeader.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            tocContainer.style.top = (headerRect.top + scrollTop) + 'px';
        }
    }
    
    // Initial positioning
    positionTOC();
    
    // Reposition on window resize
    window.addEventListener('resize', positionTOC);
    
    // Generate TOC structure
    let tocHTML = '<div class="toc-title">この記事の内容</div><ul class="toc-list">';
    let currentLevel = 2;
    
    headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.substring(1));
        const id = `toc-heading-${index}`;
        const text = heading.textContent;
        
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
            heading.id = id;
        }
        
        // Generate HTML based on heading level
        if (level === 2) {
            if (currentLevel === 3) {
                tocHTML += '</ul></li>';
            }
            tocHTML += `<li class="toc-item toc-level-2"><a href="#${heading.id}" class="toc-link">${text}</a>`;
            currentLevel = 2;
        } else if (level === 3) {
            if (currentLevel === 2) {
                tocHTML += '<ul class="toc-child-list">';
            }
            tocHTML += `<li class="toc-item toc-level-3"><a href="#${heading.id}" class="toc-link">${text}</a></li>`;
            currentLevel = 3;
        }
    });
    
    // Close the last level
    if (currentLevel === 3) {
        tocHTML += '</ul></li>';
    } else if (currentLevel === 2) {
        tocHTML += '</li>';
    }
    
    tocHTML += '</ul>';
    tocContainer.innerHTML = tocHTML;
    
    // Add smooth scrolling
    const tocLinks = tocContainer.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Offset for header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Highlight active link
                tocLinks.forEach(tl => tl.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Highlight active element on scroll
    let scrollTimer = null;
    window.addEventListener('scroll', function() {
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        
        scrollTimer = setTimeout(() => {
            const scrollPosition = window.scrollY + 120; // Offset adjustment
            let activeHeading = null;
            
            // Find the closest heading
            for (let i = headings.length - 1; i >= 0; i--) {
                if (headings[i].offsetTop <= scrollPosition) {
                    activeHeading = headings[i];
                    break;
                }
            }
            
            tocLinks.forEach(link => link.classList.remove('active'));
            
            if (activeHeading) {
                const activeLink = tocContainer.querySelector(`a[href="#${activeHeading.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    
                    // Scroll active element into view within TOC
                    const tocRect = tocContainer.getBoundingClientRect();
                    const linkRect = activeLink.getBoundingClientRect();
                    
                    if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
                        activeLink.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }
            }
        }, 50); // 50ms throttling
    });
});