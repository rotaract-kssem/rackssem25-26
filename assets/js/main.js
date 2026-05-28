document.addEventListener('DOMContentLoaded', () => {
    
    /* ----------------------------------------------------
       1. THEME SWITCHING (DARK / LIGHT MODE)
       ---------------------------------------------------- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        
        // Check local storage or system preferences
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = `${savedTheme}-theme`;
        updateThemeIcon(savedTheme);
        
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            document.body.className = `${newTheme}-theme`;
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
        
        function updateThemeIcon(theme) {
            if (theme === 'dark') {
                themeIcon.className = 'fa-solid fa-sun';
            } else {
                themeIcon.className = 'fa-solid fa-moon';
            }
        }
    } else {
        // Fallback to default dark theme
        document.body.className = 'dark-theme';
    }

    /* ----------------------------------------------------
       2. MOBILE MENU NAVBAR TOGGLE
       ---------------------------------------------------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    /* ----------------------------------------------------
       3. NAVBAR SCROLL EFFECT
       ---------------------------------------------------- */
    const mainHeader = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    /* ----------------------------------------------------
       4. ACTIVE NAV LINK HIGHLIGHTER ON SCROLL
       ---------------------------------------------------- */
    const sections = document.querySelectorAll('section');
    
    const navObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.35 // 35% visible
    };
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, navObserverOptions);
    
    sections.forEach(section => {
        navObserver.observe(section);
    });

    /* ----------------------------------------------------
       5. STATS ANIMATED COUNTERS
       ---------------------------------------------------- */
    const statsSection = document.getElementById('stats');
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;
    
    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const duration = 1800; // milliseconds
            const startTime = performance.now();
            
            function updateNumber(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out quad
                const easeProgress = progress * (2 - progress);
                const currentValue = Math.floor(easeProgress * target);
                
                stat.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = target;
                }
            }
            requestAnimationFrame(updateNumber);
        });
    }
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animateCounters();
                animated = true;
            }
        });
    }, { threshold: 0.5 });
    
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    /* ----------------------------------------------------
       6. DYNAMIC BOARD OF DIRECTORS RENDERING
       ---------------------------------------------------- */
    const boardGrid = document.getElementById('board-grid');
    
    function getInitials(name) {
        const cleaned = name.replace("RTR.", "").replace("PROF.", "").trim();
        const parts = cleaned.split(/\s+/);
        return parts.map(p => p.charAt(0)).join("").toUpperCase().slice(0, 2);
    }
    
    function renderBoard() {
        if (!boardGrid || typeof boardData === 'undefined') return;
        
        boardGrid.innerHTML = '';
        
        boardData.forEach((member) => {
            const initials = getInitials(member.name);
            const role = member.role.toUpperCase();
            
            // Determine role type and highlights
            let badgeClass = 'badge-director';
            let iconClass = 'fa-solid fa-users';
            let isHighlight = false;
            
            if (role.includes('COORDINATOR')) {
                badgeClass = 'badge-coordinator';
                iconClass = 'fa-solid fa-graduation-cap';
                isHighlight = true;
            } else if (role === 'PRESIDENT' || role.includes('SECRETARY') || role === 'VICE PRESIDENT') {
                badgeClass = 'badge-ec';
                iconClass = role.includes('SECRETARY') ? 'fa-solid fa-user-pen' : 'fa-solid fa-user-tie';
                isHighlight = true;
            } else if (role.includes('EDITOR') || role.includes('EDITORIAL')) {
                badgeClass = 'badge-editor';
                iconClass = 'fa-solid fa-pen-nib';
            }
            
            // Check if photo is a baked-in Instagram template slice
            function hasBakedFrame(photoPath) {
                return !!photoPath; // Any photo is a baked-in post image
            }
            
            const isBaked = hasBakedFrame(member.photo);
            
            // Build card class list
            let cardClassList = isHighlight ? 'board-card highlight-member' : 'board-card';
            if (isBaked) {
                cardClassList += ' baked-frame';
            }
            
            const avatarGlowClass = role.includes('SECRETARY') || role === 'PRESIDENT' ? 'avatar-glow highlight-glow' : 'avatar-glow';
            
            // Image and placeholder logic
            let imgHTML = '';
            let placeholderStyle = '';
            if (member.photo) {
                imgHTML = `<img src="${member.photo}" alt="${member.name}" class="board-avatar-img" onload="this.closest('.board-card').classList.add('has-photo')" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.closest('.board-card').classList.remove('has-photo');">`;
                placeholderStyle = 'style="display:none;"';
            }
            
            // Bio / caption logic
            const bioText = member.caption || `Active member of KSSEM Rotaract executive team, facilitating RID 3191 social service initiatives.`;
            
            // Generate board card HTML
            const card = document.createElement('div');
            card.className = cardClassList;
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <!-- Dynamic Instagram Overlays -->
                <div class="instagram-overlay-header">
                    <span class="ig-club-title">Club Of KSSEM</span>
                    <i class="fa-solid fa-gear ig-cog-icon"></i>
                </div>
                <div class="instagram-overlay-left-stripe"></div>
                <div class="instagram-overlay-watermark"></div>
                <div class="instagram-overlay-role-bg">${role}</div>
                <div class="instagram-overlay-name-ribbon">
                    <span class="ig-name">${member.name.replace("RTR.", "").replace("PROF.", "").trim()}</span>
                </div>
                <div class="instagram-overlay-role-sub">${role}</div>
                
                <div class="board-avatar-box">
                    <div class="${avatarGlowClass}"></div>
                    ${imgHTML}
                    <div class="avatar-placeholder initials-avatar" ${placeholderStyle}>${initials}</div>
                </div>
                <div class="board-info">
                    <h3>${member.name.replace("RTR.", "").replace("PROF.", "").trim()}</h3>
                    <span class="role-badge ${badgeClass}"><i class="${iconClass}"></i> ${member.role}</span>
                    <div class="board-socials">
                        <a href="${member.linkedin || 'https://www.linkedin.com/company/rotaract-club-of-kssem/'}" target="_blank" aria-label="LinkedIn" onclick="event.stopPropagation()"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="${member.instagram || 'https://www.instagram.com/rackssem/'}" target="_blank" aria-label="Instagram" onclick="event.stopPropagation()"><i class="fa-brands fa-instagram"></i></a>
                    </div>
                </div>
            `;
            
            // Click to toggle info drawer
            card.addEventListener('click', (e) => {
                const isActive = card.classList.contains('is-active');
                // Close all other open cards
                document.querySelectorAll('.board-card.is-active').forEach(c => c.classList.remove('is-active'));
                if (!isActive) card.classList.add('is-active');
            });
            
            boardGrid.appendChild(card);
        });
        
        // Click outside board grid closes any open card
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.board-card')) {
                document.querySelectorAll('.board-card.is-active').forEach(c => c.classList.remove('is-active'));
            }
        });
    }
    
    renderBoard();

    /* ----------------------------------------------------
       7. DYNAMIC PROJECTS (SORTING, FILTERING & SEARCH)
       ---------------------------------------------------- */
    const projectsGrid = document.getElementById('projects-grid');
    const portfolioFilters = document.getElementById('portfolio-filters');
    const searchInput = document.getElementById('project-search-input');
    const searchClear = document.getElementById('project-search-clear');
    const activeFiltersInfo = document.getElementById('active-filters-info');
    const resultsCount = document.getElementById('results-count');
    const clearAllFilters = document.getElementById('clear-all-filters');
    const loadMoreContainer = document.getElementById('load-more-container');
    const btnLoadMore = document.getElementById('btn-load-more');
    const loadSpinner = document.getElementById('load-spinner');
    
    // Toggle controls
    const toggleAvenues = document.getElementById('toggle-avenues');
    const toggleAreas = document.getElementById('toggle-areas');
    
    // Filter state
    let activeFilterType = 'avenue'; // 'avenue' or 'area'
    let activeFilterCategory = 'all';
    let searchQuery = '';
    let visibleLimit = 9;
    const itemsPerPage = 9;
    
    // Categories definition
    const categories = {
        avenue: {
            'all': 'All Avenues',
            'Club Service': 'Club Service',
            'Community Service': 'Community Service',
            'Professional Development': 'Vocational & PD',
            'International Service': 'International',
            'Public Image': 'Public Image',
            'Public Relations': 'Public Relations',
            'Editorial/Publication': 'Editorial',
            'Finance and Foundation': 'Finance'
        },
        area: {
            'all': 'All Areas',
            'Supporting Education': 'Education',
            'Promoting Peace': 'Peace',
            'Fighting Disease': 'Fighting Disease',
            'Growing Local Economies': 'Economies',
            'Providing Clean Water': 'Clean Water',
            'Sanitation and Hygiene': 'Sanitation',
            'Saving Mothers and Children': 'Mothers & Kids',
            'Protecting The Environment': 'Environment'
        }
    };
    
    // Determine card fallback icons based on avenues
    function getProjectIcon(avenues) {
        if (!avenues) return 'fa-briefcase';
        const avLower = avenues.toLowerCase();
        if (avLower.includes('community')) return 'fa-earth-americas';
        if (avLower.includes('international')) return 'fa-globe';
        if (avLower.includes('professional') || avLower.includes('vocational')) return 'fa-id-card';
        if (avLower.includes('club')) return 'fa-baseball-bat-ball';
        if (avLower.includes('public relations') || avLower.includes('public image')) return 'fa-bullhorn';
        if (avLower.includes('editorial')) return 'fa-book-open';
        return 'fa-handshake-angle';
    }
    
    function getAvenueBadgeClass(avenues) {
        if (!avenues) return 'club-bg';
        const avLower = avenues.toLowerCase();
        if (avLower.includes('community')) return 'community-bg';
        if (avLower.includes('international')) return 'international-bg';
        if (avLower.includes('professional') || avLower.includes('vocational')) return 'vocational-bg';
        return 'club-bg';
    }

    // Dynamic Filter Tabs Builder
    function renderFilterTabs() {
        if (!portfolioFilters) return;
        
        portfolioFilters.innerHTML = '';
        const currentTabs = categories[activeFilterType];
        
        Object.entries(currentTabs).forEach(([key, label]) => {
            const btn = document.createElement('button');
            btn.className = `filter-btn ${activeFilterCategory === key ? 'active' : ''}`;
            btn.textContent = label;
            btn.setAttribute('data-filter', key);
            
            btn.addEventListener('click', () => {
                portfolioFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilterCategory = key;
                visibleLimit = itemsPerPage; // Reset pagination limit
                renderProjects();
            });
            
            portfolioFilters.appendChild(btn);
        });
    }

    // Dynamic Projects Grid Renderer
    function renderProjects(append = false) {
        if (!projectsGrid || typeof projectsData === 'undefined') return;
        
        // Filter projects
        const filtered = projectsData.filter(project => {
            // 1. Category check
            let matchesCategory = false;
            if (activeFilterCategory === 'all') {
                matchesCategory = true;
            } else {
                if (activeFilterType === 'avenue') {
                    const aves = project.avenues_of_service || "";
                    matchesCategory = aves.toLowerCase().includes(activeFilterCategory.toLowerCase());
                } else {
                    const areas = project.areas_of_focus || "";
                    matchesCategory = areas.toLowerCase().includes(activeFilterCategory.toLowerCase());
                }
            }
            
            // 2. Search check
            let matchesSearch = false;
            if (!searchQuery) {
                matchesSearch = true;
            } else {
                const query = searchQuery.toLowerCase();
                const nameMatch = project.name.toLowerCase().includes(query);
                const descMatch = project.description.toLowerCase().includes(query);
                const venueMatch = project.venue.toLowerCase().includes(query);
                const aveMatch = (project.avenues_of_service || "").toLowerCase().includes(query);
                const areaMatch = (project.areas_of_focus || "").toLowerCase().includes(query);
                
                matchesSearch = nameMatch || descMatch || venueMatch || aveMatch || areaMatch;
            }
            
            return matchesCategory && matchesSearch;
        });
        
        // Update counts
        const totalMatches = filtered.length;
        
        if (searchQuery || activeFilterCategory !== 'all') {
            activeFiltersInfo.style.display = 'flex';
            resultsCount.textContent = `Found ${totalMatches} matching project${totalMatches !== 1 ? 's' : ''}`;
        } else {
            activeFiltersInfo.style.display = 'none';
        }
        
        // Handle Empty States
        if (totalMatches === 0) {
            projectsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 48px 24px; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
                    <h3>No campaigns found</h3>
                    <p style="color: var(--text-secondary); margin-top: 8px;">Try modifying your search text or selecting a different category tab.</p>
                </div>
            `;
            loadMoreContainer.style.display = 'none';
            return;
        }
        
        // Paginate slice
        const visibleProjects = filtered.slice(0, visibleLimit);
        
        if (!append) {
            projectsGrid.innerHTML = '';
        } else {
            // Clear current cards to prevent duplicates when appending
            projectsGrid.innerHTML = '';
        }
        
        visibleProjects.forEach((p, idx) => {
            const iconClass = getProjectIcon(p.avenues_of_service);
            const badgeBg = getAvenueBadgeClass(p.avenues_of_service);
            
            // Format tag
            let tagText = 'Rotaract Project';
            if (p.avenues_of_service) {
                tagText = p.avenues_of_service.split(',')[0].strip();
            } else if (p.areas_of_focus) {
                tagText = p.areas_of_focus.split(',')[0].strip();
            }
            
            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.animation = 'fadeInUp 0.4s ease forwards';
            card.style.animationDelay = `${(idx % 3) * 0.1}s`;
            
            // Check cover image
            let imgHTML = '';
            if (p.cover_photo) {
                imgHTML = `<img src="${p.cover_photo}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='none'; this.parentElement.querySelector('.project-fallback-icon').style.display='flex';">`;
            }
            
            card.innerHTML = `
                <div class="project-img-wrapper">
                    ${imgHTML}
                    <div class="project-overlay-gradient"></div>
                    <div class="project-tag">${tagText}</div>
                    <div class="project-fallback-icon" ${p.cover_photo ? 'style="display:none;"' : ''}>
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                </div>
                <div class="project-info">
                    <span style="font-size: 0.75rem; color: var(--secondary-color); font-weight:600; margin-bottom:4px; text-transform: uppercase;">
                        <i class="fa-regular fa-calendar"></i> ${p.start_date}
                    </span>
                    <h3 style="height:52px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; margin-bottom:8px;">${p.name}</h3>
                    <p style="height:72px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; font-size:0.85rem; color:var(--text-secondary); margin-bottom:20px;">
                        ${p.description}
                    </p>
                    <button class="project-detail-btn" data-id="${p.id}">Read Details <i class="fa-solid fa-arrow-right"></i></button>
                </div>
            `;
            
            // Wire detailed modal
            card.querySelector('.project-detail-btn').addEventListener('click', () => {
                openProjectModal(p.id);
            });
            
            projectsGrid.appendChild(card);
        });
        
        // Show/Hide Load More Button
        if (visibleLimit < totalMatches) {
            loadMoreContainer.style.display = 'flex';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Toggle Category Types (Avenues of Service vs Areas of Focus)
    if (toggleAvenues && toggleAreas) {
        toggleAvenues.addEventListener('click', () => {
            toggleAreas.classList.remove('active');
            toggleAvenues.classList.add('active');
            activeFilterType = 'avenue';
            activeFilterCategory = 'all';
            visibleLimit = itemsPerPage;
            renderFilterTabs();
            renderProjects();
        });
        
        toggleAreas.addEventListener('click', () => {
            toggleAvenues.classList.remove('active');
            toggleAreas.classList.add('active');
            activeFilterType = 'area';
            activeFilterCategory = 'all';
            visibleLimit = itemsPerPage;
            renderFilterTabs();
            renderProjects();
        });
    }

    // Real-Time Search Handler
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            if (searchQuery) {
                searchClear.style.display = 'flex';
            } else {
                searchClear.style.display = 'none';
            }
            visibleLimit = itemsPerPage; // Reset page count
            renderProjects();
        });
        
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            searchClear.style.display = 'none';
            visibleLimit = itemsPerPage;
            renderProjects();
        });
    }
    
    // Clear All Filters Links
    if (clearAllFilters) {
        clearAllFilters.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            if (searchClear) searchClear.style.display = 'none';
            activeFilterCategory = 'all';
            visibleLimit = itemsPerPage;
            
            // Reset active state in DOM buttons
            if (portfolioFilters) {
                portfolioFilters.querySelectorAll('.filter-btn').forEach(b => {
                    if (b.getAttribute('data-filter') === 'all') {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
            }
            
            renderProjects();
        });
    }

    // Pagination Load More Handler
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            btnLoadMore.setAttribute('disabled', 'true');
            loadSpinner.style.display = 'inline-block';
            
            // Simulate smooth loading transition
            setTimeout(() => {
                visibleLimit += itemsPerPage;
                renderProjects(true);
                btnLoadMore.removeAttribute('disabled');
                loadSpinner.style.display = 'none';
            }, 800);
        });
    }
    
    // String helper extension for formatting
    String.prototype.strip = function() {
        return this.trim();
    };

    // Initialize layout filters
    renderFilterTabs();
    renderProjects();

    /* ----------------------------------------------------
       8. CASE STUDY MODAL DETAILS INJECTOR
       ---------------------------------------------------- */
    const projectModal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCloseAction = document.getElementById('modal-close-action');
    const modalTag = document.getElementById('modal-project-tag');
    const modalTitle = document.getElementById('modal-project-title');
    const modalDate = document.getElementById('modal-project-date');
    const modalLeader = document.getElementById('modal-project-leader');
    const modalBody = document.getElementById('modal-project-body');
    
    function openProjectModal(projectId) {
        if (typeof projectsData === 'undefined') return;
        
        const p = projectsData.find(project => project.id === projectId);
        if (!p) return;
        
        // Parse leader/coordinator name
        const leaderName = p.type === 'JOINT_INITIATIVE' || p.type === 'COLLABORATION_WITH_SPONSORED_CLUB' 
            ? 'Collaborative Project' 
            : (p.type === 'DISTRICT_EVENT' ? 'District ISD Team' : 'Executive Board');
            
        modalTag.textContent = p.avenues_of_service || p.areas_of_focus || 'Rotaract Project';
        modalTitle.textContent = p.name;
        modalDate.textContent = p.start_date === p.end_date ? p.start_date : `${p.start_date} - ${p.end_date}`;
        modalLeader.textContent = leaderName;
        
        // Build details statistics blocks
        let statsHTML = '';
        if (p.venue || p.type) {
            statsHTML = `
                <div class="project-stats-modal-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:24px; padding:16px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                    <div style="text-align:center;">
                        <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; display:block;">Venue</span>
                        <strong style="font-size:0.9rem; color:var(--text-primary);">${p.venue || 'N/A'}</strong>
                    </div>
                    <div style="text-align:center;">
                        <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:600; display:block;">Type</span>
                        <strong style="font-size:0.9rem; color:var(--text-primary);">${p.type.replace(/_/g, ' ')}</strong>
                    </div>
                </div>
            `;
        }
        
        // Build image gallery if extra photos exist
        let galleryHTML = '';
        if (p.photos && p.photos.length > 0) {
            const slides = p.photos.map((src, i) => `
                <div style="min-width:100%; height:260px; position:relative; display:none;" class="modal-slide" data-slide="${i}">
                    <img src="${src}" alt="Event Photo ${i+1}" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius-md);" onerror="this.parentElement.style.display='none';">
                </div>
            `).join('');
            
            const controls = p.photos.length > 1 ? `
                <button class="slide-nav prev" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:none; width:36px; height:36px; border-radius:50%; color:white; font-size:1.2rem; cursor:pointer; z-index:5;">&lsaquo;</button>
                <button class="slide-nav next" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:rgba(0,0,0,0.5); border:none; width:36px; height:36px; border-radius:50%; color:white; font-size:1.2rem; cursor:pointer; z-index:5;">&rsaquo;</button>
            ` : '';
            
            galleryHTML = `
                <div class="carousel-container" style="position:relative; width:100%; overflow:hidden; border-radius:var(--radius-md); margin-bottom:20px; display:flex; background:rgba(0,0,0,0.2);">
                    ${slides}
                    ${controls}
                </div>
            `;
        }
        
        // Construct body HTML
        modalBody.innerHTML = `
            ${galleryHTML}
            ${statsHTML}
            <h4>Description</h4>
            <p style="white-space: pre-line; color: var(--text-secondary); margin-bottom: 20px;">${p.description}</p>
            
            ${p.avenues_of_service ? `
                <h4 style="margin-top:20px;">Avenues of Service</h4>
                <div class="visual-tags" style="margin-bottom:12px;">
                    ${p.avenues_of_service.split(',').map(a => `<span style="background:rgba(255,255,255,0.05); border:1px solid var(--border-color); font-size:0.75rem; padding:4px 12px; border-radius:100px; color:var(--text-secondary); margin-right:6px; display:inline-block;">${a.trim()}</span>`).join('')}
                </div>
            ` : ''}
            
            ${p.areas_of_focus ? `
                <h4 style="margin-top:16px;">Areas of Focus</h4>
                <div class="visual-tags">
                    ${p.areas_of_focus.split(',').map(af => `<span style="background:rgba(255,255,255,0.05); border:1px solid var(--border-color); font-size:0.75rem; padding:4px 12px; border-radius:100px; color:var(--secondary-color); margin-right:6px; display:inline-block;">${af.trim()}</span>`).join('')}
                </div>
            ` : ''}
        `;
        
        // Initialize Carousel slides if present
        if (p.photos && p.photos.length > 0) {
            let activeIdx = 0;
            const slides = modalBody.querySelectorAll('.modal-slide');
            
            const showSlide = (idx) => {
                slides.forEach(s => s.style.display = 'none');
                slides[idx].style.display = 'block';
            };
            
            showSlide(activeIdx);
            
            const prevBtn = modalBody.querySelector('.slide-nav.prev');
            const nextBtn = modalBody.querySelector('.slide-nav.next');
            
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => {
                    activeIdx = (activeIdx - 1 + slides.length) % slides.length;
                    showSlide(activeIdx);
                });
                
                nextBtn.addEventListener('click', () => {
                    activeIdx = (activeIdx + 1) % slides.length;
                    showSlide(activeIdx);
                });
            }
        }
        
        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock body scroll
    }
    
    function closeModal() {
        projectModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
    
    modalClose.addEventListener('click', closeModal);
    modalCloseAction.addEventListener('click', closeModal);
    
    // Close modal on background click
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeModal();
        }
    });
    
    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && projectModal.classList.contains('active')) {
            closeModal();
        }
    });

    /* ----------------------------------------------------
       9. MEMBERSHIP FORM VALIDATION & SUBMISSION
       ---------------------------------------------------- */
    const form = document.getElementById('membership-form');
    const successBox = document.getElementById('form-success');
    const spinner = document.getElementById('form-spinner');
    const submitBtn = document.getElementById('btn-submit');
    const resetBtn = document.getElementById('btn-reset-form');
    
    if (form) {
        const inputs = {
            name: document.getElementById('form-name'),
            email: document.getElementById('form-email'),
            phone: document.getElementById('form-phone'),
            usn: document.getElementById('form-usn'),
            branch: document.getElementById('form-branch'),
            interest: document.getElementById('form-interest')
        };
        
        const errors = {
            name: document.getElementById('name-error'),
            email: document.getElementById('email-error'),
            phone: document.getElementById('phone-error'),
            usn: document.getElementById('usn-error'),
            branch: document.getElementById('branch-error'),
            interest: document.getElementById('interest-error')
        };
        
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phonePattern = /^\d{10}$/;
        
        function validateField(fieldId) {
            const input = inputs[fieldId];
            const val = input.value.trim();
            let isValid = true;
            
            if (fieldId === 'name') {
                isValid = val.length > 2;
            } else if (fieldId === 'email') {
                isValid = emailPattern.test(val);
            } else if (fieldId === 'phone') {
                isValid = phonePattern.test(val);
            } else if (fieldId === 'usn' || fieldId === 'branch' || fieldId === 'interest') {
                isValid = val !== '';
            }
            
            if (!isValid) {
                input.parentElement.classList.add('invalid');
            } else {
                input.parentElement.classList.remove('invalid');
            }
            
            return isValid;
        }
        
        Object.keys(inputs).forEach(key => {
            if (inputs[key]) {
                inputs[key].addEventListener('blur', () => {
                    validateField(key);
                });
                
                inputs[key].addEventListener('input', () => {
                    if (inputs[key].parentElement.classList.contains('invalid')) {
                        inputs[key].parentElement.classList.remove('invalid');
                    }
                });
            }
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let formIsValid = true;
            Object.keys(inputs).forEach(key => {
                if (inputs[key]) {
                    const isFieldValid = validateField(key);
                    if (!isFieldValid) {
                        formIsValid = false;
                    }
                }
            });
            
            if (formIsValid) {
                submitBtn.setAttribute('disabled', 'true');
                spinner.style.display = 'inline-block';
                
                // Submit to FormSubmit.co via AJAX
                fetch("https://formsubmit.co/ajax/rackssem@gmail.com", {
                    method: "POST",
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: inputs.name.value,
                        email: inputs.email.value,
                        phone: inputs.phone.value,
                        usn: inputs.usn.value,
                        branch: inputs.branch.value,
                        interest: inputs.interest.value,
                        message: document.getElementById('form-message').value
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    const userNameInput = inputs.name ? inputs.name.value : 'Candidate';
                    const successUserName = document.getElementById('success-user-name');
                    if (successUserName) successUserName.textContent = userNameInput;
                    
                    form.style.display = 'none';
                    if (successBox) successBox.style.display = 'block';
                    
                    submitBtn.removeAttribute('disabled');
                    spinner.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error submitting form:', error);
                    alert('Something went wrong while submitting. Please try again or email us directly at rotaract@kssem.edu.in.');
                    submitBtn.removeAttribute('disabled');
                    spinner.style.display = 'none';
                });
            }
        });
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                form.reset();
                if (successBox) successBox.style.display = 'none';
                form.style.display = 'block';
                
                Object.keys(inputs).forEach(key => {
                    if (inputs[key]) {
                        inputs[key].parentElement.classList.remove('invalid');
                    }
                });
            });
        }
    }
});
